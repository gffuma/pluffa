import { createRequire } from 'module'
import path from 'path'
import importVm from './importVm'

const require = createRequire(import.meta.url)

export interface HotModule<T = any> {
  readonly name: string
  lastError: any
  get(): Promise<T>
  refresh(): void
}

export function createHotModule<T>(
  buildDir: string,
  nameNoExt: string,
  compileNodeCommonJS: boolean
): HotModule<T>

export function createHotModule(
  buildDir: string,
  nameNoExt: string,
  compileNodeCommonJS: boolean
): HotModule {
  let promiseRunTime: Promise<{
    value: any
    isError: boolean
  }>

  const name = nameNoExt + (compileNodeCommonJS ? '.js' : '.mjs')
  const correctPathForNodeMode = path.join(buildDir, name)
  let lastErrorValue: any = null

  const getFreshModule = compileNodeCommonJS
    ? async () => {
        delete require.cache[require.resolve(correctPathForNodeMode)]
        return require(correctPathForNodeMode)
      }
    : async () => importVm(correctPathForNodeMode)

  function refresh() {
    lastErrorValue = null
    promiseRunTime = getFreshModule().then(
      (value) => ({
        value,
        isError: false,
      }),
      (value) => {
        lastErrorValue = value
        return {
          value,
          isError: true,
        }
      }
    )
  }

  async function get() {
    if (!promiseRunTime) {
      refresh()
    }
    const out = await promiseRunTime
    if (out.isError) {
      throw out.value
    }
    return out.value
  }

  return {
    name,
    get,
    refresh,
    get lastError() {
      return lastErrorValue
    },
  }
}
