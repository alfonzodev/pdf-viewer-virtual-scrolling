import { PDFDocumentProxy } from "pdfjs-dist";

export type pageInView = { page: number; url: string };

export type appendPagesInView = (
  appendAmount: number,
  pdfDoc: PDFDocumentProxy,
  pagesInView: pageInView[]
) => Promise<pageInView[]>;

export type prependPagesInView = (
  prependAmount: number,
  pdfDoc: PDFDocumentProxy,
  pagesInView: pageInView[]
) => Promise<pageInView[]>;

export type QueueOperation = (
  currentPagesInView: pageInView[]
) => Promise<pageInView[]>;
