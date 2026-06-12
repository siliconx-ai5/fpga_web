import storage from '../lib/storage.js'

export function renderApiKeyManager(container){
  const settings = storage.load('settings', {})
  const apiKey = settings.api_key || ''
  const model = settings.model || 'gpt-5.5'
  container.innerHTML = `
    <div class="side-panel">
      <div class="panel-title-row">
        <h2>AI Settings</h2>
        <span>${apiKey ? 'Live' : 'Demo'}</span>
      </div>
      <p class="muted-copy">Keys are stored in browser localStorage for this prototype.</p>
      <label for="apiKeyInput" class="sr-only">API Key</label>
      <input 
        id="apiKeyInput" 
        type="password"
        class="studio-input" 
        placeholder="sk-..." 
        value="${apiKey}"
        aria-label="OpenAI API Key"
      />
      <label for="modelInput" class="field-label">Model</label>
      <input id="modelInput" class="studio-input" value="${model}" aria-label="OpenAI model" />
      <div class="button-row">
        <button id="saveKeyBtn" class="secondary-button">Save</button>
        <button id="clearKeyBtn" class="ghost-button">Clear</button>
      </div>
    </div>
  `
  const saveBtn = container.querySelector('#saveKeyBtn')
  const clearBtn = container.querySelector('#clearKeyBtn')
  const input = container.querySelector('#apiKeyInput')
  saveBtn.addEventListener('click', ()=>{
    const v = input.value.trim()
    const modelValue = container.querySelector('#modelInput').value.trim()
    const s = storage.load('settings', {})
    s.api_key = v
    s.model = modelValue || 'gpt-5.5'
    storage.save('settings', s)
    renderApiKeyManager(container)
  })
  clearBtn.addEventListener('click', ()=>{
    const s = storage.load('settings', {})
    delete s.api_key
    storage.save('settings', s)
    renderApiKeyManager(container)
  })
}

export default { renderApiKeyManager }
