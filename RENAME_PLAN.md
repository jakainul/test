# Plan: Rename "Budget Master" to "Savings Master" in UI

## Objective
Rename all UI-facing instances of "Budget Master" to "Savings Master" without changing internal code names, file names, or backend references.

## Files to Modify

### 1. Frontend UI Files (Critical - User-Facing)

#### `/workspace/budget-master/frontend/src/App.tsx`
- **Line 59**: Loading message: `Loading Budget Master...` → `Loading Savings Master...`
- **Line 68**: Main header: `💰 Budget Master` → `💰 Savings Master`

#### `/workspace/budget-master/frontend/public/index.html`
- **Line 10**: Meta description: `Budget Master - Simple monthly budget tracking application` → `Savings Master - Simple monthly savings tracking application`
- **Line 14**: Page title: `<title>Budget Master</title>` → `<title>Savings Master</title>`

#### `/workspace/budget-master/frontend/public/manifest.json`
- **Line 2**: Short name: `"short_name": "Budget Master"` → `"short_name": "Savings Master"`
- **Line 3**: Full name: `"name": "Budget Master - Monthly Budget Tracker"` → `"name": "Savings Master - Monthly Savings Tracker"`

### 2. Files to EXCLUDE (Not UI-facing)

These files will NOT be modified as they are not user-facing:

- `/workspace/budget-master/README.md` - Documentation (not displayed in app UI)
- `/workspace/budget-master/start.sh` - Script console output (not user-facing)
- `/workspace/budget-master/backend/server.js` - Backend API message (not displayed to users)
- `/workspace/budget-master/backend/package.json` - Backend package metadata (not displayed to users)

## Testing Plan

### 1. Pre-Change Verification
- [ ] Verify current state of the application
- [ ] Check that backend and frontend are properly configured
- [ ] Document current behavior

### 2. Implementation Steps
- [ ] Modify App.tsx (2 changes)
- [ ] Modify index.html (2 changes)
- [ ] Modify manifest.json (2 changes)
- [ ] Total: 6 changes across 3 files

### 3. Post-Change Testing

#### A. Visual Testing
- [ ] Start the application (backend and frontend)
- [ ] Verify browser tab title shows "Savings Master"
- [ ] Verify main page header shows "💰 Savings Master"
- [ ] Verify loading screen shows "Loading Savings Master..."
- [ ] Test on both desktop and mobile views

#### B. PWA Manifest Testing
- [ ] Verify manifest.json is properly loaded
- [ ] Check application name in browser dev tools
- [ ] Test "Add to Home Screen" functionality (if applicable)

#### C. Functional Testing
- [ ] Verify all functionality still works after changes:
  - [ ] Add monthly salary
  - [ ] Delete salary entry
  - [ ] Add savings/investments
  - [ ] Delete savings entry
  - [ ] Budget summary calculation
  - [ ] Savings summary calculation
- [ ] Check for any console errors
- [ ] Verify API communication still works

#### D. Browser Testing
- [ ] Test in Chrome/Chromium
- [ ] Test in Firefox (if available)
- [ ] Test in Safari (if available)

#### E. Regression Testing
- [ ] Ensure no broken links or references
- [ ] Verify all components load properly
- [ ] Check responsive design still works
- [ ] Verify data persistence

### 4. Build Testing
- [ ] Run production build: `npm run build`
- [ ] Verify no build errors
- [ ] Check built files for correct naming
- [ ] Test production build functionality

## Success Criteria

✅ All 6 UI-facing "Budget Master" references changed to "Savings Master"
✅ Application starts without errors
✅ All features work as expected
✅ No console errors or warnings
✅ Production build succeeds
✅ Visual appearance is correct in browser

## Rollback Plan

If issues are encountered:
1. Use git to revert changes: `git checkout -- <file>`
2. Or manually restore original text in the 3 modified files
3. Restart frontend server to reload changes

## Notes

- This is a UI-only change - no code logic is modified
- All internal references, file names, and folder names remain unchanged
- The project folder name `budget-master` remains the same
- Backend references remain unchanged
- No database changes required
- No API endpoint changes
