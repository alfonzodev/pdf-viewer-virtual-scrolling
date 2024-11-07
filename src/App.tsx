import { useState } from "react";
import FileSelect from "./components/FileSelect";
import PdfViewer from "./components/PdfViewer";

const App = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-y-2">
      <PdfViewer file={file} />
      <FileSelect setFile={setFile} />
    </div>
  );
};

export default App;
