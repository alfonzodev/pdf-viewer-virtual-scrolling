import { useEffect, useRef, useState, useCallback } from "react";
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
  appendPagesInView: (
    appendAmount: number,
    pdfDoc: PDFDocumentProxy,
    pagesInView: pagesInViewArray
  ) => Promise<pagesInViewArray>;
  prependPagesInView: (
    prependAmount: number,
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
  appendPagesInView,
  prependPagesInView,
  scale,
}: VirtualisedListProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScaleRef = useRef(scale);
  const previousPageIndexRef = useRef(currentPageIndex);

  const [pagesInView, setPagesInView] = useState<{ index: number; url: string }[]>([]);

  // Queue system for managing async operations (Prevent race conditions)
  type QueueOperation = (currentPagesInView: typeof pagesInView) => Promise<typeof pagesInView>;
  const operationQueueRef = useRef<QueueOperation[]>([]);
  const isProcessingRef = useRef(false);
  const latestPagesInViewRef = useRef(pagesInView);

  // Keep latestPagesInViewRef in sync with currentPages state
  useEffect(() => {
    latestPagesInViewRef.current = pagesInView;
  }, [pagesInView]);

  // Process the queue of async operations
  const processQueue = useCallback(async () => {
    // if processing return. the current while loop will handle new operations added to the operationQueue
    if (isProcessingRef.current) return;

    if (operationQueueRef.current.length === 0) return;

    try {
      isProcessingRef.current = true;

      while (operationQueueRef.current.length > 0) {
        const operation = operationQueueRef.current[0];
        operationQueueRef.current.shift();

        // Each operation receives the latest pages in view from the ref
        const currentPagesInView = await operation(latestPagesInViewRef.current);
        // Update react state
        setPagesInView(currentPagesInView);
        // Update our latest pages in view ref immediately
        latestPagesInViewRef.current = currentPagesInView;
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Add operation to queue
  const enqueOperation = useCallback(
    (operation: QueueOperation) => {
      operationQueueRef.current.push(operation);
      processQueue();
    },
    [processQueue]
  );

  // Apply scale to page height (zoomed in or zoomed out)
  pageHeight = pageHeight * scale;

  // Calculate pdf container height based on page height and number of pages
  const pdfContainerHeight = numPages * pageHeight + (numPages + 1) * pageSpacing;

  // Update scroll position on new scale
  useEffect(() => {
    if (viewportRef.current) {
      const currentScrollPosition = viewportRef.current.scrollTop;

      if (currentScrollPosition !== 0) {
        const newScrollPosition = (scale * currentScrollPosition) / previousScaleRef.current;
        viewportRef.current.scrollTop = newScrollPosition;
      }
    }
  }, [scale, numPages, pageHeight, pageSpacing]);

  const effectivePageHeight = pageHeight + pageSpacing;

  // Update current page index on scroll
  const handleScroll = () => {
    if (viewportRef.current) {
      const { scrollTop } = viewportRef.current;
      const pageCalc = scrollTop / effectivePageHeight;
      const newPageIndex = Math.floor(pageCalc);
      if (newPageIndex !== currentPageIndex) {
        previousPageIndexRef.current = currentPageIndex;
        setCurrentPageIndex(newPageIndex);
      }
    }
  };

  // Load initial 5 or less pages
  useEffect(() => {
    if (!pdfDoc) return;
    enqueOperation(async (currentPagesInView) => {
      const pagesInView = [...currentPagesInView];
      for (let i = 0; i < Math.min(numPages, 5); i++) {
        const pageImgUrl = await renderPage(pdfDoc, i + 1);
        pagesInView.push({
          index: i,
          url: pageImgUrl,
        });
      }
      return pagesInView;
    });
  }, [numPages, pdfDoc, enqueOperation, renderPage]);

  // Update pagesInView when scrolling
  useEffect(() => {
    if (!pdfDoc) return;

    // If scrolling down
    if (currentPageIndex > previousPageIndexRef.current) {
      enqueOperation(async (currentPagesInView) => {
        const midPointPagesInView = Math.floor(currentPagesInView.length / 2);
        // If user is past mid point of currentPagesInView batch and batch did not reach the EOF
        if (
          currentPageIndex > currentPagesInView[midPointPagesInView].index &&
          currentPagesInView[currentPagesInView.length - 1].index !== numPages - 1
        ) {
          const updatedPagesInView = await appendPagesInView(1, pdfDoc, currentPagesInView);
          updatedPagesInView.shift();
          return updatedPagesInView;
        }
        // Return unchanged current pages if no change needed
        return currentPagesInView;
      });
    }

    // If scrolling up
    if (currentPageIndex < previousPageIndexRef.current) {
      enqueOperation(async (currentPagesInView) => {
        const midPointPagesInView = Math.floor(currentPagesInView.length / 2);
        //  if user is behind mid point of pagesInView batch and batch did not reach the BOF
        if (
          currentPageIndex < currentPagesInView[midPointPagesInView].index &&
          currentPagesInView[0].index !== 0
        ) {
          const updatedPagesInView = await prependPagesInView(1, pdfDoc, currentPagesInView);
          updatedPagesInView.pop();
          // Return updated current pages for next operation in the queue
          return updatedPagesInView;
        }
        // Return unchanged current pages if no change needed
        return currentPagesInView;
      });
    }
  }, [currentPageIndex, numPages, pdfDoc, enqueOperation, appendPagesInView, prependPagesInView]);

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
