import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash")

response = model.generate_content(
    "Suggest a bus from Chennai to Bangalore under ₹1000"
)

print(response.text)