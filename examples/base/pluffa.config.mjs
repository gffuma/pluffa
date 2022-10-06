/**
 * @param {import('pluffa/config').CommandName} cmd
 * @return {Promise<import('@pluffa/node/config').NodeConfig>}
 */
export default async (cmd) => {
  return {
    runtime: 'node',
    clientEntry: './src/index.js',
    skeletonComponent: './src/Skeleton.js',
    serverComponent: './src/App.js',
    experimentalUseSwc: true,
  }
}
