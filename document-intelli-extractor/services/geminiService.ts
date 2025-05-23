
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, DOCUMENT_EXTRACTION_PROMPT } from '../constants';
import { ExtractedData } from '../types';

// Ensure API_KEY is available in the environment.
// In a real CRA or Vite app, this would be REACT_APP_API_KEY or VITE_API_KEY.
// For this environment, we assume process.env.API_KEY is directly available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set in environment variables.");
  // Potentially throw an error or handle this state in the UI
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Provide a fallback to avoid runtime error if key is missing

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (base64Data) {
        resolve({ base64: base64Data, mimeType: file.type });
      } else {
        reject(new Error("Failed to convert file to base64: result is null or invalid"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractDocumentInfo = async (
  file: File
): Promise<ExtractedData> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  }

  try {
    const { base64, mimeType } = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64,
      },
    };

    const textPart = {
      text: DOCUMENT_EXTRACTION_PROMPT,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ parts: [imagePart, textPart] }],
      config: {
        responseMimeType: "application/json",
        // Omitting thinkingConfig to allow default (enabled) thinking for higher quality
      },
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Handles optional language and newlines
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); // Trim the extracted content itself
    }

    try {
      const parsedData = JSON.parse(jsonStr) as ExtractedData;
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError);
      console.error("Raw response text:", response.text);
      throw new Error(`Failed to parse AI response. Raw text: ${response.text}`);
    }

  } catch (error) {
    console.error("Error extracting document info:", error);
    if (error instanceof Error) {
        throw new Error(`Error processing document: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing the document.");
  }
};
