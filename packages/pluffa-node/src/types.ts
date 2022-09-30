// TODO: Improve note 100% correct should be a subset of webpack
// Configuration['entry']
type Entry = string | string[] | Record<string, any>

export interface NodeConfig {
  runtime: 'node'
  /**
   * Client entry point, use the [webpack entry format](https://webpack.js.org/concepts/#entry).
   */
  clientEntry: Entry
  /**
   * Optional client entry point to use in production instead of `clientEntry`
   * option, use the [webpack entry format](https://webpack.js.org/concepts/#entry).
   */
  productionClientEntry?: Entry
  /**
   * The import compilation format of NodeJS code.
   *
   * Default to `'esm'`.
   */
  nodeModule: 'commonjs' | 'esm'
  /**
   * Produce source for map for client code?
   *
   * Default to `true`.
   */
  clientSourceMap: boolean
  /**
   * Produce source map for for client code in production?
   *
   * Override of `clientSourceMap`.
   */
  productionClientSourceMap?: boolean
  /**
   * Path to Skeleton React Component file.
   */
  skeletonComponent: string
  /**
   * Path to Server React Component file.
   */
  serverComponent: string
  /**
   * Http port of webserver.
   *
   * Default to `7000`.
   */
  port: number
  /**
   * Output direcotry of staticize command.
   *
   * Default to `'build'`.
   */
  outputDir: string
  /**
   * Public direcotry use to serve public files.
   *
   * Default to `'public'`.
   */
  publicDir: string
  /**
   * Urls to start the staticize process.
   *
   * Default to: `['/']`.
   */
  urls: string[]
  /**
   * Exit the staticize process when encounter an error?
   *
   * Default to `false`.
   */
  exitStaticizeOnError: boolean
  /**
   * Concurrency while staticize.
   *
   * Default to `4`.
   */
  crawlConcurrency: number
  /**
   * Enable crawl links when staticize?
   *
   * Default to `true`.
   */
  crawlEnabled: boolean
  /**
   * Path register statik file.
   */
  registerStatik?: string
  /**
   * Directory where exports the statik files when staticize.
   *
   * Default to `'data'`.
   */
  statikDataDir: string | false
  /**
   * Url of proxy.
   */
  proxy?: string
  /**
   * Url of proxy to use in production.
   *
   * NOTE: Default proxy IS DISABLE IN PRODUCTION.
   */
  productionProxy?: string
  /**
   * Should serve static assets in production?
   *
   * Default to `true`.
   */
  productionServeStaticAssets?: boolean
  /**
   * Should serve public assets in production?
   *
   * Defaults to `true`.
   */
  productionServePublicAssets?: boolean
  /**
   * Use the [SWC](https://swc.rs) Rust compiler instead of [Babel](https://babeljs.io) to speed
   * up code compilation.
   *
   * Default to `false`.
   */
  experimentalUseSwc?: boolean

  buildOutput?: 'standalone'
}
