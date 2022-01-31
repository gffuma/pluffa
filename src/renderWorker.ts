// Is just fantasy? No this seems the more reasonable workaround to support
// ESM hot reloading

import { workerData, parentPort } from 'worker_threads'
import render, { SnextProps } from './render.js'

async function renderWorker({
  appPath,
  skeletonPath,
  url,
  entrypoints,
}: {
  appPath: string
  skeletonPath: string
} & SnextProps) {
  const { default: App } = await import(appPath)
  const { default: Skeleton } = await import(skeletonPath)

  const html = await render(
    {
      App,
      Skeleton,
    },
    { url, entrypoints }
  )
  parentPort!.postMessage(html)
}

renderWorker(workerData)
