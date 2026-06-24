import { useCallback, useEffect, useRef, useState } from "react";

import {
  openPdfDocument,
  preloadPdfPages,
  type PdfDocumentHandle,
} from "@/lib/pdf-to-pages";

export function useCatalogPdf(pdfUrl: string) {
  const [doc, setDoc] = useState<PdfDocumentHandle | null>(null);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageImagesRef = useRef(pageImages);
  pageImagesRef.current = pageImages;

  useEffect(() => {
    let active = true;
    let handle: PdfDocumentHandle | null = null;

    async function load() {
      setLoading(true);
      setError(null);
      setPageImages({});
      setNumPages(0);
      setDoc(null);
      try {
        handle = await openPdfDocument(pdfUrl);
        if (!active) return;
        setDoc(handle);
        setNumPages(handle.numPages);
        const first = await handle.renderPage(1);
        if (!active) return;
        setPageImages({ 1: first });
        await preloadPdfPages(handle, 1, 2);
        if (!active) return;
        const batch: Record<number, string> = { 1: first };
        for (let page = 2; page <= Math.min(handle.numPages, 3); page += 1) {
          batch[page] = await handle.renderPage(page);
        }
        if (!active) return;
        setPageImages((prev) => ({ ...prev, ...batch }));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load PDF");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      handle?.destroy();
    };
  }, [pdfUrl]);

  const ensurePageLoaded = useCallback(
    async (pageNumber: number, scale?: number) => {
      if (!doc) return;
      if (pageImagesRef.current[pageNumber] && !scale) return;
      const src = await doc.renderPage(pageNumber, scale);
      setPageImages((prev) => ({ ...prev, [pageNumber]: src }));
      if (!scale) {
        await preloadPdfPages(doc, pageNumber, 2);
      }
    },
    [doc],
  );

  return {
    doc,
    pageImages,
    numPages,
    loading,
    error,
    ensurePageLoaded,
  };
}
