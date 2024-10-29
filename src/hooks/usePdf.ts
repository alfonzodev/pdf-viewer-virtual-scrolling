import * as pdfjs from "pdfjs-dist";
import { useState } from "react";

const usePdf = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  const renderPage = async (pdf: pdfjs.PDFDocumentProxy, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const outputScale = Math.min(window.devicePixelRatio, 2);

    // Create an off-DOM canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const renderContext = {
      canvasContext: context,
      transform,
      viewport,
    };

    //@ts-expect-error the render context is not null. It was assigned above
    await page.render(renderContext).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      });
    });

    const pageImageUrl = URL.createObjectURL(blob);
    return pageImageUrl;
  };

  const loadPdfDoc = async (file: File) => {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(fileArrayBuffer).promise;
    const { numPages } = pdf;
    setPdfDoc(pdf);
    setNumPages(numPages);
  };

  return { renderPage, loadPdfDoc, pdfDoc, numPages };
};

export default usePdf;
