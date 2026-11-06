// 下拉开着时，悬停就出现的层压在它上面：悬停卡片、引用的悬停预览、悬停展开的菜单与浮动按钮、图标栏的浮出菜单（Web Components）。
// 它们与下拉没有嵌套关系，不该挡住下拉的层外按下：按它们的触发器、按在它们里面、按在空白处，下拉都要收起。
// 悬停展开的菜单还会把焦点拿进自己的内容里：下拉在它出现后随即因失焦收起，不用等按下。
// 嵌套关系照旧受保护：按在悬停卡片里不收它开在其内容里的弹出层与对话框。
// 点击展开的菜单与浮动按钮经按下打开，不走这条规则。
// 真实指针的悬停、按下与层栈只有浏览器里有。
import type { CitationSource, SelectNode, SideNavNode } from '@xihan-ui/headless'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const ITEMS: SelectNode[] = [
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '停用' },
  { value: 'locked', label: '锁定' },
]

const SOURCES: CitationSource[] = [
  { type: 'source-url', sourceId: 'report', title: '报告', url: 'https://example.com/report' },
]

/** 折叠成图标栏的侧边导航：顶层分支悬停即弹出子级面板。 */
const NAV: SideNavNode[] = [{ value: 'products', children: [{ value: 'product-a' }] }]

/** 收起等待拉到 60 秒：指针移开之后悬停层仍然可见。 */
const HOLD = 60_000

const BLANK = '<div data-test="blank" style="position:fixed;inset-block-end:40px;inset-inline-start:40px;inline-size:160px;block-size:60px"></div>'

type Upgraded = HTMLElement & { updateComplete: Promise<unknown> }

let box: HTMLElement | null = null

afterEach(async () => {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  box?.remove()
  box = null
})

async function settle(): Promise<void> {
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

/** 一种悬停就出现的层：怎么写、按哪里算它的触发器与内容、此刻开没开。 */
interface HoverSubject {
  readonly name: string
  /** hold 为真时收起等待拉长，指针移开之后仍然可见。 */
  readonly html: (hold: boolean) => string
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
  html: hold => `
    <xh-hover-card open-delay="0"${hold ? ` close-delay="${HOLD}"` : ''}>
      <button data-xh-part="trigger" data-test="hover-trigger">张三</button>
      <div data-xh-part="positioner"><div data-xh-part="content" data-test="hover-content">研发部</div></div>
    </xh-hover-card>`,
  trigger: () => test('hover-trigger'),
  content: () => test('hover-content'),
  open: () => expanded(test('hover-trigger')),
}

const citation: HoverSubject = {
  name: '引用的悬停预览',
  html: hold => `
    <xh-citation preview-mode="hover" open-delay="0"${hold ? ` close-delay="${HOLD}"` : ''}>
      <div data-xh-part="root">
        <p data-xh-part="text" style="margin:0">共享原语<button data-xh-part="trigger" value="report" name="c1">1</button></p>
        <div data-xh-part="positioner">
          <section data-xh-part="preview" value="report">
            <strong data-xh-part="preview-title">报告</strong>
            <p data-test="hover-content" style="margin:0">共享原语可以减少不一致</p>
          </section>
        </div>
        <ol data-xh-part="list" hidden>
          <li data-xh-part="source" value="report"><button data-xh-part="source-link">报告</button></li>
        </ol>
      </div>
    </xh-citation>`,
  trigger: () => part('citation', 'trigger'),
  content: () => test('hover-content'),
  open: () => !part('citation', 'positioner').hidden,
}

const hoverMenu: HoverSubject = {
  name: '悬停展开的菜单',
  html: hold => `
    <xh-menu open-on-hover hover-open-delay="0"${hold ? ` hover-close-delay="${HOLD}"` : ''}>
      <button data-xh-part="trigger" data-test="hover-trigger">更多</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content" data-test="hover-content">
          <div data-xh-part="item" value="edit">编辑</div>
          <div data-xh-part="item" value="remove">删除</div>
        </div>
      </div>
    </xh-menu>`,
  trigger: () => test('hover-trigger'),
  content: () => test('hover-content'),
  open: () => expanded(test('hover-trigger')),
  takesFocus: true,
}

const hoverFloatButton: HoverSubject = {
  name: '悬停展开的浮动按钮',
  html: () => `
    <xh-float-button expand-trigger="hover">
      <div data-xh-part="root">
        <button data-xh-part="trigger" data-test="hover-trigger">操作</button>
        <div data-xh-part="list"><button type="button" data-test="hover-content">编辑</button></div>
      </div>
    </xh-float-button>`,
  trigger: () => test('hover-trigger'),
  content: () => test('hover-content'),
  open: () => expanded(test('hover-trigger')),
  closesOnLeave: true,
}

// 浮出面板的收起等待不可配：指针移开后还留着悬停意图的那一小段，之后播退场；两段里按空白处都该一并收起
const sideNavPopout: HoverSubject = {
  name: '图标栏的浮出菜单',
  html: () => `
    <xh-side-nav collapsed>
      <nav data-xh-part="root"><ul data-xh-part="list">
        <li data-xh-part="branch" value="products">
          <button data-xh-part="branch-trigger">产品</button>
          <div data-xh-part="positioner"><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="product-a">产品一</a></li></ul></div>
        </li>
      </ul></nav>
    </xh-side-nav>`,
  trigger: () => document.querySelector<HTMLElement>('[data-scope="side-nav"][data-part="branch-trigger"][data-value="products"]')!,
  content: () => part('side-nav', 'branch-content'),
  open: () => expanded(document.querySelector<HTMLElement>('[data-scope="side-nav"][data-part="branch-trigger"][data-value="products"]')!),
}

const SUBJECTS = [hoverCard, citation, hoverMenu, hoverFloatButton, sideNavPopout]

async function mount(html: string, style: string): Promise<void> {
  box = document.createElement('div')
  box.style.cssText = style
  box.innerHTML = html
  const select = box.querySelector<Upgraded & { collection?: SelectNode[] }>('xh-select')
  if (select)
    select.collection = ITEMS
  const cite = box.querySelector<Upgraded & { sources?: CitationSource[] }>('xh-citation')
  if (cite)
    cite.sources = SOURCES
  const nav = box.querySelector<Upgraded & { collection?: SideNavNode[] }>('xh-side-nav')
  if (nav)
    nav.collection = NAV
  document.body.append(box)
  const hosts = 'xh-select, xh-hover-card, xh-citation, xh-menu, xh-float-button, xh-side-nav, xh-popover, xh-dialog'
  await Promise.all([...box.querySelectorAll<Upgraded>(hosts)].map(el => el.updateComplete))
  await settle()
}

/**
 * 筛选区：悬停层的触发器在上、下拉在下（列表朝下展开，盖不到触发器），左下角留一块空白。
 * 用例页面只有 414px 宽：竖着排，整页不出滚动条。页面能滚时，真实指针的点击在目标还没稳住的那几帧里
 * 会换着对齐方式把目标滚进视口。
 */
function mountFilters(subject: string): Promise<void> {
  return mount(
    `${subject}<xh-select><div data-xh-part="root"></div></xh-select>${BLANK}`,
    'display:flex;flex-direction:column;gap:160px;padding:120px 40px;align-items:flex-start',
  )
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

describe.for(SUBJECTS)('wc 下拉开着时 $name 压在上面', (subject) => {
  it('按它的触发器：下拉收起', async () => {
    await mountFilters(subject.html(false))
    await openSelect()
    await reveal(subject)
    expectSelectStillOpen(subject)

    await userEvent.click(subject.trigger())

    await expect.poll(selectOpen).toBe(false)
  })

  it('按在它里面：下拉收起', async () => {
    await mountFilters(subject.html(false))
    await openSelect()
    await reveal(subject)
    expectSelectStillOpen(subject)

    await userEvent.click(subject.content())

    await expect.poll(selectOpen).toBe(false)
  })

  it.skipIf(subject.closesOnLeave)('它还可见时按在空白处：它与下拉一并收起', async () => {
    await mountFilters(subject.html(true))
    await openSelect()
    await reveal(subject)
    expectSelectStillOpen(subject)

    await userEvent.click(test('blank'))

    await expect.poll(selectOpen).toBe(false)
    await expect.poll(subject.open).toBe(false)
  })
})

describe('wc 下拉开着时悬停展开的菜单压在上面', () => {
  it('菜单把焦点拿进自己的内容里：下拉随即因失焦收起，不用等按下', async () => {
    await mountFilters(hoverMenu.html(true))
    await openSelect()
    await reveal(hoverMenu)

    await expect.poll(selectOpen).toBe(false)
    expect(hoverMenu.open()).toBe(true)
    expect(hoverMenu.content().contains(document.activeElement)).toBe(true)
  })
})

describe('wc 下拉开着时悬停卡片压在上面', () => {
  it('escape 先收悬停卡片，下拉等下一次按键', async () => {
    await mountFilters(hoverCard.html(false))
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

/** 收干净再移除：指针移开，逐层按 Escape 收起。 */
async function closeAll(): Promise<void> {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  for (let left = layers(); left > 0; left--) {
    await userEvent.keyboard('{Escape}')
    await expect.poll(layers).toBe(left - 1)
  }
}

describe('wc 悬停卡片开在别的层的内容里', () => {
  it('按在悬停卡片里：它所在的弹出层不收', async () => {
    await mount(
      `<xh-popover default-open>
        <button data-xh-part="trigger" data-test="outer-trigger">筛选</button>
        <div data-xh-part="positioner"><div data-xh-part="content">${hoverCard.html(false)}</div></div>
      </xh-popover>`,
      'padding:120px 40px',
    )
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
    await mount(
      `<xh-dialog default-open>
        <div data-xh-part="backdrop"></div>
        <div data-xh-part="positioner">
          <div data-xh-part="content" data-test="outer-content"><h2 data-xh-part="title">成员</h2>${hoverCard.html(false)}</div>
        </div>
      </xh-dialog>`,
      '',
    )
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

describe('wc 图标栏开在对话框里', () => {
  it('按在浮出面板里：对话框不收', async () => {
    await mount(
      `<xh-dialog default-open>
        <div data-xh-part="backdrop"></div>
        <div data-xh-part="positioner">
          <div data-xh-part="content" data-test="outer-content"><h2 data-xh-part="title">导航</h2>${sideNavPopout.html(false)}</div>
        </div>
      </xh-dialog>`,
      '',
    )
    const dialogOpen = (): boolean => test('outer-content').dataset.state === 'open'
    await expect.poll(dialogOpen).toBe(true)
    await reveal(sideNavPopout)

    // 面板搬到了浮层落点上，不在对话框的内容区里：按在它上面的事件路径不经过对话框
    await userEvent.click(sideNavPopout.content())
    await settle()

    expect(dialogOpen()).toBe(true)
    await closeAll()
  })
})

describe('wc 点击展开的菜单与浮动按钮经按下打开', () => {
  const pressMenu = (): string => `
    <xh-menu>
      <button data-xh-part="trigger" data-test="press-trigger">更多</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content"><div data-xh-part="item" value="edit">编辑</div></div>
      </div>
    </xh-menu>`
  const pressFloatButton = (): string => `
    <xh-float-button>
      <div data-xh-part="root">
        <button data-xh-part="trigger" data-test="press-trigger">操作</button>
        <div data-xh-part="list"><button type="button">编辑</button></div>
      </div>
    </xh-float-button>`

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
