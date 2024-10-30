import { ChevronDown, ChevronUp, ZoomOut, ZoomIn } from "lucide-react";
import { PDFDocumentProxy } from "pdfjs-dist";

interface ControlsProps {
  currentPageIndex: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  numPages: number;
  pdfDoc: PDFDocumentProxy | null;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 2;

const Controls = ({ setScale, currentPageIndex, numPages, pdfDoc }: ControlsProps) => {
  const handleZoomOut = () => {
    if (!pdfDoc) return;
    setScale((prevScale) => {
      if (prevScale === MIN_SCALE) {
        return prevScale;
      }
      return prevScale - 0.25;
    });
  };

  const handleZoomIn = () => {
    if (!pdfDoc) return;
    setScale((prevScale) => {
      if (prevScale === MAX_SCALE) {
        return prevScale;
      }
      return prevScale + 0.25;
    });
  };

  return (
    <div className="w-full h-10 bg-[#fefefe] flex text-gray-700">
      <div className="flex items-center justify-center gap-x-3 flex-1 h-full e">
        <ChevronDown className="cursor-pointer hover:scale-110 hover:text-black" />
        <ChevronUp className="cursor-pointer hover:scale-110 hover:text-black" />
      </div>
      <div className="flex items-center justify-center gap-x-3 flex-1 h-full text-black select-none">
        <input
          type="text"
          className="w-10 h-6 focus:outline-none bg-white border border-gray-800 text-center rounded-sm"
          readOnly
          value={pdfDoc ? currentPageIndex + 1 : ""}
        />
        <div className="border-r h-6 border-gray-700"></div>
        <p>{pdfDoc ? numPages : "---"}</p>
      </div>
      <div className="flex items-center justify-center gap-x-3 flex-1 h-full e">
        <ZoomOut
          className="cursor-pointer hover:scale-110 hover:text-black"
          onClick={handleZoomOut}
        />
        <ZoomIn
          className="cursor-pointer hover:scale-110 hover:text-black"
          onClick={handleZoomIn}
        />
      </div>
    </div>
  );
};

export default Controls;
