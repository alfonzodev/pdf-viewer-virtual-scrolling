import { useEffect, useRef } from "react";
import { VirtualisedListProps } from "../types";
import useVirtualisedList from "../hooks/useVirtualisedList";
import { calculatePdfContainerHeight, calculateEffectivePageHeight } from "../utils";

const RATIO_ISO_216_PAPER_SIZE = Math.sqrt(2);

const VirtualisedList = ({
  numPages,
  pageHeight,
  pageSpacing,
  viewportWidth,
  viewportHeight,
  pdfDoc,
  currentPage,
  setCurrentPage,
  renderPage,
  appendPagesInView,
  prependPagesInView,
  scale,
}: VirtualisedListProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScaleRef = useRef(scale);
  const previousPageRef = useRef(currentPage);

  const { pagesInView, enqueueOperation, loadNextPage, loadPreviousPage } = useVirtualisedList();

  // Apply scale to page height (zoomed in or zoomed out)
  const scaledPageHeight = pageHeight * scale;

  const effectivePageHeight = calculateEffectivePageHeight(scaledPageHeight, pageSpacing);

  // Calculate pdf container height based on page height and number of pages
  const pdfContainerHeight = calculatePdfContainerHeight(numPages, scaledPageHeight, pageSpacing);

  // Update scroll position on new scale
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
      style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
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
