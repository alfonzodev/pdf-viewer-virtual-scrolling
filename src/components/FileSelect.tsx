import { Upload } from "lucide-react";
import { useRef } from "react";

type FileSelectProps = {
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

const FileSelect = ({ setFile }: FileSelectProps) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const openFileExplorer = () => {
    inputFileRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFile(fileArray[0]);
    }
  };

  return (
    <>
      <button
        onClick={openFileExplorer}
        className="px-14 flex items-center justify-center gap-2 py-3 mx-auto mt-4 bg-slate-900 text-white font-medium rounded-full shadow-lg shadow-gray-800 hover:-translate-y-1 hover:text-orange-400 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-gray-500 select-none"
      >
        <Upload size={20} strokeWidth={1} />
        <span className="leading-none font-light">Select Pdf File</span>
      </button>
      <input
        ref={inputFileRef}
        id="documents"
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

export default FileSelect;
