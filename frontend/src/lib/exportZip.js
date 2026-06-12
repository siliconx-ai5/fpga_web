import projectModel from '../models/projectModel.js'

export async function exportProjectZip(projectId){
  const project = projectModel.getProject(projectId)
  if(!project) throw new Error('Project not found')
  const artifacts = projectModel.listArtifacts(projectId)
  if(!window.JSZip) throw new Error('JSZip not available')
  const zip = new window.JSZip()
  zip.file('project.json', JSON.stringify(project, null, 2))
  const artifactsFolder = zip.folder('artifacts')
  artifacts.forEach(a=> artifactsFolder.file(a.filename, a.content))
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g,'_')}_${project.id}.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default { exportProjectZip }
