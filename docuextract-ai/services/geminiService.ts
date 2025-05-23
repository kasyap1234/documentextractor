import { DocumentType } from '../types';

// Attempt to read from environment variables, otherwise use defaults.
// In a simple browser environment without a build step, process.env will not be populated.
const OLLAMA_API_URL = (typeof process !== 'undefined' && process.env && process.env.OLLAMA_API_URL) || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = (typeof process !== 'undefined' && process.env && process.env.OLLAMA_MODEL) || 'gemma3:4b-it-qat';

const getPromptForDocumentType = (docType: DocumentType): string => {
  let specificInstructions = "";
  switch (docType) {
    case DocumentType.BANK_STATEMENT:
      specificInstructions = "This document is a bank statement. Focus on extracting account holder name, account number, bank name, statement period, and a list of transactions (each with date, description, debit amount, credit amount, and running balance if available).";
      break;
    case DocumentType.ITR:
      specificInstructions = "This document is an Income Tax Return (ITR). Extract assessee name, PAN (Permanent Account Number), assessment year, acknowledgement number, and a summary of income from various sources, gross total income, total deductions, total taxable income, and net tax payable or refund due.";
      break;
    case DocumentType.MARKSHEET:
      specificInstructions = "This document is a marksheet or academic transcript. Extract student name, roll number or student ID, institution name, examination name/title, a list of subjects with marks obtained, maximum marks (or grading scale), and grades (if applicable). Also, try to find an overall percentage, GPA, or CGPA.";
      break;
    case DocumentType.GENERAL:
    default:
      specificInstructions = "This is a general document. Attempt to identify its nature and extract all key pieces of information such as names, dates, addresses, amounts, identifiers, and any other significant data points in a structured manner.";
      break;
  }
  // Instructions for Ollama with format: "json"
  return `You are an expert AI assistant specialized in extracting structured information from documents.
Analyze the provided document image carefully. ${specificInstructions}
Your primary goal is to return the extracted information strictly as a single, valid JSON object.
Ensure all dates, names, monetary values, and significant identifiers are accurately captured.
The JSON output should be clean, well-structured, and directly parsable.
The entire response from you MUST be ONLY the JSON object itself. Do not include any explanatory text, conversation, markdown formatting (like \`\`\`json), or any other content outside of this JSON object.
For example, a valid response would be:
{
  "document_type": "Invoice (example)",
  "invoice_id": "INV-2024-001",
  "issue_date": "2024-07-21",
  "customer_details": {
    "name": "Acme Corp",
    "contact_person": "John Doe"
  },
  "total_amount": 1250.75,
  "currency": "USD",
  "line_items": [
    { "description": "Product A", "quantity": 2, "unit_price": 300.00, "line_total": 600.00 },
    { "description": "Service B", "hours": 5, "rate": 130.15, "line_total": 650.75 }
  ]
}
(This is just an illustrative example structure. Adapt it based on the actual document content and type specified above.)
Now, process the document based on these instructions and provide only the JSON output.`;
};

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string; // This should be the JSON string when format: "json" is used
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export const extractInformation = async (
  base64ImageData: string,
  documentType: DocumentType
): Promise<object> => {
  const prompt = getPromptForDocumentType(documentType);

  const payload = {
    model: OLLAMA_MODEL,
    prompt: prompt,
    images: [base64ImageData], // Ollama expects an array of base64 strings
    format: "json", // Request JSON output from Ollama
    stream: false, // Get the full response at once
    // options: { // Example: can set temperature, etc. if needed
    //   temperature: 0.1, // Lower temperature for more deterministic JSON output
    // }
  };

  try {
    console.log("Sending request to Ollama:", OLLAMA_API_URL, "with model:", OLLAMA_MODEL);
    const httpResponse = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!httpResponse.ok) {
      const errorBody = await httpResponse.text();
      console.error("Ollama API error response:", errorBody);
      throw new Error(`Ollama API request failed: ${httpResponse.status} ${httpResponse.statusText}. Details: ${errorBody}`);
    }

    const ollamaData: OllamaResponse = await httpResponse.json();

    if (ollamaData && typeof ollamaData.response === 'string') {
      // When format: "json" is used with Ollama, ollamaData.response should be a string
      // that is itself a valid JSON.
      try {
        const parsedJson = JSON.parse(ollamaData.response);
        return parsedJson;
      } catch (e) {
        console.error("Failed to parse JSON string from Ollama's response field:", e);
        console.error("Raw response string from Ollama:", ollamaData.response);
        // It's possible the model didn't adhere perfectly to format: "json"
        // Try to extract JSON from markdown if present, as a fallback.
        let jsonStr = ollamaData.response.trim();
        const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[1]) {
          jsonStr = match[1].trim();
          try {
            const parsedJsonFallback = JSON.parse(jsonStr);
            return parsedJsonFallback;
          } catch (e2) {
             console.error("Failed to parse JSON even after attempting to strip markdown:", e2);
          }
        }
        throw new Error("The AI returned a response that is not valid JSON, even after attempting to process. Check the console for the raw response string.");
      }
    } else {
       console.error("Ollama response missing 'response' field or it's not a string:", ollamaData);
       throw new Error("The AI returned an empty or malformed response data structure from Ollama.");
    }

  } catch (error) {
    console.error("Error calling Ollama API:", error);
    // Check if it's a TypeError, often indicating network failure (e.g., Ollama server not running)
    if (error instanceof TypeError) {
        throw new Error(`Network error communicating with Ollama at ${OLLAMA_API_URL}. Is Ollama running and accessible? Original: ${error.message}`);
    }
    if (error instanceof Error) {
      // Re-throw with a more user-friendly prefix if it's not already one of our custom errors
      if (!error.message.startsWith("Ollama API") && !error.message.startsWith("Network error")) {
         throw new Error(`Ollama API communication error: ${error.message}`);
      }
      throw error; // re-throw if already a detailed error
    }
    throw new Error("An unexpected error occurred while communicating with the Ollama API.");
  }
};
