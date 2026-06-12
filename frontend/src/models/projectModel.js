import storage from '../lib/storage.js'
import sqlite from '../lib/sqlite.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

const PROJECTS_KEY = 'projects'
const ARTIFACTS_KEY = 'artifacts'

let useSql = false

function now(){ return new Date().toISOString() }

function esc(s){ return String(s).replace(/'/g, "''") }

export async function initDb(){
  const ok = await sqlite.init()
  if(!ok) return false
  // create tables if not exist
  sqlite.exec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT, created_at TEXT, updated_at TEXT);`)
  sqlite.exec(`CREATE TABLE IF NOT EXISTS artifacts (id TEXT PRIMARY KEY, project_id TEXT, type TEXT, filename TEXT, content TEXT, created_at TEXT);`)
  useSql = true
  return true
}

export function createProject(name){
  const id = 'p_' + Date.now()
  const p = { id, name, created_at: now(), updated_at: now() }
  if(useSql){
    const sql = `INSERT INTO projects (id,name,created_at,updated_at) VALUES ('${esc(p.id)}','${esc(p.name)}','${esc(p.created_at)}','${esc(p.updated_at)}')`;
    sqlite.exec(sql)
  }else{
    const projects = storage.load(PROJECTS_KEY, [])
    projects.push(p)
    storage.save(PROJECTS_KEY, projects)
  }
  return p
}

export function listProjects(){
  if(useSql){
    const rows = sqlite.run('SELECT id,name,created_at,updated_at FROM projects')
    return Array.isArray(rows) ? rows : []
  }
  return storage.load(PROJECTS_KEY, [])
}

export function getProject(id){
  if(useSql){
    const rows = sqlite.run(`SELECT id,name,created_at,updated_at FROM projects WHERE id='${esc(id)}'`)
    return Array.isArray(rows) && rows.length ? rows[0] : null
  }
  return storage.load(PROJECTS_KEY, []).find(p=>p.id===id) || null
}

export function saveArtifact(projectId, type, filename, content){
  const id = 'a_' + Date.now()
  const art = { id, project_id: projectId, type, filename, content, created_at: now() }
  if(useSql){
    const sql = `INSERT INTO artifacts (id,project_id,type,filename,content,created_at) VALUES ('${esc(art.id)}','${esc(art.project_id)}','${esc(art.type)}','${esc(art.filename)}','${esc(art.content)}','${esc(art.created_at)}')`;
    sqlite.exec(sql)
    // update project
    sqlite.exec(`UPDATE projects SET updated_at='${esc(now())}' WHERE id='${esc(projectId)}'`)
  }else{
    const artifacts = storage.load(ARTIFACTS_KEY, [])
    artifacts.push(art)
    storage.save(ARTIFACTS_KEY, artifacts)
    const projects = storage.load(PROJECTS_KEY, []).map(p=> p.id===projectId ? {...p, updated_at: now()} : p)
    storage.save(PROJECTS_KEY, projects)
  }
  return art
}

export function listArtifacts(projectId){
  if(useSql){
    const rows = sqlite.run(`SELECT id,project_id,type,filename,content,created_at FROM artifacts WHERE project_id='${esc(projectId)}'`)
    return Array.isArray(rows) ? rows : []
  }
  return storage.load(ARTIFACTS_KEY, []).filter(a=>a.project_id===projectId)
}

export function getArtifact(id){
  if(useSql){
    const rows = sqlite.run(`SELECT id,project_id,type,filename,content,created_at FROM artifacts WHERE id='${esc(id)}'`)
    return Array.isArray(rows) && rows.length ? rows[0] : null
  }
  return storage.load(ARTIFACTS_KEY, []).find(a=>a.id===id) || null
}

export default { initDb, createProject, listProjects, getProject, saveArtifact, listArtifacts, getArtifact }
