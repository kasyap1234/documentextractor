import React, { useState, useEffect } from 'react';

interface JsonDisplayProps {
  jsonData: object | string | null;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ jsonData }) => {
  const [copied, setCopied] = useState(false);
  const [formattedJson, setFormattedJson] = useState<string>('');

  useEffect(() => {
    if (jsonData) {
      try {
        const jsonString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
        setFormattedJson(jsonString);
      } catch (error) {
        console.error("Error formatting JSON for display:", error);
        setFormattedJson("Error: Could not format JSON data.");
      }
    } else {
      setFormattedJson('');
    }
  }, [jsonData]);

  const handleCopy = () => {
    if (formattedJson) {
      navigator.clipboard.writeText(formattedJson)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy JSON: ', err));
    }
  };

  if (!formattedJson) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-slate-200">Extracted JSON Data:</h3>
        <button
          onClick={handleCopy}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-150 ease-in-out border border-slate-600 hover:border-slate-500 flex items-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          aria-label="Copy JSON data to clipboard"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 mr-1.5 text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-slate-900/70 text-sm text-sky-300 p-4 rounded-md border border-slate-700 overflow-x-auto max-h-80">
        <code>{formattedJson}</code>
      </pre>
    </div>
  );
};