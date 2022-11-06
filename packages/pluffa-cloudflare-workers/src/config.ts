import type { Configuration } from 'webpack'

// TODO: Improve note 100% correct should be a subset of webpack
// Configuration['entry']
type Entry = string | string[] | Record<string, any>

export type WebPackConfigMapper = (input: Configuration) => Configuration

export interface CloudFlareWorkersConfig {
  /**
   * Pluffa runtime.
   */
  runtime: 'cloudflare-workers'
  /**
   * Path to to your worker file.
   */
  workerEntry: string
  /**
   * @markdownDescription
   *
   * Client entry point, use the [webpack entry format](https://webpack.js.org/concepts/#entry).
   */
  clientEntry: Entry
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
   * Produce source for map for client code?
   *
   * Default to `true`.
   */
  clientSourceMap?: boolean
  /**
   * @markdownDescription
   *
   * Output directory of your worker runtime code.
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
   * @markdownDescription
   *
   * Inject extra [Miniflare](https://miniflare.dev/get-started/api) configuration.
   * Note this configs only effect yout dev environment.
   */
  miniflareConfig?: Record<string, any>
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
   * Map Webpack client configuration to desired configuration.
   */
  experimentalConfigureWebpackClient?: WebPackConfigMapper
  /**
   * Map Webpack worker configuration to desired configuration.
   */
  experimentalConfigureWebpackWorker?: WebPackConfigMapper
}

export type CloudFlareWorkersConfigDefaults = Required<
  Pick<
    CloudFlareWorkersConfig,
    | 'port'
    | 'runtime'
    | 'outputDir'
    | 'publicDir'
    | 'clientSourceMap'
    | 'useSwc'
    | 'compileClientNodeModules'
    | 'useHelpersForClientCode'
  >
>

export const CloudFlareWorkersConfigDefaultsValues: CloudFlareWorkersConfigDefaults =
  {
    port: 7000,
    runtime: 'cloudflare-workers',
    outputDir: 'build',
    publicDir: 'public',
    clientSourceMap: true,
    useSwc: false,
    compileClientNodeModules: true,
    useHelpersForClientCode: false,
  }

export type CloudFlareWorkersConfigWithDefaults = CloudFlareWorkersConfig &
  CloudFlareWorkersConfigDefaults
