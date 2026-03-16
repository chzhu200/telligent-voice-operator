import os
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"

SYSTEM_PROMPT = (
    "You are Telligent, a voice AI operator. You help anyone — non-technical founders, "
    "PMs, field workers — do real tasks just by speaking. "
    "Be extremely concise. Responses will be spoken aloud — max 2-3 sentences. "
    "Be direct and actionable. No filler words. Sound like a capable assistant, not a chatbot."
)

app = FastAPI(title="Telligent Voice AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list = []


class SearchRequest(BaseModel):
    query: str


def search_web(query: str) -> list[dict]:
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; Telligent/1.0)"}
        resp = requests.get(
            f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}",
            headers=headers,
            timeout=5,
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        results = []
        for r in soup.select(".result__body")[:3]:
            title = r.select_one(".result__title")
            snippet = r.select_one(".result__snippet")
            link = r.select_one(".result__url")
            if title and snippet:
                results.append({
                    "title": title.get_text(strip=True),
                    "snippet": snippet.get_text(strip=True),
                    "url": link.get_text(strip=True) if link else "",
                })
        return results
    except Exception:
        return []


@app.get("/health")
def health():
    return {"status": "ok", "model": "gemini-2.5-flash"}


@app.post("/chat")
async def chat(req: ChatRequest):
    # Check if this is a search request
    msg_lower = req.message.lower()
    search_keywords = ["search", "look up", "find", "what is", "who is", "latest", "news about", "tell me about"]
    is_search = any(kw in msg_lower for kw in search_keywords)

    context = ""
    if is_search:
        results = search_web(req.message)
        if results:
            context = "\n\nWeb search results:\n" + "\n".join(
                [f"- {r['title']}: {r['snippet']}" for r in results]
            )

    # Build conversation history
    contents = []
    for h in req.history[-6:]:
        role = "user" if h["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=h["content"])]))

    user_message = req.message
    if context:
        user_message = f"{req.message}{context}"

    contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    response = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            max_output_tokens=300,
        ),
    )

    return {
        "response": response.text,
        "searched": is_search
    }


@app.post("/search")
async def search(req: SearchRequest):
    results = search_web(req.query)
    return {"results": results, "query": req.query}
