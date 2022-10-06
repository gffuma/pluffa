// TODO: Improve note 100% correct should be a subset of webpack
// Configuration['entry']
type Entry = string | string[] | Record<string, any>

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
  experimentalUseSwc?: boolean
}
