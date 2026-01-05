# Project Features Breakdown

## 1. Core Components

The application is structured as a Role-Based Single Page Application (SPA).

*   **`App.tsx` (Root Orchestrator)**
    *   Manages global state (`users`, `students`, `partners`, `schools`).
    *   Handles "Routing" based on `UserRole` (`STUDENT`, `STORE`, `STORE_ADMIN`, `SCHOOL_ADMIN`, `ADMIN`).
    *   Orchestrates data fetching and updates (Supabase + Mock Data fallback).

*   **Role-Specific Views**
    *   **`StudentView`**: The main interface for students. Displays the digital ID card, dependent IDs, and status.
    *   **`StoreView`**: Interface for partners. Includes:
        *   **Validation Tab**: QR Code scanner (`Scanner.tsx`) and manual CPF entry.
        *   **Profile Tab**: Store profile editing (Banner, Promotions, Description).
    *   **`SchoolManager`**: Dashboard for School Admins to manage their student base and partners.
    *   **`AdminDashboard`**: Super Admin view for platform-wide management and audit logs.
    *   **`LoginScreen`**: Entry point handling user authentication simulation.

*   **Shared Components**
    *   **`Scanner`**: Camera interface for reading Student ID QR codes.
    *   **`PartnerDetailCard`**: Modal/Card for displaying partner details to admins.
    *   **`ThemeToggle`**: Switches between Light and Dark modes.

## 2. Dependencies

### Core
*   **`react` / `react-dom`**: v19.2.3 - UI Framework.
*   **`vite`**: v6.2.0 - Build tool and Dev server.
*   **`typescript`**: ~5.8.2 - Static typing.

### Integrations
*   **`@supabase/supabase-js`**: Data persistence and database interaction.
*   **`@google/genai`**: AI features (Partner suggestions, Marketing copy).

### UI & Utilities
*   **`lucide-react`**: Iconography.
*   **`vite-plugin-pwa`**: Progressive Web App capabilities (manifest, offline support).

## 3. Technical Requirements

*   **Runtime Environment**: Browser-based SPA.
*   **Build System**: Vite.
*   **Language**: TypeScript.
*   **Styling**: Tailwind CSS (inferred from utility usage like `bg-slate-900`, `backdrop-blur`).
*   **Environment Variables**:
    *   `GEMINI_API_KEY`: For AI features.
    *   Supabase Credentials (URL + Anon Key).

## 4. UI/UX Elements

*   **Design Language**: "Premium Glassmorphism"
    *   Heavy use of `backdrop-blur`, gradients, and semi-transparent backgrounds (`bg-slate-900/50`).
    *   Dark Mode prioritized (slate-950/900 color palette).
*   **Interactive Elements**:
    *   **Toast/Alerts**: Native `alert()` currently used (Potential for upgrade).
    *   **Transitions**: Smooth transitions on hover and tab switching.
    *   **Scanner Overlay**: Visual cues for QR code scanning.

## 5. Data Requirements

### Data Models (`types.ts`)
*   **`User`**: Authentication entity with Roles.
*   **`Student`**: Core entity containing ID data, validation status, and dependents.
*   **`Partner`**: Store entities with discount rules and promotions.
*   **`School`**: Educational institutions.
*   **`ChangeRequest`**: Async requests for profile updates (e.g., adding dependents).
*   **`AuditLog`**: Security tracking for actions.

### Database Schema (Supabase)
Inferred tables from `App.tsx`:
*   `students`
*   `partners`
*   `users`
*   `schools`
*   `change_requests` (columns: `status`, `resolvedAt`, `resolvedBy`)

## 6. Integration Points

*   **Supabase Client (`services/supabase.ts`)**:
    *   Used for `upsert`, `insert`, `delete` operations on core tables.
    *   Currently integrated directly into `App.tsx` logic.
*   **Google Gemini (`services/geminiService.ts`)**:
    *   **`suggestPartners`**: Semantic search for partners based on user queries.
    *   **`generateMarketingCopy`**: Generates short, punchy descriptions for stores.

## 7. Testing Requirements

*   **Current State**: No automated testing framework (Jest/Vitest) is currently configured in `package.json`.
*   **Recommended**:
    *   **Unit Tests**: For critical logic in `App.tsx` (validation logic) and `geminiService.ts`.
    *   **E2E Tests**: For critical flows like "Login -> Validate Student ID".
