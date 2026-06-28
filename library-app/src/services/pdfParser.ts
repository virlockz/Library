import * as FileSystem from 'expo-file-system';

let pdfjsLib: any = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
  pdfjs.GlobalWorkerOptions.workerSrc = '';
  pdfjsLib = pdfjs;
  return pdfjs;
}

export async function parsePdf(filePath: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const pdfjs = await getPdfjs();
    const data = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const doc = await pdfjs.getDocument({ data }).promise;

    const pages: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const items = content.items;

      let lastY: number | null = null;
      let pageText = '';

      for (const item of items) {
        if (!item.str) continue;

        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        } else if (lastY !== null && pageText.length > 0) {
          pageText += ' ';
        }

        pageText += item.str;
        lastY = item.transform[5];
      }

      if (pageText.trim()) {
        pages.push(pageText.trim());
      }
    }

    doc.destroy();
    return pages.join('\n\n') || '<p>Unable to extract text from this PDF.</p>';
  } catch (e) {
    return `<p>Failed to parse PDF: ${e instanceof Error ? e.message : 'Unknown error'}</p>`;
  }
}
