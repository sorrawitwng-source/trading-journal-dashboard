# Stock Ideas Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deletable holdings and move stock recommendations into a polished category-driven Stock Ideas page.

**Architecture:** Keep routing local to `App.tsx` with a lightweight view state. Add a recommendation category helper that groups ranked stocks by market, sector, dividend, risk, and growth traits, then render those groups in a dedicated page component.

**Tech Stack:** React, TypeScript, Vitest, Vite, localStorage.

---

### Task 1: Stock Ideas Categories

**Files:**
- Create: `src/lib/recommendationCategories.ts`
- Create: `src/lib/recommendationCategories.test.ts`

- [ ] Add tests for all category ids and market filtering.
- [ ] Implement category definitions and grouping.
- [ ] Run the focused test.

### Task 2: Deletable Holdings

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/HoldingsTable.tsx`

- [ ] Add `handleDeletePosition`.
- [ ] Add a trash icon action for each non-editing row.
- [ ] Clear edit state if the deleted row is being edited.

### Task 3: Dedicated Ideas Page

**Files:**
- Create: `src/components/StockIdeasPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/TopBar.tsx`
- Modify: `src/styles.css`

- [ ] Add `Portfolio` and `Stock Ideas` navigation.
- [ ] Render recommendations only on the ideas page.
- [ ] Make the portfolio grid compact with no large visual dead zone.

### Task 4: Verify

- [ ] Run `vitest run`.
- [ ] Run TypeScript and Vite build.
- [ ] Check local server status.
