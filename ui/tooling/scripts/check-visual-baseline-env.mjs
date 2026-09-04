#!/usr/bin/env node
// 门禁：像素基线的运行环境常量，四处写法保持一致。
//
// 四十张位图能比对得起来，靠的是四样常量在截图用例、容器运行器、CI 与文档里逐字相同：
// 字体族名、装它的 apt 包、容器镜像、运行命令。改一处漏一处不会报错，只会让基线整体判红，
// 而那种红看起来像「皮肤改坏了」。本脚本把这四样对齐。
//
// 镜像版本另有真值：pnpm-workspace.yaml 的 catalog playwright。两边不同版本时容器里的
// 浏览器二进制与 CI 装的那一份不是同一个，渲染结果可以差在抗锯齿那一层。
//
// 登记表 tooling/scripts/visual-baseline-env.json 两侧反查：
// 登记了却没命中判名单过期，扫到了却没登记判新增处没入表。`--update` 按扫描结果重写 sites。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const repoRoot = join(uiRoot, '..')
const TABLE = 'tooling/scripts/visual-baseline-env.json'

const registry = JSON.parse(await readFile(join(uiRoot, TABLE), 'utf8'))
const { facts, ciFontStep, scan } = registry

/** 仓库根相对路径，一律正斜杠，登记表与报错都用这个形态。 */
const toPosix = path => path.replaceAll('\\', '/')

/** 字面量转正则，无 pattern 的常量按 value 逐字匹配。 */
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function matcher(fact) {
  return new RegExp(fact.pattern ?? escape(fact.value))
}

/** 文件里命中该常量的行：[行号, 原行, 捕获值]。 */
function hits(source, fact) {
  const re = new RegExp(matcher(fact).source, 'g')
  const out = []
  source.split('\n').forEach((line, index) => {
    re.lastIndex = 0
    let m = re.exec(line)
    while (m) {
      out.push({ line: index + 1, text: line.trim(), captured: m[1] })
      m = re.exec(line)
    }
  })
  return out
}

async function readRepoFile(path) {
  return readFile(join(repoRoot, path), 'utf8')
}

/** 扫描范围内的全部文件，仓库根相对路径。 */
async function scanFiles() {
  const ignoreFiles = new Set(scan.ignoreFiles)
  const ignoreDirs = new Set(scan.ignoreDirs)
  const out = []
  async function walk(abs) {
    for (const entry of await readdir(abs, { withFileTypes: true })) {
      const child = join(abs, entry.name)
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name))
          await walk(child)
        continue
      }
      const rel = toPosix(relative(repoRoot, child))
      if (ignoreFiles.has(rel))
        continue
      if (scan.extensions.some(ext => entry.name.endsWith(ext)))
        out.push(rel)
    }
  }
  for (const root of scan.roots)
    await walk(join(repoRoot, root))
  return out.sort()
}

/** catalog 里某个包的版本号，去掉 ^ ~ 之类的范围符。 */
async function catalogVersion(name) {
  const workspace = await readFile(join(uiRoot, 'pnpm-workspace.yaml'), 'utf8')
  const found = workspace.match(new RegExp(`^\\s*'?${escape(name)}'?:\\s*\\S*?([0-9]+\\.[0-9]+\\.[0-9]+)`, 'm'))
  return found?.[1] ?? null
}

const files = await scanFiles()
const sources = new Map()
for (const file of files)
  sources.set(file, await readRepoFile(file))

// --update：把每样常量的 sites 换成扫描到的全部文件
if (process.argv.includes('--update')) {
  for (const fact of Object.values(facts)) {
    fact.sites = files.filter(file => matcher(fact).test(sources.get(file)))
  }
  await writeFile(join(uiRoot, TABLE), `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
  const counts = Object.entries(facts).map(([id, fact]) => `${id} ${fact.sites.length} 处`).join('，')
  console.log(`[check-visual-baseline-env] 已写入 ${TABLE}：${counts}`)
  process.exit(0)
}

const problems = []
let matchCount = 0

for (const [id, fact] of Object.entries(facts)) {
  const registered = new Set(fact.sites)

  // 登记侧：每一处登记都要仍然命中
  for (const site of fact.sites) {
    const source = sources.get(site)
    if (source == null) {
      problems.push(`${site}:0 —— ${id} 登记了这个文件，但它不在扫描范围内或已经没了；跑 --update 重出名单`)
      continue
    }
    const found = hits(source, fact)
    if (found.length === 0) {
      problems.push(`${site}:0 —— ${id}（${fact.value ?? fact.pattern}）在这里一处也没命中，名单过期了；跑 --update 重出名单`)
      continue
    }
    matchCount += found.length
  }

  // 扫描侧：命中了就必须在名单里
  for (const file of files) {
    if (registered.has(file))
      continue
    const found = hits(sources.get(file), fact)
    for (const hit of found)
      problems.push(`${file}:${hit.line} —— ${id} 出现在这里却没登记进 ${TABLE}`)
  }

  // 镜像版本对齐 catalog
  if (fact.valueFrom?.startsWith('catalog:')) {
    const name = fact.valueFrom.slice('catalog:'.length)
    const expected = await catalogVersion(name)
    if (expected == null) {
      problems.push(`pnpm-workspace.yaml:0 —— catalog 里找不到 ${name} 的版本，${id} 没有真值可对`)
    }
    else {
      for (const site of fact.sites) {
        for (const hit of hits(sources.get(site) ?? '', fact)) {
          if (hit.captured !== expected)
            problems.push(`${site}:${hit.line} —— ${id} 写的是 ${hit.captured}，catalog 的 ${name} 是 ${expected}，两边不同版本时容器与 CI 的浏览器二进制不配套`)
        }
      }
    }
  }

  // 命令要有同名脚本
  if (fact.script) {
    const pkg = JSON.parse(sources.get('ui/package.json'))
    if (!(fact.script in (pkg.scripts ?? {})))
      problems.push(`ui/package.json:0 —— ${id} 指向脚本 ${fact.script}，package.json 的 scripts 里没有它`)
  }
}

// CI 的 browser job：装字体要排在浏览器态用例之前
{
  const workflow = sources.get(ciFontStep.workflow)
  if (workflow == null) {
    problems.push(`${ciFontStep.workflow}:0 —— 读不到工作流文件`)
  }
  else {
    const lines = workflow.split('\n')
    const jobStart = lines.findIndex(line => new RegExp(`^\\s{2}${ciFontStep.job}:\\s*$`).test(line))
    const jobEnd = jobStart === -1
      ? -1
      : lines.findIndex((line, i) => i > jobStart && /^ {2}\S/.test(line))
    if (jobStart === -1) {
      problems.push(`${ciFontStep.workflow}:0 —— 没有名为 ${ciFontStep.job} 的 job，浏览器态用例没人跑`)
    }
    else {
      const end = jobEnd === -1 ? lines.length : jobEnd
      const find = needle => lines.findIndex((line, i) => i > jobStart && i < end && line.includes(needle))
      const install = find(ciFontStep.installLine)
      const test = find(ciFontStep.testLine)
      if (install === -1)
        problems.push(`${ciFontStep.workflow}:${jobStart + 1} —— ${ciFontStep.job} job 里没有装字体那一步（找的是「${ciFontStep.installLine}」），基线会整体判红`)
      if (test === -1)
        problems.push(`${ciFontStep.workflow}:${jobStart + 1} —— ${ciFontStep.job} job 里没有「${ciFontStep.testLine}」，像素基线在 CI 上没有执行处`)
      if (install !== -1 && test !== -1 && install > test)
        problems.push(`${ciFontStep.workflow}:${install + 1} —— 装字体排在了跑用例之后，用例跑的时候字体还没装上`)
    }
  }
}

if (problems.length > 0) {
  console.error(`[check-visual-baseline-env] ✗ ${problems.length} 处对不上：`)
  for (const line of problems)
    console.error(`  ${line}`)
  process.exit(1)
}

const imageVersion = await catalogVersion('playwright')
const siteCount = Object.values(facts).reduce((sum, fact) => sum + fact.sites.length, 0)
console.log(
  `[check-visual-baseline-env] ✓ ${Object.keys(facts).length} 样常量 · ${siteCount} 处登记命中 ${matchCount} 行 · `
  + `扫了 ${files.length} 个文件 · 镜像与 catalog 的 playwright 同为 ${imageVersion} · `
  + `CI 的 ${ciFontStep.job} job 先装字体再跑用例`,
)
