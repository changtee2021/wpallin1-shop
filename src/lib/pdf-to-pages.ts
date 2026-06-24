import * as pdfjs from "pdfjs-dist";

let workerConfigured = false;

function ensureWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  workerConfigured = true;
}

export type PdfDocumentHandle = {
  numPages: number;
  renderPage: (pageNumber: number, scale?: number) => Promise<string>;
  destroy: () => void;
};

const pageCache = new Map<string, Map<number, string>>();

function cacheKey(pdfUrl: string) {
  return pdfUrl;
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

  return {
    numPages: pdf.numPages,
    async renderPage(pageNumber: number, scale = 1.5) {
      const cache = getCache();
      const cached = cache.get(pageNumber);
      if (cached) return cached;

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas not supported");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport, canvas }).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      cache.set(pageNumber, dataUrl);
      page.cleanup();
      return dataUrl;
    },
    destroy() {
      pageCache.delete(cacheKey(pdfUrl));
      void pdf.destroy();
    },
  };
}

export async function preloadPdfPages(
  handle: PdfDocumentHandle,
  centerPage: number,
  radius = 2,
) {
  const start = Math.max(1, centerPage - radius);
  const end = Math.min(handle.numPages, centerPage + radius);
  const tasks: Promise<string>[] = [];
  for (let page = start; page <= end; page += 1) {
    tasks.push(handle.renderPage(page));
  }
  await Promise.all(tasks);
}
