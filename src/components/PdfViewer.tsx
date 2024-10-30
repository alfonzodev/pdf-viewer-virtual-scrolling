import { useEffect, useState } from "react";

import usePdf from "../hooks/usePdf";
import VirtualisedList from "./VirtualisedList";

const PdfViewer = ({ file }: { file: File | null }) => {
  const { loadPdfDoc, pdfDoc, numPages, renderPage } = usePdf();

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  useEffect(() => {
    if (file) {
      loadPdfDoc(file);
    }
  }, [file]);

  return (
    <div className=" border-1 border shadow-sm">
      <div className="w-full bg-white h-10 border-b  py-1 px-4 flex justify-start items-center">
        {file && <h1 className="font-medium text-sm">{file.name}</h1>}
      </div>
      <VirtualisedList
        currentPageIndex={currentPageIndex}
        renderPage={renderPage}
        setCurrentPageIndex={setCurrentPageIndex}
        pdfDoc={pdfDoc}
        viewportWidth={500}
        viewportHeight={500}
        numPages={numPages}
        pageHeight={600}
        pageSpacing={10}
      />
    </div>
  );
};

export default PdfViewer;
