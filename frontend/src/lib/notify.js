export function requestPermission(){
  if('Notification' in window && Notification.permission !== 'granted'){
    Notification.requestPermission()
  }
}

export function notify(title, body){
  if('Notification' in window && Notification.permission === 'granted'){
    try{ new Notification(title, { body }) }catch(e){ console.warn('notify failed', e) }
  } else {
    // fallback UI
    alert(title + '\n' + body)
  }
}

export default { requestPermission, notify }
