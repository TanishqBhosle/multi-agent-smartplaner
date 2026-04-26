import os
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from graph import graph

app = FastAPI(title="SmartPlan-AI API")

# CORS for React dev server
app.add_middleware(\
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AGENT_LABELS = {
    "preference_analyzer": {
        "name": "Preference Analyzer",
        "description": "Extracting your travel preferences...",
        "icon": "🔍"
    },
    "researcher": {
        "name": "Research Agent",
        "description": "Discovering top attractions & activities...",
        "icon": "🌍"
    },
    "itinerary_planner": {
        "name": "Itinerary Planner",
        "description": "Crafting your day-by-day plan...",
        "icon": "📋"
    },
    "budget_advisor": {
        "name": "Budget Consultant",
        "description": "Calculating costs...",
        "icon": "💰"
    },
    "final_responder": {
        "name": "Final Responder",
        "description": "Compiling your personalized travel plan...",
        "icon": "✨"
    },
}

AGENT_ORDER = [
    "preference_analyzer",
    "researcher",
    "itinerary_planner",
    "budget_advisor",
    "final_responder",
]


@app.get("/api/health")
async def health():
    has_key = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    return {"status": "ok", "api_key_configured": has_key}


@app.post("/api/plan")
async def plan_trip(request: Request):
    body = await request.json()
    query = body.get("query", "").strip()

    if not query:
        return {"error": "Please provide a travel query."}

    if not (os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")):
        return {"error": "API Key is not configured on the server."}

    async def event_generator():
        # Send initial event with agent list
        yield {
            "event": "agents",
            "data": json.dumps({
                "agents": [
                    {"id": aid, **AGENT_LABELS[aid]} for aid in AGENT_ORDER
                ]
            }),
        }

        initial_state = {"user_input": query}

        try:
            # Run graph in a thread since it's synchronous
            loop = asyncio.get_event_loop()

            def run_graph():
                results = []
                for step in graph.stream(initial_state):
                    for node_name, node_state in step.items():
                        results.append((node_name, node_state))
                return results

            # We need to stream, so we'll use a queue
            import queue
            import threading

            q = queue.Queue()

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
                # Poll the queue
                try:
                    msg_type, data1, data2 = q.get(timeout=0.5)
                except queue.Empty:
                    # Send a keepalive
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
                    # Send the final plan
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

        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }

    return EventSourceResponse(event_generator())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
