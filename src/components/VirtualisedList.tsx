import { useCallback, useEffect, useRef, useState } from "react";
import { appendPagesInView, prependPagesInView } from "../types";
import useVirtualisedList from "../hooks/useVirtualisedList";
import {
  calculatePdfContainerHeight,
  calculateEffectivePageHeight,
  getBreakPoint,
  RATIO_ISO_216_PAPER_SIZE,
  PDF_VIEWER_WIDTH,
  debounce,
  currentPageCalc,
} from "../utils";
import Controls from "./Controls";
import { PDFDocumentProxy } from "pdfjs-dist";

type VirtualisedListProps = {
  numPages: number;
  pageSpacing: number;
  viewerHeight: number;
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  renderPage: (pdf: PDFDocumentProxy, pageNum: number) => Promise<string>;
  appendPagesInView: appendPagesInView;
  prependPagesInView: prependPagesInView;
  scale: number;
  handleTouchMove: (
    e: React.TouchEvent<HTMLDivElement>,
    pdfDoc: PDFDocumentProxy | null
  ) => void;
  zoomOut: () => void;
  zoomIn: () => void;
};

const VirtualisedList = ({
  numPages,
  pageSpacing,
  viewerHeight,
  pdfDoc,
  currentPage,
  setCurrentPage,
  renderPage,
  appendPagesInView,
  prependPagesInView,
  scale,
  handleTouchMove,
  zoomOut,
  zoomIn,
}: VirtualisedListProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const previousScaleRef = useRef<number>(scale);
  const previousPageRef = useRef<number>(currentPage);
  const [screenBreakpoint, setScreenBreakPoint] = useState<
    keyof typeof PDF_VIEWER_WIDTH
  >(getBreakPoint(window.innerWidth));

  const { pagesInView, enqueueOperation, loadNextPage, loadPreviousPage } =
    useVirtualisedList();

  const pageWidth =
    Math.min(PDF_VIEWER_WIDTH[screenBreakpoint] - 20, 500) * scale;
  const pageHeight = pageWidth * RATIO_ISO_216_PAPER_SIZE;
  const effectivePageHeight = calculateEffectivePageHeight(
    pageHeight,
    pageSpacing
  );
  const pdfContainerHeight = calculatePdfContainerHeight(
    numPages,
    pageHeight,
    pageSpacing
  );

  // Memoized debounced resize handler function
  const debouncedHandleResize = useCallback(
    debounce(() => {
      // update breakpoint based on window width
      const newBreakpoint = getBreakPoint(window.innerWidth);
      setScreenBreakPoint(newBreakpoint);
    }, 150),
    [getBreakPoint]
  );

  // Event listener for window resize
  useEffect(() => {
    window.addEventListener("resize", debouncedHandleResize);
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, [debouncedHandleResize]);

  // Update scroll position on resize of viewport
  useEffect(() => {
    if (viewerRef.current) {
      const newScrollPosition = (currentPage - 1) * effectivePageHeight;
      viewerRef.current.scrollTop = newScrollPosition;
    }
  }, [screenBreakpoint]);

  // Update scroll position on new scale of pdf
  useEffect(() => {
    if (viewerRef.current) {
      const currentScrollPosition = viewerRef.current.scrollTop;

      if (currentScrollPosition !== 0) {
        const newScrollPosition =
          (scale * currentScrollPosition) / previousScaleRef.current;
        previousScaleRef.current = scale;
        viewerRef.current.scrollTop = newScrollPosition;
      }
    }
  }, [scale, numPages, pageSpacing]);

  // Update scroll position on page down
  const handlePageDown = () => {
    if (viewerRef.current) {
      const newCurrentPage = currentPage > 1 ? currentPage - 1 : currentPage;
      const newScrollPosition = (newCurrentPage - 1) * effectivePageHeight;
      viewerRef.current.scrollTop = newScrollPosition;
    }
  };

  // Update scroll position on page up
  const handlePageUp = () => {
    if (viewerRef.current) {
      const newCurrentPage =
        currentPage < numPages ? currentPage + 1 : currentPage;
      const newScrollPosition = (newCurrentPage - 1) * effectivePageHeight;
      viewerRef.current.scrollTop = newScrollPosition;
    }
  };

  // Update current page index on scroll
  const handleScroll = () => {
    if (viewerRef.current) {
      const { scrollTop } = viewerRef.current;
      const newPage = Math.ceil(
        currentPageCalc(scrollTop, effectivePageHeight)
      );
      if (newPage !== currentPage) {
        previousPageRef.current = currentPage;
        setCurrentPage(newPage);
      }
    }
  };

  // Load initial 5 or less pages
  useEffect(() => {
    if (!pdfDoc) return;
    enqueueOperation(async (currentPagesInView) => {
      const pagesInView = [...currentPagesInView];
      for (let i = 1; i <= Math.min(numPages, 5); i++) {
        const pageImgUrl = await renderPage(pdfDoc, i);
        pagesInView.push({
          page: i,
          url: pageImgUrl,
        });
      }
      return pagesInView;
    });
  }, [numPages, pdfDoc, enqueueOperation, renderPage]);

  // Update pagesInView when scrolling
  useEffect(() => {
    if (!pdfDoc) return;

    // If scrolling down
    if (currentPage > previousPageRef.current) {
      enqueueOperation(async (currentPagesInView) => {
        return await loadNextPage(
          pdfDoc,
          currentPagesInView,
          currentPage,
          numPages,
          appendPagesInView
        );
      });
    }

    // If scrolling up
    if (currentPage < previousPageRef.current) {
      enqueueOperation(async (currentPagesInView) => {
        return await loadPreviousPage(
          pdfDoc,
          currentPagesInView,
          currentPage,
          prependPagesInView
        );
      });
    }
  }, [
    currentPage,
    numPages,
    pdfDoc,
    enqueueOperation,
    appendPagesInView,
    prependPagesInView,
  ]);

  return (
    <>
      <div
        style={{
          width: `${PDF_VIEWER_WIDTH[screenBreakpoint]}px`,
          height: `${viewerHeight}px`,
        }}
        onTouchMove={(e) => handleTouchMove(e, pdfDoc)}
        className="overflow-scroll relative bg-[#f5f5f5] px-2 sm:px-4 lg:px-8 "
        ref={viewerRef}
        onScroll={handleScroll}
      >
        {/* Pdf Document Container */}
        <div
          style={{
            height: `${pdfContainerHeight}px`,
            width: `${pageWidth}px`,
          }}
          className="relative mx-auto"
        >
          {pagesInView.length > 0 &&
            pagesInView.map(({ page, url }) => {
              const top = (page - 1) * pageHeight + pageSpacing * page;

              return (
                <div
                  key={`page-${page}`}
                  style={{
                    height: `${pageHeight}px`,
                    width: `${pageWidth}px`,
                    top: `${top}px`,
                  }}
                  className="absolute shadow-md border border-gray-50 p-2 flex justify-center items-center bg-white"
                >
                  <img
                    alt={`page ${page} of the x doc`}
                    src={url}
                    className="w-auto h-auto max-h-full max-w-full"
                  />
                </div>
              );
            })}
        </div>
      </div>
      <Controls
        currentPage={currentPage}
        numPages={numPages}
        pdfDoc={pdfDoc}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
        handlePageDown={handlePageDown}
        handlePageUp={handlePageUp}
      />
    </>
  );
};

export default VirtualisedList;
