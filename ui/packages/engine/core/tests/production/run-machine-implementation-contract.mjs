import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const tempRoot = resolve(tmpdir())
const outputPath = mkdtempSync(join(tempRoot, 'xihan-ui-core-production-'))
const resolvedOutput = resolve(outputPath)

if (!resolvedOutput.startsWith(`${tempRoot}${sep}`))
  throw new Error(`临时构建目录超出系统临时目录：${resolvedOutput}`)

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: packageRoot,
    env,
    stdio: 'inherit',
  })
  if (result.error)
    throw result.error
  if (result.status !== 0)
    process.exitCode = result.status ?? 1
  return result.status === 0
}

try {
  const packageManagerCli = process.env.npm_execpath
  if (!packageManagerCli)
    throw new Error('无法定位 pnpm CLI；请通过 pnpm test 运行生产契约')
  const built = run(process.execPath, [
    packageManagerCli,
    'exec',
    'tsdown',
    'tests/production/machine-implementation-entry.ts',
    '--no-config',
    '--out-dir',
    outputPath,
    '--format',
    'esm',
    '--target',
    'node18',
    '--logLevel',
    'error',
  ])
  if (built) {
    run(process.execPath, [
      '--test',
      'tests/production/machine-implementation-contract.mjs',
    ], {
      ...process.env,
      XIHAN_CORE_PRODUCTION_TEST_DIST: outputPath,
    })
  }
}
finally {
  rmSync(resolvedOutput, { force: true, recursive: true })
}
