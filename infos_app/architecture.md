# Architecture Review

## 1. Component Analysis

*   **Monolithic Orchestration**: `App.tsx` acts as a "God Component," handling:
    *   Routing (conditional rendering based on Roles).
    *   Global State (Users, Students, Partners, Schools).
    *   Data Synchronization (Supabase + Mock fallback).
    *   Business Logic (CRUD operations, Audit Logging).
    *   **Impact**: This violation of the Single Responsibility Principle leads to a fragile codebase where changes in one domain (e.g., Partner UI) risk breaking others (e.g., Student state logic).

*   **Prop Drilling**: Critical state setters (`setStudents`, `setPartners`) are passed down 3-4 levels deep (e.g., `App` -> `AdminDashboard` -> `PartnerDetailCard`). This makes refactoring difficult and obscures data flow.

*   **Tight Coupling**: Components like `AdminDashboard.tsx` contain embedded massive sub-components (Modals, Forms) rather than importing them. This results in file sizes exceeding 1500 lines, reducing readability.

## 2. Scalability Assessment

*   **State Management**: The current reliance on root-level `useState` hooks causes the **entire application to re-render** whenever any piece of state changes. As the dataset grows (e.g., 1000+ students), the UI will become sluggish.
    *   **Verdict**: Not scalable for production datasets.

*   **Code Organization**: The flat `components/` directory structure will become unmanageable.
    *   **Recommendation**: Group by feature (e.g., `features/admin`, `features/student`, `features/shared`).

## 3. Security Review

*   **CRITICAL: API Key Exposure**: The `GEMINI_API_KEY` is injected via `vite.config.ts` into the client-side bundle (`process.env.GEMINI_API_KEY`).
    *   **Risk**: Malicious users can extract this key and consume your AI quota.
    *   **Fix**: Move AI interactions to a backend service (e.g., Supabase Edge Functions) so the key never leaves the server environment.

*   **Authentication & Authorization**:
    *   Role checks are currently performed on the **client-side** (`if (user.role === ...)`).
    *   **Risk**: A savvy user could manipulate the JavaScript variable or network response to elevate privileges.
    *   **Requirement**: Ensure **Row Level Security (RLS)** policies are strictly configured in Supabase to prevent unauthorized DB access, regardless of frontend logic.

## 4. Performance Evaluation

*   **Data Fetching**: It appears the app fetches *all* data (Students, Partners) on load.
    *   **Impact**: Slow initial load times as the database grows.
    *   **Fix**: Implement **Pagination** and **Server-Side Filtering** (e.g., fetch only the first 20 students, or search by query at the DB level).

*   **Rendering**: Large lists (Students table) are rendered without virtualization. Rendering 500+ DOM nodes will freeze the browser.
    *   **Fix**: Use libraries like `react-window` or `tanstack/virtual` for long lists.

## 5. Integration Points

*   **Supabase**: Currently acting as a direct-to-database client.
    *   **Observation**: Good for rapid prototyping.
    *   **Recommendation**: Transition logic to Hooks (`useStudents`, `usePartners`) or React Query to handle caching, loading states, and error handling robustly.

*   **Google Gemini**:
    *   Integrated directly in `geminiService.ts`.
    *   **Issue**: No rate limiting or abuse protection on the client side.

## 6. Improvement Recommendations

### Immediate Priority (Refactoring & Security)
1.  **Secure API Keys**: Create a Supabase Edge Function to proxy calls to Google Gemini.
2.  **Split `App.tsx`**: Implement **React Router** to manage views instead of conditional rendering. Move global state to **React Context** or **Zustand**.
3.  **Component Extraction**: Break `AdminDashboard.tsx` into smaller, focused files (`StudentTable.tsx`, `PartnerForm.tsx`).

### Medium Term (Scalability)
4.  **React Query**: Replace `useEffect` data fetching with `TanStack Query` for caching and background updates.
5.  **Pagination**: Update Supabase queries to support `.range()` and implement pagination UI.

### Long Term (Maintenance)
6.  **Testing**: Introduce **Vitest** for unit testing critical logic (Validation rules) and **Playwright/Cypress** for critical user flows (Login -> Scan).
