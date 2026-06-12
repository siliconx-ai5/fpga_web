# Implementation Plan: Mock FPGA Web Tool

**Branch**: `001-mock-fpga-tool` | **Date**: 2026-06-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-mock-fpga-tool/spec.md`

## Summary

Build a browser-based mini FPGA design environment where users create projects, describe modules in natural language, generate mock RTL and testbenches through OpenAI-backed workflows, run a lightweight in-browser simulation, receive completion notifications, and export generated artifacts. The v1 architecture is a client-side TypeScript web app with Tailwind CSS 5 styling, browser-owned OpenAI API key storage, in-browser SQLite persistence, and a worker-hosted WASM simulation adapter for simple mock RTL runs.

## Technical Context

**Language/Version**: TypeScript 5.x, HTML5, CSS with Tailwind CSS 5

**Primary Dependencies**: Vite, React, Tailwind CSS 5, sql.js or equivalent SQLite WASM runtime, JSZip, OpenAI Responses API client wrapper, Vitest, Playwright

**Storage**: In-browser SQLite database persisted per browser session/profile, with `localStorage` only for the user-owned OpenAI API key and small UI preferences

**Testing**: Vitest for unit/service tests, React Testing Library for component behavior, Playwright for browser workflows and Notification/localStorage behavior

**Target Platform**: Modern desktop browsers with WASM, Notification API, IndexedDB/localStorage, and ES module support

**Project Type**: Single-page web application with client-side services and web workers

**Performance Goals**: Show generated RTL within 60 seconds for simple module descriptions; complete default simulations and notification delivery within 30 seconds; keep common UI transitions responsive under 100 ms after initial load

**Constraints**: Offline-capable for project browsing, SQLite persistence, export, and mock simulation after app assets load; OpenAI generation requires network and a user-provided API key; simple combinational and single-clock sequential designs only; API key stored in plain `localStorage` for v1 with visible warning and delete control

**Scale/Scope**: V1 supports a single browser user, dozens of projects, hundreds of artifacts, and demo-sized RTL/testbench files; no multi-device sync, synthesis, timing closure, production FPGA toolchain integration, or team collaboration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file still contains placeholder principles and no enforceable project-specific gates. Planning therefore applies the default Spec Kit gates:

- No unresolved `NEEDS CLARIFICATION` markers: PASS
- Simplicity appropriate to v1: PASS, a single SPA is selected over a frontend/backend split
- Testability of core workflows: PASS, each user story maps to unit, integration, or Playwright validation
- Security constraints visible: PASS, localStorage API key persistence is explicitly scoped and warned

Post-design re-check: PASS. The design artifacts preserve the single-app architecture and do not introduce additional services.

## Project Structure

### Documentation (this feature)

```text
specs/001-mock-fpga-tool/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ai-response-schemas.md
│   ├── simulation-worker.md
│   ├── storage-schema.md
│   └── ui-workflows.md
└── tasks.md
```

### Source Code (repository root)

```text
public/
├── sim/
│   └── mock-sim.wasm
└── sqlite/
    └── sqlite.wasm

src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── styles.css
├── components/
│   ├── editor/
│   ├── layout/
│   ├── notifications/
│   ├── project/
│   └── simulation/
├── services/
│   ├── ai/
│   ├── db/
│   ├── export/
│   ├── notifications/
│   └── simulation/
├── workers/
│   └── simulation.worker.ts
├── models/
└── test/

tests/
├── contract/
├── integration/
└── e2e/
```

**Structure Decision**: Use one Vite/React TypeScript app with client-side services. This matches the v1 browser-only storage and simulation decisions, avoids a premature backend, and keeps the OpenAI boundary behind a service contract so a server proxy can be introduced later.

## Complexity Tracking

No constitution violations require justification.
