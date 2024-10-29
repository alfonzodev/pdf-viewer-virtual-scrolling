import { useEffect, useRef, useState } from "react";
import usePdf from "./hooks/usePdf";
import { PDFDocumentProxy } from "pdfjs-dist";

interface VirtualisedListProps {
  numPages: number;
  pageHeight: number;
  pageSpacing: number;
  viewportWidth: number;
  viewportHeight: number;
  pdfDoc: PDFDocumentProxy | null;
}

const VirtualisedList = ({
  numPages,
  pageHeight,
  pageSpacing,
  viewportWidth,
  viewportHeight,
  pdfDoc,
}: VirtualisedListProps) => {
  const [pagesInView, setPagesInView] = useState<{ index: number; url: string }[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  const { renderPage } = usePdf();

  const viewportRef = useRef<HTMLDivElement>(null);
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
      className="py-2 flex justify-center items-center overflow-y-scroll relative"
      ref={viewportRef}
      onScroll={handleScroll}
    >
      <div
        style={{ top: "0px", height: `${numPages * pageHeight + (numPages + 1) * pageSpacing}px` }}
        className="absolute  bg-white w-full flex flex-col justify-center items-center"
      >
        {pagesInView.length > 0 &&
          pagesInView.map(({ index, url }) => {
            const top = index * pageHeight + pageSpacing * (index + 1);

            return (
              <img
                key={`page-${index + 1}`}
                style={{
                  height: `${pageHeight}px`,
                  top: `${top}px`,
                }}
                alt={`page ${index} of the x doc`}
                src={url}
                className="absolute border border-black w-auto"
              />
            );
          })}
      </div>
    </div>
  );
};

export default VirtualisedList;
