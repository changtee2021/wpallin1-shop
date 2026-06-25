import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

let workerConfigured = false;

function ensureWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  workerConfigured = true;
}

export type PdfSearchHit = {
  pageNumber: number;
  snippet: string;
};

export type PdfRenderOptions = {
  maxWidth?: number;
  quality?: number;
};

export type PdfDocumentHandle = {
  numPages: number;
  renderPage: (
    pageNumber: number,
    options?: PdfRenderOptions,
  ) => Promise<string>;
  extractPageText: (pageNumber: number) => Promise<string>;
  searchText: (
    query: string,
    onProgress?: (page: number, total: number) => void,
  ) => Promise<PdfSearchHit[]>;
  destroy: () => void;
};

const pageCache = new Map<string, Map<number, string>>();
const textCache = new Map<string, Map<number, string>>();

function cacheKey(pdfUrl: string) {
  return pdfUrl;
}

function snippetAround(text: string, index: number, radius = 48): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  const chunk = text.slice(start, end).replace(/\s+/g, " ").trim();
  return start > 0 ? `…${chunk}` : chunk;
}

export async function openPdfDocument(
  pdfUrl: string,
): Promise<PdfDocumentHandle> {
  ensureWorker();
  const loadingTask = pdfjs.getDocument({
    url: pdfUrl,
    withCredentials: false,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;

  const getCache = () => {
    const key = cacheKey(pdfUrl);
    if (!pageCache.has(key)) pageCache.set(key, new Map());
    return pageCache.get(key)!;
  };

  const getTextCache = () => {
    const key = cacheKey(pdfUrl);
    if (!textCache.has(key)) textCache.set(key, new Map());
    return textCache.get(key)!;
  };

  return {
    numPages: pdf.numPages,
    async renderPage(pageNumber: number, options?: PdfRenderOptions) {
      const cache = getCache();
      const cached = cache.get(pageNumber);
      if (cached) return cached;

      const page = await pdf.getPage(pageNumber);
      const quality = options?.quality ?? 0.85;
      const dpr =
        typeof window !== "undefined"
          ? Math.min(window.devicePixelRatio, 2)
          : 1;
      let scale = 1.2;
      if (options?.maxWidth) {
        const base = page.getViewport({ scale: 1 });
        scale = Math.min(
          2,
          Math.max(0.85, (options.maxWidth * dpr) / base.width),
        );
      }

      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas not supported");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport, canvas }).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      cache.set(pageNumber, dataUrl);
      page.cleanup();
      return dataUrl;
    },
    async extractPageText(pageNumber: number) {
      const cache = getTextCache();
      const cached = cache.get(pageNumber);
      if (cached !== undefined) return cached;

      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      page.cleanup();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      cache.set(pageNumber, text);
      return text;
    },
    async searchText(query, onProgress) {
      const q = query.trim().toLowerCase();
      if (!q) return [];

      const hits: PdfSearchHit[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        onProgress?.(pageNumber, pdf.numPages);
        const text = await this.extractPageText(pageNumber);
        const lower = text.toLowerCase();
        const index = lower.indexOf(q);
        if (index >= 0) {
          hits.push({
            pageNumber,
            snippet: snippetAround(text, index),
          });
        }
      }
      return hits;
    },
    destroy() {
      pageCache.delete(cacheKey(pdfUrl));
      textCache.delete(cacheKey(pdfUrl));
      void loadingTask.destroy().catch(() => undefined);
    },
  };
}

export async function preloadPdfPages(
  handle: PdfDocumentHandle,
  centerPage: number,
  radius = 2,
  options?: PdfRenderOptions,
) {
  const start = Math.max(1, centerPage - radius);
  const end = Math.min(handle.numPages, centerPage + radius);
  const tasks: Promise<string>[] = [];
  for (let page = start; page <= end; page += 1) {
    tasks.push(handle.renderPage(page, options));
  }
  await Promise.all(tasks);
}
