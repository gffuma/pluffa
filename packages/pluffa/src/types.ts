// TODO: Improve note 100% correct should be a subset of webpack
// Configuration['entry']
type Entry = string | string[] | Record<string, any>

export type Config =
  | {
      clientEntry: Entry
      productionClientEntry?: Entry
      clientSourceMap?: boolean,
      productionClientSourceMap?: boolean,
      skeletonComponent: string
      serverComponent: string
      runtime: 'node'
      nodeModule: 'commonjs' | 'esm'
      port: number
      outputDir: string
      publicDir: string
      urls: string[]
      exitStaticizeOnError: boolean
      crawlConcurrency: number
      crawlEnabled: boolean
      statikDataDir: string | false
      registerStatik?: string
      proxy?: string
      productionProxy?: string
      productionServeStaticAssets?: boolean
      productionServePublicAssets?: boolean
      experimentalUseSwc?: boolean
    }
  | {
      workerEntry: string
      runtime: 'cloudflare-workers'
      port: number
      clientEntry: Entry
      clientSourceMap?: boolean,
      productionClientSourceMap?: boolean,
      productionClientEntry?: Entry
      outputDir: string
      publicDir: string
      miniflareConfig?: Record<string, any>
      experimentalUseSwc?: boolean
    }
