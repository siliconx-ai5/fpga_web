import openaiClient from '../lib/openaiClient.js'
import projectModel from '../models/projectModel.js'
import simulator from '../lib/simulator/index.js'
import notify from '../lib/notify.js'

export function renderEditor(container, projectId){
  const artifacts = projectModel.listArtifacts(projectId)
  container.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-medium">Artifacts</h3>
        <div class="flex gap-2 flex-wrap">
          <button id="genRTLBtn" class="px-2 py-1 bg-green-600 text-white rounded text-sm">Generate RTL</button>
          <button id="genTBBtn" class="px-2 py-1 bg-amber-600 text-white rounded text-sm">Generate Testbench</button>
          <button id="runSimBtn" class="px-2 py-1 bg-indigo-600 text-white rounded text-sm">Run Simulation</button>
          <button id="explainBtn" class="px-2 py-1 bg-purple-600 text-white rounded text-sm">Explain</button>
          <button id="genDocsBtn" class="px-2 py-1 bg-teal-600 text-white rounded text-sm">Generate Docs</button>
        </div>
      </div>
      <ul id="artList" class="mb-3">
        ${artifacts.map(a=>`<li class="py-1 border-b"><a href="#" data-id="${a.id}" class="text-sky-600">${a.filename} (${a.type})</a></li>`).join('')}
      </ul>
      <pre id="artContent" class="p-3 bg-slate-50 rounded h-56 overflow-auto"></pre>
      <div id="aiResponse" class="mt-2 p-3 bg-blue-50 rounded hidden"></div>
    </div>
  `

  const artList = container.querySelectorAll('#artList a')
  artList.forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); const art = projectModel.getArtifact(a.dataset.id); container.querySelector('#artContent').textContent = art.content }))

  container.querySelector('#genRTLBtn').addEventListener('click', async ()=>{
    const prompt = window.prompt('Describe the hardware module (natural language)')
    if(!prompt) return
    const rtl = await openaiClient.generateRTL(prompt)
    const filename = `generated_${Date.now()}.v`
    projectModel.saveArtifact(projectId, 'rtl', filename, rtl)
    renderEditor(container, projectId)
    alert('RTL generated and saved')
  })

  container.querySelector('#genTBBtn').addEventListener('click', async ()=>{
    // Use latest RTL if present, else ask user
    const artifacts = projectModel.listArtifacts(projectId).filter(a=>a.type==='rtl')
    let rtl = ''
    if(artifacts.length) rtl = artifacts[artifacts.length-1].content
    if(!rtl){
      rtl = window.prompt('No RTL found. Paste RTL or cancel to abort')
      if(!rtl) return
    }
    const tb = await openaiClient.generateTestbench(rtl)
    const filename = `tb_${Date.now()}.v`
    projectModel.saveArtifact(projectId, 'testbench', filename, tb)
    renderEditor(container, projectId)
    alert('Testbench generated and saved')
  })

  container.querySelector('#runSimBtn').addEventListener('click', async ()=>{
    // find latest RTL and testbench
    const rts = projectModel.listArtifacts(projectId).filter(a=>a.type==='rtl')
    const tbs = projectModel.listArtifacts(projectId).filter(a=>a.type==='testbench')
    let rtl = rts.length ? rts[rts.length-1].content : ''
    let tb = tbs.length ? tbs[tbs.length-1].content : ''
    if(!rtl){ alert('No RTL found; generate or paste RTL first'); return }
    if(!tb){ if(!confirm('No testbench found. Run with empty testbench?')) return }
    // request notification permission
    notify.requestPermission()
    const logArea = container.querySelector('#artContent')
    logArea.textContent = 'Starting simulation...\n'
    const onProgress = (msg)=>{ logArea.textContent += msg + '\n' }
    const result = await simulator.runSimulation(rtl, tb, onProgress)
    logArea.textContent += 'Simulation finished: ' + result.status + '\n'
    notify.notify('Simulation finished', `Status: ${result.status}`)
    
    // If failed, offer debug suggestions
    if(result.status === 'fail'){
      const suggestions = await openaiClient.debugSuggestions(rtl, tb, result.logs.join('\n'))
      const aiResp = container.querySelector('#aiResponse')
      aiResp.classList.remove('hidden')
      aiResp.innerHTML = `<strong>Debug Suggestions:</strong><pre class="mt-2 whitespace-pre-wrap">${suggestions}</pre>`
    }
  })

  container.querySelector('#explainBtn').addEventListener('click', async ()=>{
    const artifacts = projectModel.listArtifacts(projectId).filter(a=>a.type==='rtl')
    if(!artifacts.length){ alert('No RTL found to explain'); return }
    const rtl = artifacts[artifacts.length-1].content
    const explanation = await openaiClient.explainRTL(rtl)
    const aiResp = container.querySelector('#aiResponse')
    aiResp.classList.remove('hidden')
    aiResp.innerHTML = `<strong>Explanation:</strong><p class="mt-2">${explanation}</p>`
  })

  container.querySelector('#genDocsBtn').addEventListener('click', async ()=>{
    const artifacts = projectModel.listArtifacts(projectId).filter(a=>a.type==='rtl')
    if(!artifacts.length){ alert('No RTL found to document'); return }
    const rtl = artifacts[artifacts.length-1].content
    const docs = await openaiClient.generateDocs(rtl)
    const filename = `docs_${Date.now()}.md`
    projectModel.saveArtifact(projectId, 'doc', filename, docs)
    renderEditor(container, projectId)
    alert('Documentation generated and saved')
  })
}

export default { renderEditor }
