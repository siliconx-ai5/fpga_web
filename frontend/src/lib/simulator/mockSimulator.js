// JS fallback simulator: runs a fake simulation producing logs and a simple pass/fail result
export async function runMockSimulation(rtl, tb, onProgress){
  const steps = 6
  const logs = []
  for(let i=1;i<=steps;i++){
    await new Promise(r=>setTimeout(r, 300))
    const msg = `Step ${i}/${steps}: running...`
    logs.push(msg)
    if(onProgress) onProgress(msg)
  }
  // simple heuristic: if 'assert' in tb then fail
  const failed = /assert/i.test(tb)
  const result = failed ? 'FAIL' : 'PASS'
  logs.push(`Simulation ${result}`)
  return { status: failed ? 'fail' : 'pass', logs }
}

export default { runMockSimulation }
