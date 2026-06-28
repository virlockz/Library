import { marked } from 'marked';

export function processMarkdown(content: string): string {
  return marked.parse(content) as string;
}

export function processPlainText(content: string): string {
  return content
    .split(/\n\s*\n/)
    .filter((para) => para.trim().length > 0)
    .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

export function splitIntoPages(htmlContent: string, charsPerPage: number = 3000): string[] {
  const paragraphs = htmlContent.split(/(?=<p>|<div|<h[1-6]|<ul|<ol)/gi);
  const pages: string[] = [];
  let currentPage = '';

  for (const para of paragraphs) {
    if (currentPage.length + para.length > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = para;
    } else {
      currentPage += para;
    }
  }

  if (currentPage.trim()) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : ['<p>No content available.</p>'];
}
