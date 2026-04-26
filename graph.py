from langgraph.graph import StateGraph, START, END
from state import TravelState
from agents import (
    preference_analyzer_node,
    research_agent_node,
    itinerary_planner_node,
    final_response_node,
    budget_advisor_node
)

def build_travel_graph() -> StateGraph:
    # Initialize the graph with the TravelState
    builder = StateGraph(TravelState)
    
    # Add nodes
    builder.add_node("preference_analyzer", preference_analyzer_node)
    builder.add_node("researcher", research_agent_node)
    builder.add_node("itinerary_planner", itinerary_planner_node)
    builder.add_node("budget_advisor", budget_advisor_node)
    builder.add_node("final_responder", final_response_node)
    
    # Add edges
    builder.add_edge(START, "preference_analyzer")
    builder.add_edge("preference_analyzer", "researcher")
    builder.add_edge("researcher", "itinerary_planner")
    builder.add_edge("itinerary_planner", "budget_advisor")
    builder.add_edge("budget_advisor", "final_responder")
    builder.add_edge("final_responder", END)
    
    # Compile the graph
    return builder.compile()

# Example visualization could be done here as well, if needed.
graph = build_travel_graph()
