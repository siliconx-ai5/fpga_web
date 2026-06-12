---
description: "Task list for Mock FPGA Web Tool"
---

# Tasks: Mock FPGA Web Tool

**Input**: Design documents from `/specs/001-mock-fpga-tool/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for a browser-first prototype (frontend-only, in-browser SQLite, WASM sim)

- [X] T001 Initialize frontend project scaffold in frontend/ with Vite + vanilla JS + Tailwind5 (package.json, index.html, vite config)
- [X] T002 Create `frontend/src/` layout: `App.html`, `index.js`, `styles.css`, and a minimal router
- [X] T003 Add Tailwind5 configuration and build integration: `frontend/tailwind.config.cjs`, `postcss.config.cjs`
- [X] T004 Create a simple dev run script in `package.json` and documentation in `README.md`
- [X] T005 [P] Add developer helper: `scripts/setup-dev.sh` to install deps and run dev server

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core in-browser infrastructure required by all stories (sql.js, WASM simulator, storage models, API key manager)

- [X] T006 Integrate `sql.js` (WASM) into `frontend/src/lib/sqlite.js` and add initialization script to create DB in `localStorage` namespace
- [X] T007 [P] Define DB schema and migration helper in `frontend/src/db/schema.js` (tables: projects, artifacts, runs, settings)
- [X] T008 Create `frontend/src/models/projectModel.js` with CRUD functions using `sqlite.js` schema
- [X] T009 Implement API key manager UI in `frontend/src/components/ApiKeyManager.js` and persistence in `localStorage` (settings table)
- [X] T010 Create `frontend/src/lib/openaiClient.js` wrapper that reads key from `localStorage` and exposes `generateRTL(prompt)`, `explainRTL(code)`, `generateTestbench(code)` (mockable)
- [X] T011 Add prompt templates in `frontend/src/prompts/` for RTL generation, testbench generation, explanations, and debugging suggestions
- [ ] T012 [P] Add basic linting and formatter config files (`.eslintrc`, `.prettierrc`) for frontend code

**Checkpoint**: Foundational items complete — UI state, DB, and AI client are available for story work.

---

## Phase 3: User Story 1 - Create project & generate RTL (Priority: P1) 🎯 MVP

**Goal**: Let users create a project, type an NL module description, and generate mock RTL + testbench stored in DB and viewable in the editor.

**Independent Test**: In a fresh browser session, create project, enter description, click "Generate RTL" → generated RTL appears in file list and editor; clicking "Generate Testbench" attaches a testbench artifact.

- [X] T013 [US1] Implement project CRUD UI in `frontend/src/pages/ProjectList.js` and `frontend/src/pages/ProjectView.js`
- [X] T014 [US1] Implement new-project dialog and storage via `projectModel.create()` (persist to sql.js)
- [X] T015 [US1] Create editor component `frontend/src/components/Editor.js` to view and edit artifacts (RTL/testbench)
- [X] T016 [US1] Implement `Generate RTL` action in `ProjectView.js` that calls `openaiClient.generateRTL()` with prompt template and saves artifact to DB (`artifacts` table)
- [X] T017 [US1] Implement `Generate Testbench` action that calls `openaiClient.generateTestbench()` and saves artifact
- [X] T018 [US1] Add artifact download/export button (single-file) in `ProjectView.js`
- [ ] T019 [US1] Add automated sample prompt examples in `frontend/src/data/sample_prompts.js` to help users

**Checkpoint**: US1 complete and independently testable

---

## Phase 4: User Story 2 - Run lightweight simulation & notifications (Priority: P1)

**Goal**: Run a client-side WASM behavioral simulator for simple designs, show progress, save run logs, and notify on completion.

**Independent Test**: For a project with RTL+testbench, click "Run Simulation" → progress indicator, then browser notification appears and run log saved to DB.

- [X] T020 [US2] Integrate lightweight WASM simulator in `frontend/src/lib/simulator/` (load WASM, expose `runSimulation(rtl, tb, onProgress)`)
- [X] T021 [US2] Implement `SimulationRunner.js` component to call simulator, stream logs to UI, and persist run record in `runs` table
- [X] T022 [US2] Add browser Notification API wrapper `frontend/src/lib/notify.js` and request permission on first use
- [X] T023 [US2] Trigger a desktop/browser notification when simulation completes or fails; include result summary and link to run log
- [X] T024 [US2] Add `Run History` view in `ProjectView.js` to list recent runs and allow viewing logs
- [X] T025 [US2] Create a short canned-waveform preview component `frontend/src/components/WaveformPreview.js` for the mock simulator

**Checkpoint**: US2 complete and independently testable

---

## Phase 5: User Story 3 - AI explanations, debug suggestions, and documentation (Priority: P2)

**Goal**: Allow users to ask for explanations, get debug suggestions when runs fail, and auto-generate Markdown docs for a module.

**Independent Test**: For any artifact, click "Explain" → AI returns explanation saved in DB; on failing run, click "How to fix" → AI returns suggestions; click "Generate Docs" → doc artifact saved.

- [X] T026 [US3] Implement `Explain` UI action in `Editor.js` that calls `openaiClient.explainRTL()` and displays results in a sidebar
- [X] T027 [US3] Implement `Debug Suggestions` action on failing runs that calls `openaiClient.debugSuggestions()` and stores suggestions in `runs` or `artifacts`
- [X] T028 [US3] Implement `Generate Docs` action that creates a Markdown artifact in `artifacts` table and opens it in the editor
- [ ] T029 [US3] Add UI for users to rate AI suggestions and store feedback in `settings` or `feedback` table

**Checkpoint**: US3 complete and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T030 [P] Implement export ZIP for a project (`frontend/src/lib/exportZip.js`) exporting artifacts and run logs
- [X] T031 [P] Add unit/smoke tests for core modules (db, openaiClient, simulator) in `frontend/tests/`
- [X] T032 Update `docs/quickstart.md` with steps to run the frontend dev server and demo flows
- [ ] T033 Accessibility and basic responsive adjustments to the UI
- [X] T034 [P] Add error handling and user-facing messages for `localStorage`/sql.js failures
- [X] T035 Security note: add a `README.md` section explaining `localStorage` API key implications and how to clear keys

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (Foundation must complete before User Stories)
- After Foundation, US1 and US2 (both P1) can proceed in parallel; US3 (P2) can follow or run in parallel depending on capacity

## Parallel Opportunities

- `T005`, `T007`, `T011`, `T012`, `T030` are parallelizable
- Once foundational tasks `T006`-`T012` complete, `US1` and `US2` tasks can be implemented by separate developers in parallel

---

## Implementation Strategy (MVP)

1. Complete Phase 1 and Phase 2 (setup + sql.js + openaiClient)
2. Implement US1 (project CRUD, generate RTL/testbench) as MVP and validate
3. Add US2 (simulator and notifications) next
4. Add US3 (AI explanations & docs) and polish

---
