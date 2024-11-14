import { useState } from "react";
import FileSelect from "./components/FileSelect";
import PdfViewer from "./components/PdfViewer";

const App = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 py-16 w-full">
      <PdfViewer file={file} />
      <FileSelect setFile={setFile} />
    </div>
  );
};

export default App;
