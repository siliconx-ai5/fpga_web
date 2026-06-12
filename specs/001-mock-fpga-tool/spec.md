# Feature Specification: Mock FPGA Web Tool

**Feature Branch**: `001-mock-fpga-tool`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "My goal is to create a Mock FPGA Web-Based Design Tool with AI Backend.

A browser-based  “mini FPGA tool” that lets users:
1. Create an FPGA project
2. Describe a hardware module in natural language
3. Generate mock RTL
4. Generate a testbench
5. Run a fake or lightweight simulation
6. Get AI explanation/debug suggestions
7. Generate documentation

The key is: mock the FPGA flow, but make the AI workflow real.

Reference tools: Vivado, Quartus

Specific requirements:
- web based html5 using tailwind5
- api key for openai save in browser webStorage, can modify
- storage/database use sqlite
- notification in browser after techbench done
"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create project & generate RTL (Priority: P1)

A user wants to create a new FPGA project, describe a hardware module in natural language, and obtain mock RTL and a testbench.

**Why this priority**: This is the core user flow that demonstrates the product value — producing RTL from NL via the AI backend.

**Independent Test**: In a fresh browser session, create a new project, enter a module description, request RTL generation, and verify files appear in project workspace and can be viewed/downloaded.

**Acceptance Scenarios**:
1. **Given** the user is on the project dashboard, **When** they click "New Project" and provide a name, **Then** a project workspace is created and listed.
2. **Given** a project exists, **When** the user types a natural-language hardware description and clicks "Generate RTL", **Then** a mock RTL file is generated and shown in the editor.
3. **Given** RTL was generated, **When** the user clicks "Generate Testbench", **Then** a corresponding mock testbench is produced and attached to the project.

---

### User Story 2 - Run lightweight simulation & notifications (Priority: P1)

A user runs the provided mock or lightweight simulation and receives a browser notification when it completes.

**Why this priority**: Users need feedback that the generated RTL behaves as expected and that the tool can simulate simple behaviors.

**Independent Test**: From the project, run simulation with default testbench and verify a browser notification appears and a short run log is available.

**Acceptance Scenarios**:
1. **Given** a project with RTL and testbench, **When** the user starts simulation, **Then** a progress indicator displays and a desktop/browser notification fires on completion.
2. **Given** the simulation completes, **When** the user opens run results, **Then** the log and pass/fail summary are visible.

---

### User Story 3 - AI explanations, debug suggestions, and documentation (Priority: P2)

A user can request an AI explanation of generated RTL, get debugging suggestions when simulation fails, and request a generated documentation summary.

**Why this priority**: Adds the AI-driven value differentiator, enabling quicker understanding and iteration on designs.

**Independent Test**: For any generated RTL, request "Explain this module" and confirm the AI returns an explanation; if simulation fails, request "How to fix" and receive actionable suggestions.

**Acceptance Scenarios**:
1. **Given** generated RTL, **When** the user clicks "Explain", **Then** the AI returns a concise human-readable explanation of module behavior.
2. **Given** simulation shows a failing assertion, **When** the user requests suggestions, **Then** the AI returns at least two debugging suggestions.
3. **Given** a module, **When** the user selects "Generate Docs", **Then** a Markdown documentation file is produced with usage examples.

---

### Edge Cases

- Module descriptions that are ambiguous: the UI should prompt for clarification or show the most-likely interpretation and allow edits.
- Large or complex designs: indicate limits in the UI (e.g., "complexity cap" for mock RTL generation) and fail gracefully.
- Browser storage full or `localStorage` disabled: present an error and offer file download/export.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create and manage projects in the browser UI.
- **FR-002**: System MUST accept a natural-language hardware description and call the AI backend to produce mock RTL.
- **FR-003**: System MUST generate a mock testbench corresponding to the generated RTL.
- **FR-004**: System MUST run a fake or lightweight simulation and produce a pass/fail summary plus run log.
- **FR-005**: System MUST provide AI-driven explanations and debugging suggestions for generated RTL and failing simulations.
- **FR-006**: System MUST allow users to store an OpenAI API key in browser storage and edit/remove it from settings.
- **FR-007**: System MUST store project artifacts (RTL, testbenches, run logs, docs, settings) in a SQLite database.
- **FR-008**: System MUST show a browser notification when a simulation run completes (success or failure).
- **FR-009**: System MUST use a modern HTML5 frontend styled with Tailwind5.
- **FR-010**: System MUST provide export/download of generated files as a ZIP.

*Clarifications resolved (critical):*

- **FR-011**: Simulation fidelity and execution environment: Use an in-browser WASM-based simulator (lightweight behavioral simulator). This provides moderate fidelity for simple combinational and single-clock sequential designs, runs entirely client-side (offline-capable), and keeps deployment simple while supporting basic waveform traces and assertions. Larger or more complex designs will be limited by client resources and asset size.
- **FR-012**: SQLite runtime location: Use an in-browser SQLite runtime (sql.js / WASM). Project artifacts and run logs are persisted per-browser using the WASM SQLite instance; this avoids a backend for v1 and supports offline demos. Note: data is not shared across devices unless the user exports/imports project data.
- **FR-013**: API key persistence and security: Store the user's OpenAI API key in plain `localStorage` for v1 to minimize UX friction. The UI will clearly warn users about the persistence and provide an easy way to remove or replace the key. If higher security is later required, migrate to encrypted storage or server-side vaulting.

### Key Entities

- **Project**: id, name, created_at, updated_at, list of artifacts (rtl, testbench, docs, runs)
- **Module/Artifact**: id, project_id, type (rtl/testbench/doc), content, created_at
- **SimulationRun**: id, artifact_id, started_at, finished_at, status, log
- **UserSettings**: id, api_key (stored per security constraint), preferences

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new project and generate mock RTL within 60 seconds (from clicking Generate to seeing the file).
- **SC-002**: 95% of simple module descriptions (single-module, combinational or single-clock sequential logic) produce non-empty RTL on first AI call.
- **SC-003**: A simulation run completes and a browser notification is delivered within 30 seconds for lightweight default cases.
- **SC-004**: AI explanations are rated as "helpful" by at least 80% of trial users in manual testing (qualitative acceptance during demo).

## Assumptions

- Users run the tool in modern browsers with Notification API and `localStorage` available.
- Tailwind5 utility-first CSS is acceptable for the UI look-and-feel.
- The SQLite requirement will be fulfilled with an in-browser WASM port (`sql.js`) for v1, storing data per-browser (see FR-012).
- AI calls use OpenAI-compatible APIs; prompt engineering and request limits will be handled by the frontend/backend integration.
- The project is explicitly a mock/demo tool; no production-grade synthesis or timing closure is required.
