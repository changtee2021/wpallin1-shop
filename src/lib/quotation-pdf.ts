function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function downloadQuotationElementPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { PDFDocument }] = await Promise.all([
    import("html2canvas-pro"),
    import("pdf-lib"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const doc = await PDFDocument.create();
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const page = doc.addPage([pageWidth, pageHeight]);
  const png = await doc.embedPng(dataUrlToBytes(canvas.toDataURL("image/png")));

  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const ratio = Math.min(maxWidth / png.width, maxHeight / png.height);
  const width = png.width * ratio;
  const height = png.height * ratio;

  page.drawImage(png, {
    x: (pageWidth - width) / 2,
    y: pageHeight - margin - height,
    width,
    height,
  });

  const bytes = await doc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
