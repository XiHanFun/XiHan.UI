#!/usr/bin/env node
// Nuxt 示例（仓库根 examples/nuxt）对着本仓刚构建的包装一遍、类型检查、构建，再起服务看首屏：
//   - 只靠 modules: ['@xihan-ui/vue/nuxt'] 接上：组件不 import 也渲染出来，没有原样留下的 <XhButton> 标签；
//   - <html> 上有 nuxt.config 里 initial 解出的八个视觉环境属性，head 里有首帧脚本；
//   - 产物的样式表带着令牌与用到的组件皮肤；
//   - nuxt typecheck 通过：$xhVisual 与 nuxt.config 里 xihanUI 的类型接得上，写错的值报得出来。
// 包用 pnpm pack 打出来（workspace: 换成真实版本，与发布到 npm 的那一份一致），在系统临时目录里装：
// Nuxt 不进本仓的依赖与锁文件。先 pnpm build。
//
//   node tooling/scripts/adapter/check-nuxt-example.mjs [--keep]   --keep 留下临时目录
import { spawn, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const UI_ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const EXAMPLE = resolve(UI_ROOT, '../examples/nuxt')
const KEEP = process.argv.includes('--keep')
/** 示例直接装的两个包；它们经 workspace: 依赖的兄弟包一并打包。 */
const ROOTS = ['@xihan-ui/vue', '@xihan-ui/styles']
/** Nuxt 依赖里要跑安装脚本的几个：pnpm 缺省不跑，不放行会装不全。 */
const ALLOW_BUILDS = ['@parcel/watcher', 'esbuild', 'unrs-resolver']
/** 与 examples/nuxt/nuxt.config.ts 的 initial 对应：只定了密度，其余七个轴按基线。 */
const EXPECTED_ATTRS = {
  'data-theme': 'light',
  'data-brand': 'xihan',
  'data-density': 'compact',
  'data-contrast': 'default',
  'data-motion': 'default',
  'data-transparency': 'default',
  'data-material': 'standard',
  'dir': 'ltr',
}
const COMPONENTS = ['button', 'switch']

const problems = []
/** 临时目录：包与示例都装在这里，出错时留下供排查。 */
let work = ''

function fail(message) {
  console.error(`[nuxt-example] ✗ ${message}`)
  process.exit(1)
}

const WINDOWS = process.platform === 'win32'
/** Windows 上 pnpm 是 .cmd，只能经 shell 起；参数拼成一整条命令，带空格的加引号。 */
const quote = arg => (/[\s"]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg)

/** quiet：成功时不打子进程的输出（pnpm pack 会把包里每个文件列一遍），失败时补打出来。 */
function run(command, args, cwd, { quiet = false } = {}) {
  console.log(`[nuxt-example] $ ${command} ${args.join(' ')}`)
  const result = spawnSync(WINDOWS ? [command, ...args].map(quote).join(' ') : command, WINDOWS ? [] : args, {
    cwd,
    stdio: quiet ? 'pipe' : 'inherit',
    encoding: 'utf8',
    env: { ...process.env, NUXT_TELEMETRY_DISABLED: '1' },
    shell: WINDOWS,
  })
  if (result.status !== 0) {
    if (quiet)
      console.error(`${result.stdout}${result.stderr}`)
    fail(`${command} ${args.join(' ')} 退出码 ${result.status}（临时目录 ${work} 已留下）`)
  }
}

/** 工作区里全部包：包名 → 目录。 */
function workspacePackages() {
  const out = new Map()
  const packagesDir = join(UI_ROOT, 'packages')
  for (const group of readdirSync(packagesDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
    for (const leaf of readdirSync(join(packagesDir, group.name), { withFileTypes: true }).filter(d => d.isDirectory())) {
      const dir = join(packagesDir, group.name, leaf.name)
      try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
        out.set(pkg.name, { dir, pkg })
      }
      catch {}
    }
  }
  return out
}

/** 从 ROOTS 出发，沿 dependencies 里的 workspace: 依赖走到底。 */
function closure(all) {
  const seen = new Set()
  const visit = (name) => {
    if (seen.has(name))
      return
    if (!all.has(name))
      fail(`工作区里没有 ${name}`)
    seen.add(name)
    for (const [dep, spec] of Object.entries(all.get(name).pkg.dependencies ?? {})) {
      if (String(spec).startsWith('workspace:'))
        visit(dep)
    }
  }
  ROOTS.forEach(visit)
  return [...seen].sort()
}

function freePort() {
  return new Promise((done, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => done(port))
    })
  })
}

async function waitFor(url, child) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      fail(`服务进程提前退出，退出码 ${child.exitCode}`)
    try {
      const response = await fetch(url)
      if (response.ok)
        return response
    }
    catch {}
    await new Promise(r => setTimeout(r, 300))
  }
  fail(`${url} 30 秒内没有起来`)
}

function checkHtml(html) {
  const htmlTag = html.match(/<html\b[^>]*>/)?.[0] ?? ''
  for (const [name, value] of Object.entries(EXPECTED_ATTRS)) {
    if (!htmlTag.includes(`${name}="${value}"`))
      problems.push(`<html> 上没有 ${name}="${value}"：${htmlTag}`)
  }
  const head = html.slice(0, html.indexOf('</head>'))
  if (!/<script\b[^>]*>\(function\(\)\{try\{var k="xihan-ui-example-nuxt"/.test(head))
    problems.push('head 里没有首帧脚本（或存储键不是 nuxt.config 里的那个）')
  const body = html.slice(html.indexOf('<body'))
  for (const scope of COMPONENTS) {
    if (!body.includes(`data-scope="${scope}"`))
      problems.push(`页面里没有渲染出的 ${scope}（data-scope="${scope}"）`)
  }
  const unresolved = body.match(/<(?:Xh[A-Z]\w*|xh-[\w-]+|xh[a-z]+)\b/)
  if (unresolved)
    problems.push(`页面里有没解析成组件的标签 ${unresolved[0]}：自动注册没接上`)
}

async function checkCss(html, origin) {
  const hrefs = [...html.matchAll(/<link\s[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m => m[1])
  if (hrefs.length === 0) {
    problems.push('页面没有引任何样式表')
    return
  }
  const css = (await Promise.all(hrefs.map(async href => (await fetch(new URL(href, origin))).text()))).join('\n')
  if (!/--xh-bg-brand:/.test(css))
    problems.push('样式表里没有令牌（--xh-bg-brand）')
  for (const scope of COMPONENTS) {
    if (!new RegExp(`--xh-${scope}-skin:\\s*1`).test(css))
      problems.push(`样式表里没有 ${scope} 的皮肤`)
  }
}

const all = workspacePackages()
const names = closure(all)
work = mkdtempSync(join(tmpdir(), 'xihan-ui-nuxt-'))
const packs = join(work, 'packs')
const app = join(work, 'app')
mkdirSync(packs)

// 1. 打包：pnpm pack 把 workspace: 换成真实版本，与发布到 npm 的那一份一致
const overrides = {}
for (const name of names) {
  const { dir, pkg } = all.get(name)
  run('pnpm', ['pack', '--pack-destination', packs], dir, { quiet: true })
  overrides[name] = `file:${join(packs, `${name.slice(1).replace('/', '-')}-${pkg.version}.tgz`).replaceAll('\\', '/')}`
}

// 2. 示例拷进临时目录，@xihan-ui/* 一律指到刚打的包
cpSync(EXAMPLE, app, {
  recursive: true,
  filter: source => !/(?:^|[\\/])(?:node_modules|\.nuxt|\.output|\.data)(?:[\\/]|$)/.test(relative(EXAMPLE, source)),
})
writeFileSync(join(app, 'pnpm-workspace.yaml'), [
  'overrides:',
  ...Object.entries(overrides).map(([name, spec]) => `  '${name}': '${spec}'`),
  'allowBuilds:',
  ...ALLOW_BUILDS.map(name => `  '${name}': true`),
  '',
].join('\n'))
// 类型的反例：类型一旦退化成 any，@ts-expect-error 就落空，typecheck 跟着报错。
// 只写进临时目录里的那一份，示例本身保持干净
writeFileSync(join(app, 'app/xihan-ui-type-probe.ts'), [
  'export function probe() {',
  '  const { $xhVisual } = useNuxtApp()',
  '  // @ts-expect-error 明暗只有 light / dark / system',
  `  $xhVisual.setPreference({ mode: 'blue' })`,
  '}',
  '',
].join('\n'))
const configPath = join(app, 'nuxt.config.ts')
const config = readFileSync(configPath, 'utf8')
if (!/^ {2}xihanUI: \{\r?\n/m.test(config))
  fail('examples/nuxt/nuxt.config.ts 里找不到 xihanUI 一节，类型反例插不进去')
writeFileSync(configPath, config.replace(/^ {2}xihanUI: \{\r?\n/m, match => `${match}    // @ts-expect-error components 是布尔\n    components: 'yes',\n`))
console.log(`[nuxt-example] ${names.length} 个包：${names.join(' ')}\n[nuxt-example] 临时目录 ${work}`)

// 3. 装、类型检查、构建
run('pnpm', ['install', '--no-frozen-lockfile'], app)
run('pnpm', ['exec', 'nuxt', 'typecheck'], app)
run('pnpm', ['exec', 'nuxt', 'build'], app)

// 4. 起服务看首屏
const port = await freePort()
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, [join(app, '.output/server/index.mjs')], {
  cwd: app,
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NITRO_HOST: '127.0.0.1', NITRO_PORT: String(port) },
  stdio: ['ignore', 'inherit', 'inherit'],
})
try {
  const html = await (await waitFor(`${origin}/`, server)).text()
  checkHtml(html)
  await checkCss(html, origin)
}
finally {
  server.kill()
}

if (problems.length) {
  console.error(`[nuxt-example] ✗ 首屏不对（临时目录 ${work} 已留下）：`)
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}
if (!KEEP)
  rmSync(work, { recursive: true, force: true })
console.log(`[nuxt-example] 通过：${names.length} 个包装进 Nuxt 示例，类型检查、构建与首屏均对${KEEP ? `（临时目录 ${work}）` : ''}`)
