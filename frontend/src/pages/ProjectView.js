import projectModel from '../models/projectModel.js'
import { renderEditor } from '../components/Editor.js'
import { exportProjectZip } from '../lib/exportZip.js'

export function renderProjectView(container, projectId){
  const project = projectModel.getProject(projectId)
  if(!project){ container.innerHTML = '<div class="p-4 bg-white rounded">Project not found</div>'; return }
  container.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-medium">${project.name}</h2>
        <div>
          <button id="downloadAll" class="px-2 py-1 bg-gray-200 rounded">Download ZIP</button>
        </div>
      </div>
      <div id="editorArea"></div>
    </div>
  `
  const editorArea = container.querySelector('#editorArea')
  renderEditor(editorArea, projectId)
  container.querySelector('#downloadAll').addEventListener('click', ()=>{
    try{ exportProjectZip(projectId) }catch(e){ alert('Export failed: ' + e.message) }
  })
}

export default { renderProjectView }
