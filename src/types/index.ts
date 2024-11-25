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

export interface VirtualisedListProps {
  numPages: number;
  pageSpacing: number;
  viewerHeight: number;
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  setCurrentPage: (pageIndex: number) => void;
  renderPage: (pdf: PDFDocumentProxy, pageNum: number) => Promise<string>;
  appendPagesInView: appendPagesInView;
  prependPagesInView: prependPagesInView;
  scale: number;
  zoomOut: () => void;
  zoomIn: () => void;
}

export interface ControlsProps {
  zoomOut: () => void;
  zoomIn: () => void;
  currentPage: number;
  numPages: number;
  pdfDoc: PDFDocumentProxy | null;
}

export type QueueOperation = (currentPagesInView: pageInView[]) => Promise<pageInView[]>;
