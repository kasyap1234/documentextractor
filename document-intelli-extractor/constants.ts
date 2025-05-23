
export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const DOCUMENT_EXTRACTION_PROMPT = `
You are a document understanding AI. Your task is to extract key structured information from the provided document image.
Respond ONLY with a clean JSON object. Do not include any explanations, introductions, or additional text outside of the JSON structure.

Based on the content of the image, automatically detect the document type. The possible document types and their corresponding fields to extract are:

1.  If the document is a "Tax Document", attempt to extract the following fields:
    *   \`pan_number\` (string)
    *   \`assessment_year\` (string, e.g., "2023-24")
    *   \`taxpayer_name\` (string)
    *   \`total_tax\` (number or string representing the amount)
    *   \`filing_date\` (string, e.g., "YYYY-MM-DD")

2.  If the document is a "Bank Slip", attempt to extract the following fields:
    *   \`account_number\` (string)
    *   \`ifsc_code\` (string)
    *   \`transaction_amount\` (number or string representing the amount)
    *   \`transaction_date\` (string, e.g., "YYYY-MM-DD")
    *   \`bank_name\` (string)
    *   \`branch\` (string)

3.  If the document is an "Income Tax Return (ITR) Form", attempt to extract the following fields:
    *   \`pan\` (string)
    *   \`name\` (string)
    *   \`total_income\` (number or string representing the amount)
    *   \`tax_paid\` (number or string representing the amount)
    *   \`refund_amount\` (number or string representing the amount, if applicable)
    *   \`assessment_year\` (string, e.g., "2023-24")

4.  If the document is a "Certificate" (e.g., birth certificate, marriage certificate, academic certificate), attempt to extract the following fields:
    *   \`certificate_type\` (string, e.g., "Birth Certificate", "Degree Certificate")
    *   \`name\` (string, of the person the certificate is for)
    *   \`issuing_authority\` (string)
    *   \`issue_date\` (string, e.g., "YYYY-MM-DD")
    *   \`certificate_id\` (string, if present)

For the detected document type, include a field \`detected_document_type\` in your JSON output with the name of the type (e.g., "Tax Document", "Bank Slip", "ITR Form", "Certificate").

Only include the fields that are clearly visible and identifiable in the image. If a field is not present or not legible, omit it from the JSON output. The output must be a single, valid JSON object.

Example for a Tax Document:
{
  "detected_document_type": "Tax Document",
  "pan_number": "ABCDE1234F",
  "assessment_year": "2023-24",
  "taxpayer_name": "John Doe",
  "total_tax": "15000.00",
  "filing_date": "2023-07-15"
}

Example for a Bank Slip with missing branch:
{
  "detected_document_type": "Bank Slip",
  "account_number": "123456789012",
  "ifsc_code": "SBIN0001234",
  "transaction_amount": "500.00",
  "transaction_date": "2024-01-20",
  "bank_name": "State Bank of India"
}
`;
