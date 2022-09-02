import { MultiStats } from 'webpack'

export function getFlatEntrypointsFromWebPackStats(
  stats: MultiStats,
  name: string
) {
  const deStats = stats.stats.find((c) => c.compilation.name === name)
  if (!deStats) {
    throw new Error(`Invalid webpack config name ${name}`)
  }
  const flatty: Record<string, string[]> = {}
  for (const chunk of deStats.compilation.chunks) {
    for (const file of chunk.files) {
      if (!chunk.name) continue
      if (flatty[chunk.name] === undefined) {
        flatty[chunk.name] = []
      }
      // NOTE: This files are usually used as scriptas
      // to bootstrap the server side rendering
      // but sometimes also hot module replacements updates are
      // listed here.
      // The are no clear way to grab only the "critial" assets
      // to bootstrap the app, this updates caused strange bugs while
      // pluffa is in dev mode so for now siply use the file suffix to skipe them.
      if (!file.endsWith('.hot-update.js')) {
        flatty[chunk.name].push(file)
      }
    }
  }
  return flatty
}
