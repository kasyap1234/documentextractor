
import React, { useState, useCallback } from 'react';
import { DocumentType, FileData } from './types';
import { extractInformation } from './services/geminiService'; // This service contains Ollama logic
import { FileUploadInput } from './components/FileUploadInput';
import { JsonDisplay } from './components/JsonDisplay';
import { LoaderIcon } from './components/LoaderIcon';
import { SelectDropdown } from './components/SelectDropdown';

const App: React.FC = () => {
  const [selectedFileData, setSelectedFileData] = useState<FileData | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.GENERAL);
  const [extractedJson, setExtractedJson] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now());

  const handleFileSelect = useCallback((fileData: FileData | null) => {
    setSelectedFileData(fileData);
    setExtractedJson(null);
    setError(null);
  }, []);

  const handleExtract = async () => {
    if (!selectedFileData) {
      setError("Please select a file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setExtractedJson(null);

    try {
      const result = await extractInformation(selectedFileData.base64Data, documentType);
      setExtractedJson(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during extraction.");
      }
      console.error("Extraction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFileData(null);
    setDocumentType(DocumentType.GENERAL);
    setExtractedJson(null);
    setError(null);
    setIsLoading(false);
    setFileInputKey(Date.now());
  };

  const documentTypeOptions = Object.values(DocumentType).map(value => ({
    value: value,
    label: value,
  }));

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center">
      <header className="mb-8 text-center w-full max-w-5xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100">
          DocuExtract AI
        </h1>
        <p className="text-lg text-slate-400 mt-2">
          Upload a document to extract information in JSON format.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col md:flex-row md:space-x-6 lg:space-x-8">
        {/* Left Column: Inputs and Controls */}
        <div className="md:w-2/5 lg:w-1/3 bg-slate-800 shadow-lg rounded-lg p-6 sm:p-8 space-y-6 mb-6 md:mb-0 self-start">
          <FileUploadInput
            key={fileInputKey}
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp', 'image/gif']}
            currentFile={selectedFileData}
          />

          {selectedFileData && (
            <div className="space-y-6">
              <SelectDropdown
                label="Select Document Type:"
                options={documentTypeOptions}
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              />

              <div className="flex space-x-3">
                <button
                  onClick={handleExtract}
                  disabled={isLoading || !selectedFileData}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  aria-label="Extract information from document"
                >
                  {isLoading ? <LoaderIcon className="w-5 h-5 mr-2" /> : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.5 13.5h3.75v3.75h-3.75V13.5Z" />
                    </svg>
                  )}
                  {isLoading ? 'Extracting...' : 'Extract'}
                </button>
                <button
                  onClick={handleClear}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2.5 px-4 rounded-md transition-colors duration-150 ease-in-out border border-slate-600 hover:border-slate-500 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  aria-label="Clear file selection and results"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  Clear
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-md" role="alert">
              <div className="flex">
                <div className="py-1">
                  <svg className="fill-current h-6 w-6 text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.828a1 1 0 1 0-1.415-1.415L10 8.586 7.172 5.757a1 1 0 0 0-1.415 1.415L8.586 10l-2.829 2.828a1 1 0 1 0 1.415 1.415L10 11.414l2.829 2.829a1 1 0 0 0 1.415-1.415L11.414 10z"/></svg>
                </div>
                <div>
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: JSON Output */}
        <div className="md:w-3/5 lg:w-2/3 bg-slate-800 shadow-lg rounded-lg p-6 sm:p-8 flex-grow flex flex-col">
          {isLoading && (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
              <LoaderIcon className="w-10 h-10 mb-4" />
              <p className="text-lg">Extracting information, please wait...</p>
            </div>
          )}
          {!isLoading && extractedJson && !error && (
            <JsonDisplay jsonData={extractedJson} />
          )}
          {!isLoading && !extractedJson && !error && (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5V16.5a1.5 1.5 0 0 0 1.5 1.5h5.25a1.5 1.5 0 0 0 1.5-1.5V7.5m-7.5-1.125a1.5 1.5 0 0 1 1.5-1.5h5.25a1.5 1.5 0 0 1 1.5 1.5v1.125m-7.5 0h7.5m-7.5 0a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h7.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5m-7.5 0v.008c0 .004 0 .008 0 .011L8.25 7.5Zm0 0H6.75m0 0H5.25m0 0H3.75m0 0h-.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-11.25c0-.621-.504-1.125-1.125-1.125h-.375m1.5.008c.004 0 .008 0 .011 0L15.75 7.5Zm0 0H17.25m0 0H18.75m0 0H20.25m0 0h.375c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125 1.125 1.125h-17.25c-.621 0-1.125-.504-1.125-1.125V8.625c0-.621.504-1.125 1.125-1.125h.375" />
              </svg>
              <p className="text-lg font-medium">Extracted JSON will appear here.</p>
              <p className="text-sm mt-1">Upload a document and click "Extract" to see the results.</p>
            </div>
          )}
          {!isLoading && !extractedJson && error && (
             <div className="flex-grow flex flex-col items-center justify-center text-center text-red-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-lg font-medium">Extraction Failed</p>
              <p className="text-sm mt-1">Please check the error message on the left and try again.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-10 text-center w-full max-w-5xl">
        <p className="text-slate-500 text-sm">
          Powered by a local Ollama model. For demonstration purposes.
        </p>
      </footer>
    </div>
  );
};

export default App;
