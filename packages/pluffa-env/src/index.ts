import path from 'path'
import dotenv from 'dotenv'

export function setUpEnvOnFiles(relativeFileList: string[]) {
  for (const relativeFile of relativeFileList) {
    dotenv.config({
      path: path.join(process.cwd(), relativeFile),
    })
  }
}

export function setUpEnv({ isProd }: { isProd: boolean }) {
  if (isProd) {
    setUpEnvOnFiles([
      '.env.production.local',
      '.env.local',
      '.env.production',
      '.env',
    ])
  } else {
    setUpEnvOnFiles([
      '.env.development.local',
      '.env.local',
      '.env.development',
      '.env',
    ])
  }
}
