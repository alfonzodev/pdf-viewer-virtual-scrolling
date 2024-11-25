import { ChevronDown, ChevronUp, ZoomOut, ZoomIn } from "lucide-react";
import { ControlsProps } from "../types";

const Controls = ({ currentPage, numPages, pdfDoc, zoomOut, zoomIn }: ControlsProps) => {
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
