import mock from './mockSimulator.js'
import sqlite from '../sqlite.js'

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
  // Prefer WASM if available (not implemented), else use mock
  if(wasmAvailable){
    // TODO: integrate real WASM simulator
    if(onProgress) onProgress('WASM simulator selected, but not implemented — falling back')
  }
  const out = await mock.runMockSimulation(rtl, tb, onProgress)

  // persist run log in local storage / sqlite via sqlite export (simple)
  try{
    const runsKey = 'runs'
    const runs = JSON.parse(localStorage.getItem('fpga_web_v1:' + runsKey) || '[]')
    const run = { id: 'r_'+Date.now(), status: out.status, logs: out.logs, created_at: new Date().toISOString() }
    runs.push(run)
    localStorage.setItem('fpga_web_v1:' + runsKey, JSON.stringify(runs))
  }catch(e){ console.warn('failed to persist run', e) }

  return out
}

export default { initSimulator, runSimulation }
