import type { Stream, Duplex } from 'node:stream'

declare module 'stream' {
  declare function compose(...streams: Stream[]): Duplex
}