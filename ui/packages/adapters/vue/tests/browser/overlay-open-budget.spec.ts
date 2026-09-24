// 浮层打开预算：点开 Select / Menu / Popover 这一下，主线程不得出现 ≥50ms 的长任务，
// 从 click 派发到 content 落成 data-state="open" 的同步 JS 也得压在 30ms 内。
//
// 量的是第 2、3 次打开，不是首次：首次要摊编译与皮肤解析，用户抱怨的是「每次点都卡」。
// 页面不是只有被量的那三个浮层：业务页一张表每行都带行内操作菜单与文字提示，文档站一页
// 三十来个例子，每个都是一份 Portal 壳与视觉桥。打开一个浮层的代价不能随页面上其他浮层的
// 数量线性涨，也不能随 :root 上令牌的数量线性涨——再压一份 :root 多摞 800 个自定义属性的
// 极端环境，两种环境守同一预算。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, inject, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhSelectRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** Long Tasks API 的门槛：任何一条 ≥50ms 的任务都会被输入延迟直接感知。 */
const LONG_TASK_MS = 50
/** 一次打开允许的同步 JS 总量：click 派发起，到 content 的 data-state 落成 open。 */
const SYNC_BUDGET_MS = 30
/**
 * 绝对预算在 CI 上的宽放倍数，本机仍按原值判（与 markdown 性能用例同一做法）。
 * GitHub 共享 runner 比开发机慢数倍：本机 10–20ms 的一次打开，CI 上量到同步 21–43ms、整任务 50–69ms，
 * 卡在门槛两侧时过时不过。CI 上只判「代价没有失控」并把实测数打进日志，门槛本身在本机判。
 */
const BUDGET_SLACK = inject('ci') ? 2 : 1
/** 页面背景：一张列表的行数，每行一个行内操作 Menu 与一个 Tooltip，各自带一份 Portal 壳。 */
const BACKGROUND_ROW_COUNT = 24
/** 极端夹具：:root 上额外摞的自定义属性个数。 */
const EXTREME_CUSTOM_PROPERTY_COUNT = 800
const SELECT_OPTION_COUNT = 20
const EXTREME_STYLE_ID = 'xh-overlay-open-budget-extreme'

type Scope = 'select' | 'menu' | 'popover'

interface OpenSample {
  /** click 派发到 open 属性落地的同步 JS 时间。 */
  syncMs: number
  /** 这段时间内观察到的长任务时长。 */
  longTasks: number[]
}

const OPTIONS = Array.from({ length: SELECT_OPTION_COUNT }, (_, index) => ({
  value: `option-${index}`,
  label: `第 ${index + 1} 项`,
}))

let app: App | null = null
let host: HTMLElement | null = null

/** 被量那份浮层的触发器：背景行里同类浮层的触发器不算。 */
function triggerOf(scope: Scope): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='measured'] [data-scope='${scope}'][data-part='trigger']`)
  if (!element)
    throw new Error(`找不到被量的 ${scope}/trigger`)
  return element
}

/** 触发器 aria-controls 指向的 content：它被搬进了 portal 落点，按 id 找而不是按祖先找。 */
function contentOf(scope: Scope): HTMLElement {
  const id = triggerOf(scope).getAttribute('aria-controls')
  const element = id ? document.getElementById(id) : null
  if (!element)
    throw new Error(`被量的 ${scope}/trigger 没有通过 aria-controls 指到 content`)
  return element
}

function raf(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function macrotask(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

async function waitForAnimationsDone(): Promise<void> {
  for (;;) {
    const running = document.getAnimations().filter(animation =>
      animation.playState === 'running' && Number.isFinite(animation.effect?.getComputedTiming().endTime),
    )
    if (running.length === 0) {
      await raf()
      return
    }
    await Promise.all(running.map(animation => animation.finished.then(() => {}, () => {})))
  }
}

/** 等 content 的 data-state 变成目标值；只靠 MutationObserver，不引入宏任务，同一个任务里量得到。 */
function untilState(content: HTMLElement, state: 'open' | 'closed'): Promise<void> {
  if (content.getAttribute('data-state') === state)
    return Promise.resolve()
  return new Promise((resolve, reject) => {
    let timer = 0
    const observer = new MutationObserver(() => {
      if (content.getAttribute('data-state') !== state)
        return
      clearTimeout(timer)
      observer.disconnect()
      resolve()
    })
    timer = window.setTimeout(() => {
      observer.disconnect()
      reject(new Error(`content 没有在 2s 内变成 data-state="${state}"`))
    }, 2000)
    observer.observe(content, { attributes: true, attributeFilter: ['data-state'] })
  })
}

function backgroundRow(index: number): VNode {
  return h('li', { key: index, style: 'display:flex;gap:8px;align-items:center' }, [
    h('span', `第 ${index + 1} 行`),
    h(XhTooltipRoot, null, () => [
      h(XhTooltipTrigger, null, () => '提示'),
      h(XhTooltipPositioner, null, () => h(XhTooltipContent, null, () => `第 ${index + 1} 行的说明`)),
    ]),
    h(XhMenuRoot, null, () => [
      h(XhMenuTrigger, null, () => '操作'),
      h(XhMenuPositioner, null, () => [
        h(XhMenuContent, null, () => [
          h(XhMenuItem, { value: 'edit' }, () => h(XhMenuItemText, null, () => '编辑')),
          h(XhMenuItem, { value: 'remove' }, () => h(XhMenuItemText, null, () => '删除')),
        ]),
      ]),
    ]),
  ])
}

async function mountFixture(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h('div', { style: 'padding:24px' }, [
      h('div', { 'data-testid': 'measured', 'style': 'display:flex;gap:16px' }, [
        h(XhSelectRoot, { collection: OPTIONS, defaultValue: 'option-3', placement: 'bottom-start' }),
        h(XhMenuRoot, null, () => [
          h(XhMenuTrigger, null, () => '菜单'),
          h(XhMenuPositioner, null, () => [
            h(XhMenuContent, null, () => [
              h(XhMenuItem, { value: 'edit' }, () => h(XhMenuItemText, null, () => '编辑')),
              h(XhMenuItem, { value: 'copy' }, () => h(XhMenuItemText, null, () => '复制')),
              h(XhMenuItem, { value: 'remove' }, () => h(XhMenuItemText, null, () => '删除')),
            ]),
          ]),
        ]),
        h(XhPopoverRoot, null, () => [
          h(XhPopoverTrigger, null, () => '弹出'),
          h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => [
            h(XhPopoverTitle, null, () => '设置'),
            h('button', '保存'),
          ])),
        ]),
      ]),
      h('ul', { style: 'list-style:none;padding:0;margin:16px 0 0' }, Array.from({ length: BACKGROUND_ROW_COUNT }, (_, index) => backgroundRow(index))),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await raf()
  expect(document.querySelectorAll('[data-xh-portal-shell]')).toHaveLength(3 + BACKGROUND_ROW_COUNT * 2)
}

function installExtremeCustomProperties(): void {
  const declarations = Array.from(
    { length: EXTREME_CUSTOM_PROPERTY_COUNT },
    (_, index) => `--xh-perf-fixture-${index}: ${index}px;`,
  ).join('')
  const style = document.createElement('style')
  style.id = EXTREME_STYLE_ID
  style.textContent = `:root{${declarations}}`
  document.head.append(style)
}

async function openOnce(scope: Scope): Promise<OpenSample> {
  const trigger = triggerOf(scope)
  const content = contentOf(scope)
  expect(content.getAttribute('data-state')).toBe('closed')
  const longTasks: number[] = []
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      longTasks.push(entry.duration)
  })
  observer.observe({ type: 'longtask' })

  const start = performance.now()
  trigger.click()
  await untilState(content, 'open')
  const syncMs = performance.now() - start

  // longtask 条目在任务结束后才投递：让出两个宏任务再收
  await macrotask()
  await macrotask()
  observer.disconnect()
  return { syncMs, longTasks }
}

async function closeOnce(scope: Scope): Promise<void> {
  const content = contentOf(scope)
  const target = document.activeElement instanceof HTMLElement ? document.activeElement : document.body
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  await untilState(content, 'closed')
  await waitForAnimationsDone()
  triggerOf(scope).blur()
  await raf()
}

async function warmUp(scope: Scope): Promise<void> {
  await openOnce(scope)
  await closeOnce(scope)
}

async function sampleOpens(scope: Scope, count: number): Promise<OpenSample[]> {
  const samples: OpenSample[] = []
  for (let index = 0; index < count; index++) {
    samples.push(await openOnce(scope))
    await closeOnce(scope)
  }
  return samples
}

function report(label: string, scope: Scope, samples: OpenSample[]): string {
  const rows = samples.map((sample, index) =>
    `第 ${index + 2} 次 同步 ${sample.syncMs.toFixed(1)}ms 长任务 [${sample.longTasks.map(ms => ms.toFixed(0)).join(', ')}]`,
  )
  return `[${label}] ${scope}: ${rows.join(' · ')}`
}

function assertWithinBudget(label: string, scope: Scope, samples: OpenSample[]): void {
  const summary = `${report(label, scope, samples)}${BUDGET_SLACK > 1 ? `（CI 预算 ×${BUDGET_SLACK}）` : ''}`
  console.warn(`\n${summary}`)
  for (const sample of samples) {
    expect(sample.longTasks.filter(ms => ms >= LONG_TASK_MS * BUDGET_SLACK), summary).toEqual([])
    expect(sample.syncMs, summary).toBeLessThanOrEqual(SYNC_BUDGET_MS * BUDGET_SLACK)
  }
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  document.getElementById(EXTREME_STYLE_ID)?.remove()
  app = null
  host = null
})

describe('浮层打开预算', () => {
  it.each<Scope>(['select', 'menu', 'popover'])('%s 第 2、3 次点开没有 ≥50ms 长任务，同步 JS ≤ 30ms', async (scope) => {
    await mountFixture()
    await warmUp(scope)
    const samples = await sampleOpens(scope, 2)
    assertWithinBudget('默认', scope, samples)
  })

  it.each<Scope>(['select', 'menu', 'popover'])(`%s 在 :root 多 ${EXTREME_CUSTOM_PROPERTY_COUNT} 个自定义属性时仍守住同一预算`, async (scope) => {
    installExtremeCustomProperties()
    expect(getComputedStyle(document.documentElement).getPropertyValue('--xh-perf-fixture-799').trim()).toBe('799px')
    await mountFixture()
    await warmUp(scope)
    const samples = await sampleOpens(scope, 2)
    assertWithinBudget('极端', scope, samples)
  })
})

declare module 'vitest' {
  export interface ProvidedContext {
    /** 由 vitest.browser.config 的 provide 传入：是否跑在 CI 上。 */
    ci: boolean
  }
}
