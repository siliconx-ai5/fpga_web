// Mock OpenAI client for MVP. Uses stored API key if present, but returns deterministic mock outputs.
import storage from './storage.js'

function readApiKey(){
  const s = storage.load('settings', {})
  return s.api_key || null
}

function simpleModuleNameFromPrompt(prompt){
  const m = prompt.match(/module\s+(\w+)/i)
  return m ? m[1] : 'top_module'
}

export async function generateRTL(prompt){
  // For MVP, return a small mock Verilog module
  const name = simpleModuleNameFromPrompt(prompt)
  const rtl = `module ${name} (input clk, input rst, input a, input b, output out);\n  reg q;\n  always @(posedge clk) begin\n    if(rst) q <= 0; else q <= a & b;\n  end\n  assign out = q;\nendmodule\n`
  return rtl
}

export async function generateTestbench(rtl){
  // naive testbench referencing the first module name
  const m = rtl.match(/module\s+(\w+)/)
  const name = m ? m[1] : 'top'
  const tb = `// Mock testbench for ${name}\nmodule tb;\n  reg clk = 0; reg rst = 1; reg a=0; reg b=0; wire out;\n  ${name} dut(.clk(clk), .rst(rst), .a(a), .b(b), .out(out));\n  always #5 clk = ~clk;\n  initial begin\n    #10 rst = 0;\n    a = 1; b = 1;\n    #100 $display("TEST DONE"); $finish;\n  end\nendmodule\n`
  return tb
}

export async function explainRTL(rtl){
  return `This module implements a simple register that captures the AND of inputs 'a' and 'b' on the rising edge of 'clk' and resets on 'rst'.`;
}

export async function debugSuggestions(rtl, tb, errorLog){
  return [
    '1. Check if all signals are properly initialized in the testbench',
    '2. Verify that clock period matches design requirements',
    '3. Add assertion checks to identify exact failure point',
    '4. Review reset timing and initial conditions'
  ].join('\n')
}

export async function generateDocs(rtl){
  const m = rtl.match(/module\s+(\w+)/)
  const name = m ? m[1] : 'module'
  return `# ${name} Documentation

## Overview
This module was generated from natural language specification.

## Ports
- clk: Clock input
- rst: Reset (active high)
- a, b: Input signals
- out: Output signal

## Functionality
Captures the AND of inputs on clock edge when not in reset.

## Usage Example
\`\`\`verilog
${name} dut (
  .clk(clk),
  .rst(rst),
  .a(a),
  .b(b),
  .out(out)
);
\`\`\`

## Testing
Run the provided testbench to verify functionality.
`
}

export default { generateRTL, generateTestbench, explainRTL, debugSuggestions, generateDocs, readApiKey }
