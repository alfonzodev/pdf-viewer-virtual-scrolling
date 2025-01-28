import { useCallback, useEffect, useRef, useState } from "react";

import usePdf from "../hooks/usePdf";
import useScale from "../hooks/useScale";
import useVirtualisedList from "../hooks/useVirtualisedList";
import {
  calculateEffectivePageHeight,
  calculatePdfContainerHeight,
  currentPageCalc,
  debounce,
  getBreakPoint,
  PDF_VIEWER_WIDTH,
  RATIO_ISO_216_PAPER_SIZE,
} from "../utils";
import Controls from "./Controls";
import FileSelect from "./FileSelect";

const pageSpacing = 15;
const viewerHeight = 500;

const PdfViewer = () => {
  const [file, setFile] = useState<File | null>(null);

  const { loadPdfDoc, pdfDoc, numPages, prependPagesInView, appendPagesInView } = usePdf();
  const { scale, setScale, zoomOut, zoomIn, handleTouchMove } = useScale();
  const { pagesInView, setPagesInView, enqueueOperation, loadNextPage, loadPreviousPage, loadPagesBatch } =
    useVirtualisedList();

  const [currentPage, setCurrentPage] = useState<number>(1);

  const viewerRef = useRef<HTMLDivElement>(null);
  const previousScaleRef = useRef<number>(scale);
  const previousPageRef = useRef<number>(currentPage);
  const [screenBreakpoint, setScreenBreakPoint] = useState<keyof typeof PDF_VIEWER_WIDTH>(
    getBreakPoint(window.innerWidth)
  );

  const pageWidth = Math.min(PDF_VIEWER_WIDTH[screenBreakpoint] - 20, 500) * scale;
  const pageHeight = pageWidth * RATIO_ISO_216_PAPER_SIZE;
  const effectivePageHeight = calculateEffectivePageHeight(pageHeight, pageSpacing);
  const pdfContainerHeight = calculatePdfContainerHeight(numPages, pageHeight, pageSpacing);

  // file reset
  useEffect(() => {
    if (file) {
      setPagesInView([]);
      setScale(1);
      loadPdfDoc(file);
    }
    if (viewerRef.current) {
      viewerRef.current.scrollTop = 0;
    }
  }, [file]);

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
        const newScrollPosition = (scale * currentScrollPosition) / previousScaleRef.current;
        previousScaleRef.current = scale;
        viewerRef.current.scrollTop = newScrollPosition;
      }
    }
  }, [scale, numPages, pageSpacing]);

  // Update scroll position on page down button press
  const handlePageDown = () => {
    if (viewerRef.current) {
      const newCurrentPage = currentPage > 1 ? currentPage - 1 : currentPage;
      const newScrollPosition = (newCurrentPage - 1) * effectivePageHeight;
      viewerRef.current.scrollTop = newScrollPosition;
    }
  };

  // Update scroll position on page up button press
  const handlePageUp = () => {
    if (viewerRef.current) {
      const newCurrentPage = currentPage < numPages ? currentPage + 1 : currentPage;
      const newScrollPosition = (newCurrentPage - 1) * effectivePageHeight;
      viewerRef.current.scrollTop = newScrollPosition;
    }
  };

  // Update current page index on scroll
  const handleScroll = () => {
    if (viewerRef.current) {
      const { scrollTop } = viewerRef.current;
      const newPage = Math.ceil(currentPageCalc(scrollTop, effectivePageHeight));
      if (newPage !== currentPage) {
        previousPageRef.current = currentPage;
        setCurrentPage(newPage);
      }
    }
  };

  // Load initial 5 or less pages
  useEffect(() => {
    if (!pdfDoc) return;
    loadPagesBatch(pdfDoc, numPages, 1, 5, viewerRef, effectivePageHeight);
  }, [numPages, pdfDoc]);

  // Update pagesInView when scrolling
  useEffect(() => {
    if (!pdfDoc) return;

    // If scrolling down
    if (currentPage > previousPageRef.current) {
      enqueueOperation(async (currentPagesInView) => {
        return await loadNextPage(pdfDoc, currentPagesInView, currentPage, numPages, appendPagesInView);
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
    <div className="select-none">
      <div className="w-full bg-white h-10 border-b  py-1 px-4 flex justify-start items-center">
        {file && <h1 className="font-medium text-sm">{file.name}</h1>}
      </div>
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
        setCurrentPage={setCurrentPage}
        numPages={numPages}
        pdfDoc={pdfDoc}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
        handlePageDown={handlePageDown}
        handlePageUp={handlePageUp}
        loadPagesBatch={loadPagesBatch}
        viewerRef={viewerRef}
        effectivePageHeight={effectivePageHeight}
      />
      <FileSelect setFile={setFile} />
    </div>
  );
};

export default PdfViewer;
