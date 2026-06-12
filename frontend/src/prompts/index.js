export const rtlSystemPrompt = [
  'You are an FPGA RTL generator.',
  'Produce concise Verilog for simple demo modules only.',
  'Keep the result synthesis-friendly and easy to simulate.'
].join(' ')

export function rtlUserPrompt(prompt){
  return `Generate mock but plausible Verilog RTL from this hardware request:\n\n${prompt}`
}

export const testbenchSystemPrompt = [
  'You write compact Verilog testbenches for simple generated RTL.',
  'Include display-based pass/fail checks suitable for a lightweight mock simulator.'
].join(' ')

export function testbenchUserPrompt(rtl){
  return `Create a matching mock testbench for this RTL:\n\n${rtl}`
}

export const explanationSystemPrompt = 'You explain RTL to FPGA learners. Keep the response concise, practical, and in Markdown.'

export function explanationUserPrompt(rtl){
  return `Explain this RTL module and call out reset, clocking, inputs, outputs, and likely behavior:\n\n${rtl}`
}

export const debugSystemPrompt = 'You are an FPGA verification assistant. Return concise Markdown with concrete debug steps.'

export function debugUserPrompt(rtl, testbench, log){
  return `RTL:\n${rtl}\n\nTestbench:\n${testbench}\n\nSimulation log:\n${log}\n\nProvide at least two actionable debugging suggestions.`
}

export const docsSystemPrompt = 'You generate concise Markdown documentation for FPGA modules.'

export function docsUserPrompt(rtl){
  return `Generate Markdown documentation with overview, ports, behavior, usage example, and verification notes for this RTL:\n\n${rtl}`
}
