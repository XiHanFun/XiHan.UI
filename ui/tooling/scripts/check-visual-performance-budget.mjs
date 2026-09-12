#!/usr/bin/env node
// REQ-039 静态门禁：性能预算的设备、场景、运行链和既有体积棘轮必须仍指向同一事实。
import { readFile } from 'node:fs/promises'
import process from 'node:process'

const BUDGET_FILE = 'tooling/scripts/visual-performance-budget.json'
const SPEC_FILE = 'packages/adapters/vue/tests/browser/visual-performance.spec.ts'
const PERFORMANCE_CONFIG = 'packages/adapters/vue/vitest.performance.config.ts'
const BROWSER_CONFIG = 'packages/adapters/vue/vitest.browser.config.ts'
const BASELINE_FIXTURE = 'packages/adapters/vue/tests/browser/visual-baseline.fixture.ts'
const RUNNER = 'tooling/scripts/visual-baseline.mjs'

const read = path => readFile(path, 'utf8')
const budget = JSON.parse(await read(BUDGET_FILE))
const pkg = JSON.parse(await read('package.json'))
const [workspace, runner, spec, performanceConfig, browserConfig, fixture, workflow, docs] = await Promise.all([
  read('pnpm-workspace.yaml'),
  read(RUNNER),
  read(SPEC_FILE),
  read(PERFORMANCE_CONFIG),
  read(BROWSER_CONFIG),
  read(BASELINE_FIXTURE),
  read('../.github/workflows/ci.yml'),
  read('../docs/guide/testing.md'),
])

const problems = []
function requireText(text, needle, file, why) {
  if (!text.includes(needle))
    problems.push(`${file} 缺少 ${needle}——${why}`)
}

function finitePositive(value, key) {
  if (!Number.isFinite(value) || value <= 0)
    problems.push(`${key} 必须是正有限数，收到 ${value}`)
}

function nonNegativeInteger(value, key) {
  if (!Number.isInteger(value) || value < 0)
    problems.push(`${key} 必须是非负整数，收到 ${value}`)
}

if (budget.schemaVersion !== 1)
  problems.push(`schemaVersion 必须为 1，收到 ${budget.schemaVersion}`)
if (JSON.stringify(budget.scene?.modes) !== JSON.stringify(['default', 'reduce']))
  problems.push('scene.modes 必须严格为 default、reduce，不能漏掉性能档对照')
if (budget.scene?.fixture !== 'visual-baseline Dialog variant=blur')
  problems.push('scene.fixture 必须继续指向既有 visual-baseline Dialog variant=blur')

const profile = budget.profile ?? {}
for (const [key, value] of Object.entries({
  containerCpuCores: profile.containerCpuCores,
  cpuThrottlingRate: profile.cpuThrottlingRate,
  deviceScaleFactor: profile.deviceScaleFactor,
  sampleFrames: profile.sampleFrames,
  trialsPerMode: profile.trialsPerMode,
  warmupFrames: profile.warmupFrames,
  viewportHeight: profile.viewport?.height,
  viewportWidth: profile.viewport?.width,
}))
  finitePositive(value, `profile.${key}`)

const imageMatch = runner.match(/const IMAGE = '([^']+)'/)
if (!imageMatch || imageMatch[1] !== profile.playwrightImage)
  problems.push(`${BUDGET_FILE} 的 playwrightImage 与 ${RUNNER} 的 IMAGE 不一致`)
const imageVersion = profile.playwrightImage?.match(/playwright:v(\d+\.\d+\.\d+)-/i)?.[1]
const catalogVersion = workspace.match(/^\s*playwright:\s*\^?(\d+\.\d+\.\d+)\s*$/m)?.[1]
if (!imageVersion || imageVersion !== catalogVersion)
  problems.push(`性能镜像版本 ${imageVersion ?? '无法解析'} 与 catalog playwright ${catalogVersion ?? '无法解析'} 不一致`)

const viewportMatch = fixture.match(/VISUAL_BASELINE_VIEWPORT = \{ width: (\d+), height: (\d+) \}/)
if (!viewportMatch || Number(viewportMatch[1]) !== profile.viewport?.width || Number(viewportMatch[2]) !== profile.viewport?.height)
  problems.push(`${BUDGET_FILE} 的 viewport 与 ${BASELINE_FIXTURE} 不一致`)

if (pkg.scripts?.['visual:performance'] !== 'node tooling/scripts/visual-performance.mjs')
  problems.push('package.json 必须保留 visual:performance 的唯一入口')
requireText(pkg.scripts?.gate ?? '', 'check-visual-performance-budget.mjs', 'package.json', '预算静态门禁没有接进 pnpm gate')
requireText(spec, '../../../../../tooling/scripts/visual-performance-budget.json', SPEC_FILE, '浏览器采样没有消费预算真源')
requireText(spec, 'visualBaselineDialogFixture', SPEC_FILE, '性能场景没有复用像素基线 Dialog 夹具')
requireText(spec, 'Memory.getDOMCounters', SPEC_FILE, '缺少明确的内存资源留存代理')
requireText(performanceConfig, `include: ['tests/browser/visual-performance.spec.ts']`, PERFORMANCE_CONFIG, '专用配置没有只跑性能用例')
requireText(browserConfig, `exclude: ['tests/browser/visual-performance.spec.ts']`, BROWSER_CONFIG, '硬件相关预算会误入普通 browser 全量')
requireText(workflow, 'run: pnpm visual:performance', '../.github/workflows/ci.yml', 'CI 没有执行真实性能门禁')
requireText(docs, 'pnpm visual:performance --record', '../docs/guide/testing.md', '文档没有说明先采样再定预算')
requireText(docs, BUDGET_FILE, '../docs/guide/testing.md', '文档没有指向预算真源')

const expectedSizeSources = [
  ['.size-limit.json', 'pnpm size'],
  ['.size-limit.css.json', 'node tooling/scripts/check-skin-size.mjs'],
]
const actualSizeSources = (budget.packageSizeBudgetSources ?? []).map(entry => [entry.path, entry.command])
if (JSON.stringify(actualSizeSources) !== JSON.stringify(expectedSizeSources))
  problems.push('packageSizeBudgetSources 必须只引用既有 JS/CSS 体积棘轮，不能复制另一套阈值')
for (const [path] of expectedSizeSources) {
  try {
    JSON.parse(await read(path))
  }
  catch {
    problems.push(`读不到既有体积真源 ${path}`)
  }
}

const limits = budget.limits
if (limits == null) {
  problems.push('limits 仍为空——先跑 pnpm visual:performance --record，再按真实报告落预算')
}
else {
  for (const mode of ['default', 'reduce']) {
    const limit = limits.modes?.[mode]
    if (!limit) {
      problems.push(`limits.modes 缺少 ${mode}`)
      continue
    }
    finitePositive(limit.frameIntervalP95Ms, `limits.modes.${mode}.frameIntervalP95Ms`)
    finitePositive(limit.frameIntervalMaxMs, `limits.modes.${mode}.frameIntervalMaxMs`)
    nonNegativeInteger(limit.longTaskCountMax, `limits.modes.${mode}.longTaskCountMax`)
    if (!Number.isFinite(limit.longTaskTotalMsMax) || limit.longTaskTotalMsMax < 0)
      problems.push(`limits.modes.${mode}.longTaskTotalMsMax 必须是非负有限数`)
    nonNegativeInteger(limit.backdropBlurElementsMin, `limits.modes.${mode}.backdropBlurElementsMin`)
    if (!Number.isFinite(limit.backdropBlurAreaPxMin) || limit.backdropBlurAreaPxMin < 0)
      problems.push(`limits.modes.${mode}.backdropBlurAreaPxMin 必须是非负有限数`)
    if (!Number.isFinite(limit.backdropBlurAreaPxMax) || limit.backdropBlurAreaPxMax < limit.backdropBlurAreaPxMin)
      problems.push(`limits.modes.${mode}.backdropBlurAreaPxMax 必须不小于 min`)
  }
  const reduced = limits.modes?.reduce
  if (reduced && (reduced.backdropBlurElementsMin !== 0 || reduced.backdropBlurAreaPxMin !== 0 || reduced.backdropBlurAreaPxMax !== 0))
    problems.push('reduce 的有效模糊元素数与面积预算必须严格为 0')
  const normal = limits.modes?.default
  if (normal && (normal.backdropBlurElementsMin < 1 || normal.backdropBlurAreaPxMin <= 0))
    problems.push('default 必须至少量到一个非零有效模糊面')
  for (const [key, value] of Object.entries(limits.retention ?? {}))
    nonNegativeInteger(value, `limits.retention.${key}`)
  for (const key of ['documentsDeltaMax', 'nodesDeltaMax', 'jsEventListenersDeltaMax']) {
    if (!(key in (limits.retention ?? {})))
      problems.push(`limits.retention 缺少 ${key}`)
  }
}

if (problems.length > 0) {
  console.error('[check-visual-performance-budget] ✗')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(
  `[check-visual-performance-budget] 通过：${profile.viewport.width}×${profile.viewport.height}@${profile.deviceScaleFactor}，`
  + `${profile.containerCpuCores} CPU / ${profile.containerMemory} / ${profile.cpuThrottlingRate}× throttle，default/reduce 与两份体积真源已接线`,
)
