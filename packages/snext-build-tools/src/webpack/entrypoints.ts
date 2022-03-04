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
    flat[name] = entrypoints[name].assets?.map((a) => a.name) ?? []
    return flat
  }, {} as Record<string, string[]>)
}
