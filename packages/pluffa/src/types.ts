
export type Config =
  | {
      clientEntry: string
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
    }
  | {
      workerEntry: string
      runtime: 'cloudflare-workers'
      port: number
      clientEntry: string
      outputDir: string
      publicDir: string
      miniflareConfig?: Record<string, any>
    }
