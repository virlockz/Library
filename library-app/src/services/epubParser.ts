import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

interface EpubChapter {
  id: string;
  title: string;
  label: string;
  body: string;
}

interface EpubResult {
  title: string;
  chapters: EpubChapter[];
  coverImage?: string;
}

export async function parseEpub(filePath: string): Promise<EpubResult> {
  const fileBase64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const zip = await JSZip.loadAsync(fileBase64, { base64: true });

  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Invalid EPUB: missing container.xml');

  const rootfileMatch = containerXml.match(/full-path="([^"]+)"/);
  const rootfilePath = rootfileMatch?.[1] || 'OEBPS/content.opf';

  const opfContent = await zip.file(rootfilePath)?.async('text');
  if (!opfContent) throw new Error('Invalid EPUB: missing OPF file');

  const basePath = rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1);

  // Extract cover image
  let coverImage: string | undefined;
  try {
    coverImage = await extractCoverImage(zip, opfContent, basePath, filePath);
  } catch {
    // No cover image found — that's fine
  }

  const itemMatches = [...opfContent.matchAll(/<item[^>]+\/>/gi)];
  const spineItems: [string, string][] = [];
  for (const m of itemMatches) {
    const tag = m[0];
    const idMatch = tag.match(/id="([^"]+)"/);
    const hrefMatch = tag.match(/href="([^"]+)"/);
    if (idMatch && hrefMatch) {
      spineItems.push([idMatch[1], hrefMatch[1]]);
    }
  }
  const spineOrder = [...opfContent.matchAll(/<itemref[^>]+idref="([^"]+)"/g)];

  const chapters: EpubChapter[] = [];
  let chapterIndex = 0;

  for (const match of spineOrder) {
    const itemId = match[1];
    const item = spineItems.find((i) => i[0] === itemId);
    if (!item) continue;

    const href = item[1];
    const fullPath = basePath + href;
    const file = zip.file(fullPath);
    if (!file) continue;

    const html = await file.async('text');
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : html;

    const titleMatch = body.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i);
    const title = titleMatch ? titleMatch[1].trim() : `Chapter ${chapterIndex + 1}`;

    chapters.push({
      id: `ch-${chapterIndex}`,
      title,
      label: `Chapter ${chapterIndex + 1}`,
      body: cleanHtml(body),
    });
    chapterIndex++;
  }

  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  return { title, chapters, coverImage };
}

async function extractCoverImage(
  zip: JSZip,
  opfContent: string,
  basePath: string,
  epubFilePath: string
): Promise<string | undefined> {
  let coverHref: string | undefined;

  // Method 1: <meta name="cover" content="cover-image-id"/>
  const metaCover = opfContent.match(/<meta[^>]+name="cover"[^>]+content="([^"]+)"/i);
  if (metaCover) {
    const coverId = metaCover[1];
    const itemRegex = new RegExp(`<item[^>]+id="${coverId}"[^>]+href="([^"]+)"`, 'i');
    const itemMatch = opfContent.match(itemRegex);
    if (itemMatch) coverHref = itemMatch[1];
  }

  // Method 2: <item properties="cover-image" href="..."/>
  if (!coverHref) {
    const propsCover = opfContent.match(/<item[^>]+properties="[^"]*cover-image[^"]*"[^>]+href="([^"]+)"/i);
    if (propsCover) coverHref = propsCover[1];
  }

  // Method 3: <item id="cover-image" href="..."/> or id="cover" with image media-type
  if (!coverHref) {
    const idCover = opfContent.match(/<item[^>]+id="cover(?:-image)?"[^>]+href="([^"]+)"/i);
    if (idCover) coverHref = idCover[1];
  }

  // Method 4: Find any item with image media-type in manifest
  if (!coverHref) {
    const imgItem = opfContent.match(/<item[^>]+media-type="image\/(jpeg|png|gif|webp)"[^>]+href="([^"]+)"/i);
    if (imgItem) coverHref = imgItem[2];
  }

  if (!coverHref) return undefined;

  const coverFullPath = basePath + coverHref;
  const coverFile = zip.file(coverFullPath);
  if (!coverFile) return undefined;

  const ext = coverHref.substring(coverHref.lastIndexOf('.')).toLowerCase();
  const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  if (!validExts.includes(ext)) return undefined;

  const coverBase64 = await coverFile.async('base64');
  const coverPath = `${epubFilePath.replace(/book\.epub$/, '')}cover${ext}`;
  await FileSystem.writeAsStringAsync(coverPath, coverBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return coverPath;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}
