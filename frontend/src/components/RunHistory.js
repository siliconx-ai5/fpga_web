import storage from '../lib/storage.js'

export function renderRunHistory(container){
  const runs = storage.load('runs', [])
  container.innerHTML = `
    <div class="p-4 bg-white rounded shadow mt-4">
      <h3 class="font-medium mb-3">Run History</h3>
      ${runs.length === 0 ? '<p class="text-slate-500 text-sm">No runs yet</p>' : ''}
      <div id="runsList" class="space-y-2">
        ${runs.slice(-10).reverse().map(r=>`
          <div class="p-2 border rounded hover:bg-slate-50 cursor-pointer" data-id="${r.id}">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium ${r.status==='pass'?'text-green-600':'text-red-600'}">${r.status.toUpperCase()}</span>
              <span class="text-xs text-slate-500">${new Date(r.created_at).toLocaleString()}</span>
            </div>
            <pre class="text-xs mt-1 text-slate-600 hidden run-logs">${r.logs.join('\n')}</pre>
          </div>
        `).join('')}
      </div>
    </div>
  `
  
  container.querySelectorAll('#runsList > div').forEach(el=>{
    el.addEventListener('click', ()=>{
      const logs = el.querySelector('.run-logs')
      logs.classList.toggle('hidden')
    })
  })
}

export default { renderRunHistory }
