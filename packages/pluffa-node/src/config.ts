import type { Configuration } from 'webpack'

// TODO: Improve note 100% correct should be a subset of webpack
// Configuration['entry']
type Entry = string | string[] | Record<string, any>

export type WebPackConfigMapper = (input: Configuration) => Configuration

export interface NodeConfig {
  /**
   * Pluffa runtime.
   */
  runtime: 'node'
  /**
   * @markdownDescription
   *
   * Client entry point, use the [webpack entry format](https://webpack.js.org/concepts/#entry).
   */
  clientEntry: Entry
  /**
   * Path to Skeleton React Component file.
   */
  skeletonComponent: string
  /**
   * Path to Server React Component file.
   */
  serverComponent: string
  /**
   * @markdownDescription
   *
   * The import compilation format of NodeJS code.
   *
   * Default to `'esm'`.
   */
  nodeModule?: 'commonjs' | 'esm'
  /**
   * Produce source for map for client code?
   *
   * Default to `true`.
   */
  clientSourceMap?: boolean
  /**
   * @markdownDescription
   *
   * Http port of webserver.
   *
   * Default to `7000`.
   */
  port?: number
  /**
   * @markdownDescription
   *
   * Output direcotry of staticize command.
   *
   * Default to `'build'`.
   */
  outputDir?: string
  /**
   * @markdownDescription
   *
   * Public direcotry used to serve public files.
   * Set `false` to disable serving public files.
   *
   * Default to `'public'`.
   */
  publicDir?: string | false
  /**
   * Should serve static assets on production server?
   *
   * Default to `true`.
   */
  serveStaticAssets?: boolean
  /**
   * @markdownDescription
   *
   * Urls to start the staticize process.
   *
   * Default to: `['/']`.
   */
  urls?: string[]
  /**
   * Exit the staticize process when encounter an error?
   *
   * Default to `false`.
   */
  exitStaticizeOnError?: boolean
  /**
   * @markdownDescription
   *
   * Concurrency while staticize.
   *
   * Default to `4`.
   */
  crawlConcurrency?: number
  /**
   * @markdownDescription
   *
   * Enable crawl links when staticize?
   *
   * Default to `true`.
   */
  crawlEnabled?: boolean
  /**
   * Path of statik handler file.
   */
  statikHandler?: string
  /**
   * @markdownDescription
   *
   * Directory where exports the statik files when staticize.
   *
   * Default to `'data'`.
   */
  statikDataDir?: string | false
  /**
   * @markdownDescription
   *
   * If specified Pluffa will use the given URL as proxy.
   * Util for avoiding CORS problems in development.
   *
   * **IMPORTANT**:
   * By default the proxy is not enabled when running the server
   * in production mode by running the `start` command.
   * If you really you want to use a proxy in production mode set
   * `useProxyInProd` to `true`.
   */
  proxy?: string
  /**
   * Use proxy in the production server?
   * Default to `false`.
   */
  useProxyInProd?: boolean
  /**
   * @markdownDescription
   *
   * Use the [SWC](https://swc.rs) Rust compiler instead of [Babel](https://babeljs.io) to speed
   * up code compilation.
   *
   * Default to `false`.
   */
  useSwc?: boolean
  /**
   * @markdownDescription
   *
   * Should compile `node_modules` for client code?
   *
   * Default to `true`.
   */
  compileClientNodeModules?: boolean
  /**
   * @markdownDescription
   *
   * Use external helpers package when compiling client code?
   *
   * - Install `@babel/runtime` for Babel.
   * - Install `@swc/helpers` for SWC.
   *
   * Default to `false`.
   */
  useHelpersForClientCode?: boolean
  /**
   * @markdownDescription
   *
   * Use `'standalone'` to export a standalone version of Pluffa Node
   * util for ship it in a container environment.
   */
  experimentalBuildOutput?: 'standalone'
  /**
   * Map Webpack client configuration to desired configuration.
   */
  experimentalConfigureWebpackClient?: WebPackConfigMapper
  /**
   * Map Webpack server configuration to desired configuration.
   */
  experimentalConfigureWebpackServer?: WebPackConfigMapper
}

export type NodeConfigDefaults = Required<
  Pick<
    NodeConfig,
    | 'port'
    | 'runtime'
    | 'outputDir'
    | 'publicDir'
    | 'clientSourceMap'
    | 'useSwc'
    | 'nodeModule'
    | 'urls'
    | 'crawlConcurrency'
    | 'statikDataDir'
    | 'exitStaticizeOnError'
    | 'crawlEnabled'
    | 'serveStaticAssets'
    | 'useHelpersForClientCode'
    | 'compileClientNodeModules'
  >
>

export const NodeConfigDefaultsValues: NodeConfigDefaults = {
  port: 7000,
  runtime: 'node',
  nodeModule: 'esm',
  outputDir: 'build',
  publicDir: 'public',
  urls: ['/'],
  crawlConcurrency: 4,
  statikDataDir: 'data',
  exitStaticizeOnError: false,
  crawlEnabled: true,
  serveStaticAssets: true,
  clientSourceMap: true,
  useSwc: false,
  useHelpersForClientCode: false,
  compileClientNodeModules: true,
}

export type NodeConfigWithDefaults = NodeConfig & NodeConfigDefaults
