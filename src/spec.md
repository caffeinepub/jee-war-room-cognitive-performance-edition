# Specification

## Summary
**Goal:** Add visual revision tracking toggles for Theory, PYQs, and Advanced Practice to each chapter in the MasterPCMChapterSystem with completion indicators and live percentage updates.

**Planned changes:**
- Add three prominent toggle buttons/checkboxes (Theory, PYQs, Advanced Practice) to each chapter card
- Display green checkmark icon (✓) for completed fields and red cross icon (✗) for incomplete fields
- Wire toggles to call the backend updateChapterRevision endpoint on click
- Display real-time revision coverage percentage (0-100%) calculated from completed toggles
- Ensure responsive mobile layout without horizontal scrolling on 320px-480px screens
- Update UI immediately on toggle changes without page refresh

**User-visible outcome:** Users can now visually track and toggle their Theory, PYQs, and Advanced Practice completion status for each chapter with clear checkmark/cross indicators and see the revision coverage percentage update in real-time.
