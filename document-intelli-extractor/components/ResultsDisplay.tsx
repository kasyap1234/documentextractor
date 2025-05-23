
import React from 'react';
import { ExtractedData } from '../types';

interface ResultsDisplayProps {
  data: ExtractedData | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Extracted Information:</h3>
      {data.detected_document_type && (
        <p className="mb-2 text-md">
          <span className="font-semibold text-gray-600">Detected Document Type:</span> 
          <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm">{data.detected_document_type}</span>
        </p>
      )}
      <pre className="bg-gray-50 p-3 rounded-md text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default ResultsDisplay;
