import './styles.css'

import { renderProjectList } from './pages/ProjectList.js'
import { renderProjectView } from './pages/ProjectView.js'
import { renderApiKeyManager } from './components/ApiKeyManager.js'
import projectModel from './models/projectModel.js'

const app = document.getElementById('app')

app.innerHTML = `
  <main class="min-h-screen bg-slate-50 p-4 md:p-6">
    <header class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-800">FPGA Web Tool</h1>
      <p class="text-sm text-slate-600 mt-1">Mock FPGA design tool with AI assistance</p>
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
      <aside id="left" class="lg:col-span-1 space-y-4"></aside>
      <section id="main" class="lg:col-span-3"></section>
    </div>
  </main>
`

const left = document.getElementById('left')
const main = document.getElementById('main')

function openProject(id){ renderProjectView(main, id) }

renderProjectList(left, openProject)
renderApiKeyManager(left)

// initialize sqlite in background (if available)
projectModel.initDb().then(ok=>{
  if(ok) console.log('sqlite initialized and ready')
  else console.log('sqlite not available; using localStorage fallback')
})

// show empty main
main.innerHTML = `<div class="p-4 bg-white rounded shadow">Select or create a project to begin.</div>`

export default app
