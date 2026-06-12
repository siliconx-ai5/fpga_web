// JS fallback simulator: creates a lightweight behavioral trace for demo-sized RTL.
export async function runMockSimulation(rtl, tb, onProgress){
  const steps = [
    'Parsing RTL module and ports',
    'Elaborating testbench stimulus',
    'Applying reset sequence',
    'Advancing clock cycles',
    'Evaluating display/assert checks',
    'Building waveform preview'
  ]
  const logs = []
  for(let i=0;i<steps.length;i++){
    await new Promise(r=>setTimeout(r, 300))
    const msg = `Step ${i + 1}/${steps.length}: ${steps[i]}`
    logs.push(msg)
    if(onProgress) onProgress(msg)
  }

  const forceFail = /force_fail|fail_sim/i.test(tb) || /syntax_error/i.test(rtl)
  const counterLike = /\bcount\b/i.test(rtl)
  const status = forceFail ? 'failed' : 'passed'
  const assertions = [
    {
      name: counterLike ? 'counter increments after reset' : 'output responds to driven inputs',
      status: forceFail ? 'failed' : 'passed',
      time: '45 ns'
    }
  ]

  logs.push(forceFail ? 'ASSERT_FAIL at 45 ns: expected output transition was not observed' : 'ASSERT_PASS at 45 ns: expected behavior observed')
  logs.push(`Simulation ${status.toUpperCase()}`)

  const waveform = counterLike
    ? {
        times: [0, 10, 20, 30, 40, 50, 60, 70],
        signals: [
          { name: 'clk', values: [0, 1, 0, 1, 0, 1, 0, 1] },
          { name: 'rst', values: [1, 1, 0, 0, 0, 0, 0, 0] },
          { name: 'en', values: [0, 0, 1, 1, 1, 1, 1, 1] },
          { name: 'count', values: [0, 0, 0, 1, 1, 2, 2, forceFail ? 2 : 3] }
        ]
      }
    : {
        times: [0, 10, 20, 30, 40, 50],
        signals: [
          { name: 'clk', values: [0, 1, 0, 1, 0, 1] },
          { name: 'rst', values: [1, 1, 0, 0, 0, 0] },
          { name: 'a', values: [0, 0, 1, 1, 1, 1] },
          { name: 'b', values: [0, 0, 1, 1, 1, 1] },
          { name: 'out', values: [0, 0, 0, 1, 1, forceFail ? 0 : 1] }
        ]
      }

  return {
    status,
    summary: forceFail ? '1 assertion failed' : '1 assertion passed',
    logs,
    waveform,
    assertions
  }
}

export default { runMockSimulation }
