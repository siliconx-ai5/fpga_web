// Minimal storage abstraction for MVP. Tries to use in-browser sql.js in future.
const STORAGE_PREFIX = 'fpga_web_v1:'

function key(k){ return STORAGE_PREFIX + k }

export function save(keyName, value){
  localStorage.setItem(key(keyName), JSON.stringify(value))
}

export function load(keyName, fallback=null){
  const v = localStorage.getItem(key(keyName))
  if(!v) return fallback
  try{ return JSON.parse(v) }catch(e){ return fallback }
}

export function remove(keyName){
  localStorage.removeItem(key(keyName))
}

export default { save, load, remove }
