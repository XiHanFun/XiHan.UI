#!/usr/bin/env node
// 浏览器态运行器：按组件分类挑用例，逐包串行跑，限制 worker 数。
//
//   pnpm test:browser                     全部包、全部用例
//   pnpm test:browser form overlay        只跑这几类（跨包）
//   pnpm test:browser --list              列出分类与每个包里的用例数
//   pnpm test:browser --pkg=vue,react     只跑点名的包（按目录名）
//   pnpm test:browser --workers=4         每个包的 worker 数（缺省 min(8, 核数 - 1)）
//   pnpm test:browser --no-build          跳过依赖构建（刚 build 过时用）
//   pnpm test:browser overlay -- -t Esc   -- 之后的参数原样交给 vitest
//
// 为什么不并发：每个包起一套 Chromium，每套按核数开 worker；四个包一起跑在多核机器上会同时拉起
// 上百个页面，内存与 CPU 一起被占满。逐包跑、worker 有上限，一次只有一套浏览器在跑。
//
// 分类：组件归属取 scripts/component-docs.manifest.json（与脚手架 --list-categories 同一份），
// 用例文件名以某个组件名开头（取最长匹配）即归那个组件的分类；不以组件名开头的，
// 命中 THEMES 的按主题归类，其余归 shared（跨组件：全量无障碍、计算样式快照、像素基线、焦点环对账等）。
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const PACKAGE_GLOBS = ['packages', 'tooling']
const TESTS_DIR = 'tests/browser'
const SPEC = /\.spec\.tsx?$/

/** 不以组件名开头、但明确属于某一类的用例：按文件名前缀或所在包归类。 */
const THEMES = [
  { category: 'overlay', test: name => /^(?:overlay|candidate-overlay|color-hover-overlay|anchored-portal|modal-portal|hover-tooltip-portal|portal|default-open-initial-focus|dropdown-highlight|context-menubar)/.test(name) },
  { category: 'overlay', test: (_name, pkg) => pkg === 'position' },
]
const SHARED = { id: 'shared', label: '公共（跨组件）' }

// —— 参数 ——
const argv = process.argv.slice(2)
const passIndex = argv.indexOf('--')
const own = passIndex === -1 ? argv : argv.slice(0, passIndex)
const passthrough = passIndex === -1 ? [] : argv.slice(passIndex + 1)
/** 取 --name 或 --name=value；没写返回 null，只写开关返回空串。 */
function option(name) {
  const hit = own.find(arg => arg === `--${name}` || arg.startsWith(`--${name}=`))
  return hit == null ? null : (hit.includes('=') ? hit.slice(hit.indexOf('=') + 1) : '')
}
const KNOWN = ['list', 'pkg', 'workers', 'no-build', 'help']
const unknownFlags = own.filter(arg => arg.startsWith('--') && !KNOWN.includes(arg.slice(2).split('=')[0]))
if (unknownFlags.length > 0) {
  console.error(`[test:browser] ✗ 不认识的参数：${unknownFlags.join(' ')}（可用：${KNOWN.map(k => `--${k}`).join(' ')}；给 vitest 的参数写在 -- 之后）`)
  process.exit(2)
}
if (option('help') != null) {
  console.log('用法：pnpm test:browser [分类…] [--pkg=vue,react] [--workers=N] [--no-build] [-- vitest 参数] | --list')
  process.exit(0)
}

/**
 * 起子进程。Windows 上 pnpm 是 .cmd，只能经 cmd.exe 起：参数里的 | ^ & 空格等会被 cmd 吃掉
 * （-t "a|b" 变管道、--filter=x^... 的 ^ 变转义），逐个加双引号后拼成一整条命令再交给 shell。
 */
function spawn(command, args, options) {
  if (process.platform !== 'win32')
    return spawnSync(command, args, { ...options, stdio: 'inherit' })
  const quote = arg => (/[\s"^&|<>()%!]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg)
  return spawnSync([command, ...args].map(quote).join(' '), { ...options, stdio: 'inherit', shell: true })
}

// —— 分类 ——
const manifest = JSON.parse(readFileSync('scripts/component-docs.manifest.json', 'utf8'))
const CATEGORIES = [...manifest.categories.map(category => ({ id: category.id, label: category.label })), SHARED]
const categoryOfComponent = new Map(manifest.categories.flatMap(category => category.components.map(component => [component.id, category.id])))
/** 最长的组件名先匹配：checkbox-group-* 归 checkbox-group 而不是 checkbox。 */
const componentNames = [...categoryOfComponent.keys()].sort((a, b) => b.length - a.length)

function categoryOf(file, pkg) {
  const name = file.replace(SPEC, '')
  const component = componentNames.find(id => name === id || name.startsWith(`${id}-`) || name.startsWith(`${id}.`))
  if (component)
    return categoryOfComponent.get(component)
  return THEMES.find(theme => theme.test(name, pkg))?.category ?? SHARED.id
}

// —— 包：与 check-browser-config 同一口径，声明了 test:browser 且有 tests/browser 的包 ——
function listPackages() {
  const found = []
  for (const top of PACKAGE_GLOBS) {
    const groups = top === 'tooling' ? [top] : readdirSync(top, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => join(top, e.name))
    for (const group of groups) {
      for (const entry of readdirSync(group, { withFileTypes: true })) {
        const dir = join(group, entry.name).replaceAll('\\', '/')
        const manifestPath = join(dir, 'package.json')
        if (!entry.isDirectory() || !existsSync(manifestPath) || !existsSync(join(dir, TESTS_DIR)))
          continue
        const pkg = JSON.parse(readFileSync(manifestPath, 'utf8'))
        if (!pkg.scripts?.['test:browser'])
          continue
        const specs = readdirSync(join(dir, TESTS_DIR)).filter(file => SPEC.test(file)).sort()
        found.push({ dir, id: entry.name, name: pkg.name, specs })
      }
    }
  }
  return found
}

// 包按固定顺序跑：适配器在前（用例最多），引擎在后
const ORDER = ['vue', 'react', 'web-components']
const packages = listPackages().sort((a, b) => {
  const rank = pkg => (ORDER.includes(pkg.id) ? ORDER.indexOf(pkg.id) : ORDER.length)
  return rank(a) - rank(b) || a.id.localeCompare(b.id)
})

if (option('list') != null) {
  const width = Math.max(...CATEGORIES.map(category => category.id.length))
  console.log(`${''.padEnd(width)}  ${packages.map(pkg => pkg.id.padStart(Math.max(pkg.id.length, 4))).join('  ')}  分类`)
  for (const category of CATEGORIES) {
    const counts = packages.map(pkg => String(pkg.specs.filter(file => categoryOf(file, pkg.id) === category.id).length).padStart(Math.max(pkg.id.length, 4)))
    console.log(`${category.id.padEnd(width)}  ${counts.join('  ')}  ${category.label}`)
  }
  process.exit(0)
}

const picked = own.filter(arg => !arg.startsWith('--'))
const unknownCategories = picked.filter(id => !CATEGORIES.some(category => category.id === id))
if (unknownCategories.length > 0) {
  console.error(`[test:browser] ✗ 没有这个分类：${unknownCategories.join(' ')}`)
  console.error(`  可选：${CATEGORIES.map(category => category.id).join(' ')}（pnpm test:browser --list 看每类有多少用例）`)
  process.exit(2)
}

const pkgFilter = option('pkg')
const pkgIds = pkgFilter ? pkgFilter.split(',').map(s => s.trim()).filter(Boolean) : null
const unknownPkgs = (pkgIds ?? []).filter(id => !packages.some(pkg => pkg.id === id))
if (unknownPkgs.length > 0) {
  console.error(`[test:browser] ✗ 没有这个包：${unknownPkgs.join(' ')}（可选：${packages.map(pkg => pkg.id).join(' ')}）`)
  process.exit(2)
}

const workersOption = option('workers')
const workers = workersOption ? Number(workersOption) : Math.max(1, Math.min(8, availableParallelism() - 1))
if (!Number.isInteger(workers) || workers < 1) {
  console.error(`[test:browser] ✗ --workers 要是正整数，收到 ${workersOption}`)
  process.exit(2)
}

// 每个包要跑的用例：没点分类即整包（不传文件过滤，交给包自己的 config）
const plan = packages
  .filter(pkg => pkgIds == null || pkgIds.includes(pkg.id))
  .map(pkg => ({ ...pkg, files: picked.length === 0 ? null : pkg.specs.filter(file => picked.includes(categoryOf(file, pkg.id))) }))
  .filter(pkg => pkg.files == null || pkg.files.length > 0)

if (plan.length === 0) {
  console.log('[test:browser] 选中的分类在这些包里没有用例')
  process.exit(0)
}

// 依赖构建：原先的 turbo run test:browser 声明了 dependsOn ^build，这里照样先把依赖构建好（有缓存时很快）
if (option('no-build') == null) {
  const filters = plan.map(pkg => `--filter=${pkg.name}^...`)
  console.log(`[test:browser] 构建依赖：${plan.map(pkg => pkg.name).join(' ')}`)
  const build = spawn('pnpm', ['turbo', 'run', 'build', ...filters, '--output-logs=errors-only'])
  if (build.status !== 0) {
    console.error('[test:browser] ✗ 依赖构建失败，用例没跑')
    process.exit(build.status ?? 1)
  }
}

const scope = picked.length > 0 ? picked.join(' ') : '全部分类'
const failures = []
const started = performance.now()
for (const pkg of plan) {
  const what = pkg.files == null ? `${pkg.specs.length} 个用例文件（整包）` : `${pkg.files.length} 个用例文件`
  console.log(`\n[test:browser] ── ${pkg.name} · ${scope} · ${what} · ${workers} 个 worker`)
  const args = ['run', 'test:browser', `--maxWorkers=${workers}`, ...(pkg.files ?? []).map(file => `${TESTS_DIR}/${file}`), ...passthrough]
  const run = spawn('pnpm', args, { cwd: pkg.dir })
  if (run.status !== 0)
    failures.push(pkg.name)
}

const seconds = ((performance.now() - started) / 1000).toFixed(0)
if (failures.length > 0) {
  console.error(`\n[test:browser] ✗ ${scope}：${plan.length} 个包里 ${failures.length} 个有失败（${seconds}s）：${failures.join(' ')}`)
  process.exit(1)
}
console.log(`\n[test:browser] ✓ ${scope}：${plan.length} 个包全部通过（${seconds}s）`)
