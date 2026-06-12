# Contract: Simulation Worker

The simulation service runs in `src/workers/simulation.worker.ts` and communicates with the UI using `postMessage`.

## Start Message

```json
{
  "type": "start",
  "runId": "uuid",
  "projectId": "uuid",
  "rtlArtifactId": "uuid",
  "testbenchArtifactId": "uuid",
  "rtlContent": "module counter8(...); endmodule",
  "testbenchContent": "module counter8_tb; endmodule",
  "complexityCap": "medium"
}
```

## Progress Message

```json
{
  "type": "progress",
  "runId": "uuid",
  "percent": 45,
  "message": "Evaluating assertion q increments while enable is high"
}
```

Rules:
- Progress percentage is monotonically non-decreasing.
- The UI must persist progress to the active run log.

## Complete Message

```json
{
  "type": "complete",
  "runId": "uuid",
  "status": "passed",
  "summary": "3 assertions passed",
  "log": "[0ns] reset asserted\n[10ns] assertion passed",
  "waveform": {
    "signals": [
      { "name": "clk", "values": [0, 1, 0, 1] },
      { "name": "q", "values": [0, 0, 1, 2] }
    ]
  },
  "assertions": [
    { "name": "q increments", "status": "passed", "time": "10ns" }
  ]
}
```

## Error Message

```json
{
  "type": "error",
  "runId": "uuid",
  "summary": "Simulation could not run",
  "log": "Complexity cap exceeded: multiple clocks are not supported"
}
```

Completion behavior:
- The UI stores the final `SimulationRun`.
- The UI fires a browser notification for `passed`, `failed`, or `error`.
- If Notification permission is denied, the UI still shows an in-app completion notification.
