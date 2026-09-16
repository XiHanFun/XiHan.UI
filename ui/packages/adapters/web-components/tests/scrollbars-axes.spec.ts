import type { Orientation } from '@xihan-ui/core'
// @vitest-environment jsdom
//
// 轴不止一条、壳不止 positioner 的那几个宿主。
// 这里钉住五件事：条子由元素自己建、挂在作者写的壳上、是滚动层的兄弟；
// 建出来的节点一个 data-xh-part 都不带（打了会被 discoverParts 收进 partMap）；
// 摆出来的轴与宿主报的一致（cascader 只摆横的，tree-select 两条都摆）；
// 交叉口只画在双轴宿主的竖条里；json-viewer 是页内结构容器，两档都走原生细条，root 上一条自绘条也不挂。
import type { CascaderNode, TreeNode } from '@xihan-ui/headless'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
  portalContainer?: () => Element | null
  [key: string]: unknown
}

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
  await el.updateComplete
}

function part(el: HTMLElement, name: string): HTMLElement {
  const hit = el.querySelector<HTMLElement>(`[data-xh-part="${name}"]`)
  if (!hit)
    throw new Error(`找不到 ${name}`)
  return hit
}

/** 壳里那几条条子，按摆出来的先后。 */
/** 直接挂在这个壳上的条子：壳里的滚动层自己还可能再挂贴层的条子（级联的列），那些不算本壳的。 */
function bars(shell: HTMLElement): HTMLElement[] {
  return [...shell.querySelectorAll<HTMLElement>(':scope > [data-scope="scrollbar"][data-part="root"]')]
}

const CATALOG: CascaderNode[] = [
  { value: 'zhejiang', label: 'Zhejiang', children: [{ value: 'hangzhou', label: 'Hangzhou' }] },
]

const TREE: TreeNode[] = [
  {
    value: 'docs',
    label: 'docs',
    children: [{ value: 'guide', label: 'guide.md' }],
  },
  { value: 'readme', label: 'README.md' },
]

interface Case {
  scope: string
  tag: string
  markup: string
  /** 摆出来的轴，按宿主交给共享层的顺序。 */
  axes: Orientation[]
  /** 条子挂在哪个角色节点上。 */
  shell: string
  /** 真正在滚的那层。 */
  layer: string
  attrs?: Record<string, string>
  /** 属性表达不了的数据走 property。 */
  props?: Record<string, unknown>
  /** 浮层族：按住条子那一下不该把浮层消解掉。 */
  overlay: boolean
  /** 浮层面板（带 data-state 的那层）；缺省就是滚动层，贴层的条子挂在面板里的列上时另指面板。 */
  panel?: string
}

const CASES: Case[] = [
  {
    scope: 'tree-select',
    tag: 'xh-tree-select',
    axes: ['vertical', 'horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    attrs: { 'default-open': '' },
    props: { collection: TREE, expandedValue: ['docs'] },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <button data-xh-part="trigger">
            <span data-xh-part="value-text"></span>
          </button>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="tree">
              <div data-xh-part="branch" value="docs">
                <div data-xh-part="branch-control">
                  <span data-xh-part="branch-trigger"></span>
                  <span data-xh-part="branch-text">docs</span>
                </div>
                <div data-xh-part="branch-content">
                  <div data-xh-part="item" value="guide"><span data-xh-part="item-text">guide.md</span></div>
                </div>
              </div>
              <div data-xh-part="item" value="readme"><span data-xh-part="item-text">README.md</span></div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    scope: 'cascader',
    tag: 'xh-cascader',
    axes: ['horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    attrs: { 'default-open': '' },
    props: { collection: CATALOG },
    markup: `
      <div data-xh-part="root">
        <button data-xh-part="trigger"><span data-xh-part="value-text"></span></button>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="column" level="0">
              <div data-xh-part="item" value='["zhejiang"]'><span data-xh-part="item-text">Zhejiang</span></div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    // 列自己竖滚：条子贴层挂在 content 里、紧跟在列后面，与 content 那条横的分属两个壳
    scope: 'cascader',
    tag: 'xh-cascader',
    axes: ['vertical'],
    shell: 'content',
    layer: 'column',
    panel: 'content',
    overlay: true,
    attrs: { 'default-open': '' },
    props: { collection: CATALOG },
    markup: `
      <div data-xh-part="root">
        <button data-xh-part="trigger"><span data-xh-part="value-text"></span></button>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="column" level="0">
              <div data-xh-part="item" value='["zhejiang"]'><span data-xh-part="item-text">Zhejiang</span></div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    scope: 'color-picker',
    tag: 'xh-color-picker',
    axes: ['vertical'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    attrs: { 'default-open': '', 'default-value': '#00a98e' },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <button data-xh-part="trigger"><span data-xh-part="swatch"></span></button>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="area"><div data-xh-part="area-thumb"></div></div>
          </div>
        </div>
      </div>
    `,
  },
  {
    // 面板皮肤 overflow: auto 两轴都滚：日历保持天然宽度，窄视口下横向也在面板内自己滚
    scope: 'date-picker',
    tag: 'xh-date-picker',
    axes: ['vertical', 'horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    attrs: { 'default-open': '', 'locale': 'zh-CN' },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <div data-xh-part="segment-group"><span data-xh-part="segment"></span></div>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="calendar">
              <div data-xh-part="header"><div data-xh-part="heading"></div></div>
              <div data-xh-part="grid">
                <div data-xh-part="grid-body"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    // 时间列定高自己竖滚：条子贴层挂在 content 里、紧跟在列后面
    scope: 'date-picker',
    tag: 'xh-date-picker',
    axes: ['vertical'],
    shell: 'content',
    layer: 'time-column',
    panel: 'content',
    overlay: true,
    attrs: { 'default-open': '', 'locale': 'zh-CN', 'show-time': '' },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <div data-xh-part="segment-group"><span data-xh-part="segment"></span></div>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="calendar">
              <div data-xh-part="header"><div data-xh-part="heading"></div></div>
              <div data-xh-part="grid">
                <div data-xh-part="grid-body"></div>
              </div>
            </div>
            <div data-xh-part="time-column" unit="hour"></div>
          </div>
        </div>
      </div>
    `,
  },
  {
    // 区间面板同样两轴都滚：两张日历保持天然宽度，窄视口下横向在面板内自己滚
    scope: 'date-range-picker',
    tag: 'xh-date-range-picker',
    axes: ['vertical', 'horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    attrs: { 'default-open': '', 'locale': 'zh-CN' },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <div data-xh-part="segment-group" index="0"><span data-xh-part="segment"></span></div>
          <div data-xh-part="segment-group" index="1"><span data-xh-part="segment"></span></div>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="calendar">
              <div data-xh-part="header"><div data-xh-part="heading"></div></div>
              <div data-xh-part="grid">
                <div data-xh-part="grid-body"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    // 区间面板的快捷选项列自己滚：条子贴层挂在 content 里、紧跟在列后面
    scope: 'date-range-picker',
    tag: 'xh-date-range-picker',
    axes: ['vertical', 'horizontal'],
    shell: 'content',
    layer: 'preset-group',
    panel: 'content',
    overlay: true,
    attrs: { 'default-open': '', 'locale': 'zh-CN' },
    props: { presets: [{ value: '2026-09-01/2026-09-30', label: '本月' }] },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <div data-xh-part="segment-group" index="0"><span data-xh-part="segment"></span></div>
          <div data-xh-part="segment-group" index="1"><span data-xh-part="segment"></span></div>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="preset-group"></div>
            <div data-xh-part="calendar">
              <div data-xh-part="header"><div data-xh-part="heading"></div></div>
              <div data-xh-part="grid">
                <div data-xh-part="grid-body"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    // 时间列定高自己竖滚：条子贴层挂在 content 里、紧跟在列后面；content 自己不滚，只当列们的壳
    scope: 'time-picker',
    tag: 'xh-time-picker',
    axes: ['vertical'],
    shell: 'content',
    layer: 'column',
    panel: 'content',
    overlay: true,
    attrs: { 'default-open': '' },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <div data-xh-part="segment-group"><span data-xh-part="segment"></span></div>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="column" unit="hour"></div>
          </div>
        </div>
      </div>
    `,
  },
  {
    // 两组时列并排放不下时面板整体横滚：横条挂在浮层壳上
    scope: 'time-range-picker',
    tag: 'xh-time-range-picker',
    axes: ['horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    attrs: { 'default-open': '' },
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control">
          <div data-xh-part="segment-group" index="0"><span data-xh-part="segment"></span></div>
          <div data-xh-part="segment-group" index="1"><span data-xh-part="segment"></span></div>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="column-group" index="0"><div data-xh-part="column" unit="hour"></div></div>
          </div>
        </div>
      </div>
    `,
  },
]

async function mount(item: Case): Promise<Updatable> {
  const el = document.createElement(item.tag) as Updatable
  el.innerHTML = item.markup
  for (const [name, value] of Object.entries(item.attrs ?? {}))
    el.setAttribute(name, value)
  for (const [name, value] of Object.entries(item.props ?? {}))
    el[name] = value
  if (item.overlay)
    el.portalContainer = () => el
  document.body.appendChild(el)
  await settle(el)
  return el
}

/** 元素自己铺出来的滚动层不带 data-xh-part，按 scope 取。 */
function layerOf(el: HTMLElement, item: Case): HTMLElement {
  const hit = el.querySelector<HTMLElement>(`[data-scope="${item.scope}"][data-part="${item.layer}"]`)
  if (!hit)
    throw new Error(`找不到 ${item.layer}`)
  return hit
}

describe.each(CASES)('$scope 的自绘条', (item) => {
  it('挂在壳上、是滚动层的兄弟，三层齐全', async () => {
    const el = await mount(item)

    const shell = part(el, item.shell)
    const layer = layerOf(el, item)
    const roots = bars(shell)
    expect(roots).toHaveLength(item.axes.length)
    for (const root of roots) {
      expect(root.parentElement).toBe(shell)
      expect(root.querySelector('[data-scope="scrollbar"][data-part="track"]')).not.toBeNull()
      expect(root.querySelector('[data-scope="scrollbar"][data-part="thumb"]')).not.toBeNull()
      expect(root.contains(layer)).toBe(false)
    }
    expect(layer.parentElement).toBe(shell)
  })

  it('摆出来的轴与宿主报的一致', async () => {
    const el = await mount(item)

    expect(bars(part(el, item.shell)).map(root => root.getAttribute('data-orientation')))
      .toEqual(item.axes)
  })

  it('一个 data-xh-part 都不带', async () => {
    const el = await mount(item)

    const nodes = [...part(el, item.shell).querySelectorAll<HTMLElement>('[data-scope="scrollbar"]')]
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes)
      expect(node.hasAttribute('data-xh-part')).toBe(false)
  })

  it('滚动容器带上标记，原生条交给皮肤藏掉', async () => {
    const el = await mount(item)

    // 标记是引用计数：几条轴挂上去就记几
    expect(layerOf(el, item).getAttribute('data-xh-scrollbar')).toBe(String(item.axes.length))
  })

  it('交叉口只画在双轴宿主的竖条里', async () => {
    const el = await mount(item)

    const corners = [...part(el, item.shell)
      .querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')]
    expect(corners).toHaveLength(item.axes.length > 1 ? 1 : 0)
    if (corners[0])
      expect(corners[0].closest('[data-part="root"]')?.getAttribute('data-orientation')).toBe('vertical')
  })

  it.runIf(item.overlay)('按在条子上不会把浮层消解掉', async () => {
    const el = await mount(item)

    const panel = item.panel ? part(el, item.panel) : layerOf(el, item)
    expect(panel.getAttribute('data-state')).toBe('open')

    part(el, item.shell)
      .querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
    await settle(el)

    expect(panel.getAttribute('data-state')).toBe('open')
  })
})

describe('json-viewer 不接自绘条', () => {
  async function mountViewer(view?: string): Promise<Updatable> {
    const el = document.createElement('xh-json-viewer') as Updatable
    el.innerHTML = '<div data-xh-part="root"></div>'
    if (view)
      el.setAttribute('view', view)
    el.value = { a: 1, b: [2, 3] }
    document.body.appendChild(el)
    await settle(el)
    return el
  }

  function scopePart(el: HTMLElement, name: string): HTMLElement | null {
    return el.querySelector<HTMLElement>(`[data-scope="json-viewer"][data-part="${name}"]`)
  }

  it('树档与原文档都走原生细条：root 上不挂条子，容器不带 data-xh-scrollbar', async () => {
    const el = await mountViewer()
    expect(bars(part(el, 'root'))).toHaveLength(0)
    expect(scopePart(el, 'tree')!.hasAttribute('data-xh-scrollbar')).toBe(false)

    el.setAttribute('view', 'text')
    await settle(el)
    expect(bars(part(el, 'root'))).toHaveLength(0)
    expect(scopePart(el, 'text')!.hasAttribute('data-xh-scrollbar')).toBe(false)
    expect(scopePart(el, 'tree')).toBeNull()
  })
})
