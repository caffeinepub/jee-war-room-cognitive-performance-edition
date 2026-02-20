# Specification

## Summary
**Goal:** Build Phase 1 of the JEE War Room application with core UI, Overview dashboard, real-time countdown, and complete chapter management system.

**Planned changes:**
- Implement dark UI layout (#0f0f0f background) optimized for Android devices with 44x44px minimum touch targets and mobile-responsive design (320px-480px)
- Create unified Overview dashboard displaying chapter completion percentage, PCM ratio tracker, War Mode hours counter, and weak chapter alerts
- Add real-time countdown timer to JEE Advanced 2026 (May 17, 2026, 9:00 AM IST) that updates every second and turns red when fewer than 30 days remain
- Split Chemistry into three separate sections: Physical Chemistry, Organic Chemistry, and Inorganic Chemistry, each with independent chapter lists
- Implement full chapter management system with modal-based editing for chapter name, status (Not Started, In Progress, Completed, Revised Once, Revised Twice, Mastered), weakness level (Weak, Moderate, Strong), accuracy percentage, and last revision date
- Add delete chapter functionality with confirmation modal and add custom chapter functionality with validation
- Implement dynamic chapter completion percentage calculation that updates in real-time as chapter status changes across all subjects (Physics, Physical Chemistry, Organic Chemistry, Inorganic Chemistry, Mathematics)

**User-visible outcome:** Users can view a dark-themed Overview dashboard with real-time JEE countdown, track chapter completion across Physics, three Chemistry sections, and Mathematics, and manage chapters through modal dialogs with full CRUD capabilities including status updates, weakness tracking, and accuracy monitoring.
