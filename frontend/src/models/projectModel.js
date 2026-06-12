import storage from '../lib/storage.js'
import sqlite from '../lib/sqlite.js'

const PROJECTS_KEY = 'projects'
const ARTIFACTS_KEY = 'artifacts'
const RUNS_KEY = 'runs'

let useSql = false

function now(){ return new Date().toISOString() }

function esc(s){ return String(s).replace(/'/g, "''") }

function id(prefix){ return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}` }

function normalizeArtifactType(type){
  if(type === 'doc') return 'documentation'
  return type
}

export async function initDb(){
  const ok = await sqlite.init()
  if(!ok) return false
  sqlite.exec(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT
  );`)
  sqlite.exec(`CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    type TEXT NOT NULL,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`)
  sqlite.exec(`CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    status TEXT NOT NULL,
    summary TEXT,
    logs_json TEXT NOT NULL,
    waveform_json TEXT,
    assertions_json TEXT,
    created_at TEXT NOT NULL
  );`)
  useSql = true
  return true
}

export function createProject(name, description=''){
  const p = { id: id('p'), name: String(name || 'Untitled Project').trim(), description, created_at: now(), updated_at: now(), archived_at: null }
  if(useSql){
    const sql = `INSERT INTO projects (id,name,description,created_at,updated_at,archived_at) VALUES ('${esc(p.id)}','${esc(p.name)}','${esc(p.description)}','${esc(p.created_at)}','${esc(p.updated_at)}',NULL)`;
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
    const rows = sqlite.run('SELECT id,name,description,created_at,updated_at,archived_at FROM projects WHERE archived_at IS NULL ORDER BY updated_at DESC')
    return Array.isArray(rows) ? rows : []
  }
  return storage.load(PROJECTS_KEY, []).filter(p=>!p.archived_at).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)))
}

export function getProject(id){
  if(useSql){
    const rows = sqlite.run(`SELECT id,name,description,created_at,updated_at,archived_at FROM projects WHERE id='${esc(id)}'`)
    return Array.isArray(rows) && rows.length ? rows[0] : null
  }
  return storage.load(PROJECTS_KEY, []).find(p=>p.id===id) || null
}

export function renameProject(projectId, name){
  const updated = now()
  if(useSql){
    sqlite.exec(`UPDATE projects SET name='${esc(name)}', updated_at='${esc(updated)}' WHERE id='${esc(projectId)}'`)
    return getProject(projectId)
  }
  const projects = storage.load(PROJECTS_KEY, []).map(p=> p.id===projectId ? {...p, name, updated_at: updated} : p)
  storage.save(PROJECTS_KEY, projects)
  return getProject(projectId)
}

export function saveArtifact(projectId, type, filename, content, metadata={}){
  const created = now()
  const normalizedType = normalizeArtifactType(type)
  const art = {
    id: id('a'),
    project_id: projectId,
    type: normalizedType,
    filename,
    content,
    metadata_json: JSON.stringify(metadata || {}),
    created_at: created,
    updated_at: created
  }
  if(useSql){
    const sql = `INSERT INTO artifacts (id,project_id,type,filename,content,metadata_json,created_at,updated_at) VALUES ('${esc(art.id)}','${esc(art.project_id)}','${esc(art.type)}','${esc(art.filename)}','${esc(art.content)}','${esc(art.metadata_json)}','${esc(art.created_at)}','${esc(art.updated_at)}')`;
    sqlite.exec(sql)
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

export function updateArtifact(id, updates){
  const existing = getArtifact(id)
  if(!existing) return null
  const updated = {
    ...existing,
    ...updates,
    type: normalizeArtifactType(updates.type || existing.type),
    metadata_json: typeof updates.metadata_json === 'string'
      ? updates.metadata_json
      : updates.metadata
        ? JSON.stringify(updates.metadata)
        : existing.metadata_json,
    updated_at: now()
  }

  if(useSql){
    sqlite.exec(`UPDATE artifacts SET type='${esc(updated.type)}', filename='${esc(updated.filename)}', content='${esc(updated.content)}', metadata_json='${esc(updated.metadata_json || '')}', updated_at='${esc(updated.updated_at)}' WHERE id='${esc(id)}'`)
    sqlite.exec(`UPDATE projects SET updated_at='${esc(now())}' WHERE id='${esc(updated.project_id)}'`)
  }else{
    const artifacts = storage.load(ARTIFACTS_KEY, []).map(artifact=> artifact.id === id ? updated : artifact)
    storage.save(ARTIFACTS_KEY, artifacts)
    const projects = storage.load(PROJECTS_KEY, []).map(p=> p.id===updated.project_id ? {...p, updated_at: now()} : p)
    storage.save(PROJECTS_KEY, projects)
  }
  return updated
}

export function listArtifacts(projectId){
  if(useSql){
    const rows = sqlite.run(`SELECT id,project_id,type,filename,content,metadata_json,created_at,updated_at FROM artifacts WHERE project_id='${esc(projectId)}' ORDER BY created_at ASC`)
    return Array.isArray(rows) ? rows : []
  }
  return storage.load(ARTIFACTS_KEY, []).filter(a=>a.project_id===projectId).map(a=>({...a, type: normalizeArtifactType(a.type)}))
}

export function getArtifact(id){
  if(useSql){
    const rows = sqlite.run(`SELECT id,project_id,type,filename,content,metadata_json,created_at,updated_at FROM artifacts WHERE id='${esc(id)}'`)
    return Array.isArray(rows) && rows.length ? rows[0] : null
  }
  return storage.load(ARTIFACTS_KEY, []).find(a=>a.id===id) || null
}

export function latestArtifact(projectId, type){
  const targetType = normalizeArtifactType(type)
  const artifacts = listArtifacts(projectId)
    .filter(a=>a.type===targetType)
    .sort((a,b)=>String(a.updated_at || a.created_at).localeCompare(String(b.updated_at || b.created_at)))
  return artifacts.length ? artifacts[artifacts.length - 1] : null
}

export function saveRun(projectId, run){
  const created = now()
  const record = {
    id: id('r'),
    project_id: projectId,
    status: run.status,
    summary: run.summary || '',
    logs: run.logs || [],
    waveform: run.waveform || null,
    assertions: run.assertions || [],
    created_at: created
  }
  if(useSql){
    sqlite.exec(`INSERT INTO runs (id,project_id,status,summary,logs_json,waveform_json,assertions_json,created_at) VALUES ('${esc(record.id)}','${esc(record.project_id)}','${esc(record.status)}','${esc(record.summary)}','${esc(JSON.stringify(record.logs))}','${esc(JSON.stringify(record.waveform))}','${esc(JSON.stringify(record.assertions))}','${esc(record.created_at)}')`)
    sqlite.exec(`UPDATE projects SET updated_at='${esc(now())}' WHERE id='${esc(projectId)}'`)
  }else{
    const runs = storage.load(RUNS_KEY, [])
    runs.push(record)
    storage.save(RUNS_KEY, runs)
  }
  return record
}

export function listRuns(projectId){
  if(useSql){
    const rows = sqlite.run(`SELECT id,project_id,status,summary,logs_json,waveform_json,assertions_json,created_at FROM runs WHERE project_id='${esc(projectId)}' ORDER BY created_at ASC`)
    if(!Array.isArray(rows)) return []
    return rows.map(row=>({
      id: row.id,
      project_id: row.project_id,
      status: row.status,
      summary: row.summary,
      logs: JSON.parse(row.logs_json || '[]'),
      waveform: JSON.parse(row.waveform_json || 'null'),
      assertions: JSON.parse(row.assertions_json || '[]'),
      created_at: row.created_at
    }))
  }
  return storage.load(RUNS_KEY, []).filter(r=>r.project_id===projectId)
}

export function latestRun(projectId){
  const runs = listRuns(projectId)
  return runs.length ? runs[runs.length - 1] : null
}

export default {
  initDb,
  createProject,
  renameProject,
  listProjects,
  getProject,
  saveArtifact,
  updateArtifact,
  listArtifacts,
  getArtifact,
  latestArtifact,
  saveRun,
  listRuns,
  latestRun
}
