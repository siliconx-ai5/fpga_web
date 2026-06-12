import projectModel from '../models/projectModel.js'

export function renderRunHistory(container, projectId, onSelectRun=()=>{}){
  const runs = projectModel.listRuns(projectId)
  container.innerHTML = `
    <div class="run-history">
      <div class="panel-title-row">
        <h3>Run History</h3>
        <span>${runs.length} runs</span>
      </div>
      ${runs.length === 0 ? '<p class="empty-copy">No simulations have been run for this project.</p>' : ''}
      <div class="run-list">
        ${runs.slice(-8).reverse().map(r=>`
          <button class="run-item" data-id="${r.id}">
            <span class="run-status ${r.status === 'passed' ? 'ok' : 'bad'}">${r.status}</span>
            <span>${r.summary || 'Simulation complete'}</span>
            <small>${new Date(r.created_at).toLocaleString()}</small>
          </button>
        `).join('')}
      </div>
    </div>
  `

  container.querySelectorAll('.run-item').forEach(button=>{
    button.addEventListener('click', ()=>{
      const run = runs.find(item=>item.id === button.dataset.id)
      if(run) onSelectRun(run)
    })
  })
}

export default { renderRunHistory }
