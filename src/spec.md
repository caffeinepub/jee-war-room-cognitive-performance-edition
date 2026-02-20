# Specification

## Summary
**Goal:** Add War Mode entry UI with configuration modal for duration and break settings to the Overview Dashboard.

**Planned changes:**
- Add "ENTER WAR MODE" button to OverviewDashboard component with neon blue styling
- Create War Mode configuration modal with focus duration selector (60m/90m/120m presets + custom input)
- Add "Break needed?" toggle with Yes/No options
- Implement conditional break duration selector (5m/10m/15m presets + custom input) that appears when break is enabled
- Add confirmation modal showing settings summary with "Confirm & Enter War Mode" and "Cancel" buttons
- Implement form validation for duration inputs (minimum 1 minute, positive integers)
- Ensure mobile-responsive design with 44x44px minimum touch targets for all interactive elements
- Confirmation button closes modals without entering War Mode (War Mode screen not implemented in this phase)

**User-visible outcome:** Users can tap the "ENTER WAR MODE" button on the Overview Dashboard to open a configuration modal where they select focus duration (with preset or custom options), optionally enable breaks with duration selection, review their settings in a confirmation modal, and either confirm or cancel. The modals close after confirmation, but War Mode does not start yet.
