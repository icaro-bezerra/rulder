import type { Book } from 'epubjs';
import * as pdfjsLib from 'pdfjs-dist';

/** Internal type for epub.js spine items with load capability */
interface EpubSpineItem {
  load: (loader: (path: string) => Promise<unknown>) => Promise<Document | undefined>;
}

/**
 * Extracts all text content from an EPUB book using epub.js spine iteration.
 * Returns a flat array of words preserving reading order.
 */
export async function extractTextFromEpub(book: Book): Promise<string[]> {
  const sections: string[] = [];

  // Wait for spine to be ready
  await book.loaded.spine;

  const spine = book.spine as unknown as {
    each: (fn: (item: EpubSpineItem) => void) => void;
  };

  const items: EpubSpineItem[] = [];
  spine.each((item) => items.push(item));

  // epub.js requires a load function bound to the book archive
  const loader = (book as unknown as { load: (path: string) => Promise<unknown> }).load;
  const boundLoader = loader?.bind(book);

  for (const item of items) {
    try {
      const doc = await item.load(boundLoader);
      if (doc) {
        const body = doc.body ?? doc.documentElement;
        if (body) {
          const text = extractTextFromNode(body);
          if (text.trim()) {
            sections.push(text);
          }
        }
      }
    } catch {
      /* Some spine items may fail to load — skip them */
    }
  }

  return tokenizeText(sections.join('\n\n'));
}

/**
 * Recursively extracts text from a DOM node, preserving paragraph breaks.
 */
function extractTextFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as Element;
  const tag = el.tagName?.toLowerCase();

  // Skip non-visible elements
  if (tag === 'script' || tag === 'style' || tag === 'nav') {
    return '';
  }

  const parts: string[] = [];
  for (const child of Array.from(node.childNodes)) {
    parts.push(extractTextFromNode(child));
  }

  const joined = parts.join('');

  // Insert paragraph breaks for block-level elements
  const blockTags = new Set([
    'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'blockquote', 'section', 'article', 'br', 'hr',
    'dt', 'dd', 'figcaption', 'pre',
  ]);

  if (blockTags.has(tag)) {
    return `\n${joined}\n`;
  }

  return joined;
}

/**
 * Extracts all text content from a PDF document using pdfjs-dist.
 * Returns a flat array of words preserving reading order.
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string[]> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  const pdf = await loadingTask.promise;

  const sections: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item) => 'str' in item && typeof (item as Record<string, unknown>).str === 'string')
        .map((item) => (item as unknown as { str: string }).str)
        .join(' ');

      if (pageText.trim()) {
        sections.push(pageText);
      }
    } catch {
      /* Skip pages that fail to extract */
    }
  }

  return tokenizeText(sections.join('\n\n'));
}

/**
 * Tokenizes raw text into an array of words.
 * Collapses whitespace and handles punctuation correctly.
 */
function tokenizeText(raw: string): string[] {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((word) => word.length > 0);
}

/**
 * Computes the Optimal Recognition Point (ORP) index for a word.
 * This is the letter the eye naturally focuses on during speed reading.
 */
export function getORPIndex(word: string): number {
  // Strip punctuation to compute length on letters only
  const letters = word.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '');
  const len = letters.length;

  if (len <= 1) return 0;
  if (len <= 3) return 1;
  if (len <= 5) return 2;
  if (len <= 9) return 3;
  if (len <= 13) return 4;
  return 5;
}

/**
 * Determines the delay multiplier for a word based on punctuation.
 * Commas, semicolons → 1.5x; periods, question marks, exclamation → 2.0x
 */
export function getPunctuationDelay(word: string): number {
  const lastChar = word.slice(-1);

  if (lastChar === '.' || lastChar === '!' || lastChar === '?' || lastChar === '…') {
    return 2.0;
  }
  if (lastChar === ',' || lastChar === ';' || lastChar === ':' || lastChar === '—' || lastChar === '–') {
    return 1.5;
  }
  return 1.0;
}
