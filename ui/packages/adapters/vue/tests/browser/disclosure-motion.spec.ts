// 面级披露的开合过程：行高真的从 0 长到全开（正文是裸文本也一样），内容随开合淡变，
// 宿主带 [hidden]{display:none!important}（Tailwind 4 的 preflight 就是这条）时退场照样播完。
// 中途的高度、透明度与 display 只有真实浏览器量得出来。
import type { App, Ref, VNode } from 'vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhAccordionContent,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhReasoningContent,
  XhReasoningRoot,
  XhReasoningTrigger,
  XhToolCallContent,
  XhToolCallLabel,
  XhToolCallRoot,
  XhToolCallTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 正文写裸文本：匿名网格项不能写 min-height，行轨道自己得能收到 0。 */
const BODY = Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 行说明文字`).join('。')
const MOTION_SLOTS = ['--xh-motion-duration-expand', '--xh-motion-duration-collapse', '--xh-motion-ease-disclosure']

let app: App | null = null
let host: HTMLElement | null = null
let preflight: HTMLStyleElement | null = null

beforeEach(() => {
  // 放慢到看得清中途：两支各走 600ms、匀速，中途开到几成与时间成正比
  const root = document.documentElement.style
  root.setProperty('--xh-motion-duration-expand', '600ms')
  root.setProperty('--xh-motion-duration-collapse', '600ms')
  root.setProperty('--xh-motion-ease-disclosure', 'linear')
})

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  preflight?.remove()
  preflight = null
  for (const slot of MOTION_SLOTS)
    document.documentElement.style.removeProperty(slot)
})

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function useTailwindPreflight(): void {
  preflight = document.createElement('style')
  preflight.textContent = '@layer base { [hidden]:where(:not([hidden="until-found"])) { display: none !important; } }'
  document.head.append(preflight)
}

interface Case {
  readonly scope: string
  readonly tree: (open: boolean, set: (next: boolean) => void) => VNode
}

const CASES: Case[] = [
  {
    scope: 'collapsible',
    tree: (open, set) => h(XhCollapsibleRoot, { 'open': open, 'onUpdate:open': set }, () => [
      h(XhCollapsibleTrigger, () => [h(XhCollapsibleIndicator), h('span', '详情')]),
      h(XhCollapsibleContent, () => BODY),
    ]),
  },
  {
    scope: 'accordion',
    tree: (open, set) => h(XhAccordionRoot, { 'value': open ? ['a'] : [], 'collapsible': true, 'onUpdate:value': (next: string[]) => set(next.length > 0) }, () => [
      h(XhAccordionItem, { value: 'a' }, () => [
        h(XhAccordionTrigger, () => [h(XhAccordionIndicator), h('span', '第一项')]),
        h(XhAccordionContent, () => BODY),
      ]),
    ]),
  },
  {
    scope: 'reasoning',
    tree: open => h(XhReasoningRoot, { open }, () => [
      h(XhReasoningTrigger, () => '想了想'),
      h(XhReasoningContent, () => BODY),
    ]),
  },
  {
    scope: 'tool-call',
    tree: open => h(XhToolCallRoot, { open, phase: 'output-available' }, () => [
      h(XhToolCallTrigger, () => [h(XhToolCallLabel, () => '搜索')]),
      h(XhToolCallContent, () => BODY),
    ]),
  },
]

function mount(item: Case, open: Ref<boolean>): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => item.tree(open.value, (next) => { open.value = next }),
  })
  app.mount(host)
  return host.querySelector<HTMLElement>(`[data-scope="${item.scope}"][data-part="content"]`)!
}

async function toggle(open: Ref<boolean>, next: boolean): Promise<void> {
  open.value = next
  await nextTick()
  await frame()
}

describe('accordion 单开切换', () => {
  it('一项收起一项展开等长同曲线：总高度一路单调，下方内容不过冲回弹', async () => {
    // 取真实令牌，不走上面放慢的那组
    for (const slot of MOTION_SLOTS)
      document.documentElement.style.removeProperty(slot)
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    const value = ref(['long'])
    app = createApp({
      render: () => h(XhAccordionRoot, { 'value': value.value, 'onUpdate:value': (next: string[]) => { value.value = next } }, () => [
        h(XhAccordionItem, { value: 'long' }, () => [
          h(XhAccordionTrigger, () => [h(XhAccordionIndicator), h('span', '长的一项')]),
          h(XhAccordionContent, () => BODY),
        ]),
        h(XhAccordionItem, { value: 'short' }, () => [
          h(XhAccordionTrigger, () => [h(XhAccordionIndicator), h('span', '短的一项')]),
          h(XhAccordionContent, () => '一行'),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()
    await frame()
    const root = host.querySelector<HTMLElement>('[data-scope="accordion"][data-part="root"]')!
    const before = root.getBoundingClientRect().height

    value.value = ['short']
    await nextTick()
    const samples: number[] = []
    const start = performance.now()
    while (performance.now() - start < 320) {
      await frame()
      samples.push(root.getBoundingClientRect().height)
    }
    const after = samples.at(-1)!
    expect(after).toBeLessThan(before)
    // 途中落过中间值，确实是一段动画而不是一下子跳过去
    expect(samples.some(height => height < before - 2 && height > after + 2)).toBe(true)
    // 一路往终值走：不低于终值（过冲），也不回头
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]!, `第 ${i} 帧`).toBeGreaterThanOrEqual(after - 1)
      expect(samples[i]!, `第 ${i} 帧`).toBeLessThanOrEqual(samples[i - 1]! + 1)
    }
  })
})

describe.each(CASES)('$scope 开合过程', (item) => {
  it('展开与收起的中途：高度确实在半路上，内容随之淡变', async () => {
    const open = ref(false)
    const content = mount(item, open)
    await nextTick()

    await toggle(open, true)
    await wait(700)
    await frame()
    const full = content.getBoundingClientRect().height
    expect(full).toBeGreaterThan(40)
    expect(getComputedStyle(content).opacity).toBe('1')

    await toggle(open, false)
    await wait(300)
    await frame()
    const collapsing = content.getBoundingClientRect().height
    expect(collapsing, '收起到一半高度应在两端之间').toBeGreaterThan(full * 0.15)
    expect(collapsing).toBeLessThan(full * 0.85)
    const faded = Number(getComputedStyle(content).opacity)
    expect(faded, '收起途中内容在淡出').toBeGreaterThan(0.1)
    expect(faded).toBeLessThan(0.9)
    await wait(400)
    await frame()

    await toggle(open, true)
    await wait(300)
    await frame()
    const expanding = content.getBoundingClientRect().height
    expect(expanding, '展开到一半高度应在两端之间').toBeGreaterThan(full * 0.15)
    expect(expanding).toBeLessThan(full * 0.85)
    const fading = Number(getComputedStyle(content).opacity)
    expect(fading, '展开途中内容在淡入').toBeGreaterThan(0.1)
    expect(fading).toBeLessThan(0.9)
  })

  it('宿主有 [hidden]{display:none!important} 时：收起照样播完，播完才打 hidden', async () => {
    useTailwindPreflight()
    const open = ref(true)
    const content = mount(item, open)
    await nextTick()
    await frame()
    const full = content.getBoundingClientRect().height

    await toggle(open, false)
    await wait(300)
    await frame()
    expect(getComputedStyle(content).display, '退场窗口内节点还在布局里').not.toBe('none')
    expect(content.hidden, '退场窗口内不打 hidden').toBe(false)
    expect(content.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(content.getBoundingClientRect().height).toBeLessThan(full)

    await wait(400)
    await frame()
    await nextTick()
    expect(content.hidden, '退场播完打上 hidden').toBe(true)
    expect(getComputedStyle(content).display).toBe('none')
  })

  it('宿主有 [hidden]{display:none!important} 时：展开照样从 0 长起来', async () => {
    useTailwindPreflight()
    const open = ref(false)
    const content = mount(item, open)
    await nextTick()
    await frame()

    await toggle(open, true)
    expect(content.hidden).toBe(false)
    expect(content.getAnimations().some(a => a instanceof CSSAnimation && a.animationName === 'xh-disclosure-expand')).toBe(true)
  })
})
