import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Book, Chapter, ThemeName } from '../types';
import { parseEpub } from './epubParser';
import { parsePdf } from './pdfParser';
import { processMarkdown, processPlainText, splitIntoPages } from './textProcessor';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getDefaultTheme(ext: string): ThemeName {
  switch (ext) {
    case '.epub': return 'parchment';
    case '.pdf': return 'parchment';
    case '.md': return 'modern';
    case '.txt': return 'parchment';
    default: return 'parchment';
  }
}

function chaptersToPages(chapters: Chapter[]): Chapter[] {
  return chapters.map((ch) => ({
    ...ch,
    pages: ch.pages.length > 0 ? ch.pages : [{ heading: ch.title, label: ch.label, body: '<p>No content.</p>' }],
  }));
}

export async function importFile(): Promise<Book | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'application/epub+zip', 'text/plain', 'text/markdown', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const file = result.assets[0];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const bookId = generateId();
  const destDir = `${FileSystem.documentDirectory}${bookId}/`;

  await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
  await FileSystem.copyAsync({ from: file.uri, to: `${destDir}book${ext}` });

  const localPath = `${destDir}book${ext}`;
  let chapters: Chapter[] = [];
  let title = file.name.replace(/\.[^/.]+$/, '');

  switch (ext) {
    case '.epub': {
      const parsed = await parseEpub(localPath);
      title = parsed.title;
      chapters = chaptersToPages(
        parsed.chapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          label: ch.label,
          pages: splitIntoPages(ch.body).map((body, pi) => ({
            heading: ch.title,
            label: `${ch.label} · Part ${pi + 1}`,
            body,
          })),
        }))
      );
      break;
    }
    case '.pdf': {
      const text = await parsePdf(localPath);
      const html = processPlainText(text);
      const pages = splitIntoPages(html, 2000);
      chapters = chaptersToPages([{
        id: 'chapter-1',
        title,
        label: 'Content',
        pages: pages.map((body, i) => ({
          heading: title,
          label: `Part ${i + 1}`,
          body,
        })),
      }]);
      break;
    }
    case '.md': {
      const content = await FileSystem.readAsStringAsync(localPath);
      const html = processMarkdown(content);
      const pages = splitIntoPages(html);
      chapters = chaptersToPages([{
        id: 'chapter-1',
        title,
        label: 'Content',
        pages: pages.map((body, i) => ({
          heading: title,
          label: `Part ${i + 1}`,
          body,
        })),
      }]);
      break;
    }
    case '.txt':
    default: {
      const content = await FileSystem.readAsStringAsync(localPath);
      const html = processPlainText(content);
      const pages = splitIntoPages(html);
      chapters = chaptersToPages([{
        id: 'chapter-1',
        title,
        label: 'Content',
        pages: pages.map((body, i) => ({
          heading: title,
          label: `Part ${i + 1}`,
          body,
        })),
      }]);
      break;
    }
  }

  return {
    id: bookId,
    title,
    sourceType: ext === '.epub' ? 'epub' : ext === '.md' ? 'md' : ext === '.txt' ? 'txt' : 'pdf',
    filePath: localPath,
    addedAt: new Date().toISOString(),
    defaultTheme: getDefaultTheme(ext),
    chapters,
    pageCount: chapters.reduce((sum, ch) => sum + ch.pages.length, 0),
  };
}

export async function importPastedText(text: string, title: string): Promise<Book> {
  const bookId = generateId();
  const html = processPlainText(text);
  const pages = splitIntoPages(html);

  return {
    id: bookId,
    title: title || 'Pasted Text',
    sourceType: 'pasted',
    filePath: '',
    addedAt: new Date().toISOString(),
    defaultTheme: 'parchment',
    chapters: [{
      id: 'chapter-1',
      title: title || 'Pasted Text',
      label: 'Content',
      pages: pages.map((body, i) => ({
        heading: title || 'Pasted Text',
        label: `Part ${i + 1}`,
        body,
      })),
    }],
    pageCount: pages.length,
  };
}
