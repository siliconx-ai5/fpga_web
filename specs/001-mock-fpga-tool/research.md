# Phase 0 Research: Mock FPGA Web Tool

## Decision: Single-page TypeScript web app

**Rationale**: The feature is browser-centric: project management, API key settings, SQLite persistence, browser notification, simulation, and ZIP export all happen locally for v1. A single Vite/React TypeScript app keeps the implementation direct while still supporting structured services and workers.

**Alternatives considered**: A split frontend/backend app was rejected for v1 because the spec resolves SQLite and simulation to in-browser runtimes and stores the user's API key in browser storage. A static no-build app was rejected because workers, TypeScript contracts, component testing, and WASM asset handling are easier and safer with a build tool.

## Decision: Browser-owned OpenAI integration through a service wrapper

**Rationale**: The spec requires the API key to be stored and edited in browser webStorage. The app will read the user-provided key from settings, warn that it is stored in plain `localStorage`, and call OpenAI through a narrow AI service that returns structured artifacts for RTL, testbench, explanations, debug suggestions, and docs.

**Alternatives considered**: A server-side API proxy would hide the key from browser runtime but conflicts with the v1 storage decision and adds deployment scope. A fully mocked AI layer would miss the requirement that the AI workflow be real.

## Decision: Use structured AI outputs for generated artifacts

**Rationale**: RTL, testbench, docs, explanations, warnings, and ambiguity prompts need deterministic parsing before they become project artifacts. Structured response schemas reduce fragile text parsing and make contract tests possible.

**Alternatives considered**: Free-form Markdown responses were rejected because the app must reliably store and display typed artifacts. Multiple independent prompts per artifact were rejected for the first pass because a single module-generation contract can return RTL plus metadata and then feed follow-up generation.

## Decision: In-browser SQLite persisted through IndexedDB-backed WASM storage

**Rationale**: The spec explicitly requires SQLite and resolves runtime location to an in-browser SQLite runtime. A SQLite WASM layer persisted through browser storage gives queryable project artifacts without adding backend infrastructure.

**Alternatives considered**: Plain IndexedDB was rejected because it does not satisfy the SQLite requirement. Server SQLite was rejected because v1 is offline-capable and per-browser.

## Decision: Worker-hosted lightweight WASM simulation adapter

**Rationale**: Simulation should not block the UI, and the spec calls for an in-browser WASM-based simulator. A web worker can host the simulator, stream progress/log events, and enforce complexity caps for simple combinational and single-clock sequential mock RTL.

**Alternatives considered**: Running simulation on the main thread was rejected because it risks UI freezes. Calling a remote simulator was rejected because v1 should support offline demo runs after assets load. Full synthesis-grade simulation was rejected because the product is explicitly a mock FPGA flow.

## Decision: Browser Notification API with in-app fallback

**Rationale**: FR-008 requires a browser notification when simulation completes. The app will request permission at run time, send success and failure notifications, and always record an in-app notification entry so completion is visible even when browser permission is denied.

**Alternatives considered**: In-app toast only was rejected because it does not satisfy the browser notification requirement. Asking notification permission on first page load was rejected because permission should be tied to the simulation workflow.

## Decision: ZIP export as a client-side service

**Rationale**: Project artifacts already live locally, so ZIP export can be assembled in the browser from SQLite records. This validates FR-010 without involving a server.

**Alternatives considered**: Exporting individual files only was rejected because the requirement asks for ZIP download. Server-side export was rejected because it adds unnecessary infrastructure.
