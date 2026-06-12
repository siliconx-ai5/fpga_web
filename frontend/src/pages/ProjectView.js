import projectModel from '../models/projectModel.js'
import openaiClient from '../lib/openaiClient.js'
import { exportProjectZip } from '../lib/exportZip.js'
import { renderRunHistory } from '../components/RunHistory.js'
import { renderWaveformPreview } from '../components/WaveformPreview.js'
import { executeSimulation } from '../components/SimulationRunner.js'

const viewState = new Map()

function stateFor(projectId){
  if(!viewState.has(projectId)){
    viewState.set(projectId, { tab: 'rtl', selectedArtifactId: null, selectedRunId: null, busy: false, message: '' })
  }
  return viewState.get(projectId)
}

function latest(projectId, type){
  return projectModel.latestArtifact(projectId, type)
}

function fileIcon(type){
  if(type === 'rtl') return 'V'
  if(type === 'testbench') return 'TB'
  if(type === 'documentation') return 'MD'
  if(type === 'ai_explanation') return 'AI'
  if(type === 'debug_suggestions') return 'DBG'
  return 'FILE'
}

function escapeHtml(value=''){
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderArtifactCode(artifact, emptyCopy){
  if(!artifact) return `<div class="empty-state">${emptyCopy}</div>`
  return `<pre class="code-pane">${escapeHtml(artifact.content)}</pre>`
}

function renderRtlEditor(artifact){
  if(!artifact) return '<div class="empty-state">Generated RTL will appear here.</div>'
  return `
    <div class="editor-shell">
      <div class="editor-meta">
        <span>${escapeHtml(artifact.filename)}</span>
        <span>Updated ${new Date(artifact.updated_at || artifact.created_at).toLocaleString()}</span>
      </div>
      <textarea id="rtlEditor" class="code-editor" spellcheck="false" aria-label="Editable RTL source">${escapeHtml(artifact.content)}</textarea>
    </div>
  `
}

function getSelectedRun(projectId, selectedRunId){
  const runs = projectModel.listRuns(projectId)
  return runs.find(run=>run.id === selectedRunId) || projectModel.latestRun(projectId)
}

function getRtlEditorValue(container){
  const editor = container.querySelector('#rtlEditor')
  return editor ? editor.value : null
}

function rtlHasUnsavedChanges(container, projectId){
  const value = getRtlEditorValue(container)
  const rtl = latest(projectId, 'rtl')
  return value !== null && rtl && value !== rtl.content
}

function confirmCleanRtl(container, projectId){
  if(!rtlHasUnsavedChanges(container, projectId)) return true
  return window.confirm('Discard unsaved RTL edits?')
}

function filenameWithCopySuffix(filename){
  const dot = filename.lastIndexOf('.')
  if(dot <= 0) return `${filename}_copy`
  return `${filename.slice(0, dot)}_copy_${Date.now()}${filename.slice(dot)}`
}

function parseMetadata(json){
  try{
    return json ? JSON.parse(json) : {}
  }catch(e){
    return {}
  }
}

function saveRtlEdit(projectId, container, state, onBack, saveAsCopy){
  try{
    const rtl = latest(projectId, 'rtl')
    const content = getRtlEditorValue(container)
    if(!rtl || content === null) return

    if(saveAsCopy){
      const metadata = parseMetadata(rtl.metadata_json)
      projectModel.saveArtifact(projectId, 'rtl', filenameWithCopySuffix(rtl.filename), content, {
        ...metadata,
        editedFromArtifactId: rtl.id,
        edited_at: new Date().toISOString()
      })
      state.message = 'RTL saved as a new copy.'
    }else{
      const metadata = parseMetadata(rtl.metadata_json)
      projectModel.updateArtifact(rtl.id, {
        content,
        metadata: {
          ...metadata,
          edited_at: new Date().toISOString()
        }
      })
      state.message = 'RTL edits saved.'
    }
  }catch(e){
    state.message = `RTL save failed: ${e.message}`
  }
  state.tab = 'rtl'
  renderProjectView(container, projectId, { onBack })
}

async function generateDesign(projectId, prompt, container){
  const state = stateFor(projectId)
  if(!prompt.trim()) return
  state.busy = true
  state.message = 'Generating RTL and testbench...'
  renderProjectView(container, projectId)
  try{
    const rtl = await openaiClient.generateRTLBundle(prompt)
    projectModel.saveArtifact(projectId, 'rtl', rtl.filename || `${rtl.moduleName || 'top_module'}.v`, rtl.content, {
      prompt,
      moduleName: rtl.moduleName,
      assumptions: rtl.assumptions || [],
      warnings: rtl.warnings || []
    })
    const testbench = await openaiClient.generateTestbenchBundle(rtl.content)
    projectModel.saveArtifact(projectId, 'testbench', testbench.filename || `${rtl.moduleName || 'top_module'}_tb.v`, testbench.content, {
      prompt,
      stimulusSummary: testbench.stimulusSummary,
      expectedAssertions: testbench.expectedAssertions || [],
      warnings: testbench.warnings || []
    })
    state.tab = 'rtl'
    state.message = 'Generated RTL and testbench.'
  }catch(e){
    state.message = `Generation failed: ${e.message}`
  }finally{
    state.busy = false
    renderProjectView(container, projectId)
  }
}

async function runSimulation(projectId, container){
  const state = stateFor(projectId)
  const rtl = latest(projectId, 'rtl')
  const testbench = latest(projectId, 'testbench')
  if(!rtl){
    state.message = 'Generate RTL before running simulation.'
    renderProjectView(container, projectId)
    return
  }
  state.busy = true
  state.tab = 'simulator'
  state.message = 'Starting simulation...'
  renderProjectView(container, projectId)
  const logLines = []
  try{
    const { result, savedRun } = await executeSimulation({
      projectId,
      rtlArtifact: rtl,
      testbenchArtifact: testbench,
      onProgress: (line)=>{
      logLines.push(line)
      const liveLog = container.querySelector('#liveSimLog')
      if(liveLog) liveLog.textContent = ['Starting simulation...', ...logLines].join('\n')
      }
    })
    state.selectedRunId = savedRun.id
    state.message = `Simulation ${result.status}: ${result.summary}`
  }catch(e){
    const savedRun = projectModel.saveRun(projectId, {
      status: 'error',
      summary: e.message,
      logs: ['Simulation could not complete.', e.message],
      assertions: [],
      waveform: null
    })
    state.selectedRunId = savedRun.id
    state.message = `Simulation error: ${e.message}`
  }finally{
    state.busy = false
    renderProjectView(container, projectId)
  }
}

async function explain(projectId, container){
  const state = stateFor(projectId)
  const rtl = latest(projectId, 'rtl')
  if(!rtl){
    state.message = 'Generate RTL before asking for an explanation.'
    renderProjectView(container, projectId)
    return
  }
  state.busy = true
  state.message = 'Generating explanation...'
  renderProjectView(container, projectId)
  try{
    const explanation = await openaiClient.explainRTL(rtl.content)
    projectModel.saveArtifact(projectId, 'ai_explanation', `explanation_${Date.now()}.md`, explanation, { rtlArtifactId: rtl.id })
    state.tab = 'ai'
    state.message = 'Explanation saved.'
  }catch(e){
    state.message = `Explanation failed: ${e.message}`
  }finally{
    state.busy = false
    renderProjectView(container, projectId)
  }
}

async function generateDocs(projectId, container){
  const state = stateFor(projectId)
  const rtl = latest(projectId, 'rtl')
  if(!rtl){
    state.message = 'Generate RTL before documentation.'
    renderProjectView(container, projectId)
    return
  }
  state.busy = true
  state.message = 'Generating documentation...'
  renderProjectView(container, projectId)
  try{
    const docs = await openaiClient.generateDocs(rtl.content)
    projectModel.saveArtifact(projectId, 'documentation', `docs_${Date.now()}.md`, docs, { rtlArtifactId: rtl.id })
    state.tab = 'docs'
    state.message = 'Documentation saved.'
  }catch(e){
    state.message = `Documentation failed: ${e.message}`
  }finally{
    state.busy = false
    renderProjectView(container, projectId)
  }
}

async function generateDebug(projectId, container){
  const state = stateFor(projectId)
  const rtl = latest(projectId, 'rtl')
  const testbench = latest(projectId, 'testbench')
  const run = projectModel.latestRun(projectId)
  if(!rtl || !run){
    state.message = 'Run a simulation before requesting debug suggestions.'
    renderProjectView(container, projectId)
    return
  }
  state.busy = true
  state.message = 'Generating debug suggestions...'
  renderProjectView(container, projectId)
  try{
    const suggestions = await openaiClient.debugSuggestions(rtl.content, testbench?.content || '', run.logs.join('\n'))
    projectModel.saveArtifact(projectId, 'debug_suggestions', `debug_${Date.now()}.md`, suggestions, { runId: run.id })
    state.tab = 'ai'
    state.message = 'Debug suggestions saved.'
  }catch(e){
    state.message = `Debug suggestions failed: ${e.message}`
  }finally{
    state.busy = false
    renderProjectView(container, projectId)
  }
}

function renderTabContent(projectId, state){
  const rtl = latest(projectId, 'rtl')
  const testbench = latest(projectId, 'testbench')
  const docs = latest(projectId, 'documentation')
  const explanation = latest(projectId, 'ai_explanation')
  const debug = latest(projectId, 'debug_suggestions')
  const selectedRun = getSelectedRun(projectId, state.selectedRunId)

  if(state.tab === 'rtl'){
    return `
      <div class="workspace-actions">
        <button type="button" id="saveRtlBtn" data-action="save-rtl" class="primary-button" ${rtl ? '' : 'disabled'}>Save RTL</button>
        <button type="button" id="saveRtlCopyBtn" data-action="save-rtl-copy" class="secondary-button" ${rtl ? '' : 'disabled'}>Save as Copy</button>
        <button type="button" id="explainBtn" class="secondary-button">Explain RTL</button>
        <button type="button" id="docsBtn" class="secondary-button">Generate Docs</button>
      </div>
      ${renderRtlEditor(rtl)}
    `
  }

  if(state.tab === 'testbench'){
    return `
      <div class="workspace-actions">
        <button type="button" id="regenTestbenchBtn" class="secondary-button">Regenerate Testbench</button>
      </div>
      ${renderArtifactCode(testbench, 'Generated testbench will appear here.')}
    `
  }

  if(state.tab === 'simulator'){
    const log = selectedRun ? selectedRun.logs.join('\n') : ''
    return `
      <div class="sim-grid">
        <div>
          <div class="workspace-actions">
            <button type="button" id="runSimBtn" class="primary-button" ${state.busy ? 'disabled' : ''}>Run Simulation</button>
            <button type="button" id="debugBtn" class="secondary-button">How To Fix</button>
          </div>
          <pre id="liveSimLog" class="code-pane sim-log">${escapeHtml(log || 'Run a simulation to see logs.')}</pre>
        </div>
        <div id="waveformMount"></div>
      </div>
    `
  }

  if(state.tab === 'docs'){
    return `
      <div class="workspace-actions">
        <button type="button" id="docsBtn" class="secondary-button">Generate Docs</button>
      </div>
      ${renderArtifactCode(docs, 'Generated Markdown documentation will appear here.')}
    `
  }

  return `
    <div class="ai-grid">
      <div>
        <div class="workspace-actions">
          <button type="button" id="explainBtn" class="secondary-button">Explain RTL</button>
          <button type="button" id="debugBtn" class="secondary-button">How To Fix</button>
        </div>
        <h3 class="content-heading">Explanation</h3>
        ${renderArtifactCode(explanation, 'Ask AI Copilot to explain the generated RTL.')}
      </div>
      <div>
        <h3 class="content-heading">Debug Suggestions</h3>
        ${renderArtifactCode(debug, 'Run a failing simulation or request debug suggestions.')}
      </div>
    </div>
  `
}

function attachWorkspaceHandlers(container, projectId, state, onBack){
  if(container.workspaceActionHandler){
    container.removeEventListener('click', container.workspaceActionHandler)
  }
  container.workspaceActionHandler = event=>{
    const actionTarget = event.target.closest('[data-action]')
    if(!actionTarget || !container.contains(actionTarget)) return
    if(actionTarget.dataset.action === 'save-rtl'){
      event.preventDefault()
      saveRtlEdit(projectId, container, state, onBack, false)
    }
    if(actionTarget.dataset.action === 'save-rtl-copy'){
      event.preventDefault()
      saveRtlEdit(projectId, container, state, onBack, true)
    }
  }
  container.addEventListener('click', container.workspaceActionHandler)

  container.querySelector('#backBtn')?.addEventListener('click', onBack)
  container.querySelector('#downloadAll')?.addEventListener('click', async ()=>{
    try{ await exportProjectZip(projectId) }catch(e){ state.message = `Export failed: ${e.message}`; renderProjectView(container, projectId, { onBack }) }
  })
  container.querySelectorAll('.tab-button').forEach(button=>{
    button.addEventListener('click', ()=>{
      if(!confirmCleanRtl(container, projectId)) return
      state.tab = button.dataset.tab
      renderProjectView(container, projectId, { onBack })
    })
  })
  container.querySelectorAll('.file-item').forEach(button=>{
    button.addEventListener('click', ()=>{
      if(!confirmCleanRtl(container, projectId)) return
      state.selectedArtifactId = button.dataset.id
      const artifact = projectModel.getArtifact(button.dataset.id)
      if(artifact?.type === 'testbench') state.tab = 'testbench'
      else if(artifact?.type === 'documentation') state.tab = 'docs'
      else if(artifact?.type === 'ai_explanation' || artifact?.type === 'debug_suggestions') state.tab = 'ai'
      else state.tab = 'rtl'
      renderProjectView(container, projectId, { onBack })
    })
  })
  container.querySelector('#promptForm')?.addEventListener('submit', (event)=>{
    event.preventDefault()
    const input = container.querySelector('#promptInput')
    generateDesign(projectId, input.value, container)
  })
  container.querySelector('#runSimBtn')?.addEventListener('click', ()=>runSimulation(projectId, container))
  container.querySelector('#explainBtn')?.addEventListener('click', ()=>explain(projectId, container))
  container.querySelector('#docsBtn')?.addEventListener('click', ()=>generateDocs(projectId, container))
  container.querySelector('#debugBtn')?.addEventListener('click', ()=>generateDebug(projectId, container))
  container.querySelector('#regenTestbenchBtn')?.addEventListener('click', async ()=>{
    const rtl = latest(projectId, 'rtl')
    if(!rtl){ state.message = 'Generate RTL first.'; renderProjectView(container, projectId, { onBack }); return }
    state.busy = true
    state.message = 'Regenerating testbench...'
    renderProjectView(container, projectId, { onBack })
    try{
      const testbench = await openaiClient.generateTestbenchBundle(rtl.content)
      projectModel.saveArtifact(projectId, 'testbench', testbench.filename || `tb_${Date.now()}.v`, testbench.content, testbench)
      state.message = 'Testbench saved.'
    }catch(e){
      state.message = `Testbench generation failed: ${e.message}`
    }finally{
      state.busy = false
      renderProjectView(container, projectId, { onBack })
    }
  })
}

export function renderProjectView(container, projectId, options={}){
  const project = projectModel.getProject(projectId)
  const onBack = options.onBack || (()=>{})
  if(!project){
    container.innerHTML = '<div class="empty-state">Project not found.</div>'
    return
  }

  const state = stateFor(projectId)
  const artifacts = projectModel.listArtifacts(projectId)
  const run = getSelectedRun(projectId, state.selectedRunId)
  const tabs = [
    ['rtl', 'RTL'],
    ['testbench', 'Testbench'],
    ['simulator', 'Simulator'],
    ['docs', 'Docs'],
    ['ai', 'AI Copilot']
  ]

  container.innerHTML = `
    <section class="studio-shell">
      <header class="studio-topbar">
        <button type="button" id="backBtn" class="ghost-button">Projects</button>
        <div>
          <h1>FPGA Design Studio</h1>
          <p>Project: ${escapeHtml(project.name)}</p>
        </div>
        <button type="button" id="downloadAll" class="secondary-button">Export ZIP</button>
      </header>
      <div class="project-layout">
        <aside class="documents-panel">
          <div class="panel-title-row">
            <h2>Documents</h2>
            <span>${artifacts.length}</span>
          </div>
          <div class="file-tree">
            ${artifacts.length === 0 ? '<p class="empty-copy">No files yet.</p>' : artifacts.map(artifact=>`
              <button type="button" class="file-item" data-id="${artifact.id}">
                <span>${fileIcon(artifact.type)}</span>
                <strong>${escapeHtml(artifact.filename)}</strong>
              </button>
            `).join('')}
          </div>
          <div id="runHistoryMount"></div>
        </aside>
        <main class="workspace-panel">
          <nav class="tab-strip">
            ${tabs.map(([key, label])=>`<button class="tab-button ${state.tab === key ? 'active' : ''}" data-tab="${key}">${label}</button>`).join('')}
          </nav>
          <section class="tab-content">
            ${state.message ? `<div class="status-banner ${state.message.includes('failed') || state.message.includes('error') ? 'bad' : ''}">${escapeHtml(state.message)}</div>` : ''}
            ${renderTabContent(projectId, state)}
          </section>
          <form id="promptForm" class="prompt-bar">
            <span class="prompt-plus">+</span>
            <input id="promptInput" placeholder="Describe what you would like to generate" ${state.busy ? 'disabled' : ''} />
            <button class="generate-button" ${state.busy ? 'disabled' : ''}>Generate</button>
          </form>
        </main>
      </div>
    </section>
  `

  renderRunHistory(container.querySelector('#runHistoryMount'), projectId, selected=>{
    state.selectedRunId = selected.id
    state.tab = 'simulator'
    renderProjectView(container, projectId, { onBack })
  })

  if(state.tab === 'simulator'){
    renderWaveformPreview(container.querySelector('#waveformMount'), run?.waveform, run?.status || 'idle')
  }

  attachWorkspaceHandlers(container, projectId, state, onBack)

  if(options.initialPrompt){
    const prompt = options.initialPrompt
    options.initialPrompt = ''
    window.setTimeout(()=>generateDesign(projectId, prompt, container), 0)
  }
}

export default { renderProjectView }
