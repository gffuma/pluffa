import fs from 'fs/promises'
import path from 'path'
import render from './render.js'
import ncpCB from 'ncp'
import util from 'util'
import { parse as parseHTML } from 'node-html-parser'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

const ncp = util.promisify(ncpCB)

interface ProcessContract {
  renderURL(url: string): Promise<string>
  saveFile(url: string, html: string): Promise<void>
}

function getPathFromUrl(url: string) {
  return url.split(/[?#]/)[0]
}

const AbsoluteURLRegex = new RegExp('^(?:[a-z]+:)?//', 'i')
function isUrlAbsolute(url: string) {
  return AbsoluteURLRegex.test(url)
}

async function processURL(url: string, config: ProcessContract) {
  console.log('-->', url)
  const { renderURL, saveFile } = config
  const html = await renderURL(url)
  const document = parseHTML(html)
  const urls = document
    .getElementsByTagName('a')
    .map((l) => l.attributes.href)
    .filter((url) => !isUrlAbsolute(url))
    .map((url) => getPathFromUrl(url))
  await saveFile(url, html)
  return urls
}

async function processURLs(
  urls: string[],
  config: ProcessContract
): Promise<void> {
  const queue: string[] = []

  const uniqeUrls = new Set<string>()
  function addToQueue(url: string) {
    if (!uniqeUrls.has(url)) {
      queue.push(url)
      uniqeUrls.add(url)
    }
  }

  urls.forEach(addToQueue)

  async function recursiveProcessURL(): Promise<void> {
    if (queue.length === 0) {
      return
    }
    const url = queue.pop()!
    const collectedUrls = await processURL(url, config)
    collectedUrls.forEach(addToQueue)
    return recursiveProcessURL()
  }

  return recursiveProcessURL()
}

export default async function staticize({
  outputDir = 'build',
  publicDir = 'public',
  compileNodeCommonJS = false,
}: {
  outputDir: string
  publicDir: string
  compileNodeCommonJS: boolean
}) {
  rimraf.sync(path.resolve(process.cwd(), outputDir))
  await ncp(
    path.resolve(process.cwd(), publicDir),
    path.resolve(process.cwd(), outputDir)
  )
  await ncp(
    path.resolve(process.cwd(), '.snext/client'),
    path.resolve(process.cwd(), outputDir)
  )
  const manifest = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), 'build', 'manifest.json'),
      'utf-8'
    )
  )

  const uniformExport = (o: any) => (compileNodeCommonJS ? o.default : o)

  const appPath = path.join(
    process.cwd(),
    '.snext/node',
    `App.${compileNodeCommonJS ? '' : 'm'}js`
  )
  const {
    default: App,
    getSkeletonProps,
    getStaticProps,
  } = await import(appPath).then(uniformExport)

  const skeletonPath = path.join(
    process.cwd(),
    '.snext/node',
    `Skeleton.${compileNodeCommonJS ? '' : 'm'}js`
  )
  const { default: Skeleton } = await import(skeletonPath).then(uniformExport)

  await processURLs(['/'], {
    async renderURL(url) {
      return render(
        {
          App,
          getSkeletonProps,
          getStaticProps,
          Skeleton,
        },
        {
          url,
          entrypoints: manifest.entrypoints,
        }
      )
    },
    async saveFile(url, html) {
      let filePath = path.join(outputDir, url)
      if (!filePath.endsWith('.html')) {
        mkdirp.sync(filePath)
        filePath = path.join(filePath, 'index.html')
      } else {
        mkdirp.sync(path.dirname(filePath))
      }
      await fs.writeFile(filePath, html)
    },
  })
}