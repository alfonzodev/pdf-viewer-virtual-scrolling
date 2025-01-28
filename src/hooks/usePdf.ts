import * as pdfjs from "pdfjs-dist";
import { useState, useCallback } from "react";
import { appendPagesInView, prependPagesInView } from "../types";
import { renderPage } from "../utils";

const usePdf = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

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
