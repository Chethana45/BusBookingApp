"""
AI Bus Booking Chatbot
Powered by Google Gemini — handles booking queries, FAQs, and route info.
"""
 
import os
import json
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv
 
load_dotenv()
 
# ── Configuration ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
 
genai.configure(api_key=GEMINI_API_KEY)
 
# ── System Prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an intelligent AI assistant for a bus booking platform called "SmartBus".
Your role is to help users with:
 
1. BOOKING QUERIES: Help users search for buses, check availability, and complete bookings
2. ROUTE INFORMATION: Provide details about routes, distances, travel times
3. PRICING: Share fare details, discounts, and offers
4. POLICIES: Explain cancellation, refund, and baggage policies
5. SEAT SELECTION: Guide users on seat types (Window, Aisle, Sleeper, Semi-Sleeper)
6. BUS TYPES: Explain differences between AC, Non-AC, Volvo, Sleeper buses
7. SUPPORT: Handle complaints, modifications, and general queries
 
RESPONSE GUIDELINES:
- Be concise, friendly, and helpful
- Always ask for missing details (source, destination, date, passengers)
- Suggest popular routes when users are unsure
- Mention ongoing offers when relevant
- For bookings, collect: source, destination, date, number of passengers, preferences
- Format prices in INR (₹)
- Keep responses under 150 words unless detailed info is requested
 
INTENT CLASSIFICATION: At the end of every response, add a JSON block:
{"intent": "<one of: booking_query|route_info|pricing|cancellation|seat_info|complaint|general>"}
 
SAMPLE ROUTES & PRICES (for reference):
- Mumbai → Pune: ₹200–500, 3h
- Delhi → Agra: ₹300–600, 4h  
- Bangalore → Chennai: ₹500–900, 6h
- Hyderabad → Bangalore: ₹700–1200, 10h
 
POLICIES:
- Free cancellation up to 2 hours before departure
- 50% refund for cancellation within 2 hours
- No refund for no-shows
- 15 kg baggage allowed free
"""
 
 
# ── Chatbot Class ──────────────────────────────────────────────────────────────
class BusBookingChatbot:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature":     0.7,
                "top_p":           0.95,
                "top_k":           40,
                "max_output_tokens": 1024,
            },
        )
        # session_id → list of {"role": ..., "parts": [...]}
        self._sessions: Dict[str, List[dict]] = {}
 
    # ── Internal helpers ───────────────────────────────────────────────────────
    def _get_or_create_session(self, session_id: str) -> List[dict]:
        if session_id not in self._sessions:
            self._sessions[session_id] = []
        return self._sessions[session_id]
 
    def _parse_intent(self, text: str) -> tuple[str, str]:
        """Extract intent JSON from the model's response and return (clean_text, intent)."""
        intent = "general"
        clean_text = text
        try:
            if '{"intent":' in text:
                start = text.rfind('{"intent":')
                json_str = text[start:]
                end = json_str.find("}") + 1
                intent_data = json.loads(json_str[:end])
                intent = intent_data.get("intent", "general")
                clean_text = text[:start].strip()
        except (json.JSONDecodeError, ValueError):
            pass
        return clean_text, intent
 
    def _build_context_message(self, history: List[dict], new_message: str) -> List[dict]:
        """Build the full message list including system context."""
        messages = []
 
        # Inject system prompt as the first user/model turn if history is empty
        if not history:
            messages.append({"role": "user",  "parts": [SYSTEM_PROMPT]})
            messages.append({"role": "model", "parts": ["Understood! I'm SmartBus AI assistant, ready to help with bus bookings, route info, pricing, and more. How can I assist you today?"]})
 
        messages.extend(history)
        messages.append({"role": "user", "parts": [new_message]})
        return messages
 
    # ── Public API ─────────────────────────────────────────────────────────────
    async def process_message(self, session_id: str, message: str) -> dict:
        """Process a user message and return the AI response."""
        history = self._get_or_create_session(session_id)
        messages = self._build_context_message(history, message)
 
        # Run blocking Gemini call in a thread pool
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.model.generate_content(messages),
        )
 
        raw_text = response.text
        clean_text, intent = self._parse_intent(raw_text)
 
        # Persist to history
        history.append({"role": "user",  "parts": [message]})
        history.append({"role": "model", "parts": [clean_text]})
        self._sessions[session_id] = history
 
        return {
            "response": clean_text,
            "intent":   intent,
            "timestamp": datetime.now().isoformat(),
        }
 
    def get_history(self, session_id: str) -> Optional[List[dict]]:
        """Return the conversation history for a session."""
        if session_id not in self._sessions:
            return None
        return [
            {
                "role":    msg["role"],
                "content": msg["parts"][0] if msg["parts"] else "",
            }
            for msg in self._sessions[session_id]
        ]
 
    def clear_history(self, session_id: str) -> None:
        """Delete a session's conversation history."""
        self._sessions.pop(session_id, None)
 
    def get_active_sessions(self) -> List[str]:
        """Return all active session IDs."""
        return list(self._sessions.keys())
 
    async def get_quick_reply_suggestions(self, intent: str) -> List[str]:
        """Return contextual quick-reply chips based on detected intent."""
        suggestions_map = {
            "booking_query": [
                "Search buses for tomorrow",
                "Check seat availability",
                "Best buses for Bangalore → Chennai",
            ],
            "pricing": [
                "Show cheapest options",
                "Are there any discounts?",
                "What's included in the fare?",
            ],
            "cancellation": [
                "How to cancel my ticket?",
                "What's the refund policy?",
                "Cancel booking #BK12345",
            ],
            "route_info": [
                "How long is the journey?",
                "Are there food stops?",
                "Show me the route map",
            ],
            "seat_info": [
                "What's a sleeper bus?",
                "Window vs Aisle seat",
                "Show available seats",
            ],
            "general": [
                "Book a bus ticket",
                "Track my bus",
                "Contact support",
            ],
        }
        return suggestions_map.get(intent, suggestions_map["general"])