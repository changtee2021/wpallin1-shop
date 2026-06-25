import { useEffect, useState } from "react";

export type CatalogDevice = "mobile" | "tablet" | "desktop";

export type CatalogBookLayout = {
  device: CatalogDevice;
  usePortrait: boolean;
  width: number;
  height: number;
  maxWidth: number;
  quality: number;
  compactToolbar: boolean;
};

export function detectCatalogDevice(): CatalogDevice {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function getCatalogBookLayout(): CatalogBookLayout {
  if (typeof window === "undefined") {
    return {
      device: "desktop",
      usePortrait: false,
      width: 420,
      height: 594,
      maxWidth: 420,
      quality: 0.85,
      compactToolbar: false,
    };
  }

  const device = detectCatalogDevice();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const landscape = vw > vh;

  const chromeHeight =
    device === "mobile" ? 260 : device === "tablet" ? 280 : 240;
  const maxHeight = Math.max(300, vh - chromeHeight);

  const horizontalInset =
    device === "mobile" ? 8 : device === "tablet" ? 16 : 32;

  let usePortrait = device !== "desktop";
  let pageWidth: number;

  if (device === "mobile") {
    pageWidth = vw - horizontalInset * 2;
    usePortrait = true;
  } else if (device === "tablet") {
    if (landscape) {
      pageWidth = Math.min(Math.floor((vw - horizontalInset * 2) / 2), 460);
      usePortrait = false;
    } else {
      pageWidth = Math.min(vw - horizontalInset * 2, 540);
      usePortrait = true;
    }
  } else {
    const containerMax = Math.min(vw - 64, 960);
    pageWidth = Math.floor(containerMax / 2) - 12;
    usePortrait = false;
  }

  let pageHeight = Math.floor(pageWidth * 1.414);
  if (pageHeight > maxHeight) {
    pageHeight = maxHeight;
    pageWidth = Math.floor(pageHeight / 1.414);
  }

  pageWidth = Math.max(240, Math.round(pageWidth));
  pageHeight = Math.max(340, Math.round(pageHeight));

  return {
    device,
    usePortrait,
    width: pageWidth,
    height: pageHeight,
    maxWidth: pageWidth,
    quality: device === "mobile" ? 0.78 : device === "tablet" ? 0.82 : 0.85,
    compactToolbar: device !== "desktop",
  };
}

export function useCatalogViewport(): CatalogBookLayout {
  const [layout, setLayout] = useState(getCatalogBookLayout);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setLayout(getCatalogBookLayout()), 120);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return layout;
}
