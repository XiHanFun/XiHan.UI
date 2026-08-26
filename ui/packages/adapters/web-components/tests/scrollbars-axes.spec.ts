// @vitest-environment jsdom
//
// 轴不止一条、壳不止 positioner 的那几个宿主。
// 这里钉住五件事：条子由元素自己建、挂在作者写的壳上、是滚动层的兄弟；
// 建出来的节点一个 data-xh-part 都不带（打了会被 discoverParts 收进 partMap）；
// 摆出来的轴与宿主报的一致（cascader 只摆横的，tree-select 与 json-viewer 两条都摆）；
// 交叉口只画在双轴宿主的竖条里；json-viewer 两档互斥，换档时条子不被整份重铺抹掉。
import type { CascaderNode, TreeNode } from '@xihan-ui/headless'
import type { Orientation } from '@xihan-ui/kernel'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
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
function bars(shell: HTMLElement): HTMLElement[] {
  return [...shell.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')]
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
    scope: 'date-picker',
    tag: 'xh-date-picker',
    axes: ['vertical'],
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
    scope: 'json-viewer',
    tag: 'xh-json-viewer',
    axes: ['vertical', 'horizontal'],
    shell: 'root',
    layer: 'tree',
    overlay: false,
    props: { value: { orderNo: 'SO-1', items: [{ sku: 'A', qty: 2 }] } },
    markup: '<div data-xh-part="root"></div>',
  },
]

async function mount(item: Case): Promise<Updatable> {
  const el = document.createElement(item.tag) as Updatable
  el.innerHTML = item.markup
  for (const [name, value] of Object.entries(item.attrs ?? {}))
    el.setAttribute(name, value)
  for (const [name, value] of Object.entries(item.props ?? {}))
    el[name] = value
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

    const panel = layerOf(el, item)
    expect(panel.getAttribute('data-state')).toBe('open')

    part(el, item.shell)
      .querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
    await settle(el)

    expect(panel.getAttribute('data-state')).toBe('open')
  })
})

describe('json-viewer 两档互斥', () => {
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

  it('树档：条子跟着 tree，pre 不在场', async () => {
    const el = await mountViewer()

    expect(bars(part(el, 'root'))).toHaveLength(2)
    expect(scopePart(el, 'tree')!.getAttribute('data-xh-scrollbar')).toBe('2')
    expect(scopePart(el, 'text')).toBeNull()
  })

  it('原文档：条子跟着 pre', async () => {
    const el = await mountViewer('text')

    expect(bars(part(el, 'root'))).toHaveLength(2)
    expect(scopePart(el, 'text')!.getAttribute('data-xh-scrollbar')).toBe('2')
  })

  it('换档时整份重铺不把条子抹掉，条子跟到此刻在场的那个容器', async () => {
    const el = await mountViewer()
    const before = bars(part(el, 'root'))
    expect(before).toHaveLength(2)

    el.setAttribute('view', 'text')
    await settle(el)

    // 条子由同一组机器摆出，换档不重建
    expect(bars(part(el, 'root'))).toEqual(before)
    expect(scopePart(el, 'text')!.getAttribute('data-xh-scrollbar')).toBe('2')
    expect(scopePart(el, 'tree')).toBeNull()
  })

  it('作者写在 root 里的东西被清掉时，条子留在原地', async () => {
    const el = document.createElement('xh-json-viewer') as Updatable
    el.innerHTML = '<div data-xh-part="root"><span id="stale">占位</span></div>'
    el.value = { a: 1 }
    document.body.appendChild(el)
    await settle(el)

    const root = part(el, 'root')
    expect(root.querySelector('#stale')).toBeNull()
    expect(bars(root)).toHaveLength(2)
  })
})
