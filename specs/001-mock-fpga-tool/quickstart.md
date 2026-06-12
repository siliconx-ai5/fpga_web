# Quickstart Validation Guide: Mock FPGA Web Tool

## Prerequisites

- Node.js LTS
- Modern Chromium-based browser for Playwright validation
- OpenAI API key for AI generation scenarios

## Setup

```bash
npm install
npm run dev
```

Open the local dev server URL printed by Vite.

## Validation Scenario 1: Create Project And Generate RTL

1. Open the dashboard.
2. Create a project named `Counter Demo`.
3. Open settings and save a test OpenAI API key.
4. In the workspace, enter: `Create an 8-bit counter with enable and async reset`.
5. Select Generate RTL.

Expected outcome:
- A project is persisted in SQLite.
- A non-empty RTL artifact appears in the artifact tree and editor.
- The RTL generation finishes within 60 seconds for the demo prompt.

## Validation Scenario 2: Generate Testbench

1. Use the project from Scenario 1.
2. Select Generate Testbench.

Expected outcome:
- A non-empty testbench artifact appears in the artifact tree.
- The testbench references the generated module name.

## Validation Scenario 3: Run Simulation And Receive Notification

1. Use a project with RTL and testbench.
2. Select Run Simulation.
3. Allow browser notifications when prompted.

Expected outcome:
- The simulation status changes from queued to running to passed, failed, or error.
- Progress is visible while the worker runs.
- A browser notification appears on completion.
- The run log and summary are persisted and visible in the workspace.

## Validation Scenario 4: Explanation, Debug, And Docs

1. Select an RTL artifact.
2. Select Explain.
3. If the latest simulation failed or errored, select Debug.
4. Select Generate Docs.

Expected outcome:
- Explanation content is saved as Markdown.
- Debug suggestions include at least two actionable items when available.
- Documentation is saved as a Markdown artifact with usage examples.

## Validation Scenario 5: Export ZIP

1. From the workspace or dashboard, select Export ZIP.

Expected outcome:
- A ZIP downloads locally.
- The ZIP contains generated RTL, testbench, docs, AI explanations, debug suggestions, simulation logs, and a manifest.

## Suggested Test Commands

```bash
npm run test
npm run test:e2e
npm run build
```

These commands should be added during implementation if the project scaffold does not exist yet.
