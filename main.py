import os
import json
import asyncio
import threading
import queue
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

# Load environment variables
load_dotenv()

from graph import graph

# ✅ Initialize FastAPI app
app = FastAPI(title="SmartPlan-AI API")

# ✅ CORS (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agent metadata for the frontend
AGENT_LABELS = {
    "preference_analyzer": {
        "name": "Context Engine",
        "description": "Analyzing parameters...",
        "icon": ""
    },
    "researcher": {
        "name": "Global Research",
        "description": "Sourcing attractions...",
        "icon": ""
    },
    "itinerary_planner": {
        "name": "Logistics Planner",
        "description": "Structuring days...",
        "icon": ""
    },
    "budget_advisor": {
        "name": "Budget Consultant",
        "description": "Calculating costs...",
        "icon": ""
    },
    "final_responder": {
        "name": "Final Synthesis",
        "description": "Generating dossier...",
        "icon": ""
    },
}

AGENT_ORDER = [
    "preference_analyzer",
    "researcher",
    "itinerary_planner",
    "budget_advisor",
    "final_responder",
]

@app.get("/")
def home():
    return {"message": "SmartPlan-AI API is running 🚀"}

@app.get("/api/health")
async def health():
    has_key = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    return {"status": "ok", "api_key_configured": has_key}

@app.post("/api/plan")
async def generate_plan(request: Request):
    """
    Main API endpoint that runs the multi-agent graph and streams progress via SSE.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Match the 'query' field from frontend
    query = body.get("query", "").strip()

    if not query:
        raise HTTPException(status_code=400, detail="User input ('query') cannot be empty")

    if not (os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")):
        raise HTTPException(status_code=500, detail="API Key missing. Check your .env file.")

    async def event_generator():
        # 1. Send initial event with agent list
        yield {
            "event": "agents",
            "data": json.dumps({
                "agents": [
                    {"id": aid, **AGENT_LABELS[aid]} for aid in AGENT_ORDER
                ]
            }),
        }

        initial_state = {"user_input": query}
        q = queue.Queue()

        # Run langgraph stream in a separate thread to keep it non-blocking for SSE
        def run_and_queue():
            try:
                for step in graph.stream(initial_state):
                    for node_name, node_state in step.items():
                        q.put(("step", node_name, node_state))
                q.put(("done", None, None))
            except Exception as e:
                q.put(("error", str(e), None))

        thread = threading.Thread(target=run_and_queue, daemon=True)
        thread.start()

        final_state = {}

        while True:
            try:
                # Poll the queue for updates from the graph thread
                msg_type, data1, data2 = q.get(timeout=1.0)
            except queue.Empty:
                # Send a keepalive ping to prevent connection timeout
                yield {"event": "ping", "data": ""}
                continue

            if msg_type == "step":
                node_name = data1
                node_state = data2
                final_state.update(node_state)

                yield {
                    "event": "agent_complete",
                    "data": json.dumps({
                        "agent_id": node_name,
                        **AGENT_LABELS.get(node_name, {}),
                    }),
                }
            elif msg_type == "done":
                # Final result event
                yield {
                    "event": "plan_complete",
                    "data": json.dumps({
                        "destination": final_state.get("destination", ""),
                        "num_days": final_state.get("num_days", 0),
                        "budget": final_state.get("budget", ""),
                        "preferences": final_state.get("preferences", []),
                        "attractions": final_state.get("attractions", ""),
                        "itinerary": final_state.get("itinerary", ""),
                        "budget_breakdown": final_state.get("budget_breakdown", ""),
                        "final_plan": final_state.get("final_plan", ""),
                    }),
                }
                break
            elif msg_type == "error":
                yield {
                    "event": "error",
                    "data": json.dumps({"error": str(data1)}),
                }
                break

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)