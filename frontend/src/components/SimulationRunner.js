import simulator from '../lib/simulator/index.js'
import notify from '../lib/notify.js'
import openaiClient from '../lib/openaiClient.js'
import projectModel from '../models/projectModel.js'

export async function executeSimulation({ projectId, rtlArtifact, testbenchArtifact, onProgress }){
  Promise.race([
    notify.requestPermission(),
    new Promise(resolve=>setTimeout(resolve, 500))
  ]).catch(()=>{})
  const result = await simulator.runSimulation(rtlArtifact.content, testbenchArtifact?.content || '', onProgress)
  const savedRun = projectModel.saveRun(projectId, result)
  notify.notify('Simulation finished', result.summary || result.status)

  let debugArtifact = null
  if(result.status === 'failed'){
    try{
      const suggestions = await openaiClient.debugSuggestions(
        rtlArtifact.content,
        testbenchArtifact?.content || '',
        result.logs.join('\n')
      )
      debugArtifact = projectModel.saveArtifact(projectId, 'debug_suggestions', `debug_${Date.now()}.md`, suggestions, {
        runId: savedRun.id
      })
    }catch(e){
      debugArtifact = projectModel.saveArtifact(projectId, 'debug_suggestions', `debug_${Date.now()}.md`, `### Debug Suggestions\n\nUnable to call AI debug service: ${e.message}`, {
        runId: savedRun.id
      })
    }
  }

  return { result, savedRun, debugArtifact }
}

export default { executeSimulation }
