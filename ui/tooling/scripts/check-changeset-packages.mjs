#!/usr/bin/env node
// 门禁：changeset 头部只能写会发布的包。
//
// .changeset/config.json 的 ignore 表登记了不计版的私有包（如 @xihan-ui/testing）。头部一旦
// 写上它们，有两种下场，都是静默的：只写它的 changeset 在 `changeset version` 时被整份丢掉，
// 正文进不了任何 CHANGELOG；与发布包混写的 changeset 让 `changeset version` 直接报错
// （Mixed changesets … are not allowed），发版当场被挡——而写 changeset 的时候没有任何提示。
// `changeset status` 能查出混写，但它还要拿 baseBranch 做 git diff，浅克隆与 detached HEAD
// 下先死在 git 上，所以这里自己解析头部，不依赖 git。
//
// 判三件事：
//   1. 头部每一行都能读成 `"包名": 档位`，档位在 major / minor / patch / none 之内——读不出的
//      行 changesets 自己也会抛，先在这里报文件与行号。
//   2. 头部的包必须是工作区里的包——不在的名字 `changeset version` 会抛 not in the workspace。
//   3. 头部的包不得在 ignore 表里——见上。
// 反查：ignore 表登记的包在工作区里必须存在，名单不会悄悄过期。
//
// 头部为空（`changeset add --empty` 的产物）放行：正文纯作说明，不指望进 CHANGELOG。
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const CHANGESET_DIR = '.changeset'
const CONFIG = join(CHANGESET_DIR, 'config.json')
const WORKSPACE = 'pnpm-workspace.yaml'
const VERSION_TYPES = new Set(['major', 'minor', 'patch', 'none'])

// 头部在第一对 `---` 之间，与 @changesets/parse 同一口径：起始 `---` 前只许空白。
const FENCE = /^\s*---\s*$/
// 一行一个包：可带单双引号的包名、冒号、档位。
const RELEASE_LINE = /^\s*(?:"([^"]+)"|'([^']+)'|([^\s:'"]+))\s*:\s*(\S+)\s*$/

/** pnpm-workspace.yaml 的 packages 段 → glob 列表。 */
async function workspaceGlobs() {
  const yaml = await readFile(WORKSPACE, 'utf8')
  const start = yaml.search(/^packages:\s*$/m)
  if (start === -1)
    throw new Error(`${WORKSPACE} 里找不到 packages 段`)
  const globs = []
  for (const line of yaml.slice(start).split('\n').slice(1)) {
    const hit = line.match(/^\s+-\s+'([^']+)'\s*$/)
    if (!hit)
      break
    globs.push(hit[1])
  }
  return globs
}

/** 按工作区 glob 收集包名 → 目录；只认「固定首段 + 若干个 `*` 段」的形态。 */
async function workspacePackages() {
  const out = new Map()
  for (const glob of await workspaceGlobs()) {
    const segments = glob.split('/')
    if (!segments.every((s, i) => (i === 0 ? s !== '*' : s === '*')))
      throw new Error(`${WORKSPACE} 的 glob 形态认不出：${glob}，改了形态就把这里一起改`)
    let dirs = [segments[0]]
    for (let depth = 1; depth < segments.length; depth++) {
      const next = []
      for (const dir of dirs) {
        if (!existsSync(dir))
          continue
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          if (entry.isDirectory())
            next.push(join(dir, entry.name))
        }
      }
      dirs = next
    }
    for (const dir of dirs) {
      const manifest = join(dir, 'package.json')
      if (!existsSync(manifest))
        continue
      const { name } = JSON.parse(await readFile(manifest, 'utf8'))
      if (typeof name === 'string' && name)
        out.set(name, dir.replaceAll('\\', '/'))
    }
  }
  return out
}

/** 解析一份 changeset 的头部：返回 { releases: [{ name, type }] } 或 { errors: [...] }。 */
function parseHeader(contents) {
  const lines = contents.split('\n')
  const open = lines.findIndex(line => line.trim())
  if (open === -1 || !FENCE.test(lines[open]))
    return { errors: ['没有 `---` 包起来的头部'] }
  const close = lines.findIndex((line, i) => i > open && FENCE.test(line))
  if (close === -1)
    return { errors: ['头部的 `---` 没有合上'] }
  const releases = []
  const errors = []
  lines.slice(open + 1, close).forEach((line, i) => {
    if (!line.trim())
      return
    const release = line.match(RELEASE_LINE)
    const lineNumber = open + 2 + i // 行号从 1 数，头部第一行紧跟起始 `---`
    if (!release) {
      errors.push(`第 ${lineNumber} 行读不成 \`"包名": 档位\`：${line.trim()}`)
      return
    }
    const name = release[1] ?? release[2] ?? release[3]
    const type = release[4]
    if (!VERSION_TYPES.has(type)) {
      errors.push(`第 ${lineNumber} 行 ${name} 的档位 ${type} 不在 ${[...VERSION_TYPES].join(' / ')} 之内`)
      return
    }
    releases.push({ name, type })
  })
  return errors.length ? { errors } : { releases }
}

const config = JSON.parse(await readFile(CONFIG, 'utf8'))
const ignore = Array.isArray(config.ignore) ? config.ignore : []
const packages = await workspacePackages()

// ── ignore 表反查 ────────────────────────────────────────────────────────────
const stale = ignore.filter(name => !packages.has(name))
if (stale.length) {
  console.error(`[check-changeset-packages] ✗ ${CONFIG} 的 ignore 表过期：`)
  for (const name of stale)
    console.error(`  ${name} —— 登记在 ignore 里却不在工作区，包改名或没了`)
  process.exit(1)
}

// ── 逐份 changeset ───────────────────────────────────────────────────────────
const IGNORED = new Set(ignore)
const files = (await readdir(CHANGESET_DIR)).filter(f => f.endsWith('.md') && f !== 'README.md').sort()
const problems = []
let empty = 0

for (const file of files) {
  const path = `${CHANGESET_DIR}/${file}`
  const parsed = parseHeader(await readFile(path, 'utf8'))
  if (parsed.errors) {
    for (const error of parsed.errors)
      problems.push(`${path} —— ${error}`)
    continue
  }
  if (!parsed.releases.length)
    empty++
  const unknown = parsed.releases.filter(r => !packages.has(r.name)).map(r => r.name)
  if (unknown.length)
    problems.push(`${path} —— 头部写了不在工作区的包：${unknown.join('、')}（changeset version 会抛 not in the workspace）`)
  const ignored = parsed.releases.filter(r => IGNORED.has(r.name)).map(r => r.name)
  if (ignored.length) {
    const others = parsed.releases.filter(r => !IGNORED.has(r.name)).map(r => r.name)
    const outcome = others.length
      ? `与发布包 ${others.join('、')} 混写，changeset version 会报 Mixed changesets`
      : '整份在 changeset version 时会被丢掉，正文进不了 CHANGELOG'
    problems.push(`${path} —— 头部写了 ignore 表里的包：${ignored.join('、')}，${outcome}`)
  }
}

if (problems.length) {
  console.error(`[check-changeset-packages] ✗ ${problems.length} 份 changeset 的头部不合规：`)
  for (const p of problems)
    console.error(`  ${p}`)
  console.error(
    '  —— ignore 表里的包从头部删掉，正文里说明测试套件的变化即可；'
    + '头部一行不剩就留成空头部（两行 `---` 之间什么都不写）',
  )
  process.exit(1)
}

console.log(
  `[check-changeset-packages] 通过：${files.length} 份 changeset 的头部只写了工作区里的发布包`
  + `（ignore 表 ${ignore.length} 个：${ignore.join('、') || '无'}；空头部 ${empty} 份）`,
)
