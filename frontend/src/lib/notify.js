export async function requestPermission(){
  if('Notification' in window && Notification.permission !== 'granted'){
    return Notification.requestPermission()
  }
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

export function notify(title, body){
  if('Notification' in window && Notification.permission === 'granted'){
    try{ new Notification(title, { body }) }catch(e){ console.warn('notify failed', e) }
    return true
  } else {
    return false
  }
}

export default { requestPermission, notify }
