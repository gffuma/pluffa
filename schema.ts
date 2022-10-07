import type { NodeConfig } from '@pluffa/node/config'
import type { CloudFlareWorkersConfig } from '@pluffa/cloudflare-workers/config'

// Allow meta "$schema" key in pluffa.json
interface OptionalSchemaURL {
  $schema?: string
}

export type Config = (NodeConfig | CloudFlareWorkersConfig) & OptionalSchemaURL
