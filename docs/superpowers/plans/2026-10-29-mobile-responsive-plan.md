# Mobile Responsive Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the API test center comfortable to use on narrow mobile screens without changing API behavior or desktop layout.

**Architecture:** Keep the existing React component structure and implement the adaptation through mobile-first CSS rules. Add a small stylesheet contract test so the intended responsive class hooks remain explicit, then verify the full app with Vitest and Vite build.

**Tech Stack:** React, TypeScript, Vite, Vitest, CSS media queries.

**Spec:** `docs/superpowers/specs/2026-10-29-mobile-responsive-design.md`

## Global Constraints

- Do not change API registry, runners, API fields, or execution behavior.
- Do not add a UI component library or third-party responsive dependency.
- Keep desktop API cards in a two-column layout at widths of 840px and above.
- At narrow widths, preserve API descriptions and test results rather than hiding them.

## Review Focus

- A 320px viewport must not create horizontal overflow from the page shell, tabs, cards, or JSON output.
- Long tab labels must remain readable and tappable through horizontal scrolling rather than being compressed.
- Card headers with long API names and documentation links must wrap into separate rows.
- Primary run buttons must remain easy to tap on mobile with a minimum 44px height.
- Long JSON strings and error messages must wrap inside their result containers.

### Task 1: Add responsive layout contract tests

**Files:**
- Create: `src/__tests__/responsive-layout.test.ts`
- Test: `src/App.css`

**Interfaces:**
- Consumes: CSS class names already rendered by `App`, `ApiGroup`, and `ApiTestCard`.
- Produces: Assertions documenting the required mobile CSS selectors and breakpoint behavior.

- [ ] **Step 1: Write the failing test**

  Add tests that read `src/App.css` and assert it contains:
  - a max-width media query for the mobile layout;
  - mobile horizontal overflow handling for `.api-tabs`;
  - mobile single-column `.api-grid` behavior;
  - mobile stacked `.api-card-header` behavior;
  - a mobile full-width `.api-card button` rule;
  - wrapping behavior for `.result pre`.

- [ ] **Step 2: Run test to verify it fails**

  Run: `npm test -- --run src/__tests__/responsive-layout.test.ts`

  Expected: FAIL because the new mobile selectors are not present yet.

### Task 2: Implement mobile-first responsive styles

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: Existing layout classes from the React components.
- Produces: Responsive layout behavior at widths below 768px while retaining the existing desktop breakpoint.

- [ ] **Step 1: Implement the minimal CSS required by the failing contract tests**

  Add a `@media (max-width: 767px)` block that:
  - reduces `.App`, `.hero`, and `.api-card` padding;
  - reduces the hero heading size and makes runtime status chips fit naturally;
  - makes `.api-tabs` horizontally scrollable and keeps `.api-tab` at least 44px tall without shrinking its label;
  - stacks `.api-card-header` and allows the documentation link to occupy its own row;
  - makes `.api-card button` full width with a minimum 44px height;
  - keeps `.field input`, `.field textarea`, `.result`, and `.result pre` within the card width and wraps long content.

- [ ] **Step 2: Run the focused test to verify it passes**

  Run: `npm test -- --run src/__tests__/responsive-layout.test.ts`

  Expected: PASS.

### Task 3: Verify the complete change

**Files:**
- Modify: `docs/superpowers/specs/2026-10-29-mobile-responsive-design.md` only if implementation decisions need recording.

- [ ] **Step 1: Run the full test suite**

  Run: `npm test -- --run`

  Expected: all test files and tests pass.

- [ ] **Step 2: Run the production build**

  Run: `npm run build`

  Expected: Vite exits with code 0.

- [ ] **Step 3: Check the diff for whitespace errors**

  Run: `git diff --check`

  Expected: no output and exit code 0.

- [ ] **Step 4: Review the final diff**

  Confirm that only responsive styles, their test, and the approved design/plan documents changed; confirm API runtime files are untouched.
