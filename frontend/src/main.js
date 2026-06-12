import './styles.css'

import { renderProjectList } from './pages/ProjectList.js'
import { renderProjectView } from './pages/ProjectView.js'
import { renderApiKeyManager } from './components/ApiKeyManager.js'

const app = document.getElementById('app')

app.innerHTML = `
  <main class="min-h-screen bg-slate-50 p-6">
    <div class="grid grid-cols-4 gap-6">
      <div id="left" class="col-span-1"></div>
      <div id="main" class="col-span-3"></div>
    </div>
  </main>
`

const left = document.getElementById('left')
const main = document.getElementById('main')

function openProject(id){ renderProjectView(main, id) }

renderProjectList(left, openProject)
renderApiKeyManager(left)

// show empty main
main.innerHTML = `<div class="p-4 bg-white rounded shadow">Select or create a project to begin.</div>`

export default app
