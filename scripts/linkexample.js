#!/usr/bin/env zx

const BASE_LINKS = ['pluffa', '@pluffa/ssr']

const BASE_CROSS_LINKS = ['react', 'react-dom']

async function main() {
  const [exampleName] = argv._
  if (!exampleName) {
    console.log('Missing example name')
    process.exit(1)
  }

  const examplePath = path.join('./examples', exampleName)

  const pkg = await fs.readJson(path.join(examplePath, 'package.json'))
  const libDeps = Object.keys(pkg.dependencies).filter(
    (d) => d === 'pluffa' || d.startsWith('@pluffa/')
  )

  const toLinks = new Set(libDeps.concat(BASE_LINKS))

  const crossLinks = new Set()
  for (const lib of libDeps) {
    let deName = lib.replace('@pluffa/', 'pluffa-')
    const pkg = await fs.readJson(
      path.join('./packages', deName, 'package.json')
    )
    Object.keys(pkg.dependencies ?? {})
      .concat(Object.keys(pkg.peerDependencies ?? {}))
      .filter((d) => d.includes('react'))
      .forEach((d) => crossLinks.add(d))
  }

  await within(async () => {
    cd(examplePath)
    for (const link of toLinks.values()) {
      await $`yarn link ${link}`
    }
  })

  for (const link of crossLinks.values()) {
    const vendorDir = path.join(examplePath, 'node_modules', link)
    await $`rm -rf ${vendorDir}`
    await $`ln -s ../../../node_modules/${link} ${vendorDir}`
  }

  console.log(`${exampleName} linked!`)
}

main()
