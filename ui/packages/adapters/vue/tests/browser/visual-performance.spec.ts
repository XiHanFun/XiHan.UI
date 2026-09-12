// REQ-039：在真实 Chromium 中给既有 Dialog 视觉样板施加固定的逐帧背景重绘，
// 同时量默认透明与 data-transparency=reduce。预算来自 tooling/scripts 下唯一的 JSON 真源，
// record 模式只落真实报告、不判预算，用于先采样再定红线。
import type { App } from 'vue'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cdp, commands, page } from 'vitest/browser'
import { createApp, nextTick } from 'vue'
import budgetSource from '../../../../../tooling/scripts/visual-performance-budget.json'
import {
  VISUAL_BASELINE_FONT,
  VISUAL_BASELINE_VIEWPORT,
  visualBaselineDialogFixture,
} from './visual-baseline.fixture'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Mode = 'default' | 'reduce'

interface ModeLimit {
  frameIntervalP95Ms: number
  frameIntervalMaxMs: number
  longTaskCountMax: number
  longTaskTotalMsMax: number
  backdropBlurElementsMin: number
  backdropBlurAreaPxMin: number
  backdropBlurAreaPxMax: number
}

interface Limits {
  modes: Record<Mode, ModeLimit>
  retention: {
    documentsDeltaMax: number
    nodesDeltaMax: number
    jsEventListenersDeltaMax: number
  }
}

interface BlurMetric {
  areaPx: number
  elements: Array<{
    blurPx: number
    areaPx: number
    part: string
    scope: string
  }>
}

interface TrialMetric {
  backdropBlur: BlurMetric
  frameIntervalMaxMs: number
  frameIntervalP50Ms: number
  frameIntervalP95Ms: number
  longTaskCount: number
  longTaskMaxMs: number
  longTaskTotalMs: number
}

const budget = budgetSource as Omit<typeof budgetSource, 'limits'> & { limits: Limits | null }
const RECORD_ONLY = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_VISUAL_PERFORMANCE_RECORD === '1'
const REPORT_FILE = '.vitest-attachments/visual-performance.json'
const PORTAL_ROOT_ID = 'xh-portal-root'
const STYLE_ID = 'xh-visual-performance-style'
const STAGE_ID = 'xh-visual-performance-stage'
const MODES = budget.scene.modes as Mode[]

let phase = 0

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

function percentile(values: number[], ratio: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)]!
}

function raf(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

async function waitForAnimationsDone(): Promise<void> {
  for (;;) {
    const running = document.getAnimations().filter(animation => animation.playState === 'running')
    if (running.length === 0) {
      await raf()
      if (document.getAnimations().every(animation => animation.playState !== 'running'))
        return
      continue
    }
    const endless = running.some(animation => animation.effect?.getComputedTiming().iterations === Number.POSITIVE_INFINITY)
    if (endless)
      throw new Error('性能样板出现无限动画，无法把固定背景重绘与组件自发动画分开')
    await Promise.all(running.map(animation => animation.finished.then(() => {}, () => {})))
  }
}

function installStageStyle(): void {
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    :root {
      font-size: 16px;
      font-family: '${VISUAL_BASELINE_FONT}';
    }

    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    #${STAGE_ID} {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      overflow: hidden;
      color: var(--xh-fg-default);
      background-color: var(--xh-bg-canvas);
      background-image:
        radial-gradient(circle at 20% 30%, var(--xh-accent-500) 0 8%, transparent 28%),
        radial-gradient(circle at 75% 65%, var(--xh-info-500) 0 10%, transparent 32%),
        repeating-linear-gradient(135deg, transparent 0 18px, var(--xh-bg-muted) 18px 36px);
      background-size: 360px 280px, 420px 320px, 72px 72px;
    }
  `
  document.head.append(style)
}

function applyMode(mode: Mode): void {
  const root = document.documentElement
  root.dataset.theme = budget.scene.theme
  root.dataset.density = budget.scene.density
  if (mode === 'reduce')
    root.dataset.transparency = 'reduce'
  else
    delete root.dataset.transparency
}

function clearAxes(): void {
  const root = document.documentElement
  delete root.dataset.theme
  delete root.dataset.density
  delete root.dataset.transparency
}

async function mountScene(mode: Mode): Promise<{ app: App, stage: HTMLElement }> {
  applyMode(mode)
  const stage = document.createElement('main')
  stage.id = STAGE_ID
  const slot = document.createElement('div')
  stage.append(slot)
  document.body.prepend(stage)

  const app = createApp({ setup: () => () => visualBaselineDialogFixture() })
  app.mount(slot)
  await nextTick()
  await nextTick()
  await document.fonts.ready
  await waitForAnimationsDone()
  return { app, stage }
}

async function unmountScene(view: { app: App, stage: HTMLElement }): Promise<void> {
  view.app.unmount()
  view.stage.remove()
  document.getElementById(PORTAL_ROOT_ID)?.replaceChildren()
  clearAxes()
  await raf()
}

function effectiveBackdropBlur(): BlurMetric {
  const elements: BlurMetric['elements'] = []
  for (const element of document.querySelectorAll<HTMLElement>('body *')) {
    const style = getComputedStyle(element)
    const filter = style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter')
    const match = filter.match(/(?:^|\s)blur\(([\d.]+)px\)/)
    if (!match || style.display === 'none' || style.visibility === 'hidden' || Number.parseFloat(style.opacity) === 0)
      continue
    const rect = element.getBoundingClientRect()
    const width = Math.max(0, Math.min(innerWidth, rect.right) - Math.max(0, rect.left))
    const height = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top))
    const areaPx = round(width * height)
    if (areaPx === 0)
      continue
    elements.push({
      areaPx,
      blurPx: Number.parseFloat(match[1]!),
      part: element.dataset.part ?? '',
      scope: element.dataset.scope ?? '',
    })
  }
  return { areaPx: round(elements.reduce((sum, entry) => sum + entry.areaPx, 0)), elements }
}

function sampleFrames(stage: HTMLElement, count: number): Promise<number[]> {
  return new Promise((resolve) => {
    const intervals: number[] = []
    let previous: number | undefined
    const tick = (timestamp: number) => {
      phase = (phase + 7) % 360
      stage.style.backgroundPosition = `${phase}px ${-phase}px, ${-phase}px ${phase}px, ${phase / 2}px ${phase / 2}px`
      if (previous != null)
        intervals.push(timestamp - previous)
      previous = timestamp
      if (intervals.length === count)
        resolve(intervals)
      else
        requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

async function measureTrial(mode: Mode): Promise<{ intervals: number[], metric: TrialMetric }> {
  const view = await mountScene(mode)
  await sampleFrames(view.stage, budget.profile.warmupFrames)

  const longTasks: number[] = []
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      longTasks.push(entry.duration)
  })
  observer.observe({ type: 'longtask', buffered: false })
  const intervals = await sampleFrames(view.stage, budget.profile.sampleFrames)
  longTasks.push(...observer.takeRecords().map(entry => entry.duration))
  observer.disconnect()

  const metric: TrialMetric = {
    backdropBlur: effectiveBackdropBlur(),
    frameIntervalMaxMs: round(Math.max(...intervals)),
    frameIntervalP50Ms: round(percentile(intervals, 0.5)),
    frameIntervalP95Ms: round(percentile(intervals, 0.95)),
    longTaskCount: longTasks.length,
    longTaskMaxMs: round(longTasks.length === 0 ? 0 : Math.max(...longTasks)),
    longTaskTotalMs: round(longTasks.reduce((sum, duration) => sum + duration, 0)),
  }
  await unmountScene(view)
  return { intervals, metric }
}

async function domCounters(): Promise<{ documents: number, jsEventListeners: number, nodes: number }> {
  await cdp().send('HeapProfiler.collectGarbage')
  return await cdp().send('Memory.getDOMCounters') as { documents: number, jsEventListeners: number, nodes: number }
}

async function exerciseRetentionCycles(): Promise<void> {
  for (let index = 0; index < budget.profile.retentionCycles; index++) {
    const mode = MODES[index % MODES.length]!
    const view = await mountScene(mode)
    await unmountScene(view)
  }
}

describe('req-039 视觉样板性能预算', () => {
  beforeAll(async () => {
    expect(MODES).toEqual(['default', 'reduce'])
    expect(PerformanceObserver.supportedEntryTypes).toContain('longtask')
    installStageStyle()
    await page.viewport(VISUAL_BASELINE_VIEWPORT.width, VISUAL_BASELINE_VIEWPORT.height)
    await cdp().send('Emulation.setCPUThrottlingRate', { rate: budget.profile.cpuThrottlingRate })
    expect(innerWidth).toBe(budget.profile.viewport.width)
    expect(innerHeight).toBe(budget.profile.viewport.height)
    expect(devicePixelRatio).toBe(budget.profile.deviceScaleFactor)
  })

  afterAll(async () => {
    await cdp().send('Emulation.setCPUThrottlingRate', { rate: 1 })
    document.getElementById(STYLE_ID)?.remove()
    document.getElementById(PORTAL_ROOT_ID)?.replaceChildren()
    document.getElementById(STAGE_ID)?.remove()
    clearAxes()
  })

  it('交替采样默认与 reduce，并在强制 GC 后核对资源留存代理', async () => {
    const trials = { default: [] as TrialMetric[], reduce: [] as TrialMetric[] }
    const intervals = { default: [] as number[], reduce: [] as number[] }
    for (let trial = 0; trial < budget.profile.trialsPerMode; trial++) {
      for (const mode of MODES) {
        const measured = await measureTrial(mode)
        trials[mode].push(measured.metric)
        intervals[mode].push(...measured.intervals)
      }
    }

    const beforeRetention = await domCounters()
    await exerciseRetentionCycles()
    const afterRetention = await domCounters()
    const retentionDelta = {
      documents: afterRetention.documents - beforeRetention.documents,
      jsEventListeners: afterRetention.jsEventListeners - beforeRetention.jsEventListeners,
      nodes: afterRetention.nodes - beforeRetention.nodes,
    }

    const modes = Object.fromEntries(MODES.map((mode) => {
      const modeTrials = trials[mode]
      return [mode, {
        backdropBlurAreaPxMax: Math.max(...modeTrials.map(metric => metric.backdropBlur.areaPx)),
        backdropBlurAreaPxMin: Math.min(...modeTrials.map(metric => metric.backdropBlur.areaPx)),
        backdropBlurElementsMin: Math.min(...modeTrials.map(metric => metric.backdropBlur.elements.length)),
        frameIntervalMaxMs: round(Math.max(...intervals[mode])),
        frameIntervalP50Ms: round(percentile(intervals[mode], 0.5)),
        frameIntervalP95Ms: round(percentile(intervals[mode], 0.95)),
        longTaskCount: modeTrials.reduce((sum, metric) => sum + metric.longTaskCount, 0),
        longTaskMaxMs: round(Math.max(...modeTrials.map(metric => metric.longTaskMaxMs))),
        longTaskTotalMs: round(modeTrials.reduce((sum, metric) => sum + metric.longTaskTotalMs, 0)),
        trials: modeTrials,
      }]
    })) as Record<Mode, {
      backdropBlurAreaPxMax: number
      backdropBlurAreaPxMin: number
      backdropBlurElementsMin: number
      frameIntervalMaxMs: number
      frameIntervalP50Ms: number
      frameIntervalP95Ms: number
      longTaskCount: number
      longTaskMaxMs: number
      longTaskTotalMs: number
      trials: TrialMetric[]
    }>

    const candidateMemory = performance as Performance & { measureUserAgentSpecificMemory?: () => Promise<unknown> }
    const report = {
      schemaVersion: budget.schemaVersion,
      sampledAt: new Date().toISOString(),
      recordOnly: RECORD_ONLY,
      profile: budget.profile,
      runtime: {
        crossOriginIsolated,
        hardwareConcurrency: navigator.hardwareConcurrency,
        measureUserAgentSpecificMemoryCandidate: typeof candidateMemory.measureUserAgentSpecificMemory === 'function',
        userAgent: navigator.userAgent,
      },
      scene: budget.scene,
      modes,
      memory: {
        ...budget.memory,
        proxyResult: { after: afterRetention, before: beforeRetention, delta: retentionDelta },
      },
      packageSizeBudgetSources: budget.packageSizeBudgetSources,
    }
    await commands.writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`)

    const problems: string[] = []
    if (modes.default.backdropBlurElementsMin === 0 || modes.default.backdropBlurAreaPxMin === 0)
      problems.push('default 没量到有效 backdrop-filter 模糊面，场景或材质已失效')
    if (modes.reduce.backdropBlurElementsMin !== 0 || modes.reduce.backdropBlurAreaPxMax !== 0)
      problems.push(`reduce 仍有模糊：${modes.reduce.backdropBlurElementsMin} 个 / ${modes.reduce.backdropBlurAreaPxMax} px²`)

    const limits = budget.limits
    if (!RECORD_ONLY && limits == null) {
      problems.push('预算真源还没有 limits；先用 pnpm visual:performance --record 采样，再根据报告制定红线')
    }
    else if (!RECORD_ONLY && limits != null) {
      for (const mode of MODES) {
        const actual = modes[mode]
        const limit = limits.modes[mode]
        if (actual.frameIntervalP95Ms > limit.frameIntervalP95Ms)
          problems.push(`${mode} 帧间隔 p95 ${actual.frameIntervalP95Ms}ms > ${limit.frameIntervalP95Ms}ms`)
        if (actual.frameIntervalMaxMs > limit.frameIntervalMaxMs)
          problems.push(`${mode} 最大帧间隔 ${actual.frameIntervalMaxMs}ms > ${limit.frameIntervalMaxMs}ms`)
        if (actual.longTaskCount > limit.longTaskCountMax)
          problems.push(`${mode} 长任务 ${actual.longTaskCount} 个 > ${limit.longTaskCountMax} 个`)
        if (actual.longTaskTotalMs > limit.longTaskTotalMsMax)
          problems.push(`${mode} 长任务合计 ${actual.longTaskTotalMs}ms > ${limit.longTaskTotalMsMax}ms`)
        if (actual.backdropBlurElementsMin < limit.backdropBlurElementsMin)
          problems.push(`${mode} 有效模糊面最少 ${actual.backdropBlurElementsMin} 个 < ${limit.backdropBlurElementsMin} 个`)
        if (actual.backdropBlurAreaPxMin < limit.backdropBlurAreaPxMin)
          problems.push(`${mode} 有效模糊面积最少 ${actual.backdropBlurAreaPxMin}px² < ${limit.backdropBlurAreaPxMin}px²`)
        if (actual.backdropBlurAreaPxMax > limit.backdropBlurAreaPxMax)
          problems.push(`${mode} 有效模糊面积最大 ${actual.backdropBlurAreaPxMax}px² > ${limit.backdropBlurAreaPxMax}px²`)
      }
      if (retentionDelta.documents > limits.retention.documentsDeltaMax)
        problems.push(`资源代理 documents 留存 ${retentionDelta.documents} > ${limits.retention.documentsDeltaMax}`)
      if (retentionDelta.nodes > limits.retention.nodesDeltaMax)
        problems.push(`资源代理 nodes 留存 ${retentionDelta.nodes} > ${limits.retention.nodesDeltaMax}`)
      if (retentionDelta.jsEventListeners > limits.retention.jsEventListenersDeltaMax)
        problems.push(`资源代理 jsEventListeners 留存 ${retentionDelta.jsEventListeners} > ${limits.retention.jsEventListenersDeltaMax}`)
    }

    expect(problems, `性能报告：${REPORT_FILE}`).toEqual([])
  })
})
