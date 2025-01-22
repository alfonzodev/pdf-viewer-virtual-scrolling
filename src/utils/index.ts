export const calculatePdfContainerHeight = (
  numPages: number,
  pageHeight: number,
  pageSpacing: number
) => numPages * pageHeight + (numPages + 1) * pageSpacing;

export const calculateEffectivePageHeight = (
  pageHeight: number,
  pageSpacing: number
) => pageHeight + pageSpacing;

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

export const currentPageCalc = (
  scrollTop: number,
  effectivePageHeight: number
) => {
  return (scrollTop + 1) / effectivePageHeight;
};
