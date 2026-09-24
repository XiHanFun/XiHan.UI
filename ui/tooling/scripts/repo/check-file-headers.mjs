#!/usr/bin/env node
// 检查并批量同步 packages 核心源码的版权头与功能注释。
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyFileHeader, removeFileHeader } from '../../file-header.mjs'

const UI_ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const REPOSITORY_ROOT = resolve(UI_ROOT, '..')
const WRITE = process.argv.includes('--write')
const COMMENTABLE_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.mjs',
  '.mts',
  '.ps1',
  '.sh',
  '.ts',
  '.tsx',
  '.vue',
  '.yaml',
  '.yml',
])
const SOURCE_EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.vue'])

function isPrimarySource(path) {
  const normalized = path.replaceAll('\\', '/')
  const extension = extname(path).toLowerCase()
  if (!normalized.startsWith('ui/packages/'))
    return false
  if (!SOURCE_EXTENSIONS.has(extension))
    return false
  if (/(?:^|\/)(?:__tests__|tests?)\//i.test(normalized) || /\.(?:spec|test)\.(?:ts|tsx)$/i.test(normalized))
    return false
  if (/(?:^|\/)[^/]+\.config\.ts$/i.test(normalized) || /(?:^|\/)vitest\.workspace\.ts$/i.test(normalized))
    return false
  return true
}

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { cwd: REPOSITORY_ROOT, encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean)
  .filter(path => COMMENTABLE_EXTENSIONS.has(extname(path).toLowerCase()))

const missing = []
let primary = 0
let excluded = 0
for (const relative of files) {
  const path = resolve(REPOSITORY_ROOT, relative)
  const source = await readFile(path, 'utf8')
  const target = isPrimarySource(relative)
  const expected = target ? applyFileHeader(relative, source) : removeFileHeader(relative, source)
  if (target)
    primary++
  else
    excluded++
  if (expected === source)
    continue
  missing.push(relative)
  if (WRITE)
    await writeFile(path, expected, 'utf8')
}

if (WRITE) {
  console.log(`[file-headers] 已同步 ${missing.length} 个文件；packages 核心源码 ${primary} 个，其他文件 ${excluded} 个`)
}
else if (missing.length > 0) {
  console.error(`[file-headers] 文件头策略不一致：${missing.length} 个`)
  for (const path of missing.slice(0, 80))
    console.error(`  ${path}`)
  if (missing.length > 80)
    console.error(`  ... 其余 ${missing.length - 80} 个`)
  console.error('运行 pnpm headers 自动补齐。')
  process.exit(1)
}
else {
  console.log(`[file-headers] 通过：${primary} 个 packages 核心源码文件具备统一文件头，${excluded} 个其他文件保持无文件头`)
}
