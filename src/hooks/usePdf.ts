import * as pdfjs from "pdfjs-dist";
import { useState, useCallback } from "react";
import { appendPagesInView, prependPagesInView } from "../types";

const usePdf = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  const renderPage = useCallback(async (pdf: pdfjs.PDFDocumentProxy, pageNum: number) => {
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
  }, []);

  const loadPdfDoc = async (file: File) => {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(fileArrayBuffer).promise;
    const { numPages } = pdf;
    setPdfDoc(pdf);
    setNumPages(numPages);
  };

  const prependPagesInView: prependPagesInView = useCallback(
    async (prependAmount, pdfDoc, pagesInView) => {
      const newPagesInView = [...pagesInView];
      for (let i = 0; i < prependAmount; i++) {
        const newPage = newPagesInView[0].page - 1;
        const pageImgUrl = await renderPage(pdfDoc, newPage);
        // add page to start of queue
        newPagesInView.unshift({ page: newPage, url: pageImgUrl });
      }

      return newPagesInView;
    },
    [renderPage]
  );

  const appendPagesInView: appendPagesInView = useCallback(
    async (appendAmount, pdfDoc, pagesInView) => {
      const newPagesInView = [...pagesInView];
      for (let i = 0; i < appendAmount; i++) {
        const newPage = newPagesInView[newPagesInView.length - 1].page + 1;
        const pageImgUrl = await renderPage(pdfDoc, newPage);
        // add page to rear of queue
        newPagesInView.push({
          page: newPage,
          url: pageImgUrl,
        });
      }
      return newPagesInView;
    },
    [renderPage]
  );

  return {
    renderPage,
    loadPdfDoc,
    prependPagesInView,
    appendPagesInView,
    pdfDoc,
    numPages,
  };
};

export default usePdf;
