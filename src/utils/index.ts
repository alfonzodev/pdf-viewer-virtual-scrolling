export const calculatePdfContainerHeight = (
  numPages: number,
  pageHeight: number,
  pageSpacing: number
) => numPages * pageHeight + (numPages + 1) * pageSpacing;

export const calculateEffectivePageHeight = (pageHeight: number, pageSpacing: number) =>
  pageHeight + pageSpacing;
