import { StatsCompilation } from 'webpack'

export function getFlatEntrypointsFromWebPackStats(
  stats: StatsCompilation,
  name: string
) {
  const deStats = stats.children?.find((c) => c.name === name)
  if (!deStats) {
    throw new Error(`Invalid webpack config name ${name}`)
  }
  const entrypoints = deStats.entrypoints ?? {}
  return Object.keys(entrypoints).reduce((flat, name) => {
    flat[name] = (entrypoints[name].assets?.map((a) => a.name) ?? [])
      // NOTE: This files are usually used as scriptas
      // to bootstrap the server side rendering
      // but sometimes also hot module replacements updates are
      // listed as "entrypoints" file names.
      // The are no clear way to grab only the "critial" assets
      // to bootstrap the app, this updates caused strange bugs while
      // pluffa is in dev mode so for now siply use the file suffix to skipe them.
      .filter((name) => !name.endsWith('.hot-update.js'))

    return flat
  }, {} as Record<string, string[]>)
}
