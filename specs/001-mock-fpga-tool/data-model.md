# Data Model: Mock FPGA Web Tool

## Project

Fields:
- `id`: UUID primary key
- `name`: non-empty string, unique among active projects per browser database
- `description`: optional string
- `created_at`: ISO timestamp
- `updated_at`: ISO timestamp
- `archived_at`: nullable ISO timestamp

Relationships:
- Has many `Artifact`
- Has many `SimulationRun`

Validation:
- Name is required, trimmed, and limited to 80 characters.
- Archived projects remain exportable but are hidden from the default dashboard.

## Artifact

Fields:
- `id`: UUID primary key
- `project_id`: foreign key to `Project`
- `kind`: enum `rtl`, `testbench`, `documentation`, `ai_explanation`, `debug_suggestions`
- `filename`: non-empty string
- `language`: enum `verilog`, `systemverilog`, `markdown`, `text`, `json`
- `content`: text
- `source_prompt`: nullable text
- `metadata_json`: nullable JSON text
- `created_at`: ISO timestamp
- `updated_at`: ISO timestamp

Relationships:
- Belongs to `Project`
- May be referenced by `SimulationRun.rtl_artifact_id` or `SimulationRun.testbench_artifact_id`

Validation:
- Content must be non-empty before an artifact is persisted.
- `rtl` filenames default to `<module_name>.v`.
- `testbench` filenames default to `<module_name>_tb.v`.
- Documentation and explanation artifacts use Markdown.

## SimulationRun

Fields:
- `id`: UUID primary key
- `project_id`: foreign key to `Project`
- `rtl_artifact_id`: foreign key to RTL `Artifact`
- `testbench_artifact_id`: nullable foreign key to testbench `Artifact`
- `status`: enum `queued`, `running`, `passed`, `failed`, `error`, `cancelled`
- `started_at`: nullable ISO timestamp
- `finished_at`: nullable ISO timestamp
- `summary`: short text
- `log`: full simulation log text
- `waveform_json`: nullable JSON text for simple signal traces
- `assertions_json`: nullable JSON text for assertion results

Relationships:
- Belongs to `Project`
- References RTL and optional testbench artifacts

State transitions:
- `queued` -> `running`
- `running` -> `passed`
- `running` -> `failed`
- `running` -> `error`
- `running` -> `cancelled`

Validation:
- A run cannot start without an RTL artifact.
- Completed states must set `finished_at`, `summary`, and `log`.
- `passed` requires all recorded assertions to pass.

## UserSettings

Fields:
- `id`: singleton key, default `local`
- `theme`: enum `system`, `light`, `dark`
- `notification_permission_seen`: boolean
- `default_model`: optional string
- `complexity_cap`: enum `low`, `medium`, `high`, default `medium`
- `created_at`: ISO timestamp
- `updated_at`: ISO timestamp

Storage split:
- SQLite stores non-secret settings.
- `localStorage.openai_api_key` stores the user-provided OpenAI API key in plain text for v1.

Validation:
- Settings screen must allow replacing and removing the API key.
- UI must warn before saving that the key remains in browser storage.

## AIGenerationRequest

Fields:
- `id`: UUID primary key
- `project_id`: foreign key to `Project`
- `request_type`: enum `rtl`, `testbench`, `explanation`, `debug`, `documentation`
- `input_text`: text
- `model`: string
- `status`: enum `pending`, `succeeded`, `failed`
- `error_message`: nullable text
- `created_artifact_id`: nullable foreign key to `Artifact`
- `created_at`: ISO timestamp
- `finished_at`: nullable ISO timestamp

Validation:
- Failed requests keep the original input and error message for user retry.
- Successful artifact-generating requests link to the created artifact.
