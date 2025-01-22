import { useCallback, useEffect, useRef, useState } from "react";
import { appendPagesInView, pageInView, prependPagesInView, QueueOperation } from "../types";
import { PDFDocumentProxy } from "pdfjs-dist";

const useVirtualisedList = () => {
  const [pagesInView, setPagesInView] = useState<pageInView[]>([]);
  const operationQueueRef = useRef<QueueOperation[]>([]);
  const isProcessingRef = useRef(false);
  const latestPagesInViewRef = useRef(pagesInView);

  useEffect(() => {
    latestPagesInViewRef.current = pagesInView;
  }, [pagesInView]);

  // Process the queue of async operations
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || operationQueueRef.current.length === 0) return;

    isProcessingRef.current = true;
    try {
      while (operationQueueRef.current.length > 0) {
        const operation = operationQueueRef.current.shift()!;
        const currentPagesInView = await operation(latestPagesInViewRef.current);
        setPagesInView(currentPagesInView);
        latestPagesInViewRef.current = currentPagesInView;
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Add operation to queue
  const enqueueOperation = useCallback(
    (operation: QueueOperation) => {
      operationQueueRef.current.push(operation);
      processQueue();
    },
    [processQueue]
  );
  const loadNextPage = async (
    pdfDoc: PDFDocumentProxy,
    currentPagesInView: pageInView[],
    currentPage: number,
    numPages: number,
    appendPagesInView: appendPagesInView
  ) => {
    const midPointPagesInView = Math.floor(currentPagesInView.length / 2);
    // If user is past mid point of currentPagesInView batch and batch did not reach the EOF
    if (
      currentPage > currentPagesInView[midPointPagesInView].page &&
      currentPagesInView[currentPagesInView.length - 1].page !== numPages
    ) {
      const updatedPagesInView = await appendPagesInView(1, pdfDoc, currentPagesInView);
      updatedPagesInView.shift();
      return updatedPagesInView;
    }
    // Return unchanged current pages if no change needed
    return currentPagesInView;
  };

  const loadPreviousPage = async (
    pdfDoc: PDFDocumentProxy,
    currentPagesInView: pageInView[],
    currentPage: number,
    prependPagesInView: prependPagesInView
  ) => {
    const midPointPagesInView = Math.floor(currentPagesInView.length / 2);
    //  if user is behind mid point of pagesInView batch and batch did not reach the BOF
    if (currentPage < currentPagesInView[midPointPagesInView].page && currentPagesInView[0].page !== 1) {
      const updatedPagesInView = await prependPagesInView(1, pdfDoc, currentPagesInView);
      updatedPagesInView.pop();
      // Return updated current pages for next operation in the queue
      return updatedPagesInView;
    }
    // Return unchanged current pages if no change needed
    return currentPagesInView;
  };

  return {
    pagesInView,
    setPagesInView,
    latestPagesInViewRef,
    enqueueOperation,
    loadNextPage,
    loadPreviousPage,
  };
};

export default useVirtualisedList;
