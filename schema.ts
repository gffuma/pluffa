import type { NodeConfig } from '@pluffa/node/types'
import type { CloudFlareWorkersConfig } from '@pluffa/cloudflare-workers/types'

export type Config = NodeConfig | CloudFlareWorkersConfig
