import { useEffect, useRef, useState } from "react";
import { PDFDocumentProxy } from "pdfjs-dist";

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
  scale,
}: VirtualisedListProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [pagesInView, setPagesInView] = useState<{ index: number; url: string }[]>([]);

  // Apply Scale to Page Height (Zoomed in or Zoomed out)
  pageHeight = pageHeight * scale;

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

  // update the pagesInView array when page index change, if needed
  useEffect(() => {
    // pagesInView is loaded async
    if (!pagesInView.length) return;

    const updatePagesInViewOnScrollDown = async () => {
      const newPagesInView = [...pagesInView];
      const newPageIndex = pagesInView[pagesInView.length - 1].index + 1;
      const pageImgUrl = await renderPage(pdfDoc, newPageIndex + 1);
      // remove index of first page in array
      newPagesInView.shift();
      // push index of page after last in array
      newPagesInView.push({
        index: newPageIndex,
        url: pageImgUrl,
      });
      return newPagesInView;
    };

    // if crossing from middle to second to last page in pagesInView
    // and last page in pagesInView does not match numPages - 1
    if (
      currentPageIndex === pagesInView[pagesInView.length - 2].index &&
      pagesInView[pagesInView.length - 1].index !== numPages - 1
    ) {
      updatePagesInViewOnScrollDown().then((pagesInView) => {
        setPagesInView(pagesInView);
      });
    }

    const updatePagesInViewOnScrollUp = async () => {
      const newPagesInView = [...pagesInView];
      const newPageIndex = pagesInView[0].index - 1;
      const pageImgUrl = await renderPage(pdfDoc, newPageIndex + 1);
      // remove index of last page in array
      newPagesInView.pop();
      // push index of page before first in array
      newPagesInView.unshift({ index: newPageIndex, url: pageImgUrl });
      return newPagesInView;
    };

    // if crossing from middle to second page in pagesInView
    // and first page in pagesInView does not match 0
    if (currentPageIndex === pagesInView[1].index && pagesInView[0].index !== 0) {
      updatePagesInViewOnScrollUp().then((pagesInView) => setPagesInView(pagesInView));
    }
  }, [currentPageIndex]);

  return (
    <div
      style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
      className="overflow-scroll relative bg-[#f5f5f5] px-10"
      ref={viewportRef}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${numPages * pageHeight + (numPages + 1) * pageSpacing}px`,
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
                className="absolute shadow-md border border-gray-50 p-1 flex justify-center items-center bg-white"
              >
                <img alt={`page ${index + 1} of the x doc`} src={url} className="w-auto h-auto" />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default VirtualisedList;
