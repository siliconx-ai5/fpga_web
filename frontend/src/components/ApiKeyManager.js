import storage from '../lib/storage.js'

export function renderApiKeyManager(container){
  const settings = storage.load('settings', {})
  const apiKey = settings.api_key || ''
  container.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <h2 class="font-medium mb-2">OpenAI API Key</h2>
      <p class="text-sm text-slate-500 mb-2">Store your OpenAI API key in localStorage (development only).</p>
      <label for="apiKeyInput" class="sr-only">API Key</label>
      <input 
        id="apiKeyInput" 
        type="password"
        class="border p-2 w-full mb-2 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500" 
        placeholder="sk-..." 
        value="${apiKey}"
        aria-label="OpenAI API Key"
      />
      <div class="flex gap-2">
        <button id="saveKeyBtn" class="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 focus:ring-2 focus:ring-sky-500">Save</button>
        <button id="clearKeyBtn" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-400">Clear</button>
      </div>
    </div>
  `
  const saveBtn = container.querySelector('#saveKeyBtn')
  const clearBtn = container.querySelector('#clearKeyBtn')
  const input = container.querySelector('#apiKeyInput')
  saveBtn.addEventListener('click', ()=>{
    const v = input.value.trim()
    const s = storage.load('settings', {})
    s.api_key = v
    storage.save('settings', s)
    alert('API key saved to localStorage')
  })
  clearBtn.addEventListener('click', ()=>{
    const s = storage.load('settings', {})
    delete s.api_key
    storage.save('settings', s)
    input.value = ''
    alert('API key cleared')
  })
}

export default { renderApiKeyManager }
