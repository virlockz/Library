import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

interface EpubChapter {
  id: string;
  title: string;
  label: string;
  body: string;
}

export async function parseEpub(filePath: string): Promise<{ title: string; chapters: EpubChapter[] }> {
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

  const basePath = rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1);

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

  return { title, chapters };
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}
