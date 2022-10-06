export type CommandName = 'dev' | 'build' | 'staticize' | 'start'

export const PLUFFA_RUNTIMES = ['node', 'cloudflare-workers'] as const

export type PluffaRutimes = typeof PLUFFA_RUNTIMES[number]

type MakeRuntimeConfig<U> = U extends any
  ? { runtime: U; [key: string]: any }
  : never

export type MinimalConfig = MakeRuntimeConfig<PluffaRutimes>
