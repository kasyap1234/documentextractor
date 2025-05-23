import os
import json
from PIL import Image
import google.generativeai as genai

# Configure the Gemini API with your API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY") or "YOUR_API_KEY")

# Load the Gemini 1.5 Pro Vision model
model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")

def load_image(image_path):
    """Load an image from the specified path."""
    return Image.open(image_path)

def build_prompt():
    """Construct the prompt for extracting structured data."""
    return """
You are a document understanding AI. Extract key structured information from the provided document image. Respond ONLY with a clean JSON object. Do not include explanations or additional text.

Depending on the document type, extract the following fields:

1. Tax Documents:
   - pan_number
   - assessment_year
   - taxpayer_name
   - total_tax
   - filing_date

2. Bank Slips:
   - account_number
   - ifsc_code
   - transaction_amount
   - transaction_date
   - bank_name
   - branch

3. Income Tax Return (ITR) Forms:
   - pan
   - name
   - total_income
   - tax_paid
   - refund_amount
   - assessment_year

4. Certificates:
   - certificate_type
   - name
   - issuing_authority
   - issue_date
   - certificate_id

Automatically detect the document type and include only the fields present in the image. Ensure the output is valid JSON.
"""

def extract_structured_data(image_path: str):
    """Extract structured data from a document image using Gemini Vision."""
    image = load_image(image_path)
    prompt = build_prompt()

    response = model.generate_content(
        [prompt, image],
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 2048
        }
    )

    content = response.text.strip()

    # Attempt to parse the response as JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        print("⚠️ The response is not valid JSON:")
        print(content)
        return None

# Example usage
if __name__ == "__main__":
    image_path = "large.png"  # Replace with your image path
    result = extract_structured_data(image_path)
    if result:
        print(json.dumps(result, indent=2))

