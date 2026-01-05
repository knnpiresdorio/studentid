# Metrics Framework for UniPass

This document outlines the performance measurement framework for the UniPass Digital ID ecosystem, broken down by key feature domains.

---

## 1. Feature: Student Digital ID (Core Product)
**Goal:** ensure students convert from physical to digital and use the ID regularly.

### 1. North Star Metric (NSM)
*   **Definition:** **Weekly Active Students (WAS)**
*   **Components:** Unique students opening the app + Unique students successfully validating ID.
*   **Target:** 30% of total enrolled student base engaging weekly.

### 2. Supporting Metrics
*   **Acquisition:** New Digital Activations (First-time app login & ID generation).
*   **Activation:** Rate of students adding a Dependent ID within first 7 days.
*   **Retention:** D30 Retention (Percentage of users returning 30 days after activation).
*   **Revenue:** N/A (assuming standard student usage is free/included).

### 3. Leading Indicators
*   **App Opens per Student:** Frequency of accessing the digital wallet.
*   **Profile Update Requests:** Number of photo/info update requests (indicates engagement with data accuracy).

### 4. Lagging Indicators
*   **Churn Rate:** Students who haven't opened the app in 90 days.
*   **Support Ticket Volume:** Complaints about "ID not opening" or "Login failed".

### 5. Health Metrics
*   **Load Time:** Average time to render the ID card (< 1.5s).
*   **Crash Rate:** % of sessions ending in error.

---

## 2. Feature: Partner Network & Benefits
**Goal:** Drive value for students through meaningful discounts and for partners through traffic.

### 1. North Star Metric (NSM)
*   **Definition:** **Monthly Redeemed Value (MRV)**
*   **Components:** Total estimated financial savings by students + Total verifications at partners.
*   **Target:** 15% Month-over-Month growth in redemptions.

### 2. Supporting Metrics
*   **Acquisition:** New Partners Onboarded per Month.
*   **Activation:** Partners with > 5 scans in their first week.
*   **Retention:** % of Partners active (scanning/updating profile) after 3 months.
*   **Revenue:** Commission revenue (if applicable) or Partner Subscription Renewal Rate.

### 3. Leading Indicators
*   **Deal Views:** Number of times a partner's detail card is opened by students.
*   **Search Volume:** Number of "Partner Search" queries or AI suggestions requested.

### 4. Lagging Indicators
*   **Partner Churn:** Partners requesting removal or inactive for > 60 days.
*   **Avg. Discount Usage per Student:** Trend analysis of benefit saturation.

### 5. Health Metrics
*   **Zero-Result Searches:** % of partner searches returning no results.
*   **Partner Profile Completeness:** % of partners with logo, banner, and active promotions.

---

## 3. Feature: Validation System (Scanner)
**Goal:** Ensure trust and frictionless verification.

### 1. North Star Metric (NSM)
*   **Definition:** **Successful Verification Rate (SVR)**
*   **Components:** (Valid Scans / Total Scan Attempts) * 100.
*   **Target:** > 98% success rate on first attempt.

### 2. Supporting Metrics
*   **Acquisition:** N/A (Feature usage depends on Partners).
*   **Activation:** N/A.
*   **Retention:** Frequency of scanner usage by "Store" users.
*   **Revenue:** N/A.

### 3. Leading Indicators
*   **Scan Speed:** Time from opening scanner to result display.
*   **Permission Grants:** Rate of successful Camera permission approvals.

### 4. Lagging Indicators
*   **Manual Fallback Rate:** % of validations done via CPF typing vs. QR Scan (High rate indicates scanner issues/failure).
*   **Reported False Negatives:** User reports of valid IDs showing as invalid.

### 5. Health Metrics
*   **API Latency:** Avg. response time for validation endpoint (< 200ms).
*   **Offline Validations:** Number of validations performed without network (if PWA offline mode supported).

---

## 4. Feature: School Management Dashboard
**Goal:** Empower schools to manage their student base autonomously.

### 1. North Star Metric (NSM)
*   **Definition:** **Admin Efficiency Score**
*   **Components:** Time to resolve Change Requests (Avg. Resolution Time).
*   **Target:** < 24 hours per request.

### 2. Supporting Metrics
*   **Acquisition:** Schools onboarded.
*   **Activation:** Admins who complete the "School Profile" setup.
*   **Retention:** WAU (Weekly Active Users) for School Admins.
*   **Revenue:** SaaS Licensing Revenue / ARR (Annual Recurring Revenue) per School.

### 3. Leading Indicators
*   **Bulk Upload Frequency:** Regularity of student list updates.
*   **Audit Log Activity:** Volume of actions taken (updates, creates, deletes).

### 4. Lagging Indicators
*   **NPS (Net Promoter Score):** School Admin satisfaction.
*   **Contract Renewals:** % of schools renewing annual licenses.

### 5. Health Metrics
*   **System Uptime:** Availability of the dashboard.
*   **Data Integrity Errors:** Failed bulk uploads or sync errors.
