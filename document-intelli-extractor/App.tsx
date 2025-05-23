
import React, { useState, useCallback } from 'react';
import FileUploadButton from './components/FileUploadButton';
import ImagePreview from './components/ImagePreview';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import AlertMessage from './components/AlertMessage';
import { extractDocumentInfo } from './services/geminiService';
import { ExtractedData } from './types';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null); // Clear previous results
    setError(null); // Clear previous errors
  }, []);

  const handleExtractInfo = useCallback(async () => {
    if (!selectedFile) {
      setError("Please select a document image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const data = await extractDocumentInfo(selectedFile);
      setExtractedData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during extraction.");
      }
      console.error("Extraction error in App:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          Document Intelli-Extractor
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Upload a document image (Tax, Bank Slip, ITR, Certificate) and let AI extract key information.
        </p>
      </header>

      <main className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <div className="space-y-6">
          <section id="upload-section" className="text-center">
            <FileUploadButton onFileSelect={handleFileSelect} disabled={isLoading} />
            <p className="mt-2 text-sm text-gray-500">Supports PNG, JPG, WEBP images.</p>
          </section>
          
          {error && <AlertMessage message={error} type="error" />}
          
          {previewUrl && <ImagePreview imageUrl={previewUrl} />}

          {selectedFile && !extractedData && !isLoading && !error && (
            <section id="action-section" className="text-center mt-6">
              <button
                onClick={handleExtractInfo}
                disabled={isLoading}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {isLoading ? 'Processing...' : 'Extract Information'}
              </button>
            </section>
          )}

          {isLoading && <LoadingSpinner />}
          
          {extractedData && !isLoading && <ResultsDisplay data={extractedData} />}
        </div>
      </main>

      {/* <footer className="text-center mt-12 py-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Created in 2025 
        </p>
         <p className="text-xs text-gray-400 mt-1">
           Remember to set your <code className="bg-gray-200 px-1 rounded">API_KEY</code> environment variable.
        </p>
      </footer> */}
    </div>
  );
};

export default App;
