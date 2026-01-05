# Backlog: Breaking the Monolith (UniPass Digital)

This backlog focuses specifically on deconstructing "God Components" and decoupling the state architecture to move from a monolithic frontend to a modular, feature-based architecture.

---

## 🏗️ Phase 1: The Admin Deconstruction (P0) - [COMPLETED]
**Objective:** Reduce `AdminDashboard.tsx` from 1,450 lines to <200 lines by fragmenting it into domain-specific components.

1.  **Extract `SchoolManagement` Module:** [DONE]
    *   Create `features/admin/schools/SchoolList.tsx`.
    *   Create `features/admin/schools/SchoolForm.tsx`.
    *   Extract logic to `useSchoolAdmin.ts`.
2.  **Extract `GlobalMemberRegistry` Module:** [DONE]
    *   Move the global table and pagination to `features/admin/members/MemberRegistry.tsx`.
    *   Extract search/filter logic to `useMemberRegistry.ts`. (Note: Integrated with existing pagination hooks)
3.  **Extract `SystemPartnerDirectory` Module:** [DONE]
    *   Create `features/admin/partners/PartnerDirectory.tsx`.
    *   Extract partner CRUD logic to `useAdminPartner.ts`.
4.  **Extract `GlobalAuditLogs` Module:** [DONE]
    *   Create `features/admin/audit/GlobalAuditTrail.tsx`.

---

## 🏗️ Phase 2: Decoupling Student & Partner Hubs (P1) - [OKAY]
**Objective:** Break down `StudentView` and `StoreView` into functional sub-pages.

1.  **Fragment `StudentView.tsx`:**
    *   Isolate the "Digital ID" logic into a dedicated route/view.
    *   Move "Benefits Explorer" to `features/student/benefits/BenefitsList.tsx`.
    *   Move "Dependent Management" to `features/student/profile/DependentManager.tsx`.
2.  **Fragment `StoreView.tsx`:**
    *   Isolate the "Scanner/Validation" logic to `features/partner/validation/ScannerView.tsx`.
    *   Move "Business Metrics" to `features/partner/analytics/MetricsDashboard.tsx`.
    *   Move "Promotion Management" to `features/partner/promotions/PromotionManager.tsx`.

---

## 🏗️ Phase 3: State & Context Atomization (P1) [COMPLETED]
**Objective:** Split the "Master Context" (`StoreContext.tsx`) into independent domain providers.

1.  **Split `StoreContext` into:**
    *   `MemberContext.tsx`: Only handles student/staff data.
    *   `PartnerContext.tsx`: Only handles store and promotion data.
    *   `AnalyticsContext.tsx`: Handles audit logs and usage metrics.
2.  **Implement "Proxy-less" Refresh:**
    *   Remove deprecated setters in Contexts.
    *   Ensure components consume specific hooks (e.g., `useSchools()`) instead of the master `useStore()`.

---

## 🏗️ Phase 4: Feature Isolation & Routing (P2) [COMPLETED]
**Objective:** Modernize the app bootstrap and improve bundle safety.

1.  **Modular Routing: [COMPLETED]**
    *   Create separate route configuration files for each role (e.g., `routes/AdminRoutes.tsx`).
    *   Implement React Lazy Loading for feature pages to reduce initial load time.
2.  **Domain Service Isolation: [COMPLETED]**
    *   Move domain services from `services/supabase.ts` into feature folders (`features/admin/api.ts`).
3.  **Logic "Hook-ification": [COMPLETED]**
    *   Final scrub of components to ensure 0% business logic (all logic moved to `hooks` or `utils`).

---

## 🏁 Success Criteria (Definition of Done)
*   [ ] **Zero God Components**: No component exceeds 400 lines of code.
*   [ ] **Domain Isolation**: Changing a "Partner" promotion doesn't trigger a re-render in the "School" management view.
*   [ ] **Testability**: Every extracted `useHook` has a unit test capability.
*   [ ] **Performance**: Total Lighthouse score for "Performance" > 90 due to smaller individual chunks.

---

## 🏗️ Phase 5: Performance & Boundaries (P0) [COMPLETED]
**Objective:** Optimize data fetching and enforce strict module boundaries.

1.  **Refactor AdminStudentView:** [COMPLETED]
    *   Replaced `students` prop with `studentStats` for KPI calculations.
    *   Implemented `fetchStudentById` for on-demand editing/actions.
2.  **Optimize Audit Logs:** [COMPLETED]
    *   Implemented server-side pagination for Audit Logs.
    *   Removed full log history fetching.

---

## 🏗️ Phase 6: Global Data Elimination (P0) [COMPLETED]
**Objective:** Remove the heavy "Select All" queries from the initial application load.

1.  **Refactor MemberContext:** [COMPLETED]
    *   Removed `useStudentsQuery` (fetch * students) from `MemberProvider`.
    *   Removed `students` array from `MemberContext`.
2.  **Refactor Consumers:** [COMPLETED]
    *   Updated `SchoolManager` to use only paginated data.
    *   Refactored `RequestList` to fetch student photos on-demand (`StudentAvatar`).

---


---

## 🏗️ Phase 7: Robust Form Management (P1) [COMPLETED]
**Objective:** Replace manual state management with performant validation libraries to reduce re-renders and potential bugs.

1.  **Migrate Student Forms:**
    *   Implement `react-hook-form` + `zod` for `StudentModal`.
    *   Add schema validation for CPF, Phone, and Dates.
2.  **Migrate Partner Forms:**
    *   Refactor `PartnerModal` to use controlled inputs with validation.
    *   Standardize error messages.

---

## 🏗️ Phase 8: Testing Strategy (P2) [COMPLETED]
**Objective:** Establish a safety net for future refactors with automated testing.

1.  **Setup Testing Infrastructure:**
    *   Install Vitest + React Testing Library.
    *   Configure test aliases.
2.  **Unit Test Core Hooks:**
    *   Add tests for `useStudentActions`, `usePartnerMetrics`.
3.  **Component Tests:**
    *   Add snapshot tests for `StudentCard` and `DigitalID`.

---

*Created: 2026-01-04*
