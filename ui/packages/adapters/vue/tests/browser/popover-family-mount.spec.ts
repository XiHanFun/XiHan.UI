import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 浮层一族的挂载时机与定位微调要在真浏览器里验：退场动画得真播、定位引擎得真量。
// lazyMount 第一次打开前不挂 content 里的内容；unmountOnExit 退场播完才卸，播的那一段内容照旧在；
// 虚拟锚点按它给的矩形落位；flip 为 false 时守着请求的那一侧。

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function part(scope: string, name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
}

function body(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-testid="body"]')
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

interface Case {
  name: string
  scope: string
  Root: Component
  Trigger: Component
  Positioner: Component
  Content: Component
  /** 内容里还要放的必备部件（popconfirm 的两颗钮）。 */
  extra?: () => ReturnType<typeof h>[]
}

const CASES: Case[] = [
  { name: 'Popover', scope: 'popover', Root: XhPopoverRoot, Trigger: XhPopoverTrigger, Positioner: XhPopoverPositioner, Content: XhPopoverContent },
  {
    name: 'Popconfirm',
    scope: 'popconfirm',
    Root: XhPopconfirmRoot,
    Trigger: XhPopconfirmTrigger,
    Positioner: XhPopconfirmPositioner,
    Content: XhPopconfirmContent,
    extra: () => [h(XhPopconfirmCancelTrigger, null, () => '取消'), h(XhPopconfirmConfirmTrigger, null, () => '删除')],
  },
  { name: 'HoverCard', scope: 'hover-card', Root: XhHoverCardRoot, Trigger: XhHoverCardTrigger, Positioner: XhHoverCardPositioner, Content: XhHoverCardContent },
  { name: 'Tooltip', scope: 'tooltip', Root: XhTooltipRoot, Trigger: XhTooltipTrigger, Positioner: XhTooltipPositioner, Content: XhTooltipContent },
]

describe.each(CASES)('$name 的 lazyMount / unmountOnExit', (c) => {
  function mount(props: Record<string, unknown>): { open: ReturnType<typeof ref<boolean>>, exits: () => number } {
    const host = document.createElement('div')
    document.body.append(host)
    const open = ref(false)
    let exits = 0
    app = createApp({
      render: () => h(c.Root, {
        ...props,
        'open': open.value,
        'onUpdate:open': (v: boolean) => { open.value = v },
        // 只有 Popover 与 Popconfirm 报退场完成
        ...(c.scope === 'popover' || c.scope === 'popconfirm' ? { onExitComplete: () => { exits += 1 } } : {}),
      }, () => [
        h(c.Trigger, null, () => '打开'),
        h(c.Positioner, null, () => h(c.Content, null, () => [
          h('p', { 'data-testid': 'body' }, '内容'),
          ...(c.extra?.() ?? []),
        ])),
      ]),
    })
    app.mount(host)
    return { open, exits: () => exits }
  }

  it('缺省两根轴都关着：收起态内容常驻在 content 里（不改变现有行为）', async () => {
    mount({})
    await settle()
    expect(part(c.scope, 'content')).not.toBeNull()
    expect(body()).not.toBeNull()
  })

  it('lazyMount：第一次打开前 content 节点在、里面的内容不在；打开过之后收起也留着', async () => {
    const t = mount({ lazyMount: true })
    await settle()
    expect(part(c.scope, 'content')).not.toBeNull()
    expect(body()).toBeNull()
    t.open.value = true
    await settle()
    expect(body()).not.toBeNull()
    t.open.value = false
    await expect.poll(() => getComputedStyle(part(c.scope, 'content')!).display).toBe('none')
    expect(body()).not.toBeNull()
  })

  it('unmountOnExit：退场动画在播的那一段内容照旧在，播完才卸；下次打开重新挂上', async () => {
    const t = mount({ unmountOnExit: true })
    t.open.value = true
    await settle()
    const first = body()
    expect(first).not.toBeNull()
    await expect.poll(() => part(c.scope, 'positioner')!.hasAttribute('data-positioned')).toBe(true)
    // 等进场播完，免得退场接在半截进场上
    await Promise.all(finiteAnimations(part(c.scope, 'content')!).map(animation => animation.finished))

    t.open.value = false
    await nextTick()
    await expect.poll(() => finiteAnimations(part(c.scope, 'content')!).length).toBeGreaterThan(0)
    // 退场正在播：内容还在、content 还没收成 display:none
    expect(body()).toBe(first)
    expect(getComputedStyle(part(c.scope, 'content')!).display).not.toBe('none')

    await expect.poll(() => body()).toBeNull()
    expect(getComputedStyle(part(c.scope, 'content')!).display).toBe('none')
    if (c.scope === 'popover' || c.scope === 'popconfirm')
      await expect.poll(t.exits).toBe(1)

    t.open.value = true
    await settle()
    expect(body()).not.toBeNull()
    expect(body()).not.toBe(first)
  })
})

describe('定位微调与虚拟锚点', () => {
  it('popover 的虚拟锚点：浮层按锚点给的矩形落位，换一个锚点对象即重挂', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const point = ref({ x: 160, y: 120 })
    const anchor = ref({ getBoundingClientRect: () => DOMRect.fromRect({ x: point.value.x, y: point.value.y, width: 0, height: 0 }) })
    app = createApp({
      render: () => h(XhPopoverRoot, { open: true, anchor: anchor.value, placement: 'bottom-start', offset: 8 }, () => [
        h(XhPopoverPositioner, null, () => h(XhPopoverContent, { 'aria-label': '落点' }, () => h('p', '这一点'))),
      ]),
    })
    app.mount(host)
    await expect.poll(() => part('popover', 'positioner')!.hasAttribute('data-positioned')).toBe(true)
    const rect = (): DOMRect => part('popover', 'positioner')!.getBoundingClientRect()
    expect(rect().left).toBeCloseTo(160, 0)
    expect(rect().top).toBeCloseTo(128, 0)

    point.value = { x: 240, y: 200 }
    anchor.value = { getBoundingClientRect: () => DOMRect.fromRect({ x: point.value.x, y: point.value.y, width: 0, height: 0 }) }
    await expect.poll(() => Math.round(rect().left)).toBe(240)
    expect(rect().top).toBeCloseTo(208, 0)
  })

  it('flip 为 false：触发器贴着视口底边时守着 bottom，缺省则翻到 top', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const flip = ref<boolean | undefined>(undefined)
    app = createApp({
      render: () => h(XhPopoverRoot, { open: true, placement: 'bottom', flip: flip.value }, () => [
        h(XhPopoverTrigger, { style: 'position: fixed; left: 40px; bottom: 4px' }, () => '打开'),
        h(XhPopoverPositioner, null, () => h(XhPopoverContent, { 'aria-label': '面板' }, () => h('p', { style: 'block-size: 120px' }, '内容'))),
      ]),
    })
    app.mount(host)
    await expect.poll(() => part('popover', 'positioner')!.dataset.placement).toBe('top')
    app.unmount()
    document.body.innerHTML = ''

    const again = document.createElement('div')
    document.body.append(again)
    flip.value = false
    app = createApp({
      render: () => h(XhPopoverRoot, { open: true, placement: 'bottom', flip: flip.value }, () => [
        h(XhPopoverTrigger, { style: 'position: fixed; left: 40px; bottom: 4px' }, () => '打开'),
        h(XhPopoverPositioner, null, () => h(XhPopoverContent, { 'aria-label': '面板' }, () => h('p', { style: 'block-size: 120px' }, '内容'))),
      ]),
    })
    app.mount(again)
    await expect.poll(() => part('popover', 'positioner')!.hasAttribute('data-positioned')).toBe(true)
    expect(part('popover', 'positioner')!.dataset.placement).toBe('bottom')
  })
})
