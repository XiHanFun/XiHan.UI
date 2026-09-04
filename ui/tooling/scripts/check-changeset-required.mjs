#!/usr/bin/env node
// 门禁：这次改动动了公开面，就必须带一份 changeset。
//
// 触发源登记在 tooling/scripts/changeset-required.json：公开面基线 tooling/public-surface.json
// 有改动，或 packages/engine/headless/src 下多了组件目录。命中任一条，本次改动里就必须
// 新增或改动至少一份非 README 的 .changeset/*.md。
//
// 判的是「本次改动里有没有 changeset」，不是「.changeset 目录空不空」：目录里常年躺着几十份
// 未发布的 changeset，按「存在即可」判等于永远放行。
//
// 基线取法：
//   --base=<ref> / CHANGESET_GATE_BASE  显式指定，本地手动跑用
//   GITHUB_BASE_REF                     CI 的 pull_request 事件带，取 origin/<它>
//   都没有                              跳过并说明（本地开发、push 事件不是 PR，不判）
// 取不到基线时跳过而不是判红：开发到一半还没写 changeset 是常态，本地必红会让人把它关掉。
//
// 登记表两侧都反查：登记的触发源在仓里必须存在，ignore 里的文件名在 .changeset 下必须存在。
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const REGISTRY = 'tooling/scripts/changeset-required.json'

/** 跑一条 git，失败时按 allowFail 决定是返回 null 还是抛。 */
function git(args, { cwd, allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  }
  catch {
    if (allowFail)
      return null
    throw new Error(`git ${args.join(' ')} 失败`)
  }
}

/** 把 git 的多行输出切成非空行。 */
function lines(out) {
  return (out ?? '').split('\n').map(s => s.trim()).filter(Boolean)
}

const registry = JSON.parse(await readFile(REGISTRY, 'utf8'))
const CHANGESET_DIR = registry.changesetDir
const IGNORE = new Set(registry.ignore)

// ── 登记表反查：登记了却不存在的条目一律判红，名单不会悄悄过期 ──────────────
const stale = []

if (!existsSync(CHANGESET_DIR))
  stale.push(`${CHANGESET_DIR} —— 登记为 changesetDir 却不存在`)

for (const t of registry.triggers) {
  if (!existsSync(t.path))
    stale.push(`${t.path} —— 登记在 triggers 里却不存在，触发源改名或没了`)
}

for (const name of IGNORE) {
  if (!existsSync(join(CHANGESET_DIR, name)))
    stale.push(`${CHANGESET_DIR}/${name} —— 登记在 ignore 里却不存在，名单过期了`)
}

if (stale.length) {
  console.error(`[check-changeset-required] ✗ ${REGISTRY} 的登记表过期：`)
  for (const s of stale)
    console.error(`  ${s}`)
  process.exit(1)
}

// ── 基线分支 ─────────────────────────────────────────────────────────────────
const argBase = process.argv.find(a => a.startsWith('--base='))?.slice('--base='.length)
const envBase = process.env.CHANGESET_GATE_BASE
const ciBase = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : null
const baseRef = argBase || envBase || ciBase

if (!baseRef) {
  console.log(
    '[check-changeset-required] 跳过：没有基线分支（不在 PR 流水线里）。'
    + '要在本地判就跑 `node tooling/scripts/check-changeset-required.mjs --base=origin/dev`',
  )
  process.exit(0)
}

const top = git(['rev-parse', '--show-toplevel'])
const prefix = git(['rev-parse', '--show-prefix']) // 形如 ui/，git 输出的路径都带这个前缀

/** 解析成 commit sha，解析不出返回 null。 */
function resolveCommit(ref) {
  return git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd: top, allowFail: true })
}

let baseSha = resolveCommit(baseRef)
if (!baseSha) {
  // 浅克隆里 origin/<分支> 往往不存在，先补一段历史再解析
  const remoteName = baseRef.replace(/^origin\//, '')
  git(['fetch', '--no-tags', '--quiet', '--depth=50', 'origin', remoteName], { cwd: top, allowFail: true })
  baseSha = resolveCommit(baseRef) ?? resolveCommit('FETCH_HEAD')
}

if (!baseSha) {
  console.error(
    `[check-changeset-required] ✗ 解析不出基线 ${baseRef}——`
    + '检出时把它一起取下来（actions/checkout 加 fetch-depth: 0），或换一个存在的引用',
  )
  process.exit(1)
}

// 与分叉点比，而不是与基线分支的头比：基线上后来的提交不算进这次改动
const mergeBase = git(['merge-base', baseSha, 'HEAD'], { cwd: top, allowFail: true })
const from = mergeBase ?? baseSha
const fromNote = mergeBase ? '分叉点' : `${baseRef} 头（找不到分叉点，历史太浅）`

// ── 本次改动动了哪些文件（已提交 + 工作区 + 未跟踪） ─────────────────────────
const scope = prefix || '.'
const changed = new Set([
  ...lines(git(['diff', '--name-only', from, '--', scope], { cwd: top })),
  ...lines(git(['ls-files', '--others', '--exclude-standard', '--', scope], { cwd: top })),
].map(p => p.slice(prefix.length)))

// ── 触发源 ───────────────────────────────────────────────────────────────────
const hits = []

for (const t of registry.triggers) {
  if (t.kind === 'file') {
    if (changed.has(t.path))
      hits.push(`${t.path} —— ${t.why}`)
    continue
  }
  if (t.kind === 'component-dirs') {
    const baseDirs = new Set(lines(
      git(['ls-tree', '--name-only', '-d', `${from}:${prefix}${t.path}`], { cwd: top, allowFail: true }),
    ))
    const nowDirs = (await readdir(t.path, { withFileTypes: true }))
      .filter(d => d.isDirectory())
      .map(d => d.name)
    const added = nowDirs.filter(d => !baseDirs.has(d)).sort()
    if (added.length)
      hits.push(`${t.path}/{${added.join(', ')}} —— ${t.why}`)
    continue
  }
  console.error(`[check-changeset-required] ✗ ${REGISTRY} 里有认不出的 kind：${t.kind}`)
  process.exit(1)
}

// ── 本次改动带了哪些 changeset ───────────────────────────────────────────────
const brought = [...changed].filter(
  p => p.startsWith(`${CHANGESET_DIR}/`)
    && p.endsWith('.md')
    && !IGNORE.has(p.slice(CHANGESET_DIR.length + 1)),
).sort()

if (hits.length && !brought.length) {
  console.error(`[check-changeset-required] ✗ 改了公开面却没带 changeset（基线 ${baseRef} 的${fromNote} ${from.slice(0, 8)}）：`)
  for (const h of hits)
    console.error(`  ${h}`)
  console.error(
    '  —— 跑 `pnpm changeset` 写一份：不留兼容层的前提下，changeset 是使用者唯一能看到的迁移信号',
  )
  process.exit(1)
}

const pending = (await readdir(CHANGESET_DIR)).filter(f => f.endsWith('.md') && !IGNORE.has(f)).length

if (!hits.length) {
  console.log(
    `[check-changeset-required] 通过：与 ${baseRef} 的${fromNote}比，${changed.size} 个文件有改动，`
    + `没碰 ${registry.triggers.length} 处触发源，不要求 changeset（目录里另有 ${pending} 份待发布）`,
  )
  process.exit(0)
}

console.log(
  `[check-changeset-required] 通过：${hits.length} 处公开面改动，本次带了 ${brought.length} 份 changeset`
  + `（${brought.map(p => p.slice(CHANGESET_DIR.length + 1)).join('、')}）`,
)
