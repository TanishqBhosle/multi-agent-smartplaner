from typing import TypedDict, List
from typing_extensions import NotRequired

class TravelState(TypedDict):
    user_input: str
    destination: NotRequired[str]
    num_days: NotRequired[int]
    budget: NotRequired[str]
    preferences: NotRequired[List[str]]
    attractions: NotRequired[str]
    itinerary: NotRequired[str]
    budget_breakdown: NotRequired[str]
    final_plan: NotRequired[str]
