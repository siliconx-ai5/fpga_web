import projectModel from '../models/projectModel.js'

export function renderProjectList(container, onOpenProject){
  const projects = projectModel.listProjects()
  container.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-medium">Projects</h2>
        <button id="newProjectBtn" class="px-2 py-1 bg-sky-600 text-white rounded">New</button>
      </div>
      <ul id="projectList">
        ${projects.map(p=>`<li class="py-1"><a href="#" data-id="${p.id}" class="text-sky-600">${p.name}</a></li>`).join('')}
      </ul>
    </div>
  `
  const newBtn = container.querySelector('#newProjectBtn')
  newBtn.addEventListener('click', ()=>{
    const name = prompt('Project name')
    if(name){
      const p = projectModel.createProject(name)
      renderProjectList(container, onOpenProject)
      if(onOpenProject) onOpenProject(p.id)
    }
  })
  container.querySelectorAll('#projectList a').forEach(a=>{
    a.addEventListener('click', (e)=>{ e.preventDefault(); const id = a.dataset.id; if(onOpenProject) onOpenProject(id) })
  })
}

export default { renderProjectList }
