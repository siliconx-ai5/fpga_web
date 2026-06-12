import storage from '../lib/storage.js'

const PROJECTS_KEY = 'projects'
const ARTIFACTS_KEY = 'artifacts'

function now(){ return new Date().toISOString() }

function loadProjects(){
  return storage.load(PROJECTS_KEY, [])
}

function saveProjects(list){ storage.save(PROJECTS_KEY, list) }

function loadArtifacts(){ return storage.load(ARTIFACTS_KEY, []) }
function saveArtifacts(list){ storage.save(ARTIFACTS_KEY, list) }

export function createProject(name){
  const projects = loadProjects()
  const id = 'p_' + Date.now()
  const p = { id, name, created_at: now(), updated_at: now() }
  projects.push(p)
  saveProjects(projects)
  return p
}

export function listProjects(){ return loadProjects() }

export function getProject(id){
  return loadProjects().find(p=>p.id===id) || null
}

export function saveArtifact(projectId, type, filename, content){
  const artifacts = loadArtifacts()
  const id = 'a_' + Date.now()
  const art = { id, project_id: projectId, type, filename, content, created_at: now() }
  artifacts.push(art)
  saveArtifacts(artifacts)
  // update project's updated_at
  const projects = loadProjects().map(p=> p.id===projectId ? {...p, updated_at: now()} : p)
  storage.save(PROJECTS_KEY, projects)
  return art
}

export function listArtifacts(projectId){
  return loadArtifacts().filter(a=>a.project_id===projectId)
}

export function getArtifact(id){ return loadArtifacts().find(a=>a.id===id) || null }

export default { createProject, listProjects, getProject, saveArtifact, listArtifacts, getArtifact }
