import type { NodeConfig } from '@pluffa/node/config'
import type { CloudFlareWorkersConfig } from '@pluffa/cloudflare-workers/config'

// Allow meta "$schema" key in pluffa.json
interface OptionalSchemaURL {
  $schema?: string
}

// NOTE: Actually this doesn't work with shcema generator...
// type JustNonFunctionKeys<T> = {
//   [P in keyof T]: T[P] extends Function ? never : P
// }[keyof T]
// type ExcludeFunctions<T> = Pick<T, JustNonFunctionKeys<T>>

export type Config = (
  | Omit<
      NodeConfig,
      | 'experimentalConfigureWebpackClient'
      | 'experimentalConfigureWebpackServer'
    >
  | Omit<
      CloudFlareWorkersConfig,
      | 'experimentalConfigureWebpackClient'
      | 'experimentalConfigureWebpackWorker'
    >
) &
  OptionalSchemaURL
