import openaiClient from '../lib/openaiClient.js'
import projectModel from '../models/projectModel.js'

export function renderEditor(container, projectId){
  const artifacts = projectModel.listArtifacts(projectId)
  container.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-medium">Artifacts</h3>
        <div>
          <button id="genRTLBtn" class="px-2 py-1 bg-green-600 text-white rounded mr-2">Generate RTL</button>
          <button id="genTBBtn" class="px-2 py-1 bg-amber-600 text-white rounded">Generate Testbench</button>
        </div>
      </div>
      <ul id="artList" class="mb-3">
        ${artifacts.map(a=>`<li class="py-1 border-b"><a href="#" data-id="${a.id}" class="text-sky-600">${a.filename} (${a.type})</a></li>`).join('')}
      </ul>
      <pre id="artContent" class="p-3 bg-slate-50 rounded h-56 overflow-auto"></pre>
    </div>
  `

  const artList = container.querySelectorAll('#artList a')
  artList.forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); const art = projectModel.getArtifact(a.dataset.id); container.querySelector('#artContent').textContent = art.content }))

  container.querySelector('#genRTLBtn').addEventListener('click', async ()=>{
    const prompt = prompt('Describe the hardware module (natural language)')
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
      rtl = prompt('No RTL found. Paste RTL or cancel to abort')
      if(!rtl) return
    }
    const tb = await openaiClient.generateTestbench(rtl)
    const filename = `tb_${Date.now()}.v`
    projectModel.saveArtifact(projectId, 'testbench', filename, tb)
    renderEditor(container, projectId)
    alert('Testbench generated and saved')
  })
}

export default { renderEditor }
