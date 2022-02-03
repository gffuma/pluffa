import { workerData, parentPort } from 'worker_threads'
import runStatik, { StatikRequest } from './runStatik.js'

async function statikWorker({
  statikPath,
  ...req
}: StatikRequest & { statikPath: string }) {
  const { default: registerStatik } = await import(statikPath)
  const data = await runStatik(req, registerStatik)
  parentPort!.postMessage(data)
}

statikWorker(workerData)
