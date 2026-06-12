# Contract: UI Workflows

## Project Dashboard

Required controls:
- New project action
- Project list with name, updated time, latest run status, and open action
- Settings action for API key and preferences
- Export action per project

Acceptance:
- Creating a project inserts a SQLite `Project` and opens the project workspace.
- Project names are validated before insert.

## Project Workspace

Required regions:
- Artifact tree for RTL, testbench, docs, explanations, and run logs
- Editor/viewer pane for selected artifact
- Natural-language module description input
- Actions for Generate RTL, Generate Testbench, Run Simulation, Explain, Debug, Generate Docs, Export ZIP
- Simulation status panel with progress and latest pass/fail summary

Acceptance:
- Generate RTL is disabled until an API key is present and description text is non-empty.
- Generate Testbench is disabled until an RTL artifact exists.
- Run Simulation is disabled until an RTL artifact exists.
- Explain and Generate Docs are disabled until an RTL artifact exists.
- Debug is enabled only after a failed or errored simulation run.

## Settings

Required controls:
- API key input with save, replace, and remove actions
- Clear warning that the key is stored in plain browser storage for v1
- Default model input or selector
- Complexity cap selector
- Notification permission status

Acceptance:
- Saving API key writes `localStorage.openai_api_key`.
- Removing API key deletes `localStorage.openai_api_key`.
- Non-secret preferences persist in SQLite `user_settings`.

## Notifications

Acceptance:
- Starting a simulation requests notification permission if it has not been requested.
- Completion sends a browser notification when permission is granted.
- Completion always creates an in-app notification/toast and stores the run log.

## Export

Acceptance:
- Export ZIP includes RTL, testbench, docs, explanations, debug suggestions, simulation logs, and a manifest file.
- Export works without network access after project data exists locally.
