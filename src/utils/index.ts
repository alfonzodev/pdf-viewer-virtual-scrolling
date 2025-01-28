import { PDFDocumentProxy } from "pdfjs-dist";

export const calculatePdfContainerHeight = (numPages: number, pageHeight: number, pageSpacing: number) =>
  numPages * pageHeight + (numPages + 1) * pageSpacing;

export const calculateEffectivePageHeight = (pageHeight: number, pageSpacing: number) =>
  pageHeight + pageSpacing;

export const RATIO_ISO_216_PAPER_SIZE = Math.sqrt(2);

// width of the pdf viewer at each breakpoint
export const PDF_VIEWER_WIDTH = {
  "3xs": 295,
  "2xs": 310,
  xs: 355,
  sm: 410,
  md: 590,
  lg: 700,
  xl: 950,
};

export const getBreakPoint = (windowWidth: number) => {
  if (windowWidth >= 1024) return "xl";
  if (windowWidth >= 768) return "lg";
  if (windowWidth >= 640) return "md";
  if (windowWidth >= 425) return "sm";
  if (windowWidth >= 375) return "xs";
  if (windowWidth >= 320) return "2xs";
  else return "3xs";
};

export const debounce = (func: () => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
};

export const currentPageCalc = (scrollTop: number, effectivePageHeight: number) => {
  return (scrollTop + 1) / effectivePageHeight;
};

export const renderPage = async (pdf: PDFDocumentProxy, pageNum: number) => {
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
