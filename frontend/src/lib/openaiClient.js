import storage from './storage.js'
import {
  debugSystemPrompt,
  debugUserPrompt,
  docsSystemPrompt,
  docsUserPrompt,
  explanationSystemPrompt,
  explanationUserPrompt,
  rtlSystemPrompt,
  rtlUserPrompt,
  testbenchSystemPrompt,
  testbenchUserPrompt
} from '../prompts/index.js'

const DEFAULT_MODEL = 'gpt-5.5'
const RESPONSES_URL = 'https://api.openai.com/v1/responses'

function readSettings(){
  return storage.load('settings', {})
}

function readApiKey(){
  const settings = readSettings()
  return settings.api_key || null
}

function readModel(){
  const settings = readSettings()
  return settings.model || DEFAULT_MODEL
}

function moduleNameFromText(text){
  const explicit = text.match(/module\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
  if(explicit) return explicit[1]
  if(/counter/i.test(text)) return /8[\s-]*bit/i.test(text) ? 'counter8' : 'counter'
  if(/fifo/i.test(text)) return 'simple_fifo'
  if(/uart/i.test(text)) return 'uart_core'
  if(/pwm/i.test(text)) return 'pwm_generator'
  return 'top_module'
}

export function suggestProjectName(prompt){
  const moduleName = moduleNameFromText(prompt)
  return moduleName.replace(/_/g, ' ').replace(/\b\w/g, ch=>ch.toUpperCase())
}

function extractResponseText(payload){
  if(payload.output_text) return payload.output_text
  const parts = []
  for(const item of payload.output || []){
    for(const content of item.content || []){
      if(content.text) parts.push(content.text)
      if(content.type === 'output_text' && content.text) parts.push(content.text)
    }
  }
  return parts.join('\n').trim()
}

function extractJsonObject(text){
  const trimmed = String(text || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  try{
    return JSON.parse(trimmed)
  }catch(e){
    // Continue below: some model responses contain a valid JSON object followed
    // by prose. Recover the first balanced object instead of failing the flow.
  }

  const start = trimmed.indexOf('{')
  if(start === -1) throw new Error('AI response did not contain a JSON object.')

  let depth = 0
  let inString = false
  let escaped = false
  for(let i = start; i < trimmed.length; i += 1){
    const ch = trimmed[i]
    if(inString){
      if(escaped){
        escaped = false
      }else if(ch === '\\'){
        escaped = true
      }else if(ch === '"'){
        inString = false
      }
      continue
    }
    if(ch === '"'){
      inString = true
    }else if(ch === '{'){
      depth += 1
    }else if(ch === '}'){
      depth -= 1
      if(depth === 0){
        return JSON.parse(trimmed.slice(start, i + 1))
      }
    }
  }

  throw new Error('AI response contained incomplete JSON.')
}

async function callResponses({ system, user, schema, schemaName }){
  const apiKey = readApiKey()
  if(!apiKey) throw new Error('OpenAI API key is required for live generation.')

  const body = {
    model: readModel(),
    store: false,
    input: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  }

  if(schema){
    body.text = {
      format: {
        type: 'json_schema',
        name: schemaName,
        strict: true,
        schema
      }
    }
  }

  const response = await fetch(RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  const payload = await response.json().catch(()=>({}))
  if(!response.ok){
    const message = payload.error?.message || `OpenAI request failed with HTTP ${response.status}`
    throw new Error(message)
  }
  return extractResponseText(payload)
}

function rtlSchema(){
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      moduleName: { type: 'string' },
      filename: { type: 'string' },
      content: { type: 'string' },
      assumptions: { type: 'array', items: { type: 'string' } },
      warnings: { type: 'array', items: { type: 'string' } }
    },
    required: ['moduleName', 'filename', 'content', 'assumptions', 'warnings']
  }
}

function testbenchSchema(){
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      filename: { type: 'string' },
      content: { type: 'string' },
      stimulusSummary: { type: 'string' },
      expectedAssertions: { type: 'array', items: { type: 'string' } },
      warnings: { type: 'array', items: { type: 'string' } }
    },
    required: ['filename', 'content', 'stimulusSummary', 'expectedAssertions', 'warnings']
  }
}

function mockRTL(prompt){
  const name = moduleNameFromText(prompt)
  if(/counter/i.test(prompt)){
    const width = /8[\s-]*bit/i.test(prompt) ? 8 : 4
    const syncReset = /synchronous\s+reset/i.test(prompt)
    const resetSensitivity = syncReset ? 'posedge clk' : 'posedge clk or posedge rst'
    const resetNote = syncReset ? 'Synchronous active-high reset' : 'Active-high asynchronous reset'
    return {
      moduleName: name,
      filename: `${name}.v`,
      content: `module ${name} (\n  input wire clk,\n  input wire rst,\n  input wire en,\n  output reg [${width - 1}:0] count\n);\n  always @(${resetSensitivity}) begin\n    if (rst) begin\n      count <= ${width}'d0;\n    end else if (en) begin\n      if (count == ${width}'h${(2 ** width - 1).toString(16)}) begin\n        count <= ${width}'d0;\n      end else begin\n        count <= count + ${width}'d1;\n      end\n    end\n  end\nendmodule\n`,
      assumptions: [`${width}-bit up counter`, resetNote, 'Enable controls counting', `Wraps to zero after ${2 ** width - 1}`],
      warnings: ['Demo mode: no OpenAI API key was used.']
    }
  }

  return {
    moduleName: name,
    filename: `${name}.v`,
    content: `module ${name} (\n  input wire clk,\n  input wire rst,\n  input wire a,\n  input wire b,\n  output reg out\n);\n  always @(posedge clk or posedge rst) begin\n    if (rst) begin\n      out <= 1'b0;\n    end else begin\n      out <= a & b;\n    end\n  end\nendmodule\n`,
    assumptions: ['Single clock named clk', 'Active-high reset named rst', 'Inputs are sampled on the rising clock edge'],
    warnings: ['Demo mode: no OpenAI API key was used.']
  }
}

function mockTestbench(rtl){
  const moduleName = moduleNameFromText(rtl)
  const isCounter = /count\s*\]/i.test(rtl) || /\bcount\b/i.test(rtl)
  const content = isCounter
    ? `module ${moduleName}_tb;\n  reg clk = 0;\n  reg rst = 1;\n  reg en = 0;\n  wire [7:0] count;\n\n  ${moduleName} dut(.clk(clk), .rst(rst), .en(en), .count(count));\n\n  always #5 clk = ~clk;\n\n  initial begin\n    #12 rst = 0;\n    en = 1;\n    #80;\n    if (count == 0) $display(\"ASSERT_FAIL: counter did not increment\");\n    else $display(\"ASSERT_PASS: counter incremented\");\n    $finish;\n  end\nendmodule\n`
    : `module ${moduleName}_tb;\n  reg clk = 0;\n  reg rst = 1;\n  reg a = 0;\n  reg b = 0;\n  wire out;\n\n  ${moduleName} dut(.clk(clk), .rst(rst), .a(a), .b(b), .out(out));\n\n  always #5 clk = ~clk;\n\n  initial begin\n    #12 rst = 0;\n    a = 1;\n    b = 1;\n    #20;\n    if (out !== 1'b1) $display(\"ASSERT_FAIL: expected out high\");\n    else $display(\"ASSERT_PASS: out high when a and b are high\");\n    $finish;\n  end\nendmodule\n`

  return {
    filename: `${moduleName}_tb.v`,
    content,
    stimulusSummary: 'Reset release followed by representative input stimulus and a pass/fail display check.',
    expectedAssertions: ['Generated testbench emits ASSERT_PASS or ASSERT_FAIL in the run log.'],
    warnings: readApiKey() ? [] : ['Demo mode: no OpenAI API key was used.']
  }
}

export async function generateRTLBundle(prompt){
  if(!readApiKey()) return mockRTL(prompt)
  const text = await callResponses({
    schemaName: 'rtl_generation',
    schema: rtlSchema(),
    system: rtlSystemPrompt,
    user: rtlUserPrompt(prompt)
  })
  return extractJsonObject(text)
}

export async function generateRTL(prompt){
  const result = await generateRTLBundle(prompt)
  return result.content
}

export async function generateTestbenchBundle(rtl){
  if(!readApiKey()) return mockTestbench(rtl)
  const text = await callResponses({
    schemaName: 'testbench_generation',
    schema: testbenchSchema(),
    system: testbenchSystemPrompt,
    user: testbenchUserPrompt(rtl)
  })
  return extractJsonObject(text)
}

export async function generateTestbench(rtl){
  const result = await generateTestbenchBundle(rtl)
  return result.content
}

export async function explainRTL(rtl){
  if(!readApiKey()){
    const moduleName = moduleNameFromText(rtl)
    return `### ${moduleName}\n\nThis RTL describes a simple clocked module with reset behavior. Signals are updated on the active clock edge, reset drives the outputs back to a known value, and the main behavior is intentionally small enough for the mock simulator.`
  }
  return callResponses({
    system: explanationSystemPrompt,
    user: explanationUserPrompt(rtl)
  })
}

export async function debugSuggestions(rtl, tb, errorLog){
  if(!readApiKey()){
    return [
      '### Debug Suggestions',
      '',
      '1. Check that reset is asserted long enough before stimulus begins.',
      '2. Confirm that the testbench port names match the RTL module declaration.',
      '3. Add a display or assertion near the failing time to inspect the expected output.',
      '4. Verify clocked outputs are checked after a clock edge, not immediately after input changes.'
    ].join('\n')
  }
  return callResponses({
    system: debugSystemPrompt,
    user: debugUserPrompt(rtl, tb, errorLog)
  })
}

export async function generateDocs(rtl){
  if(!readApiKey()){
    const moduleName = moduleNameFromText(rtl)
    return `# ${moduleName}\n\n## Overview\nGenerated RTL module for the current FPGA Web project.\n\n## Interface\nReview the Verilog port list in the RTL tab for signal directions and widths.\n\n## Usage Example\n\n\`\`\`verilog\n${moduleName} dut (/* connect ports here */);\n\`\`\`\n\n## Verification\nRun the generated testbench from the Simulator tab and inspect the waveform preview and run log.`
  }
  return callResponses({
    system: docsSystemPrompt,
    user: docsUserPrompt(rtl)
  })
}

export default {
  generateRTL,
  generateRTLBundle,
  generateTestbench,
  generateTestbenchBundle,
  explainRTL,
  debugSuggestions,
  generateDocs,
  readApiKey,
  readModel,
  suggestProjectName
}
