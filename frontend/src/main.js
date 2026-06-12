import './styles.css'

import { renderProjectView } from './pages/ProjectView.js'
import { renderApiKeyManager } from './components/ApiKeyManager.js'
import projectModel from './models/projectModel.js'
import openaiClient from './lib/openaiClient.js'

const app = document.getElementById('app')
let selectedProjectId = null

function escapeHtml(value=''){
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderProjectRail(){
  const mount = document.getElementById('projectsRail')
  const projects = projectModel.listProjects()
  mount.innerHTML = `
    <div class="side-panel">
      <div class="panel-title-row">
        <h2>Projects</h2>
        <button id="newProjectBtn" class="mini-button">New</button>
      </div>
      <div class="project-list">
        ${projects.length === 0 ? '<p class="empty-copy">Create a project from the generator.</p>' : projects.map(project=>`
          <button class="project-link ${project.id === selectedProjectId ? 'active' : ''}" data-id="${project.id}">
            <strong>${escapeHtml(project.name)}</strong>
            <small>${new Date(project.updated_at).toLocaleDateString()}</small>
          </button>
        `).join('')}
      </div>
    </div>
  `
  mount.querySelector('#newProjectBtn')?.addEventListener('click', ()=>{
    const name = window.prompt('Project name')
    if(!name) return
    const project = projectModel.createProject(name)
    selectedProjectId = project.id
    renderApp()
  })
  mount.querySelectorAll('.project-link').forEach(button=>{
    button.addEventListener('click', ()=>{
      selectedProjectId = button.dataset.id
      renderApp()
    })
  })
}

function renderLanding(){
  const main = document.getElementById('mainPanel')
  const projects = projectModel.listProjects()
  main.innerHTML = `
    <section class="landing-panel">
      <div class="landing-copy">
        <span class="eyebrow">Mock FPGA flow, real AI workflow</span>
        <h1>FPGA Design Studio</h1>
        <p>Describe a small hardware module and generate a project with RTL, a testbench, simulation traces, and AI-assisted documentation.</p>
      </div>
      <form id="landingPromptForm" class="landing-prompt">
        <span class="prompt-plus">+</span>
        <input id="landingPromptInput" placeholder="Describe what you would like to generate" autofocus />
        <button class="generate-button">Generate</button>
      </form>
      ${projects.length ? `
        <div class="recent-projects">
          ${projects.slice(0, 3).map(project=>`
            <button class="recent-card" data-id="${project.id}">
              <span>Project</span>
              <strong>${escapeHtml(project.name)}</strong>
              <small>${new Date(project.updated_at).toLocaleString()}</small>
            </button>
          `).join('')}
        </div>
      ` : ''}
    </section>
  `

  main.querySelector('#landingPromptForm').addEventListener('submit', event=>{
    event.preventDefault()
    const input = main.querySelector('#landingPromptInput')
    const prompt = input.value.trim()
    if(!prompt) return
    const name = openaiClient.suggestProjectName(prompt)
    const project = projectModel.createProject(name, prompt)
    selectedProjectId = project.id
    renderApp({ initialPrompt: prompt })
  })

  main.querySelectorAll('.recent-card').forEach(button=>{
    button.addEventListener('click', ()=>{
      selectedProjectId = button.dataset.id
      renderApp()
    })
  })
}

function renderApp(options={}){
  app.innerHTML = `
    <main class="app-frame">
      <aside class="app-sidebar">
        <div class="brand-lockup">
          <span class="brand-mark">FP</span>
          <div>
            <strong>FPGA Studio</strong>
            <small>Design, simulate, explain</small>
          </div>
        </div>
        <div id="projectsRail"></div>
        <div id="apiKeyRail"></div>
      </aside>
      <section id="mainPanel" class="app-main"></section>
    </main>
  `
  renderProjectRail()
  renderApiKeyManager(document.getElementById('apiKeyRail'))

  if(selectedProjectId){
    renderProjectView(document.getElementById('mainPanel'), selectedProjectId, {
      initialPrompt: options.initialPrompt,
      onBack: ()=>{
        selectedProjectId = null
        renderApp()
      }
    })
  }else{
    renderLanding()
  }
}

projectModel.initDb().finally(()=>renderApp())

export default app
