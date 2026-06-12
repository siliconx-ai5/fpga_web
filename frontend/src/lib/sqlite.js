// Minimal sql.js integration wrapper.
// The database is stored as a base64 export in localStorage so sql.js data
// survives page refreshes without requiring a server.

let SQL = null
let db = null
let initialized = false
const DB_KEY = 'fpga_web_v1:sqlite_db'

function bytesToBase64(bytes){
  let binary = ''
  const chunkSize = 0x8000
  for(let i = 0; i < bytes.length; i += chunkSize){
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function base64ToBytes(value){
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for(let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function persist(){
  if(!initialized || !db) return false
  try{
    localStorage.setItem(DB_KEY, bytesToBase64(db.export()))
    return true
  }catch(e){
    console.warn('failed to persist sqlite database:', e)
    return false
  }
}

export async function init(){
  if(initialized) return initialized
  try{
    if(!window.initSqlJs){
      // load script dynamically
      await new Promise((res, rej)=>{
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js'
        s.onload = res
        s.onerror = rej
        document.head.appendChild(s)
      })
    }
    SQL = await window.initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` })
    const saved = localStorage.getItem(DB_KEY)
    db = saved ? new SQL.Database(base64ToBytes(saved)) : new SQL.Database()
    initialized = true
    return true
  }catch(e){
    console.warn('sql.js failed to load, falling back:', e)
    initialized = false
    return false
  }
}

export function exec(sql){
  if(!initialized || !db) return { error: 'sqlite not initialized' }
  try{
    const res = db.exec(sql)
    persist()
    return res
  }catch(e){
    return { error: e.message }
  }
}

export function run(sql, params=[]){
  if(!initialized || !db) return { error: 'sqlite not initialized' }
  try{
    const stmt = db.prepare(sql)
    stmt.bind(params)
    const out = []
    while(stmt.step()){
      out.push(stmt.getAsObject())
    }
    stmt.free()
    return out
  }catch(e){
    return { error: e.message }
  }
}

export function exportBinary(){
  if(!initialized || !db) return null
  const data = db.export()
  return data
}

export function save(){
  return persist()
}

export default { init, exec, run, exportBinary, save }
