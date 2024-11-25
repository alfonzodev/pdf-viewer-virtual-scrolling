import { useEffect, useState } from "react";

import usePdf from "../hooks/usePdf";
import VirtualisedList from "./VirtualisedList";
import Controls from "./Controls";
import useScale from "../hooks/useScale";

const PdfViewer = ({ file }: { file: File | null }) => {
  const { loadPdfDoc, pdfDoc, numPages, renderPage, prependPagesInView, appendPagesInView } =
    usePdf();
  const { scale, zoomOut, zoomIn } = useScale();

  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (file) {
      loadPdfDoc(file);
    }
  }, [file]);

  return (
    <div className="border shadow-sm select-none rounded-lg overflow-hidden">
      <div className="w-full bg-white h-10 border-b  py-1 px-4 flex justify-start items-center">
        {file && <h1 className="font-medium text-sm">{file.name}</h1>}
      </div>
      <VirtualisedList
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        renderPage={renderPage}
        scale={scale}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
        pdfDoc={pdfDoc}
        viewerHeight={500}
        numPages={numPages}
        pageSpacing={15}
        prependPagesInView={prependPagesInView}
        appendPagesInView={appendPagesInView}
      />
      <Controls
        currentPage={currentPage}
        numPages={numPages}
        pdfDoc={pdfDoc}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
      />
    </div>
  );
};

export default PdfViewer;
