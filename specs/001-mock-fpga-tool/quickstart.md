# Quick Start Guide: Mock FPGA Web Tool

## For End Users

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- OpenAI API key (optional - mock mode works without it)

### Getting Started

1. **Access the Application**
   - For development: `cd frontend && npm install && npm run dev`
   - Open `http://localhost:5173/` in your browser

2. **Configure API Key** (Optional)
   - In the left sidebar, find "OpenAI API Key" section
   - Enter your key and click "Save"
   - ⚠️ **Security Note**: Keys are stored in localStorage (development only)

3. **Create Your First Project**
   - Click "New" in the Projects section
   - Enter a name (e.g., "My Counter")
   - Click on the project to open it

4. **Generate RTL**
   - Click "Generate RTL"
   - Describe your module: "Create an 8-bit counter with enable and async reset"
   - View the generated Verilog in the artifacts list

5. **Generate Testbench**
   - Click "Generate Testbench"
   - Testbench is auto-created from your RTL

6. **Run Simulation**
   - Click "Run Simulation"
   - Allow notifications when prompted
   - Watch progress in the log area
   - Get notification on completion

7. **Use AI Features**
   - **Explain**: Click to understand your RTL
   - **Generate Docs**: Create module documentation
   - Debug suggestions appear automatically on simulation failures

8. **Export Your Work**
   - Click "Download ZIP" to save all artifacts

### Key Features

- 🎯 **Natural Language RTL**: Describe hardware in plain English
- 🧪 **Instant Simulation**: Mock WASM simulator with browser notifications
- 🤖 **AI Assistant**: Explain, debug, and document your designs
- 💾 **Local Storage**: sql.js (WASM) or localStorage fallback
- 📦 **Export**: Download projects as ZIP files

## For Developers & Validators

### Development Setup

```bash
# Install dependencies
cd frontend
npm install

# Start dev server
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
