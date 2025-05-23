const MODEL="gemma3:4b-it-qat"

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


export const extractDocumentInfo=async(file)=> {

    try {
        base64,mimeType =await fileToBase64(file)
        
    }
    catch {

    }
}