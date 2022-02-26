import path from 'path'
import { existsSync, readFileSync } from 'fs'

export function B<T>(
  value: T
): value is Exclude<T, false | null | undefined | '' | 0> {
  return Boolean(value)
}

interface FoundPkg {
  content: any
  path: string
}

function findPkgInPath(request: string, modulePath: string): FoundPkg | false {
  let search = path.join(modulePath, request)
  if (path.extname(search)) {
    search = path.dirname(search)
  }

  while (search !== modulePath) {
    const pkgPath = path.join(search, 'package.json')
    if (existsSync(pkgPath)) {
      return {
        content: JSON.parse(readFileSync(pkgPath, 'utf-8')),
        path: pkgPath,
      }
    }
    search = path.dirname(search)
  }

  return false
}

export function findPkgJson(
  request: string,
  modulesPaths: string[]
): FoundPkg | false {
  for (let modulePath of modulesPaths) {
    const pkg = findPkgInPath(request, modulePath)
    if (pkg !== false) {
      return pkg
    }
  }
  return false
}