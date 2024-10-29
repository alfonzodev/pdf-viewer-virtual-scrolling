import usePdf from "./hooks/usePdf.ts";
import VirtualisedList from "./VirtualisedList.tsx";
import { useEffect, useState } from "react";
import FileSelect from "./FileSelect.tsx";

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const { loadPdfDoc, pdfDoc, numPages } = usePdf();

  useEffect(() => {
    if (file) {
      loadPdfDoc(file);
    }
  }, [file]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-y-2">
      <div className=" border-1 border shadow-sm">
        <div className="w-full bg-white h-10 border-b  py-1 px-4 flex justify-start items-center">
          {file && <h1 className="font-medium text-sm">{file.name}</h1>}
        </div>
        <VirtualisedList
          pdfDoc={pdfDoc}
          viewportWidth={500}
          viewportHeight={500}
          numPages={numPages}
          pageHeight={600}
          pageSpacing={10}
        />
      </div>

      <FileSelect setFile={setFile} />
    </div>
  );
};

export default App;
