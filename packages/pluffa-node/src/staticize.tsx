import sourceMap from 'source-map-support'
import fs from 'fs/promises'
import path from 'path'
import ncpCB from 'ncp'
import util from 'util'
import { parse as parseHTML } from 'node-html-parser'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import chalk from 'chalk'
import PQueue from 'p-queue'
import {
  renderAsyncToString,
  AbortRenderingError,
  RenderOptions,
} from '@pluffa/node-render'
import { CrawlSession, createCrawlSession, CrawlContext } from '@pluffa/crawl'
import type { StatikHandler } from '@pluffa/statik/runtime'
import {
  SkeletonComponent,
  ServerComponent,
  BundleInformation,
  InstructResponse,
  SSRProvider,
  SSRContextType,
} from '@pluffa/ssr'
import type { GetServerData } from './types'
import createRequest from './createRequest'
import { NodeRequestWrapper } from './httpWrappers'
import { Request } from 'express'

const ncp = util.promisify(ncpCB)

interface ProcessContract {
  exitOnError: boolean
  crawlEnabled: boolean
  renderURL(url: string): Promise<[string, string[]]>
  saveFile(url: string, html: string): Promise<void>
  signal?: AbortSignal
}

function getPathFromUrl(url: string) {
  return url.split(/[?#]/)[0]
}

const AbsoluteURLRegex = new RegExp('^(?:[a-z]+:)?//', 'i')
function isUrlAbsolute(url: string) {
  return AbsoluteURLRegex.test(url)
}

async function processURL(url: string, config: ProcessContract) {
  console.log(chalk.bold.cyan(url))
  const { renderURL } = config
  try {
    const [html, urls] = await renderURL(url)
    if (config.crawlEnabled) {
      const document = parseHTML(html)
      document
        .getElementsByTagName('a')
        .map((l) => l.attributes.href)
        .filter((url) => !isUrlAbsolute(url))
        .forEach((url) => urls.push(getPathFromUrl(url)))
      document
        .querySelectorAll('[data-crawl-url]')
        .map((l) => l.attributes['data-crawl-url'])
        .filter((url) => !isUrlAbsolute(url))
        .forEach((url) => urls.push(getPathFromUrl(url)))
    }
    return { sourceUrl: url, html, success: true, urls }
  } catch (error) {
    if (!(error instanceof AbortRenderingError)) {
      console.log(chalk.bold.red(`⚠️  ${url}`))
      console.log(chalk.red('Error during rendering'))
      console.error(error)
      if (config.exitOnError) {
        process.exit(1)
      }
    }
    return { sourceUrl: url, success: false, urls: [], html: null }
  }
}

type ProcessedUrlOutput = Awaited<ReturnType<typeof processURL>>

async function processURLs(
  urls: string[],
  concurrency: number,
  config: ProcessContract
) {
  const { signal, saveFile } = config
  const queue = new PQueue({ concurrency })
  const uniqeUrls = new Set<string>()
  const succededUrls: string[] = []
  const failedUrls: string[] = []

  function enqueueUrl(url: string) {
    if (!uniqeUrls.has(url)) {
      uniqeUrls.add(url)
      queue.add(() => processURL(url, config))
    }
  }

  queue.on(
    'completed',
    async ({ urls, success, sourceUrl, html }: ProcessedUrlOutput) => {
      urls.forEach((url) => enqueueUrl(url))
      if (success) {
        succededUrls.push(sourceUrl)
        await saveFile(sourceUrl, html!)
      } else {
        failedUrls.push(sourceUrl)
      }
    }
  )

  urls.forEach((url) => enqueueUrl(url))
  if (signal) {
    const abortPromise = new Promise((resolve) => {
      signal.addEventListener(
        'abort',
        () => {
          console.log('ABOORT!')
          queue.removeAllListeners()
          queue.clear()
          resolve(null)
        },
        {
          once: true,
        }
      )
    })
    await Promise.race([queue.onIdle(), abortPromise])
  } else {
    await queue.onIdle()
  }

  return {
    succededUrls,
    failedUrls,
  }
}

function informMissingBuildStep() {
  console.error(
    chalk.red(
      'Pluffa.js error you need to build your project before run staticize.\n'
    )
  )
}

function handleImportError(err: any): never {
  if (err.code === 'ERR_MODULE_NOT_FOUND') {
    informMissingBuildStep()
  }
  throw err
}

function handleFileNotFoundError(err: any): never {
  if (
    Array.isArray(err)
      ? err.some((e) => e.code === 'ENOENT')
      : err.code === 'ENOENT'
  ) {
    informMissingBuildStep()
  }
  throw err
}

// TODO: Implement better ... and move ...
class InstructStaticizeResponse implements InstructResponse {
  _status: number
  _headers: Record<string, string>

  constructor() {
    this._status = 200
    this._headers = {}
  }

  status(code: number) {
    this._status = code
  }

  getStatus() {
    return this._status
  }

  getHeaders() {
    return this._headers
  }

  setHeader(name: string, value: string) {
    this._headers[name] = value
  }

  getHeader(name: string) {
    return this._headers[name]
  }
}

export interface StaticizeConfig {
  outputDir: string
  publicDir: string | false
  compileNodeCommonJS: boolean
  urls: string[]
  crawlConcurrency: number
  crawlEnabled: boolean
  statikEnabled: boolean
  statikDataDir: string | false
  exitOnError: boolean
  signal?: AbortSignal
}

export default async function staticize({
  outputDir,
  publicDir,
  compileNodeCommonJS,
  urls,
  crawlConcurrency,
  statikDataDir,
  signal,
  statikEnabled = false,
  crawlEnabled = true,
  exitOnError = false,
}: StaticizeConfig) {
  sourceMap.install()

  const outPath = path.resolve(process.cwd(), outputDir)
  const buildPath = path.join(process.cwd(), '.pluffa')
  const buildClientPath = path.join(buildPath, 'client')
  const buildNodePath = path.join(buildPath, 'node')
  const buildImportExt = `${compileNodeCommonJS ? '' : 'm'}js`

  try {
    // Remove stale ourput
    rimraf.sync(outPath)
    // Copy public (unless disabled)
    if (publicDir !== false) {
      const publicPath = path.resolve(process.cwd(), publicDir)
      await ncp(publicPath, outPath)
    }
    // Copy static from builded client
    await ncp(
      path.join(buildClientPath, 'static'),
      path.join(outPath, 'static')
    )
  } catch (err) {
    handleFileNotFoundError(err)
  }

  // Read build manifest
  const manifest = JSON.parse(
    await fs
      .readFile(path.join(buildClientPath, 'manifest.json'), 'utf-8')
      .catch(handleFileNotFoundError)
  )
  const bundle: BundleInformation = {
    entrypoints: manifest.entrypoints,
    buildPath,
  }

  // Unifrom ESM vs CommonJS
  const uniformExport = (o: any) => (compileNodeCommonJS ? o.default : o)

  // Configure Statik
  if (statikEnabled) {
    // NOTE: We Inject the current user code for registerStatik
    // to inject into the correct version CommonJS vs ESM
    // we also import the correct version of statik runtime
    const getStatikRunTime: () => Promise<{
      configureStatikDataDir(dataDir: string): void
      configureStatikHandler(register: StatikHandler): void
    }> = compileNodeCommonJS
      ? async () => require('@pluffa/statik/runtime')
      : async () => await import('@pluffa/statik/runtime')

    const { configureStatikHandler, configureStatikDataDir } =
      await getStatikRunTime()

    const { default: statikHandler } = await import(
      path.join(buildNodePath, `statik.${buildImportExt}`)
    )
      .catch(handleImportError)
      .then(uniformExport)

    configureStatikHandler(statikHandler)
    if (statikDataDir !== false) {
      configureStatikDataDir(path.resolve(outPath, statikDataDir))
    }
  }

  const serverPath = path.join(buildNodePath, `Server.${buildImportExt}`)
  const { default: Server, getServerData } = (await import(serverPath)
    .catch(handleImportError)
    .then(uniformExport)) as {
    default: ServerComponent
    getServerData?: GetServerData
  }

  const skeletonPath = path.join(buildNodePath, `Skeleton.${buildImportExt}`)
  const { default: Skeleton } = (await import(skeletonPath)
    .catch(handleImportError)
    .then(uniformExport)) as { default: SkeletonComponent }

  const { succededUrls, failedUrls } = await processURLs(
    urls,
    crawlConcurrency,
    {
      exitOnError,
      crawlEnabled,
      signal,
      async renderURL(url) {
        let WrappedServer = Server
        let crawlSess: CrawlSession
        if (crawlEnabled) {
          crawlSess = createCrawlSession()
          WrappedServer = () => (
            <CrawlContext.Provider value={crawlSess}>
              <Server />
            </CrawlContext.Provider>
          )
        }
        const request = new NodeRequestWrapper(createRequest({ url }))
        const response = new InstructStaticizeResponse()
        const ssrCtx: SSRContextType<Request> = {
          bundle,
          request,
          response,
        }
        let providedRenderOptions: RenderOptions | undefined
        if (getServerData) {
          const { data, ...passDownRenderOptions } = await getServerData({
            bundle,
            request,
            response,
            mode: 'staticizer',
          })
          ssrCtx.data = data
          providedRenderOptions = passDownRenderOptions
        }
        const html = await renderAsyncToString(
          <SSRProvider
            value={{
              ...ssrCtx,
              Server: WrappedServer,
            }}
          >
            <Skeleton />
          </SSRProvider>,
          {
            ...providedRenderOptions,
            stopOnError: true,
            mode: 'seo',
          },
          signal
        )
        let urls: string[] = []
        if (crawlEnabled) {
          urls = await crawlSess!.rewind()
        }
        return [html, urls]
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
    }
  )
  console.log()
  if (failedUrls.length === 0) {
    console.log(chalk.green('WoW all site staticized!'))
  } else {
    console.log(chalk.red('Wops! Some urls fails to staticized ....'))
  }
  console.log()
  console.log('Success:' + '  ' + chalk.green.bold(succededUrls.length))
  if (failedUrls.length > 0) {
    console.log('Failed:' + '   ' + chalk.red.bold(failedUrls.length))
    console.log()
    console.log(chalk.red('Urls failed:'))
    failedUrls.forEach((url) => {
      console.log(chalk.red(url))
    })
  }
}
