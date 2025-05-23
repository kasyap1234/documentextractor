
export enum DocumentType {
  GENERAL = "General Document",
  BANK_STATEMENT = "Bank Statement",
  ITR = "Income Tax Return",
  MARKSHEET = "Marksheet",
}

export interface FileData {
  base64Data: string;
  mimeType: string;
  name: string;
}
