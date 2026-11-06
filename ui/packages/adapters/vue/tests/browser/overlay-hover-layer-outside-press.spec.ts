// 下拉开着时，悬停就出现的层压在它上面：悬停卡片、引用的悬停预览、悬停展开的菜单与浮动按钮。
// 它们与下拉没有嵌套关系，不该挡住下拉的层外按下：按它们的触发器、按在它们里面、按在空白处，下拉都要收起。
// 悬停展开的菜单还会把焦点拿进自己的内容里：下拉在它出现后随即因失焦收起，不用等按下。
// 嵌套关系照旧受保护：按在悬停卡片里不收它开在其内容里的弹出层与对话框。
// 点击展开的菜单与浮动按钮经按下打开，不走这条规则。
// 真实指针的悬停、按下与层栈只有浏览器里有。
import type { CitationSource } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCitationPositioner,
  XhCitationPreview,
  XhCitationRoot,
  XhCitationText,
  XhCitationTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhFloatButtonList,
  XhFloatButtonRoot,
  XhFloatButtonTrigger,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhSelectRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ITEMS = [
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '停用' },
  { value: 'locked', label: '锁定' },
]

const SOURCES: CitationSource[] = [
  { type: 'source-url', sourceId: 'report', title: '报告', url: 'https://example.com/report' },
]

/** 收起等待拉到 60 秒：指针移开之后悬停层仍然可见。 */
const HOLD = 60_000

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

async function settle(): Promise<void> {
  await nextTick()
  for (let i = 0; i < 3; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function test(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-test="${name}"]`)!
}

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

const expanded = (el: HTMLElement): boolean => el.getAttribute('aria-expanded') === 'true'
const layers = (): number => getLayerRegistry(document).list().length

/** 一种悬停就出现的层：怎么渲染、按哪里算它的触发器与内容、此刻开没开。 */
interface HoverSubject {
  readonly name: string
  /** hold 为真时收起等待拉长，指针移开之后仍然可见。 */
  readonly render: (hold: boolean) => VNode
  readonly trigger: () => HTMLElement
  readonly content: () => HTMLElement
  readonly open: () => boolean
  /** 指针一离开就收，没有「还可见时按在空白处」这一种状态。 */
  readonly closesOnLeave?: boolean
  /** 展开时把焦点拿进自己的内容里：下面的下拉在它出现后随即因失焦收起，不用等按下。 */
  readonly takesFocus?: boolean
}

const hoverCard: HoverSubject = {
  name: '悬停卡片',
  render: hold => h(XhHoverCardRoot, { openDelay: 0, ...(hold ? { closeDelay: HOLD } : {}) }, () => [
    h(XhHoverCardTrigger, { 'data-test': 'hover-trigger' }, () => '张三'),
    h(XhHoverCardPositioner, null, () => h(XhHoverCardContent, { 'data-test': 'hover-content' }, () => '研发部')),
  ]),
  trigger: () => test('hover-trigger'),
  content: () => test('hover-content'),
  open: () => expanded(test('hover-trigger')),
}

const citation: HoverSubject = {
  name: '引用的悬停预览',
  render: hold => h(XhCitationRoot, { sources: SOURCES, previewMode: 'hover', openDelay: 0, ...(hold ? { closeDelay: HOLD } : {}) }, () => [
    h(XhCitationText, null, () => ['共享原语', h(XhCitationTrigger, { sourceId: 'report', citationId: 'c1' }, () => '1')]),
    h(XhCitationPositioner, null, () => h(XhCitationPreview, { sourceId: 'report' }, () => h('p', { 'data-test': 'hover-content', 'style': 'margin:0' }, '共享原语可以减少不一致'))),
  ]),
  trigger: () => part('citation', 'trigger'),
  content: () => test('hover-content'),
  open: () => !part('citation', 'positioner').hidden,
}

const hoverMenu: HoverSubject = {
  name: '悬停展开的菜单',
  render: hold => h(XhMenuRoot, { openOnHover: true, hoverOpenDelay: 0, ...(hold ? { hoverCloseDelay: HOLD } : {}) }, () => [
    h(XhMenuTrigger, { 'data-test': 'hover-trigger' }, () => '更多'),
    h(XhMenuPositioner, null, () => h(XhMenuContent, { 'data-test': 'hover-content' }, () => [
      h(XhMenuItem, { value: 'edit' }, () => '编辑'),
      h(XhMenuItem, { value: 'remove' }, () => '删除'),
    ])),
  ]),
  trigger: () => test('hover-trigger'),
  content: () => test('hover-content'),
  open: () => expanded(test('hover-trigger')),
  takesFocus: true,
}

const hoverFloatButton: HoverSubject = {
  name: '悬停展开的浮动按钮',
  render: () => h(XhFloatButtonRoot, { expandTrigger: 'hover' }, () => [
    h(XhFloatButtonTrigger, { 'data-test': 'hover-trigger' }, () => '操作'),
    h(XhFloatButtonList, null, () => h('button', { 'type': 'button', 'data-test': 'hover-content' }, '编辑')),
  ]),
  trigger: () => test('hover-trigger'),
  content: () => test('hover-content'),
  open: () => expanded(test('hover-trigger')),
  closesOnLeave: true,
}

const SUBJECTS = [hoverCard, citation, hoverMenu, hoverFloatButton]

// 用例页面只有 414px 宽：筛选区竖着排，整页不出滚动条。页面能滚时，真实指针的点击在目标还没稳住的那几帧里
// 会换着对齐方式把目标滚进视口，带进场动画的面板就一直稳不下来
const STACK = 'display:flex;flex-direction:column;gap:160px;padding:120px 40px;align-items:flex-start'
const BLANK = 'position:fixed;inset-block-end:40px;inset-inline-start:40px;inline-size:160px;block-size:60px'

/** 筛选区：悬停层的触发器在上、下拉在下（列表朝下展开，盖不到触发器），左下角留一块空白。 */
async function mountFilters(subject: VNode): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = STACK
  document.body.append(host)
  app = createApp({
    render: () => [
      subject,
      h(XhSelectRoot, { collection: ITEMS }),
      h('div', { 'data-test': 'blank', 'style': BLANK }),
    ],
  })
  app.mount(host)
  await settle()
}

const selectOpen = (): boolean => expanded(part('select', 'trigger'))

async function openSelect(): Promise<void> {
  await userEvent.click(part('select', 'trigger'))
  await expect.poll(selectOpen).toBe(true)
  await expect.poll(layers).toBe(1)
}

/** 栈里有没有登记成悬停就出现的层。 */
const hoverLayerOnStack = (): boolean => getLayerRegistry(document).list().some(layer => layer.opensOnHover)

/** 指针移到悬停层的触发器上，等它出现并入栈。 */
async function reveal(subject: HoverSubject): Promise<void> {
  await userEvent.hover(subject.trigger())
  await expect.poll(subject.open).toBe(true)
  await expect.poll(hoverLayerOnStack).toBe(true)
}

/** 悬停出现不经按下：不拿焦点的层出现的这一刻下拉还开着；拿焦点的层另有用例。 */
function expectSelectStillOpen(subject: HoverSubject): void {
  if (!subject.takesFocus)
    expect(selectOpen()).toBe(true)
}

describe.for(SUBJECTS)('vue 下拉开着时 $name 压在上面', (subject) => {
  it('按它的触发器：下拉收起', async () => {
    await mountFilters(subject.render(false))
    await openSelect()
    await reveal(subject)
    expectSelectStillOpen(subject)

    await userEvent.click(subject.trigger())

    await expect.poll(selectOpen).toBe(false)
  })

  it('按在它里面：下拉收起', async () => {
    await mountFilters(subject.render(false))
    await openSelect()
    await reveal(subject)
    expectSelectStillOpen(subject)

    await userEvent.click(subject.content())

    await expect.poll(selectOpen).toBe(false)
  })

  it.skipIf(subject.closesOnLeave)('它还可见时按在空白处：它与下拉一并收起', async () => {
    await mountFilters(subject.render(true))
    await openSelect()
    await reveal(subject)
    expectSelectStillOpen(subject)

    await userEvent.click(test('blank'))

    await expect.poll(selectOpen).toBe(false)
    await expect.poll(subject.open).toBe(false)
  })
})

describe('vue 下拉开着时悬停展开的菜单压在上面', () => {
  it('菜单把焦点拿进自己的内容里：下拉随即因失焦收起，不用等按下', async () => {
    await mountFilters(hoverMenu.render(true))
    await openSelect()
    await reveal(hoverMenu)

    await expect.poll(selectOpen).toBe(false)
    expect(hoverMenu.open()).toBe(true)
    expect(hoverMenu.content().contains(document.activeElement)).toBe(true)
  })
})

describe('vue 下拉开着时悬停卡片压在上面', () => {
  it('escape 先收悬停卡片，下拉等下一次按键', async () => {
    await mountFilters(hoverCard.render(false))
    await openSelect()
    await reveal(hoverCard)

    await userEvent.keyboard('{Escape}')
    await expect.poll(hoverCard.open).toBe(false)
    expect(selectOpen()).toBe(true)

    // 悬停卡片播完退场、层释放之后，下一次 Escape 才轮到下拉
    await expect.poll(layers).toBe(1)
    await userEvent.keyboard('{Escape}')
    await expect.poll(selectOpen).toBe(false)
  })
})

describe('vue 悬停卡片开在别的层的内容里', () => {
  /** 收干净再卸载：指针移开，逐层按 Escape 收起。 */
  async function closeAll(): Promise<void> {
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    for (let left = layers(); left > 0; left--) {
      await userEvent.keyboard('{Escape}')
      await expect.poll(layers).toBe(left - 1)
    }
  }

  it('按在悬停卡片里：它所在的弹出层不收', async () => {
    host = document.createElement('div')
    host.style.cssText = 'padding:120px 40px'
    document.body.append(host)
    app = createApp({
      render: () => h(XhPopoverRoot, { defaultOpen: true }, () => [
        h(XhPopoverTrigger, { 'data-test': 'outer-trigger' }, () => '筛选'),
        h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => hoverCard.render(false))),
      ]),
    })
    app.mount(host)
    await settle()
    await expect.poll(() => expanded(test('outer-trigger'))).toBe(true)
    await reveal(hoverCard)

    // 卡片的内容区搬到了浮层落点上，不在弹出层的内容区里：按在它上面的事件路径不经过弹出层
    await userEvent.click(hoverCard.content())
    await settle()

    expect(expanded(test('outer-trigger'))).toBe(true)
    expect(hoverCard.open()).toBe(true)
    await closeAll()
  })

  it('按在悬停卡片里：它所在的对话框不收', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhDialogRoot, { defaultOpen: true }, () => h(XhDialogContent, { 'data-test': 'outer-content' }, () => [
        h(XhDialogTitle, null, () => '成员'),
        hoverCard.render(false),
      ])),
    })
    app.mount(host)
    await settle()
    const dialogOpen = (): boolean => test('outer-content').dataset.state === 'open'
    await expect.poll(dialogOpen).toBe(true)
    await reveal(hoverCard)

    await userEvent.click(hoverCard.content())
    await settle()

    expect(dialogOpen()).toBe(true)
    expect(hoverCard.open()).toBe(true)
    await closeAll()
  })
})

describe('vue 点击展开的菜单与浮动按钮经按下打开', () => {
  const pressMenu = (): VNode => h(XhMenuRoot, null, () => [
    h(XhMenuTrigger, { 'data-test': 'press-trigger' }, () => '更多'),
    h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => h(XhMenuItem, { value: 'edit' }, () => '编辑'))),
  ])
  const pressFloatButton = (): VNode => h(XhFloatButtonRoot, null, () => [
    h(XhFloatButtonTrigger, { 'data-test': 'press-trigger' }, () => '操作'),
    h(XhFloatButtonList, null, () => h('button', { type: 'button' }, '编辑')),
  ])

  it.for([
    ['菜单', pressMenu],
    ['浮动按钮', pressFloatButton],
  ] as const)('点击展开的%s：层不登记成悬停就出现的层，照旧按栈序挡住下面每一层', async ([, render]) => {
    await mountFilters(render())
    await userEvent.click(test('press-trigger'))
    await expect.poll(() => expanded(test('press-trigger'))).toBe(true)
    await expect.poll(layers).toBe(1)

    expect(getLayerRegistry(document).top()?.opensOnHover).toBe(false)

    await userEvent.keyboard('{Escape}')
    await expect.poll(layers).toBe(0)
  })
})
