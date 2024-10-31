import { useEffect, useRef, useState } from "react";
import { PDFDocumentProxy } from "pdfjs-dist";
import { pagesInViewArray } from "../types";

interface VirtualisedListProps {
  numPages: number;
  pageHeight: number;
  pageSpacing: number;
  viewportWidth: number;
  viewportHeight: number;
  pdfDoc: PDFDocumentProxy | null;
  currentPageIndex: number;
  setCurrentPageIndex: (pageIndex: number) => void;
  renderPage: (pdf: PDFDocumentProxy, pageNum: number) => Promise<string>;
  appendPageInView: (
    pdfDoc: PDFDocumentProxy,
    pagesInView: pagesInViewArray
  ) => Promise<pagesInViewArray>;
  prependPageInView: (
    pdfDoc: PDFDocumentProxy,
    pagesInView: pagesInViewArray
  ) => Promise<pagesInViewArray>;
  scale: number;
}

const RATIO_ISO_216_PAPER_SIZE = Math.sqrt(2);

const VirtualisedList = ({
  numPages,
  pageHeight,
  pageSpacing,
  viewportWidth,
  viewportHeight,
  pdfDoc,
  currentPageIndex,
  setCurrentPageIndex,
  renderPage,
  appendPageInView,
  prependPageInView,
  scale,
}: VirtualisedListProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScaleRef = useRef(scale);

  const [pagesInView, setPagesInView] = useState<{ index: number; url: string }[]>([]);

  // Apply Scale to Page Height (Zoomed in or Zoomed out)
  pageHeight = pageHeight * scale;

  // Calculate Pdf Container Height based on Page Height and Number of Pages
  const pdfContainerHeight = numPages * pageHeight + (numPages + 1) * pageSpacing;

  // Update scroll position on new scale
  useEffect(() => {
    if (viewportRef.current) {
      const currentScrollPosition = viewportRef.current.scrollTop;

      if (currentScrollPosition !== 0) {
        const newScrollPosition = (scale * currentScrollPosition) / previousScaleRef.current;
        viewportRef.current.scrollTop = newScrollPosition;
      }

      previousScaleRef.current = scale;
    }
  }, [scale, numPages, pageHeight, pageSpacing]);

  const effectivePageHeight = pageHeight + pageSpacing;

  const handleScroll = () => {
    if (viewportRef.current) {
      const { scrollTop } = viewportRef.current;
      const pageCalc = scrollTop / effectivePageHeight;
      const newPageIndex = Math.floor(pageCalc);
      if (newPageIndex !== currentPageIndex) {
        setCurrentPageIndex(newPageIndex);
      }
    }
  };

  // loading initial 5 or less pages
  // leave this in useEffect, because numPages is going to change
  // when pdf file loaded from 0 to X
  useEffect(() => {
    if (!pdfDoc) return;
    const loadPages = async () => {
      const pagesInView = [];
      for (let i = 0; i < Math.min(numPages, 5); i++) {
        const pageImgUrl = await renderPage(pdfDoc, i + 1);
        pagesInView.push({
          index: i,
          url: pageImgUrl,
        });
      }
      return pagesInView;
    };
    if (pdfDoc) {
      loadPages().then((pagesInView) => {
        setPagesInView(pagesInView);
      });
    }
  }, [numPages, pdfDoc]);

  // update pagesInView when scrolling
  useEffect(() => {
    if (!pdfDoc) return;
    if (pagesInView.length < 0) return;

    // if scrolling down past the middle page in pagesInView
    if (
      currentPageIndex === pagesInView[pagesInView.length - 2].index &&
      pagesInView[pagesInView.length - 1].index !== numPages - 1
    ) {
      appendPageInView(pdfDoc, pagesInView).then((pagesInView) => {
        // remove page from front of queue
        pagesInView.shift();
        setPagesInView(pagesInView);
      });
    }

    // if scrolling up past the middle page in pagesInView
    if (currentPageIndex === pagesInView[1].index && pagesInView[0].index !== 0) {
      prependPageInView(pdfDoc, pagesInView).then((pagesInView) => {
        // remove page from rear of queue
        pagesInView.pop();
        setPagesInView(pagesInView);
      });
    }
  }, [currentPageIndex]);

  // update pagesInView when zooming out (add pages)

  return (
    <div
      style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
      className="overflow-scroll relative bg-[#f5f5f5] px-8"
      ref={viewportRef}
      onScroll={handleScroll}
    >
      {/* Pdf Container */}
      <div
        style={{
          height: `${pdfContainerHeight}px`,
          width: `${pageHeight / RATIO_ISO_216_PAPER_SIZE}px`,
        }}
        className="relative mx-auto"
      >
        {pagesInView.length > 0 &&
          pagesInView.map(({ index, url }) => {
            const top = index * pageHeight + pageSpacing * (index + 1);

            return (
              <div
                key={`page-${index + 1}`}
                style={{
                  height: `${pageHeight}px`,
                  width: `${pageHeight / RATIO_ISO_216_PAPER_SIZE}px`,
                  top: `${top}px`,
                }}
                className="absolute shadow-md border border-gray-50 p-2 flex justify-center items-center bg-white"
              >
                <img
                  alt={`page ${index + 1} of the x doc`}
                  src={url}
                  className="w-auto h-auto max-h-full max-w-full"
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default VirtualisedList;
