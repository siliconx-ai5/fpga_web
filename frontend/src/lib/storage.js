// Minimal storage abstraction for MVP. Tries to use in-browser sql.js in future.
const STORAGE_PREFIX = 'fpga_web_v1:'

function key(k){ return STORAGE_PREFIX + k }

function checkStorageAvailable(){
  try{
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  }catch(e){
    console.error('localStorage not available:', e)
    return false
  }
}

export function save(keyName, value){
  if(!checkStorageAvailable()){
    console.warn('Storage unavailable, data will not persist')
    return false
  }
  try{
    localStorage.setItem(key(keyName), JSON.stringify(value))
    return true
  }catch(e){
    console.error('Failed to save to localStorage:', e)
    if(e.name === 'QuotaExceededError'){
      alert('Storage quota exceeded. Please export your projects and clear old data.')
    }
    return false
  }
}

export function load(keyName, fallback=null){
  if(!checkStorageAvailable()) return fallback
  try{
    const v = localStorage.getItem(key(keyName))
    if(!v) return fallback
    return JSON.parse(v)
  }catch(e){
    console.error('Failed to load from localStorage:', e)
    return fallback
  }
}

export function remove(keyName){
  if(!checkStorageAvailable()) return false
  try{
    localStorage.removeItem(key(keyName))
    return true
  }catch(e){
    console.error('Failed to remove from localStorage:', e)
    return false
  }
}

export default { save, load, remove }
