import { useEffect, useRef, useState } from "react";
import { VirtualisedListProps } from "../types";
import useVirtualisedList from "../hooks/useVirtualisedList";
import {
  calculatePdfContainerHeight,
  calculateEffectivePageHeight,
  getBreakPoint,
  RATIO_ISO_216_PAPER_SIZE,
  PDF_VIEWER_WIDTH,
} from "../utils";

const VirtualisedList = ({
  numPages,
  pageHeight,
  pageSpacing,
  viewerHeight,
  pdfDoc,
  currentPage,
  setCurrentPage,
  renderPage,
  appendPagesInView,
  prependPagesInView,
  scale,
}: VirtualisedListProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScaleRef = useRef<number>(scale);
  const previousPageRef = useRef<number>(currentPage);
  const [screenBreakpoint, setScreenBreakPoint] = useState<keyof typeof PDF_VIEWER_WIDTH>(
    getBreakPoint(window.innerWidth)
  );

  const { pagesInView, enqueueOperation, loadNextPage, loadPreviousPage } = useVirtualisedList();

  // Event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      // update breakpoint based on window width
      const newBreakpoint = getBreakPoint(window.innerWidth);
      setScreenBreakPoint(newBreakpoint);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply scale to page height (zoomed in or zoomed out)
  const scaledPageHeight = pageHeight * scale;

  const effectivePageHeight = calculateEffectivePageHeight(scaledPageHeight, pageSpacing);

  // Calculate pdf container height based on page height and number of pages
  const pdfContainerHeight = calculatePdfContainerHeight(numPages, scaledPageHeight, pageSpacing);

  // Update scroll position on resize of viewport
  useEffect(() => {}, []);

  // Update scroll position on new scale of pdf
  useEffect(() => {
    if (viewportRef.current) {
      const currentScrollPosition = viewportRef.current.scrollTop;

      if (currentScrollPosition !== 0) {
        const newScrollPosition = (scale * currentScrollPosition) / previousScaleRef.current;
        previousScaleRef.current = scale;
        viewportRef.current.scrollTop = newScrollPosition;
      }
    }
  }, [scale, numPages, scaledPageHeight, pageSpacing]);

  // Update current page index on scroll
  const handleScroll = () => {
    if (viewportRef.current) {
      const { scrollTop } = viewportRef.current;
      const pageCalc = (scrollTop + 1) / effectivePageHeight;
      const newPage = Math.ceil(pageCalc);
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
        return await loadPreviousPage(pdfDoc, currentPagesInView, currentPage, prependPagesInView);
      });
    }
  }, [currentPage, numPages, pdfDoc, enqueueOperation, appendPagesInView, prependPagesInView]);

  return (
    <div
      style={{
        width: `${PDF_VIEWER_WIDTH[screenBreakpoint]}px`,
        height: `${viewerHeight}px`,
      }}
      className="overflow-scroll relative bg-[#f5f5f5] px-8"
      ref={viewportRef}
      onScroll={handleScroll}
    >
      {/* Pdf Container */}
      <div
        style={{
          height: `${pdfContainerHeight}px`,
          width: `${scaledPageHeight / RATIO_ISO_216_PAPER_SIZE}px`,
        }}
        className="relative mx-auto"
      >
        {pagesInView.length > 0 &&
          pagesInView.map(({ page, url }) => {
            const top = (page - 1) * scaledPageHeight + pageSpacing * page;

            return (
              <div
                key={`page-${page}`}
                style={{
                  height: `${scaledPageHeight}px`,
                  width: `${scaledPageHeight / RATIO_ISO_216_PAPER_SIZE}px`,
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
  );
};

export default VirtualisedList;
