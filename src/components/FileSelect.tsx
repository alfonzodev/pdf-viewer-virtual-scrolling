import { useRef } from "react";

interface PdfProps {
  setFile: (file: File) => void;
}

const FileSelect = ({ setFile }: PdfProps) => {
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
    <div>
      <button
        onClick={openFileExplorer}
        className="px-8 py-2 bg-gray-800 text-white font-medium rounded-lg shadow-md hover:bg-gray-700 hover:text-gray-300 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-gray-500"
      >
        Select Pdf File
      </button>
      <input
        ref={inputFileRef}
        id="documents"
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default FileSelect;
