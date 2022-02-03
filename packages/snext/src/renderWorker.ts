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
  const {
    default: App,
    getStaticProps,
    getSkeletonProps,
  } = await import(appPath)
  const { default: Skeleton } = await import(skeletonPath)

  const html = await render(
    {
      App,
      getStaticProps,
      getSkeletonProps,
      Skeleton,
    },
    { url, entrypoints }
  )
  parentPort!.postMessage(html)
}

renderWorker(workerData)
