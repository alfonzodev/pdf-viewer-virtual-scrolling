import { ChevronDown, ChevronUp, ZoomOut, ZoomIn } from "lucide-react";
import { PDFDocumentProxy } from "pdfjs-dist";
import { useState } from "react";

type ControlsProps = {
  zoomOut: () => void;
  zoomIn: () => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  numPages: number;
  pdfDoc: PDFDocumentProxy | null;
  handlePageDown: () => void;
  handlePageUp: () => void;
  viewerRef: React.RefObject<HTMLDivElement>;
  effectivePageHeight: number;
  loadPagesBatch: (
    pdfDoc: PDFDocumentProxy,
    numPages: number,
    currentPage: number,
    loadAmount: number,
    viewerRef: React.RefObject<HTMLDivElement>,
    effectivePageHeight: number
  ) => void;
};

const Controls = ({
  currentPage,
  setCurrentPage,
  numPages,
  pdfDoc,
  zoomOut,
  zoomIn,
  handlePageDown,
  handlePageUp,
  loadPagesBatch,
  viewerRef,
  effectivePageHeight,
}: ControlsProps) => {
  const [newPageInput, setNewPageInput] = useState<string | null>(null);

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-expect-error
    if (!isNaN(e.target.value)) {
      setNewPageInput(e.target.value);
    }
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPageInput === "") {
      setNewPageInput(null);
    }
    if (newPageInput) {
      const newPageNum = Math.max(1, Math.min(numPages, Number(newPageInput)));
      setNewPageInput(null);
      setCurrentPage(newPageNum);
      if (pdfDoc) loadPagesBatch(pdfDoc, numPages, newPageNum, 5, viewerRef, effectivePageHeight);
    }
  };

  return (
    <div className="w-full h-10 bg-[#fefefe] flex text-gray-700">
      <div className="flex items-center justify-center gap-x-3 flex-1 h-full e">
        <button
          className="cursor-pointer hover:scale-110 hover:text-black "
          onClick={() => handlePageUp()}
          disabled={!pdfDoc}
        >
          <ChevronDown />
        </button>
        <button
          className="cursor-pointer hover:scale-110 hover:text-black "
          onClick={() => handlePageDown()}
          disabled={!pdfDoc}
        >
          <ChevronUp />
        </button>
      </div>
      <div className="flex items-center justify-center gap-x-3 flex-1 h-full text-black select-none">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-10 h-6 focus:outline-none bg-white border border-gray-800 text-center rounded-sm"
            readOnly={pdfDoc ? false : true}
            value={pdfDoc ? (newPageInput !== null || newPageInput === "" ? newPageInput : currentPage) : ""}
            onChange={handlePageInput}
          />
        </form>
        <div className="border-r h-6 border-gray-700"></div>
        <p>{pdfDoc ? numPages : "---"}</p>
      </div>
      <div className="flex items-center justify-center gap-x-3 flex-1 h-full e">
        <ZoomOut
          className="cursor-pointer hover:scale-110 hover:text-black"
          onClick={() => pdfDoc && zoomOut()}
        />
        <ZoomIn
          className="cursor-pointer hover:scale-110 hover:text-black"
          onClick={() => pdfDoc && zoomIn()}
        />
      </div>
    </div>
  );
};

export default Controls;
