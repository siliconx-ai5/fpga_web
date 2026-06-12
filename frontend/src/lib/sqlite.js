// Minimal sql.js integration wrapper for MVP.
// Attempts to load sql.js from CDN and create an in-memory DB.
// If loading fails, the wrapper falls back to a no-op interface.

let SQL = null
let db = null
let initialized = false

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
    db = new SQL.Database()
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

export default { init, exec, run, exportBinary }
