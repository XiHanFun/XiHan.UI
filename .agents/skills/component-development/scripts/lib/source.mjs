import { access, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

async function exists(path) {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

async function isRepositoryRoot(path) {
  return await exists(join(path, 'ui', 'package.json'))
    && await exists(join(path, 'ui', 'packages', 'engine', 'headless', 'src'))
    && await exists(join(path, 'docs', 'components'))
}

async function findUp(start) {
  let current = resolve(start)
  for (;;) {
    if (await isRepositoryRoot(current))
      return current
    const parent = dirname(current)
    if (parent === current)
      return null
    current = parent
  }
}

/** 解析当前 XiHan.UI 检出；不读取已发布站点或其他安装版本。 */
export async function repoRoot() {
  if (process.env.XIHAN_UI_ROOT) {
    const explicit = resolve(process.env.XIHAN_UI_ROOT)
    if (!await isRepositoryRoot(explicit))
      fail(`XIHAN_UI_ROOT 不是 XiHan.UI 仓库根：${explicit}`)
    return explicit
  }

  const skillDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
  for (const start of [process.cwd(), skillDir]) {
    const found = await findUp(start)
    if (found)
      return found
  }

  fail('找不到 XiHan.UI 仓库；请在仓库内运行，或设置 XIHAN_UI_ROOT')
}

export async function readRequired(path, label = '文件') {
  if (!await exists(path))
    fail(`${label}不存在：${path}`)
  return { path, text: await readFile(path, 'utf8') }
}

export async function readJson(path, label = 'JSON') {
  const hit = await readRequired(path, label)
  try {
    return { ...hit, value: JSON.parse(hit.text) }
  }
  catch (error) {
    fail(`${label}不是有效 JSON：${path}\n${error instanceof Error ? error.message : String(error)}`)
  }
}

export function componentId(value) {
  if (!value || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value))
    fail('组件标识必须是非空 kebab-case')
  return value
}

export function positional(argv) {
  return argv.slice(2).filter(arg => !arg.startsWith('-'))
}

export function fail(message) {
  throw new Error(message)
}

export async function run(main) {
  try {
    await main()
  }
  catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
