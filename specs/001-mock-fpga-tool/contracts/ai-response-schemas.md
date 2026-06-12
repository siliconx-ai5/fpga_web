# Contract: AI Response Schemas

The UI calls a local `AiService` wrapper. The wrapper may call OpenAI directly from the browser for v1, using the user-owned key from `localStorage`.

## Generate RTL

Input:

```json
{
  "projectId": "uuid",
  "description": "Create an 8-bit counter with enable and async reset",
  "preferredLanguage": "verilog",
  "complexityCap": "medium"
}
```

Output:

```json
{
  "kind": "rtl",
  "moduleName": "counter8",
  "filename": "counter8.v",
  "language": "verilog",
  "content": "module counter8(...); endmodule",
  "ports": [
    { "name": "clk", "direction": "input", "width": 1 },
    { "name": "q", "direction": "output", "width": 8 }
  ],
  "assumptions": ["Single clock named clk"],
  "warnings": [],
  "needsClarification": false,
  "clarifyingQuestion": null
}
```

Rules:
- `content` must be non-empty when `needsClarification` is false.
- `clarifyingQuestion` must be non-empty when `needsClarification` is true.
- The app persists successful output as an `rtl` artifact.

## Generate Testbench

Input:

```json
{
  "projectId": "uuid",
  "rtlArtifactId": "uuid",
  "rtlContent": "module counter8(...); endmodule",
  "moduleName": "counter8"
}
```

Output:

```json
{
  "kind": "testbench",
  "filename": "counter8_tb.v",
  "language": "verilog",
  "content": "module counter8_tb; endmodule",
  "stimulusSummary": "Reset, enable, count for 16 cycles",
  "expectedAssertions": ["q increments while enable is high"],
  "warnings": []
}
```

## Explain RTL

Output:

```json
{
  "kind": "ai_explanation",
  "format": "markdown",
  "content": "### Behavior\nThe module..."
}
```

## Debug Suggestions

Output:

```json
{
  "kind": "debug_suggestions",
  "format": "markdown",
  "suggestions": [
    {
      "title": "Check reset polarity",
      "detail": "The failing trace shows q remains unknown after reset."
    }
  ],
  "content": "### Suggestions\n..."
}
```

Rules:
- At least two suggestions are required for failed simulations.

## Generate Documentation

Output:

```json
{
  "kind": "documentation",
  "filename": "counter8.md",
  "format": "markdown",
  "content": "# counter8\n\n## Overview..."
}
```
