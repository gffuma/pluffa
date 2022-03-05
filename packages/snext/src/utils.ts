import path from 'path'
import fs from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'

export function readLibPkgSync() {
  return JSON.parse(
    readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../package.json'
      ),
      'utf-8'
    )
  )
}

export async function getUserPkg() {
  return JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
  )
}

export function getUserPkgSync() {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  )
}

export function shouldUseTypescript() {
  return existsSync(path.resolve(process.cwd(), 'tsconfig.json'))
}

export function repeatString(n: number, str: string) {
  return Array.apply(null, { length: n } as any)
    .map((_) => str)
    .join('')
}