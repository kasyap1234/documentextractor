import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileData } from '../types';

interface FileUploadInputProps {
  onFileSelect: (fileData: FileData | null) => void;
  acceptedFileTypes: string[];
  currentFile: FileData | null;
  key?: any; // Added key prop for potential reset from parent
}

const fileToDataURLAndMime = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mimeTypeMatch = result.match(/^data:(.+);base64,/);
      if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        reject(new Error("Could not determine MIME type from file data."));
        return;
      }
      const mimeType = mimeTypeMatch[1];
      const base64Data = result.split(',')[1];
      if (!base64Data) {
        reject(new Error("Could not extract base64 data from file."));
        return;
      }
      resolve({ base64Data, mimeType, name: file.name });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


export const FileUploadInput: React.FC<FileUploadInputProps> = ({ onFileSelect, acceptedFileTypes, currentFile }) => {
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [currentFile]);

  const processFile = async (file: File) => {
    if (!acceptedFileTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${acceptedFileTypes.map(t=>t.split('/')[1].toUpperCase()).join(', ')}.`);
      onFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setError(null);
    try {
      const fileData = await fileToDataURLAndMime(file);
      onFileSelect(fileData);
    } catch (err) {
      setError("Error reading file. Please try again.");
      onFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      console.error(err);
    }
  }

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    } else {
      onFileSelect(null);
    }
  }, [onFileSelect, acceptedFileTypes]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [onFileSelect, acceptedFileTypes]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileSelect(null);
    setError(null);
  }

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={currentFile ? undefined : triggerFileInput}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer transition-all duration-150
                    ${dragOver ? 'border-blue-500 bg-slate-700' : 'border-slate-600 hover:border-slate-500 bg-slate-700/60'}
                    ${currentFile ? 'border-green-600 bg-slate-700' : ''}`}
        aria-describedby={error ? 'file-error' : undefined}
      >
        {currentFile ? (
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto text-green-500 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="font-medium text-sm text-slate-100 truncate max-w-xs">{currentFile.name}</p>
            <p className="text-xs text-slate-400">{currentFile.mimeType}</p>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Change file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <svg className="w-8 h-8 mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="mb-1 text-sm text-slate-400">
              <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">{`Supported: ${acceptedFileTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`}</p>
          </div>
        )}
        <input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileChange}
          aria-label="File uploader"
        />
      </label>
      {error && <p id="file-error" className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
};