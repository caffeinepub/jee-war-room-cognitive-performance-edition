# Specification

## Summary
**Goal:** Remove AIR rank projection and sleep tracker features, and add chapter names to time block cards.

**Planned changes:**
- Remove AIR rank projection section from IntelligenceEngine component (keep weakness detection, burnout detection, and daily suggestions)
- Remove SleepTracker component and all sleep-related UI elements
- Remove sleep quality factor from FSI calculation formula and redistribute weighting to 50% deep work, 25% task switching, 25% distraction
- Remove all backend sleep tracking endpoints, data models, and storage
- Remove all sleep-related React Query hooks from frontend
- Add chapter name display to time block cards in FlexibleScheduleGrid, positioned below time range
- Update time block data model to ensure chapter field is populated and displayed
- Update FocusStabilityIndex component UI to reflect new formula without sleep references

**User-visible outcome:** The Intelligence tab no longer shows rank projections, the sleep tracker is completely removed from the dashboard and FSI calculation, and time block cards now clearly display the chapter name below the time range for better study tracking.
