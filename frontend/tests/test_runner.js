import storage from '../src/lib/storage.js'
import projectModel from '../src/models/projectModel.js'

const out = document.getElementById('results')
function ok(msg){ const el = document.createElement('div'); el.textContent = 'OK: ' + msg; el.style.color='green'; out.appendChild(el) }
function fail(msg){ const el = document.createElement('div'); el.textContent = 'FAIL: ' + msg; el.style.color='red'; out.appendChild(el) }

try{
  // storage test
  storage.save('__test__', {x:1})
  const v = storage.load('__test__')
  if(v && v.x===1) ok('storage save/load')
  else fail('storage save/load')

  // project model
  const p = projectModel.createProject('testproj')
  if(p && projectModel.listProjects().some(x=>x.id===p.id)) ok('project create/list')
  else fail('project create/list')

  const art = projectModel.saveArtifact(p.id, 'rtl', 'a.v', 'module a(); endmodule')
  if( projectModel.listArtifacts(p.id).length > 0 ) ok('artifact save/list')
  else fail('artifact save/list')
}catch(e){ fail('exception: ' + e.message) }
