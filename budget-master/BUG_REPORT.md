# Budget Master - Bug Report

## Date: October 3, 2025
## Project: Budget Master

After thoroughly analyzing the Budget Master project codebase, here are the bugs and issues identified:

---

## 🐛 BUGS FOUND

### 1. **BUG: Inconsistent Application Naming** 
**Severity:** Medium  
**Location:** `/workspace/budget-master/frontend/src/App.tsx` (Lines 59, 68)  
**Description:** The application displays "Savings Master" in the loading screen and header, but the project is actually called "Budget Master" everywhere else (README, package.json, etc.).

**Current Code:**
```tsx
// Line 59
<h2>Loading Savings Master...</h2>

// Line 68
<h1>💰 Savings Master</h1>
```

**Expected:** Should say "Budget Master" for consistency.

**Impact:** User confusion and brand inconsistency.

---

### 2. **BUG: Missing Year Validation Upper Limit** 
**Severity:** Low  
**Location:** `/workspace/budget-master/frontend/src/components/SalaryForm.tsx` (Line 90)  
**Description:** The year input field has a hardcoded maximum year of 2030, which will become problematic after 2030.

**Current Code:**
```tsx
max="2030"
```

**Issue:** This creates a time bomb where users won't be able to enter valid years after 2030. The validation should be dynamic.

**Recommendation:** Use `new Date().getFullYear() + 10` or remove the max constraint entirely.

---

### 3. **BUG: Missing Year Validation Upper Limit (Duplicate)** 
**Severity:** Low  
**Location:** `/workspace/budget-master/frontend/src/components/SavingsForm.tsx` (Line 189)  
**Description:** Same issue as #2 - hardcoded maximum year of 2030.

**Current Code:**
```tsx
max="2030"
```

**Impact:** Same as bug #2.

---

### 4. **BUG: Incorrect Locale for Currency Formatting** 
**Severity:** Low  
**Location:** Multiple files (BudgetSummary.tsx:10, SavingsSummary.tsx:44, SalaryList.tsx:17, SavingsList.tsx:21)  
**Description:** The currency formatter uses `'en-EU'` which is not a valid locale identifier. The correct locale for Euro formatting should be `'en-IE'`, `'de-DE'`, or just `'en'` with currency EUR.

**Current Code:**
```tsx
return new Intl.NumberFormat('en-EU', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
}).format(amount);
```

**Issue:** `'en-EU'` is not a standard BCP 47 language tag. While it might work in some browsers due to fallback mechanisms, it's technically incorrect and could cause inconsistent formatting across browsers.

**Correct Options:**
- `'en-IE'` (English - Ireland, uses Euro)
- `'de-DE'` (German - Germany, uses Euro)
- `'fr-FR'` (French - France, uses Euro)
- Or just `'en'` which will use default English formatting with EUR symbol

---

### 5. **BUG: Potential Division by Zero in Percentage Adjustment** 
**Severity:** Low  
**Location:** `/workspace/budget-master/frontend/src/components/SavingsForm.tsx` (Lines 25-68)  
**Description:** The `adjustPercentages` function could theoretically encounter edge cases where division by zero occurs if `otherTotal` is 0, though there are fallback conditions.

**Analysis:** While the code has `if (otherTotal > 0)` checks followed by else branches, the logic is correct. However, the rounding approach could lead to percentages not summing exactly to 100% due to rounding errors.

**Current Validation:**
```tsx
const isValidPercentage = Math.abs(totalPercentage - 100) < 1;
```

This allows for up to 1% difference, which is acceptable but could be improved.

---

### 6. **BUG: Savings Account Not Shown in Totals Grid** 
**Severity:** Medium  
**Location:** `/workspace/budget-master/frontend/src/components/BudgetSummary.tsx`  
**Description:** The BudgetSummary component only shows "Total Salaries" but doesn't display total savings or a comparison between income and savings. The CSS suggests it was designed for a grid with multiple total cards (`.totals-grid` uses `grid-template-columns: 1fr 1fr`), but only one card is rendered.

**Current Code:**
```tsx
<div className="totals-grid">
  <div className="total-card total-income">
    <div className="total-amount">{formatCurrency(summary.totalSalaries)}</div>
    <div className="total-label">Total Salaries</div>
  </div>
</div>
```

**Expected:** Should either:
1. Display total savings alongside total salaries
2. Or update the CSS to reflect single column layout

**Impact:** Incomplete budget overview for users.

---

### 7. **POTENTIAL BUG: SavingsSummary Filter Logic** 
**Severity:** Low  
**Location:** `/workspace/budget-master/frontend/src/components/SavingsSummary.tsx` (Line 216)  
**Description:** On line 216, the code filters out null values from savings account data, but then immediately re-adds 240 nulls. This could lead to confusion and potentially incorrect chart rendering if the historical data length is not properly calculated.

**Current Code:**
```tsx
// Remove any null values and keep only historical data
savingsDataset.data = savingsDataset.data.filter(val => val !== null);
// Extend with nulls for future months to maintain chart structure
savingsDataset.data = [...savingsDataset.data, ...new Array(240).fill(null)];
```

**Issue:** The comment says "remove null values" but then adds them back. While this might work, it's confusing and could lead to bugs if the data structure changes.

---

### 8. **BUG: DataTable Uses Array Index as Key** 
**Severity:** Medium  
**Location:** `/workspace/budget-master/frontend/src/components/DataTable.tsx` (Line 83)  
**Description:** The DataTable component uses array index as the key for table rows instead of a unique identifier.

**Current Code:**
```tsx
{data.map((record, index) => (
  <tr key={index} className="data-row">
```

**Issue:** Using array index as a key is an anti-pattern in React, especially when the list can be sorted, filtered, or items can be deleted. This can lead to:
- Incorrect component updates
- State preservation issues
- Performance problems
- Potential rendering bugs

**Recommendation:** Use a unique identifier from the record, like `record.id` if available, or create a composite key.

---

### 9. **SECURITY: Missing Input Sanitization** 
**Severity:** Low  
**Location:** Backend `/workspace/budget-master/backend/server.js` (Multiple endpoints)  
**Description:** User inputs are not sanitized before being inserted into the database. While SQLite3's parameterized queries prevent SQL injection, there's no validation for malicious content in text fields like descriptions.

**Impact:** Users could potentially inject malicious strings that could cause XSS if not properly escaped in the frontend.

**Recommendation:** Add input sanitization/validation middleware.

---

### 10. **BUG: No Error Handling for Database Initialization** 
**Severity:** Medium  
**Location:** `/workspace/budget-master/backend/server.js` (Line 14)  
**Description:** The database initialization error is only logged to console but doesn't prevent the server from starting with a broken database connection.

**Current Code:**
```javascript
initDatabase().catch(console.error);
```

**Issue:** If database initialization fails, the server will still start and serve requests, leading to 500 errors on all API calls.

**Recommendation:** Should exit the process or refuse to start if database initialization fails.

---

### 11. **BUG: Salaries Table Missing Error Callback** 
**Severity:** Low  
**Location:** `/workspace/budget-master/backend/database.js` (Line 13-21)  
**Description:** The salaries table creation doesn't have an error callback, so errors during that table creation won't be caught.

**Current Code:**
```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS salaries (
    ...
  )
`);
```

**Issue:** If salaries table creation fails, the error won't be caught and the promise might resolve incorrectly.

---

### 12. **DEPRECATION WARNING: Multiple Deprecated Dependencies** 
**Severity:** Low  
**Location:** Both `frontend/package.json` and `backend/package.json`  
**Description:** The project uses several deprecated packages as shown during npm install.

**Frontend:**
- Multiple deprecated packages including rimraf@3.0.2, glob@7.2.3, inflight@1.0.6
- 10 vulnerabilities (3 moderate, 7 high)
- eslint@8.57.1 is no longer supported

**Backend:**
- 1 high severity vulnerability

**Recommendation:** Run `npm audit` and update vulnerable packages.

---

## 📊 Summary

| Severity | Count |
|----------|-------|
| High     | 0     |
| Medium   | 4     |
| Low      | 8     |
| **Total**| **12**|

## 🔧 Priority Fixes

1. **Fix application name inconsistency** (Bug #1) - Quick fix, high visibility
2. **Fix invalid locale 'en-EU'** (Bug #4) - Affects data formatting
3. **Add total savings to BudgetSummary** (Bug #6) - Feature incompleteness
4. **Fix DataTable key prop** (Bug #8) - React anti-pattern
5. **Fix database initialization error handling** (Bug #10) - Server reliability
6. **Update deprecated dependencies** (Bug #12) - Security and maintenance

## ✅ What's Working Well

- Clean, modern UI with responsive design
- Good component structure and separation of concerns
- Comprehensive feature set (salaries, savings, allocations, projections)
- Data persistence with SQLite
- Toast notifications for user feedback
- Sortable and filterable data tables
- 20-year projection charts for investments
- No linter errors in the current code

---

**Analysis completed by:** AI Code Review Assistant  
**Date:** October 3, 2025
