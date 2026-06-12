export function renderWaveformPreview(container, runStatus){
  // Simple ASCII-art waveform for demo
  const waveform = runStatus === 'pass' ? `
CLK   __|‾‾|__|‾‾|__|‾‾|__|‾‾|__
RST   ‾‾‾‾|_____________________
A     ________|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
B     ________|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
OUT   _____________|‾‾‾‾‾‾‾‾‾‾‾
  ` : `
CLK   __|‾‾|__|‾‾|__|‾‾|__|‾‾|__
RST   ‾‾‾‾|_____________________
ERROR ____________|‾‾‾‾‾‾‾‾‾‾‾‾
  `
  
  container.innerHTML = `
    <div class="p-4 bg-slate-900 text-green-400 rounded font-mono text-xs mt-4">
      <div class="mb-2 text-white">Waveform Preview (Mock)</div>
      <pre>${waveform}</pre>
    </div>
  `
}

export default { renderWaveformPreview }
