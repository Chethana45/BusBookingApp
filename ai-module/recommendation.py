"""
AI Bus Recommendation Engine
Uses Google Gemini to intelligently rank and explain bus options.
"""
 
import os
import json
import asyncio
import random
from typing import List, Dict, Any
from datetime import datetime, timedelta
import google.generativeai as genai
from dotenv import load_dotenv
 
load_dotenv()
 
# ── Configuration ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
 
# ── Mock Bus Database ──────────────────────────────────────────────────────────
BUS_OPERATORS = [
    "RedBus Express", "VRL Travels", "SRS Travels",
    "Orange Tours",   "IntrCity SmartBus", "Parveen Travels",
    "KPN Travels",    "Neeta Tours",
]
 
BUS_TYPES = ["AC Sleeper", "Non-AC Sleeper", "AC Semi-Sleeper", "Volvo AC", "Luxury AC", "Non-AC Seater"]
 
AMENITIES_POOL = [
    "WiFi", "USB Charging", "Blanket", "Water Bottle",
    "Snacks", "Reading Light", "Air Cushion Seat",
    "Live Tracking", "Emergency Contact", "CCTV",
]
 
ROUTE_CONFIG: Dict[str, Dict] = {
    "mumbai-pune":           {"base_price": 250,  "duration_h": 3,  "distance_km": 150},
    "delhi-agra":            {"base_price": 350,  "duration_h": 4,  "distance_km": 200},
    "bangalore-chennai":     {"base_price": 550,  "duration_h": 6,  "distance_km": 346},
    "hyderabad-bangalore":   {"base_price": 750,  "duration_h": 10, "distance_km": 570},
    "kolkata-bhubaneswar":   {"base_price": 600,  "duration_h": 8,  "distance_km": 440},
    "chennai-coimbatore":    {"base_price": 500,  "duration_h": 8,  "distance_km": 500},
    "jaipur-delhi":          {"base_price": 400,  "duration_h": 5,  "distance_km": 280},
    "ahmedabad-mumbai":      {"base_price": 700,  "duration_h": 9,  "distance_km": 530},
    "default":               {"base_price": 500,  "duration_h": 7,  "distance_km": 400},
}
 
# ── Helpers ────────────────────────────────────────────────────────────────────
def _route_key(source: str, destination: str) -> str:
    return f"{source.lower().replace(' ', '')}-{destination.lower().replace(' ', '')}"
 
 
def _generate_mock_buses(
    source: str,
    destination: str,
    date: str,
    count: int = 8,
) -> List[Dict[str, Any]]:
    """Generate realistic mock bus listings for a route."""
    key = _route_key(source, destination)
    cfg = ROUTE_CONFIG.get(key, ROUTE_CONFIG["default"])
 
    buses = []
    base_hour = 6  # First bus at 06:00
 
    for i in range(count):
        operator   = random.choice(BUS_OPERATORS)
        bus_type   = random.choice(BUS_TYPES)
        price_mult = 1.0 + (i * 0.15) + random.uniform(-0.1, 0.2)
        price      = round(cfg["base_price"] * price_mult, -1)  # round to nearest 10
 
        dep_hour   = (base_hour + i * 2) % 24
        dep_min    = random.choice([0, 15, 30, 45])
        duration_h = cfg["duration_h"] + random.uniform(-0.5, 1.0)
        arr_hour   = int((dep_hour + duration_h)) % 24
        arr_min    = int((dep_min + (duration_h % 1) * 60)) % 60
 
        amenities = random.sample(AMENITIES_POOL, k=random.randint(3, 7))
        rating    = round(random.uniform(3.2, 4.9), 1)
        seats     = random.randint(2, 30)
 
        buses.append({
            "bus_id":          f"BUS{1000 + i}",
            "operator":        operator,
            "bus_type":        bus_type,
            "departure":       f"{dep_hour:02d}:{dep_min:02d}",
            "arrival":         f"{arr_hour:02d}:{arr_min:02d}",
            "duration":        f"{int(duration_h)}h {int((duration_h % 1) * 60)}m",
            "price":           float(price),
            "seats_available": seats,
            "rating":          rating,
            "amenities":       amenities,
            "source":          source,
            "destination":     destination,
            "date":            date,
        })
 
    return buses
 
 
# ── Recommendation Engine ──────────────────────────────────────────────────────
class BusRecommendationEngine:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature":     0.3,   # Lower = more deterministic scoring
                "top_p":           0.9,
                "max_output_tokens": 2048,
            },
        )
 
    # ── Core Scoring ───────────────────────────────────────────────────────────
    def _heuristic_score(self, bus: Dict, preferences: List[str]) -> float:
        """Fast rule-based pre-score (0–100) before Gemini re-ranking."""
        score = 50.0
 
        # Rating (max +25)
        score += (bus["rating"] - 3.0) * 12.5
 
        # Availability (max +10)
        if bus["seats_available"] > 20:
            score += 10
        elif bus["seats_available"] > 10:
            score += 5
 
        # Price (cheaper = higher score, relative)
        if bus["price"] < 500:
            score += 8
        elif bus["price"] > 1200:
            score -= 8
 
        # Amenity bonus
        pref_map = {
            "wifi":     ("WiFi",              8),
            "ac":       ("Air Cushion Seat",  6),
            "charging": ("USB Charging",      6),
            "sleeper":  ("Blanket",           5),
            "food":     ("Snacks",            5),
            "tracking": ("Live Tracking",     4),
        }
        bus_amenities_lower = [a.lower() for a in bus["amenities"]]
        for pref in preferences:
            for key, (amenity, pts) in pref_map.items():
                if key in pref.lower() and amenity.lower() in bus_amenities_lower:
                    score += pts
 
        # Bus type preference
        for pref in preferences:
            if "sleeper" in pref.lower() and "sleeper" in bus["bus_type"].lower():
                score += 10
            if "volvo" in pref.lower() and "volvo" in bus["bus_type"].lower():
                score += 8
            if "ac" in pref.lower() and "ac" in bus["bus_type"].lower():
                score += 6
 
        return min(max(score, 0), 100)
 
    async def _ai_rank_and_explain(
        self,
        buses: List[Dict],
        source: str,
        destination: str,
        date: str,
        passengers: int,
        preferences: List[str],
    ) -> Dict:
        """Ask Gemini to rank buses and generate summary + per-bus reasons."""
        buses_json = json.dumps(buses[:6], indent=2)  # Top 6 for token efficiency
        pref_str   = ", ".join(preferences) if preferences else "No specific preferences"
 
        prompt = f"""You are an expert bus booking advisor. Analyze these bus options and provide intelligent recommendations.
 
ROUTE: {source} → {destination}
DATE: {date}
PASSENGERS: {passengers}
USER PREFERENCES: {pref_str}
 
BUS OPTIONS:
{buses_json}
 
Your task:
1. Rank these buses from best to worst for this user
2. For each bus, write a 1-sentence recommendation reason (max 20 words)
3. Write an overall AI summary (2–3 sentences) about the best options
 
Respond ONLY with valid JSON in this exact format:
{{
  "ranked_bus_ids": ["BUS1001", "BUS1003", ...],
  "reasons": {{
    "BUS1001": "Best value with top rating and WiFi — ideal for overnight travel.",
    "BUS1003": "Premium Volvo with sleeper seats, perfect for comfort seekers."
  }},
  "ai_summary": "For this route, we recommend the RedBus Express AC Sleeper for the best comfort-to-price ratio. If you prefer budget options, VRL Travels offers reliable service at a lower fare."
}}"""
 
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: self.model.generate_content(prompt)
        )
 
        raw = response.text.strip()
        # Strip markdown fences if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
 
    # ── Public API ─────────────────────────────────────────────────────────────
    async def get_recommendations(
        self,
        source: str,
        destination: str,
        date: str,
        passengers: int = 1,
        preferences: List[str] = None,
    ) -> Dict:
        """Return AI-ranked bus recommendations for the given route."""
        preferences = preferences or []
 
        # 1. Generate / fetch bus listings
        buses = _generate_mock_buses(source, destination, date, count=8)
 
        # 2. Heuristic pre-scoring
        for bus in buses:
            bus["ai_score"] = self._heuristic_score(bus, preferences)
 
        # 3. Sort by heuristic score
        buses.sort(key=lambda b: b["ai_score"], reverse=True)
 
        # 4. AI re-ranking & explanations
        try:
            ai_result = await self._ai_rank_and_explain(
                buses, source, destination, date, passengers, preferences
            )
            ranked_ids = ai_result.get("ranked_bus_ids", [])
            reasons    = ai_result.get("reasons", {})
            ai_summary = ai_result.get("ai_summary", "Here are the best buses for your route.")
 
            # Re-order buses according to AI ranking
            bus_map = {b["bus_id"]: b for b in buses}
            ranked_buses = []
            for bus_id in ranked_ids:
                if bus_id in bus_map:
                    bus = bus_map[bus_id]
                    bus["recommendation_reason"] = reasons.get(
                        bus_id, "Highly rated option for this route."
                    )
                    ranked_buses.append(bus)
 
            # Append any buses not in AI ranking
            ranked_bus_ids_set = set(ranked_ids)
            for bus in buses:
                if bus["bus_id"] not in ranked_bus_ids_set:
                    bus["recommendation_reason"] = "Good alternative option."
                    ranked_buses.append(bus)
 
        except (json.JSONDecodeError, Exception):
            # Fallback: use heuristic order with generic reasons
            ai_summary = f"Showing {len(buses)} buses for {source} → {destination} on {date}."
            for bus in buses:
                bus["recommendation_reason"] = f"Rated {bus['rating']}★ with {bus['seats_available']} seats available."
            ranked_buses = buses
 
        # 5. Build response
        return {
            "source":          source,
            "destination":     destination,
            "date":            date,
            "recommendations": ranked_buses[:6],  # Return top 6
            "ai_summary":      ai_summary,
        }
 
    async def get_price_prediction(
        self, source: str, destination: str, travel_date: str
    ) -> Dict:
        """Predict whether prices will rise or fall using Gemini analysis."""
        prompt = f"""As a travel pricing expert, analyze bus ticket pricing trends for:
Route: {source} → {destination}
Travel Date: {travel_date}
Today: {datetime.now().strftime('%Y-%m-%d')}
 
Respond ONLY with JSON:
{{
  "trend": "rising|falling|stable",
  "confidence": 0.85,
  "recommendation": "Book now — prices typically rise 20% closer to the date.",
  "best_booking_window": "3–7 days before travel"
}}"""
 
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: self.model.generate_content(prompt)
        )
        raw = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
 