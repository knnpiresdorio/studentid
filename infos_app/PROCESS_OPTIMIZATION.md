# Process Optimization Plan: UniPass Digital

This document outlines the strategy for optimizing both the **product workflows** (business processes) and the **development workflows** (engineering processes) for the UniPass platform.

---

## 1. Current State Analysis

### A. Product Workflows (Business Processes)
*   **Member Onboarding:** Currently manual via `StudentModal`, requiring individual typing of data for each student or staff member.
*   **Identification:** Digital IDs are generated on-the-fly. QR codes link to validation profiles.
*   **Benefit Usage:** Partners scan QR codes. Validation depends on real-time database checks or cached state.
*   **Data Structure:** Recently expanded to include `MemberType` (Staff, Managers, Partners) in addition to Students.

### B. Engineering Workflows (Development)
*   **Component Architecture:** Heavy reliance on "God Components" (e.g., `AdminDashboard`, `SchoolManager`) exceeding 1,000+ lines.
*   **State Management:** Redundant "Bridge Pattern" where data from React Query is copied into local `useState` in `StoreContext`, leading to potential desync.
*   **Validation:** Tipagem manual no TypeScript sem validação de runtime para entradas de formulário.

---

## 2. Bottleneck Identification

| Area | Bottleneck | Impact |
| :--- | :--- | :--- |
| **Administration** | Manual Member Entry | Non-scalable for large educational institutions. |
| **Development** | Monolithic Components | High cognitive load for developers; difficult to debug and test. |
| **Reliability** | Redundant State Sync | "Flicker" of old data and potential race conditions during updates. |
| **Performance** | Client-side Filtering | UI lag as the database grows (currently fetching all records at once). |
| **Security** | PII visibility in Logs | Potential LGPD compliance risk if not strictly masked. |

---

## 3. Improvement Opportunities

### Strategic "Quick Wins"
*   **Bulk Import:** Implement CSV/Excel upload for school administrators to onboard entire classes/staff lists in seconds.
*   **Hook Extraction:** Move business logic (validation, status toggling) into specialized hooks (`useMemberActions`) to reduce component complexity.
*   **Zod Integration:** Enforce runtime validation for all form submissions to ensure data integrity before reaching Supabase.

### Architectural Scaling
*   **Server-side Pagination:** Shift filtering and pagination to the Supabase layer to support 10k+ beneficiaries.
*   **Image Optimization:** Automated compression of member profile photos to reduce bandwidth/storage costs.

---

## 4. Implementation Plan

### Phase 1: Engineering Streamlining (Internal)
1.  **State Unification:** Remove local mirroring of React Query cache. Use `useMutation` with `optimisticUpdates` for all CRUD actions.
2.  **Hook-First Refactor:** Extract logic from `AdminDashboard` and `SchoolManager` into atomic hooks.
3.  **UI Standardization:** Consolidate variations of the "Student/Member" identity into a single `MemberCard` component.

### Phase 2: Administrative Excellence (Feature)
1.  **Bulk Member Service:** Create a background process for processing member spreadsheets.
2.  **Advanced Audit trail:** Implement a more granular audit log with built-in PII masking at the data access level.

### Phase 3: Platform Hardening (Optimization)
1.  **PWA Service Workers:** Automate background syncing of ID data for robust offline usage in areas with poor connectivity.
2.  **API Pagination:** Update all `useSupabaseQuery` hooks to support `limit` and `offset`.

---

## 5. Success Metrics

| Metric | Current Goal | Success Indicator |
| :--- | :--- | :--- |
| **Onboarding Speed** | ~2 min per member | < 10 seconds per member (via Bulk Import) |
| **Code Quality** | > 1000 lines/file | < 300 lines per functional component |
| **Data Accuracy** | Manual validation | 100% Schema Compliance (Zod) |
| **Validation Latency** | Depends on real-time connection | < 500ms (Offline-first approach) |
| **Maintenance Cost** | High (Complex logic) | Low (Logic isolated in Hooks/Utils) |

---

## 6. Proposed Automated Workflows (.agent/workflows)

To optimize the **developer process**, the following workflows should be implemented in the `.agent/workflows` directory:

1.  **`deploy-feature.md`**: Automates linting, type checking, and schema validation before a feature merge.
2.  **`seed-test-data.md`**: Quickly populates the environment with diverse `MemberTypes` for validation testing.
3.  **`generate-migration.md`**: Automates the creation of Supabase migrations when changing `types.ts`.

---
*Last Updated: 2026-01-04*
