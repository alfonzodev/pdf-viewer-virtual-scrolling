import { ChevronDown, ChevronUp, ZoomOut, ZoomIn } from "lucide-react";
import { PDFDocumentProxy } from "pdfjs-dist";

type ControlsProps = {
  zoomOut: () => void;
  zoomIn: () => void;
  currentPage: number;
  numPages: number;
  pdfDoc: PDFDocumentProxy | null;
  handlePageDown: () => void;
  handlePageUp: () => void;
};

const Controls = ({
  currentPage,
  numPages,
  pdfDoc,
  zoomOut,
  zoomIn,
  handlePageDown,
  handlePageUp,
}: ControlsProps) => {
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
        <input
          type="text"
          className="w-10 h-6 focus:outline-none bg-white border border-gray-800 text-center rounded-sm"
          readOnly
          value={pdfDoc ? currentPage : ""}
        />
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
