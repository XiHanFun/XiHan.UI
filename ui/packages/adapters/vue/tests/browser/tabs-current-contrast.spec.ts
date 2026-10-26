// 横线页签（line 档）的当前页压在页面底与面上：静息、悬停、键盘高亮与按下四态的字底对比度都要够正文 4.5。
// 示例取文档站的基础用法，亮、暗与两档高对比逐档量；带语气时交互三态的字跟着语气深一档。axe 在悬停那一刻再查一遍。
// Tab 刚停到当前页上那一刻不等过渡播完：逐帧量字底对比度，并当场跑 axe，过渡途中的每一帧也要够。
import type { Tone } from '@xihan-ui/core'
import type { App } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface Environment {
  readonly theme: 'light' | 'dark'
  readonly contrast: 'default' | 'more'
}

const ENVIRONMENTS: readonly Environment[] = [
  { theme: 'light', contrast: 'default' },
  { theme: 'dark', contrast: 'default' },
  { theme: 'light', contrast: 'more' },
  { theme: 'dark', contrast: 'more' },
]

const BACKDROPS = ['--xh-bg-page', '--xh-bg-surface'] as const
const TONES = ['neutral', 'success', 'warning', 'danger', 'info'] as const

let stage: HTMLElement | null = null
let app: App | null = null

afterEach(async () => {
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 0, y: 0, button: 'left', buttons: 0, clickCount: 1 })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  app?.unmount()
  app = null
  stage?.remove()
  stage = null
})

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/** 元素中心在外层页面（CDP 坐标系）里的位置：测试文档装在按比例缩放的 iframe 里，要先换算。 */
function centerOf(element: HTMLElement): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const outer = window.frameElement?.getBoundingClientRect()
  if (!outer)
    return { x, y }
  return { x: outer.left + x * (outer.width / window.innerWidth), y: outer.top + y * (outer.height / window.innerHeight) }
}

/** 文档站基础用法的同一份结构。 */
async function mountDemo(environment: Environment, backdrop: string, tone?: string, instant = true): Promise<HTMLElement> {
  app?.unmount()
  stage = document.createElement('div')
  stage.dataset.theme = environment.theme
  stage.dataset.contrast = environment.contrast
  stage.style.background = `var(${backdrop})`
  stage.style.padding = '16px'
  // 过渡即时完成：量的是稳定态的颜色
  if (instant) {
    for (const duration of ['micro', 'press', 'release'])
      stage.style.setProperty(`--xh-motion-duration-${duration}`, '0ms')
  }
  // 键盘那一步从示例前面这枚按钮按 Tab 进来，焦点经键盘落到当前页上
  const start = document.createElement('button')
  start.type = 'button'
  start.dataset.testStart = ''
  start.textContent = '起点'
  const host = document.createElement('div')
  stage.append(start, host)
  document.body.append(stage)
  app = createApp({
    render: () => h(XhTabsRoot, { defaultValue: 'overview', tone: tone as Tone | undefined, style: 'inline-size: 360px; max-inline-size: 100%' }, () => [
      h(XhTabsList, { 'aria-label': '项目视图' }, () => [
        h(XhTabsTrigger, { value: 'overview' }, () => '概览'),
        h(XhTabsTrigger, { value: 'analytics' }, () => '分析'),
        h(XhTabsTrigger, { value: 'reports' }, () => '报告'),
        h(XhTabsIndicator),
      ]),
      h(XhTabsContent, { value: 'overview' }, () => '查看项目概览与近期活动。'),
      h(XhTabsContent, { value: 'analytics' }, () => '分析访问趋势与关键指标。'),
      h(XhTabsContent, { value: 'reports' }, () => '浏览已生成的项目报告。'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await frame()
  return stage.querySelector<HTMLElement>('[data-scope="tabs"][data-part="trigger"][data-current]')!
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

/** 依次叠画几层颜色后读回那一点的 8 位 sRGB。 */
function paint(...layers: readonly string[]): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  for (const color of ['#fff', ...layers]) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
  }
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]!, d[1]!, d[2]!]
}

function luminance([r, g, b]: readonly [number, number, number]): number {
  const channel = (c: number): number => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

interface Reading {
  readonly fg: string
  readonly ratio: number
}

/** 标签的字色压在「承载底 + 标签自己的面」上的对比度。 */
function read(trigger: HTMLElement): Reading {
  const backdrop = getComputedStyle(stage!).backgroundColor
  const face = getComputedStyle(trigger).backgroundColor
  const fg = getComputedStyle(trigger).color
  const [hi, lo] = [luminance(paint(backdrop, face, fg)), luminance(paint(backdrop, face))].sort((x, y) => y - x) as [number, number]
  return { fg, ratio: (hi + 0.05) / (lo + 0.05) }
}

/** 静息、悬停、按下、键盘高亮四态各读一次。 */
async function readStates(trigger: HTMLElement): Promise<Record<'rest' | 'hover' | 'pressed' | 'highlight', Reading>> {
  const rest = read(trigger)
  const { x, y } = centerOf(trigger)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await frame()
  const hover = read(trigger)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
  await frame()
  const pressed = read(trigger)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  stage!.querySelector<HTMLElement>('[data-test-start]')!.focus()
  await userEvent.tab()
  await frame()
  expect(document.activeElement, '键盘焦点落在当前页上').toBe(trigger)
  expect(trigger.matches(':focus-visible')).toBe(true)
  const highlight = read(trigger)
  return { rest, hover, pressed, highlight }
}

describe('tabs 横线档的当前页对比度', () => {
  for (const environment of ENVIRONMENTS) {
    for (const backdrop of BACKDROPS) {
      it(`${environment.theme} / contrast-${environment.contrast} / ${backdrop}：四态都够 4.5`, async () => {
        const states = await readStates(await mountDemo(environment, backdrop))
        for (const [state, { ratio }] of Object.entries(states))
          expect(ratio, state).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  for (const environment of ENVIRONMENTS) {
    it(`${environment.theme} / contrast-${environment.contrast}：带语气时四态都够 4.5，交互三态的字跟着语气深一档`, async () => {
      const brandStrong = (await readStates(await mountDemo(environment, '--xh-bg-page'))).hover.fg
      stage!.remove()
      for (const backdrop of BACKDROPS) {
        const strongByTone = new Set<string>()
        for (const tone of TONES) {
          const states = await readStates(await mountDemo(environment, backdrop, tone))
          for (const [state, { ratio }] of Object.entries(states))
            expect(ratio, `${tone} ${backdrop} ${state}`).toBeGreaterThanOrEqual(4.5)
          // 悬停、高亮、按下是同一枚深一档的字，不退回无语气时的品牌深字
          expect(states.highlight.fg, `${tone} ${backdrop}`).toBe(states.hover.fg)
          expect(states.pressed.fg, `${tone} ${backdrop}`).toBe(states.hover.fg)
          expect(states.hover.fg, `${tone} ${backdrop}`).not.toBe(brandStrong)
          strongByTone.add(states.hover.fg)
          stage!.remove()
        }
        expect(strongByTone.size, `${backdrop} 上各语气深一档的字互不相同`).toBe(TONES.length)
      }
    })
  }

  it('键盘 Tab 刚停到当前页上：过渡途中逐帧都够 4.5，当场跑 axe 不报文字对比度', async () => {
    for (const environment of ENVIRONMENTS) {
      for (const backdrop of BACKDROPS) {
        const trigger = await mountDemo(environment, backdrop, undefined, false)
        stage!.querySelector<HTMLElement>('[data-test-start]')!.focus()
        await userEvent.tab()
        expect(document.activeElement, '键盘焦点落在当前页上').toBe(trigger)
        const label = `${environment.theme} / ${environment.contrast} / ${backdrop}`
        const { violations } = await runAxe(stage!)
        expect(violations.filter(v => v.id === 'color-contrast').map(v => v.nodes.map(n => n.failureSummary)), label).toEqual([])
        // 过渡缺省 150ms：量够十帧，从停住那一刻到落定
        for (let i = 0; i < 10; i++) {
          expect(read(trigger).ratio, `${label} 第 ${i} 帧`).toBeGreaterThanOrEqual(4.5)
          await frame()
        }
        stage!.remove()
      }
    }
  })

  it('悬停在当前页上时 axe 不报文字对比度', async () => {
    for (const environment of ENVIRONMENTS) {
      const trigger = await mountDemo(environment, '--xh-bg-page')
      await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...centerOf(trigger) })
      await frame()
      const { violations } = await runAxe(stage!)
      expect(violations.filter(v => v.id === 'color-contrast').map(v => v.nodes.map(n => n.failureSummary)), `${environment.theme} / ${environment.contrast}`).toEqual([])
      stage!.remove()
    }
  })
})
