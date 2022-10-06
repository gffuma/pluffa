import type { NodeConfig } from '@pluffa/node/config'
import type { CloudFlareWorkersConfig } from '@pluffa/cloudflare-workers/config'

export type Config = NodeConfig | CloudFlareWorkersConfig
