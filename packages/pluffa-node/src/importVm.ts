import vm from 'vm'
import { readFile } from 'fs/promises'

export default async function importVm(path: string) {
  const content = await readFile(path, 'utf-8')
  const mod = new vm.SourceTextModule(content, {
    identifier: path,
    initializeImportMeta(meta) {
      meta.url = path
    },
  })

  await mod.link(async (specifier: any, referencingModule: any) => {
    return new Promise(async (resolve, reject) => {
      const deModule = await import(specifier)
      const exportNames = Object.keys(deModule)

      const syntheticModule = new vm.SyntheticModule(exportNames, function () {
        exportNames.forEach((key) => {
          this.setExport(key, deModule[key])
        })
      })

      resolve(syntheticModule)
    })
  })
  await mod.evaluate()
  return mod.namespace
}
