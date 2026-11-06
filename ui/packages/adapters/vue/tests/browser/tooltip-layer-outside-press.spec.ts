// 下拉开着时，后出现的提示压在它上面；两者没有嵌套关系，提示不该挡住下拉的层外按下。
// 提示可见时按它的触发器、提示正在退场、提示可见时按在外面，这三种状态下按在下拉之外都要把下拉收起。
// 嵌套关系照旧受保护：按在提示里不收它开在其内容里的浮层，Escape 仍先收提示。
// 按在层外时提示谁也不护：它可见、正在播退场，它所在的浮层都在这一下收起；浮层等提示的层先释放，层栈不报乱序。
// 悬停展开的导航面板与提示同属内联层，同样不挡下拉。
// 真实指针的悬停、按下与退场期间的层栈只有浏览器里有。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { App } from 'vue'
import { DIAGNOSTIC_CODES, getLayerRegistry, onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhSelectRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ITEMS = [
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '停用' },
  { value: 'locked', label: '锁定' },
]

let app: App | null = null
let host: HTMLElement | null = null
let stopDiagnostics: (() => void) | null = null

afterEach(async () => {
  stopDiagnostics?.()
  stopDiagnostics = null
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.querySelector('[data-test="exit-style"]')?.remove()
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

async function settle(): Promise<void> {
  await nextTick()
  for (let i = 0; i < 3; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function tooltip(props: Record<string, unknown>): ReturnType<typeof h> {
  return h(XhTooltipRoot, { openDelay: 0, closeDelay: 0, ...props }, () => [
    h(XhTooltipTrigger, { 'data-test': 'tip-trigger' }, () => '查询'),
    h(XhTooltipPositioner, null, () => h(XhTooltipContent, { 'data-test': 'tip-content' }, () => '按条件查询')),
  ])
}

// 用例页面只有 414px 宽：筛选区竖着排，整页不出滚动条。页面能滚时，真实指针的点击在目标还没稳住的那几帧里
// 会换着对齐方式把目标滚进视口，带进场动画的面板就一直稳不下来
const STACK = 'display:flex;flex-direction:column;gap:120px;padding:120px 40px;align-items:flex-start'

/** 筛选区：带提示的按钮在上、下拉在下（列表朝下展开，盖不到按钮），左下角留一块空白。 */
async function mountFilters(tooltipProps: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = STACK
  document.body.append(host)
  app = createApp({
    render: () => [
      tooltip(tooltipProps),
      h(XhSelectRoot, { collection: ITEMS }),
      h('div', { 'data-test': 'blank', 'style': 'position:fixed;inset-block-end:40px;inset-inline-start:40px;inline-size:160px;block-size:60px' }),
    ],
  })
  app.mount(host)
  await settle()
}

/** 浮层里放一颗带提示的按钮：提示开在浮层的内容里。浮层缺省展开，初始焦点落在这颗按钮上，提示随聚焦出现。 */
async function mountNested(tooltipProps: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding:120px 40px'
  document.body.append(host)
  app = createApp({
    render: () => [
      h(XhPopoverRoot, { defaultOpen: true }, () => [
        h(XhPopoverTrigger, { 'data-test': 'popover-trigger' }, () => '筛选'),
        h(XhPopoverPositioner, null, () => h(XhPopoverContent, { 'data-test': 'popover-content' }, () => tooltip(tooltipProps))),
      ]),
      h('div', { 'data-test': 'blank', 'style': 'position:fixed;inset-block-end:40px;inset-inline-start:40px;inline-size:160px;block-size:60px' }),
    ],
  })
  app.mount(host)
  await settle()
}

function test(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-test="${name}"]`)!
}

function selectTrigger(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!
}

const selectOpen = (): string | null => selectTrigger().getAttribute('aria-expanded')
const popoverOpen = (): string | null => test('popover-trigger').getAttribute('aria-expanded')
const tipState = (): string | undefined => test('tip-content').dataset.state
const layers = (): number => getLayerRegistry(document).list().length

/** 收下层栈的乱序诊断：父层先于开在它里面的层释放时才有。 */
function watchReleaseOrder(): DiagnosticRecord[] {
  const records: DiagnosticRecord[] = []
  stopDiagnostics = onDiagnostic((record) => {
    if (record.code === DIAGNOSTIC_CODES.layerDisposeNotTop)
      records.push(record)
  })
  return records
}

async function openSelect(): Promise<void> {
  await userEvent.click(selectTrigger())
  await expect.poll(selectOpen).toBe('true')
  await expect.poll(layers).toBe(1)
}

/** 指针移到带提示的按钮上，等提示出现并入栈。 */
async function showTip(layerCount: number): Promise<void> {
  await userEvent.hover(test('tip-trigger'))
  await expect.poll(tipState).toBe('open')
  await expect.poll(layers).toBe(layerCount)
}

/** 提示的退场拉到 60 秒：逻辑收起之后它的层一直留在栈里。 */
function holdTipExit(): void {
  const style = document.createElement('style')
  style.dataset.test = 'exit-style'
  style.textContent = `
    @keyframes test-tip-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-scope='tooltip'][data-part='content'][data-state='closed'] {
      animation: test-tip-exit 60s linear forwards;
    }
  `
  document.head.append(style)
}

describe('vue 下拉开着时提示压在上面', () => {
  it('提示可见时按它的触发器：下拉收起', async () => {
    await mountFilters()
    await openSelect()
    await showTip(2)

    await userEvent.click(test('tip-trigger'))

    await expect.poll(selectOpen).toBe('false')
  })

  it('提示正在退场、层还留在栈里：按在空白处，下拉收起', async () => {
    holdTipExit()
    await mountFilters()
    await openSelect()
    await showTip(2)

    await userEvent.hover(test('blank'))
    await expect.poll(tipState).toBe('closed')
    // 提示逻辑上已经收起，退场没播完，层还压在下拉上面
    expect(layers()).toBe(2)
    expect(selectOpen()).toBe('true')

    await userEvent.click(test('blank'))

    await expect.poll(selectOpen).toBe('false')
    // 放掉拉长的退场：两层各自播完后都从栈里释放
    for (const animation of test('tip-content').getAnimations())
      animation.finish()
    await expect.poll(layers).toBe(0)
  })

  it('提示可见时按在空白处：提示与下拉一并收起', async () => {
    // 收起等待拉长：指针移到空白处之后提示仍然可见
    await mountFilters({ closeDelay: 60_000 })
    await openSelect()
    await showTip(2)

    await userEvent.click(test('blank'))

    await expect.poll(selectOpen).toBe('false')
    await expect.poll(tipState).toBe('closed')
  })

  it('escape 先收提示，下拉等下一次按键', async () => {
    await mountFilters()
    await openSelect()
    await showTip(2)

    await userEvent.keyboard('{Escape}')
    await expect.poll(tipState).toBe('closed')
    expect(selectOpen()).toBe('true')

    // 提示播完退场、层释放之后，下一次 Escape 才轮到下拉
    await expect.poll(layers).toBe(1)
    await userEvent.keyboard('{Escape}')
    await expect.poll(selectOpen).toBe('false')
  })
})

describe('vue 下拉开着时悬停展开导航面板', () => {
  it('按在导航面板里：导航不动，下拉收起', async () => {
    host = document.createElement('div')
    host.style.cssText = STACK
    document.body.append(host)
    app = createApp({
      render: () => [
        // 导航在上、自己占一块定宽的盒子，面板朝下展开；下拉在它下面，隔开够远
        h('div', { style: 'inline-size:320px' }, h(XhNavigationMenuRoot, { delayDuration: 0 }, () => h(XhNavigationMenuList, null, () => h(XhNavigationMenuItem, null, () => [
          h(XhNavigationMenuTrigger, { 'value': 'products', 'data-test': 'nav-trigger' }, () => '产品'),
          h(XhNavigationMenuContent, { value: 'products' }, () => h('p', { 'data-test': 'nav-panel' }, '产品概览')),
        ])))),
        h(XhSelectRoot, { collection: ITEMS }),
      ],
    })
    app.mount(host)
    await settle()
    await openSelect()

    const navOpen = (): string | null => test('nav-trigger').getAttribute('aria-expanded')
    await userEvent.hover(test('nav-trigger'))
    await expect.poll(navOpen).toBe('true')
    // 导航面板入栈，压在下拉上面
    await expect.poll(layers).toBe(2)

    await userEvent.click(test('nav-panel'))

    await expect.poll(selectOpen).toBe('false')
    expect(navOpen()).toBe('true')
  })

  it('面板里一颗带提示的按钮、提示可见时按在层外：提示与面板一并收起，不报乱序', async () => {
    const records = watchReleaseOrder()
    host = document.createElement('div')
    host.style.cssText = STACK
    document.body.append(host)
    app = createApp({
      render: () => [
        h('div', { style: 'inline-size:320px' }, h(XhNavigationMenuRoot, { delayDuration: 0 }, () => h(XhNavigationMenuList, null, () => h(XhNavigationMenuItem, null, () => [
          h(XhNavigationMenuTrigger, { 'value': 'products', 'data-test': 'nav-trigger' }, () => '产品'),
          // 收起等待拉长：指针移到空白处之后提示仍然可见
          h(XhNavigationMenuContent, { value: 'products' }, () => tooltip({ closeDelay: 60_000 })),
        ])))),
        h('div', { 'data-test': 'blank', 'style': 'position:fixed;inset-block-end:40px;inset-inline-start:40px;inline-size:160px;block-size:60px' }),
      ],
    })
    app.mount(host)
    await settle()

    const navOpen = (): string | null => test('nav-trigger').getAttribute('aria-expanded')
    await userEvent.hover(test('nav-trigger'))
    await expect.poll(navOpen).toBe('true')
    // 提示开在导航面板里，两层都是悬停出现的内联层
    await showTip(2)

    await userEvent.click(test('blank'))

    // 面板等提示的层先释放，不抢在它前面走
    await expect.poll(navOpen).toBe('false')
    await expect.poll(layers).toBe(0)
    expect(records).toEqual([])
  })
})

describe('vue 提示开在浮层的内容里', () => {
  it('按在提示里：浮层不收', async () => {
    await mountNested()
    await expect.poll(popoverOpen).toBe('true')
    await showTip(2)

    // 提示的内容区搬到了浮层落点上，不在浮层的内容区里：按在它上面的事件路径不经过浮层
    await userEvent.click(test('tip-content'))
    await settle()

    expect(popoverOpen()).toBe('true')

    // 收干净再卸载：指针移开后提示收起（随聚焦出现的那一次已经随失焦收起），浮层按一次 Escape 收起
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    await expect.poll(layers).toBe(1)
    await userEvent.keyboard('{Escape}')
    await expect.poll(layers).toBe(0)
  })

  it('提示随聚焦出现时按在层外：提示与浮层一并收起，层栈清空，不报乱序', async () => {
    const records = watchReleaseOrder()
    await mountNested()
    await expect.poll(popoverOpen).toBe('true')
    // 浮层缺省展开，初始焦点落在带提示的按钮上，提示随聚焦出现，压在浮层上面
    await expect.poll(tipState).toBe('open')
    await expect.poll(layers).toBe(2)

    await userEvent.click(test('blank'))

    // 这一下把两层都收起：各播各的退场，浮层等提示的层先释放
    await expect.poll(popoverOpen).toBe('false')
    await expect.poll(layers).toBe(0)
    expect(document.querySelector<HTMLElement>('[data-test="tip-content"]')?.dataset.state).not.toBe('open')
    expect(records).toEqual([])
  })

  it('提示收起后还在播退场、层留在栈里：按在层外，浮层这一下就收起，不报乱序', async () => {
    const records = watchReleaseOrder()
    holdTipExit()
    await mountNested()
    await expect.poll(popoverOpen).toBe('true')
    await expect.poll(tipState).toBe('open')
    await expect.poll(layers).toBe(2)

    // Escape 只收栈顶的提示；退场拉长，它的层还压在浮层上面
    await userEvent.keyboard('{Escape}')
    await expect.poll(tipState).toBe('closed')
    expect(popoverOpen()).toBe('true')
    expect(layers()).toBe(2)

    await userEvent.click(test('blank'))

    await expect.poll(popoverOpen).toBe('false')
    // 浮层自己的退场播完了，提示的还没有：浮层留在栈里等它，不抢在它前面释放
    await expect.poll(() => test('popover-content').getAnimations().length).toBe(0)
    await settle()
    expect(layers()).toBe(2)

    // 放掉拉长的退场：提示的层先释放，浮层的层跟着释放
    for (const animation of test('tip-content').getAnimations())
      animation.finish()
    await expect.poll(layers).toBe(0)
    expect(records).toEqual([])
  })
})
