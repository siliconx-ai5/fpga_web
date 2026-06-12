import mock from './mockSimulator.js'

let wasmAvailable = false

export async function initSimulator(){
  // Placeholder: attempt to load a WASM simulator from /simulator/sim.wasm
  // If not available, we'll use the JS mock.
  try{
    // try fetch to see if WASM exists
    const res = await fetch('/simulator/sim.wasm', { method: 'HEAD' })
    if(res.ok) wasmAvailable = true
  }catch(e){ wasmAvailable = false }
}

export async function runSimulation(rtl, tb, onProgress){
  if(wasmAvailable){
    // TODO: integrate real WASM simulator
    if(onProgress) onProgress('WASM simulator asset detected; using behavioral mock adapter for this build.')
  }
  return mock.runMockSimulation(rtl, tb, onProgress)
}

export default { initSimulator, runSimulation }
