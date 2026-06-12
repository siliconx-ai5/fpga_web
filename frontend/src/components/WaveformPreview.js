function normalizeWaveform(waveform){
  if(waveform?.signals?.length) return waveform
  return {
    times: [0, 10, 20, 30, 40, 50],
    signals: [
      { name: 'clk', values: [0, 1, 0, 1, 0, 1] },
      { name: 'rst', values: [1, 1, 0, 0, 0, 0] },
      { name: 'out', values: [0, 0, 0, 1, 1, 1] }
    ]
  }
}

function signalPath(values, rowIndex){
  const x0 = 72
  const step = 62
  const high = 22 + rowIndex * 44
  const low = high + 18
  let path = ''
  values.forEach((value, index)=>{
    const x = x0 + index * step
    const y = Number(value) ? high : low
    if(index === 0){
      path += `M ${x} ${y}`
      return
    }
    const previousY = Number(values[index - 1]) ? high : low
    path += ` H ${x} V ${y}`
    if(previousY !== y) path += ` M ${x} ${y}`
  })
  path += ` H ${x0 + values.length * step}`
  return path
}

export function renderWaveformPreview(container, waveform, status='idle'){
  const data = normalizeWaveform(waveform)
  const width = Math.max(520, 120 + data.times.length * 62)
  const height = 38 + data.signals.length * 44
  const statusClass = status === 'failed' ? 'text-red-300' : status === 'passed' ? 'text-emerald-300' : 'text-slate-300'
  const statusLabel = status === 'idle' ? 'No run yet' : status.toUpperCase()

  container.innerHTML = `
    <div class="waveform-card">
      <div class="waveform-header">
        <span>Waveform</span>
        <span class="${statusClass}">${statusLabel}</span>
      </div>
      <div class="waveform-scroll">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Simulation waveform preview">
          ${data.signals.map((signal, index)=>`
            <text x="16" y="${38 + index * 44}" class="wave-label">${signal.name}</text>
            <path d="${signalPath(signal.values, index)}" class="${status === 'failed' && index === data.signals.length - 1 ? 'wave-line wave-line-fail' : 'wave-line'}"></path>
          `).join('')}
          ${data.times.map((time, index)=>`
            <line x1="${72 + index * 62}" y1="10" x2="${72 + index * 62}" y2="${height - 12}" class="wave-grid"></line>
            <text x="${64 + index * 62}" y="${height - 2}" class="wave-time">${time}ns</text>
          `).join('')}
        </svg>
      </div>
    </div>
  `
}

export default { renderWaveformPreview }
