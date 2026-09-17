// @vitest-environment jsdom
//
// 轴不止一条、壳不止 positioner 的那几个宿主。
// 这里钉住五件事：条子挂在各自的壳上、是滚动层的兄弟；建出来的节点一个 data-xh-part 都不带；
// 摆出来的轴与宿主报的一致（cascader 只摆横的，tree-select 与 listbox 两条都摆）；
// listbox 是页内定高小列表：壳是 root、条子贴 content 的盒子、走 6px 缺省档；
// 双轴的让位跟着另一条轴的实测溢出走、交叉口只画在竖条里；
// json-viewer 是页内结构容器，两档都走原生细条，root 上一条自绘条也不挂。
import type { Orientation } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import {
  XhCascaderContent,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhColorPickerContent,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhDatePickerContent,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDateRangePickerContent,
  XhDateRangePickerPositioner,
  XhDateRangePickerRoot,
  XhJsonViewerRoot,
  XhListboxContent,
  XhListboxItem,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
  XhTimeRangePickerContent,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRoot,
  XhTransferItem,
  XhTransferItemText,
  XhTransferList,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTreeSelectRoot,
} from '../src'

let unmount: (() => void) | null = null

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

/** 效应推迟一拍才挂监听器与首次测量，跨轴的让位还要再等一轮重算。 */
async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await nextTick()
  await nextTick()
}

function render(node: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({ setup: () => () => node() }))
  app.mount(host)
  unmount = () => {
    app.unmount()
    host.remove()
  }
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

function part(scope: string, name: string): HTMLElement {
  return el(`[data-scope="${scope}"][data-part="${name}"]`)
}

/** 壳里那几条条子，按摆出来的先后。 */
function bars(shell: HTMLElement): HTMLElement[] {
  return [...shell.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')]
}

/** jsdom 不做布局：两条轴的可视区与内容长度逐个钉死。 */
function stubBox(target: HTMLElement, vertical: [number, number], horizontal: [number, number]): void {
  let top = 0
  let left = 0
  Object.defineProperties(target, {
    clientHeight: { configurable: true, get: () => vertical[0] },
    scrollHeight: { configurable: true, get: () => vertical[1] },
    clientWidth: { configurable: true, get: () => horizontal[0] },
    scrollWidth: { configurable: true, get: () => horizontal[1] },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = v } },
    scrollLeft: { configurable: true, get: () => left, set: (v: number) => { left = v } },
  })
}

const CATALOG = [
  {
    value: 'digital',
    label: '数码',
    children: [
      { value: 'phone', label: '手机' },
      { value: 'pad', label: '平板' },
    ],
  },
  { value: 'other', label: '其他' },
]

const TREE = [
  {
    value: 'docs',
    label: 'docs',
    children: [
      { value: 'guide', label: 'guide.md' },
      { value: 'api', label: 'api.md' },
    ],
  },
  { value: 'readme', label: 'README.md' },
]

interface Case {
  scope: string
  /** 摆出来的轴，按宿主交给共享层的顺序。 */
  axes: Orientation[]
  /** 条子挂在哪个角色节点上。 */
  shell: string
  /** 真正在滚的那层。 */
  layer: string
  mount: () => Promise<void>
  /** 浮层族：按住条子那一下不该把浮层消解掉。 */
  overlay: boolean
}

const CASES: Case[] = [
  {
    scope: 'tree-select',
    axes: ['vertical', 'horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    mount: async () => {
      render(() => h(XhTreeSelectRoot, {
        collection: TREE,
        defaultExpandedValue: ['docs'],
        defaultOpen: true,
      }))
      await settle()
    },
  },
  {
    scope: 'cascader',
    axes: ['horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    mount: async () => {
      render(() => h(XhCascaderRoot, { collection: CATALOG, defaultOpen: true }, () => [
        h(XhCascaderPositioner, null, () => [h(XhCascaderContent)]),
      ]))
      await settle()
    },
  },
  {
    scope: 'color-picker',
    axes: ['vertical'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    mount: async () => {
      render(() => h(XhColorPickerRoot, { defaultOpen: true }, () => [
        h(XhColorPickerPositioner, null, () => [h(XhColorPickerContent, null, () => '面板')]),
      ]))
      await settle()
    },
  },
  {
    // 面板皮肤 overflow: auto 两轴都滚：日历保持天然宽度，窄视口下横向也在面板内自己滚
    scope: 'date-picker',
    axes: ['vertical', 'horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    mount: async () => {
      render(() => h(XhDatePickerRoot, { defaultOpen: true }, () => [
        h(XhDatePickerPositioner, null, () => [h(XhDatePickerContent, null, () => '面板')]),
      ]))
      await settle()
    },
  },
  {
    // 区间面板同样两轴都滚：两张日历保持天然宽度，窄视口下横向在面板内自己滚
    scope: 'date-range-picker',
    axes: ['vertical', 'horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    mount: async () => {
      render(() => h(XhDateRangePickerRoot, { defaultOpen: true }, () => [
        h(XhDateRangePickerPositioner, null, () => [h(XhDateRangePickerContent, null, () => '面板')]),
      ]))
      await settle()
    },
  },
  {
    // 页内定高小列表（§6.6）：条子挂在 root 上、贴在 content 自己的盒子上（root 里还有标题），两轴都摆，走 6px 缺省档
    scope: 'listbox',
    axes: ['vertical', 'horizontal'],
    shell: 'root',
    layer: 'content',
    overlay: false,
    mount: async () => {
      render(() => h(XhListboxRoot, null, () => [
        h(XhListboxLabel, null, () => '水果'),
        h(XhListboxContent, null, () => [
          h(XhListboxItem, { value: 'apple' }, () => [h(XhListboxItemText, null, () => 'Apple')]),
          h(XhListboxItem, { value: 'pear' }, () => [h(XhListboxItemText, null, () => 'Pear')]),
        ]),
      ]))
      await settle()
    },
  },
  {
    // 两组时列并排放不下时面板整体横滚：横条挂在浮层壳上；各列自己的竖条贴在列上、挂在 content 里
    scope: 'time-range-picker',
    axes: ['horizontal'],
    shell: 'positioner',
    layer: 'content',
    overlay: true,
    mount: async () => {
      render(() => h(XhTimeRangePickerRoot, { defaultOpen: true }, () => [
        h(XhTimeRangePickerPositioner, null, () => [h(XhTimeRangePickerContent, null, () => '面板')]),
      ]))
      await settle()
    },
  },
]

describe.each(CASES)('$scope 的自绘条', (item) => {
  it('挂在壳上、是滚动层的兄弟，三层齐全', async () => {
    await item.mount()

    const shell = part(item.scope, item.shell)
    const layer = part(item.scope, item.layer)
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
    await item.mount()

    expect(bars(part(item.scope, item.shell)).map(root => root.getAttribute('data-orientation')))
      .toEqual(item.axes)
  })

  it('一个 data-xh-part 都不带', async () => {
    await item.mount()

    const nodes = [...part(item.scope, item.shell).querySelectorAll<HTMLElement>('[data-scope="scrollbar"]')]
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes)
      expect(node.hasAttribute('data-xh-part')).toBe(false)
  })

  it('滚动容器带上标记，原生条交给皮肤藏掉', async () => {
    await item.mount()

    // 标记是引用计数：几条轴挂上去就记几
    expect(part(item.scope, item.layer).getAttribute('data-xh-scrollbar'))
      .toBe(String(item.axes.length))
  })

  it.runIf(!item.overlay)('页内宿主：条子贴层锚定、走 6px 缺省档', async () => {
    await item.mount()

    for (const root of bars(part(item.scope, item.shell))) {
      expect(root.getAttribute('data-anchor')).toBe('layer')
      // 页内宿主不传 size：缺省 6px 档，根上不写 data-size
      expect(root.getAttribute('data-size')).toBeNull()
    }
  })

  it('交叉口只画在双轴宿主的竖条里', async () => {
    await item.mount()

    const corners = [...part(item.scope, item.shell)
      .querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')]
    expect(corners).toHaveLength(item.axes.length > 1 ? 1 : 0)
    if (corners[0])
      expect(corners[0].closest('[data-part="root"]')?.getAttribute('data-orientation')).toBe('vertical')
  })

  it.runIf(item.overlay)('按在条子上不会把浮层消解掉', async () => {
    await item.mount()

    const panel = part(item.scope, item.layer)
    expect(panel.getAttribute('data-state')).toBe('open')

    part(item.scope, item.shell)
      .querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
    await settle()

    expect(panel.getAttribute('data-state')).toBe('open')
  })
})

describe('双轴的让位跟着另一条轴走', () => {
  /** 树浮层挂起来，把 content 的两条轴按给定尺寸钉死。 */
  async function mountTreeSelect(
    vertical: [number, number],
    horizontal: [number, number],
  ): Promise<HTMLElement> {
    render(() => h(XhTreeSelectRoot, {
      collection: TREE,
      defaultExpandedValue: ['docs'],
      defaultOpen: true,
    }))
    stubBox(part('tree-select', 'content'), vertical, horizontal)
    await settle()
    return part('tree-select', 'positioner')
  }

  it('两条轴都溢出时各自让出交叉口那一格，交叉口露面', async () => {
    const shell = await mountTreeSelect([100, 400], [100, 400])

    expect(bars(shell).map(root => root.hasAttribute('data-gutter'))).toEqual([true, true])
    expect(shell.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')!.hasAttribute('hidden'))
      .toBe(false)
  })

  it('只有竖轴溢出时两条都不让位，交叉口收着', async () => {
    const shell = await mountTreeSelect([100, 400], [100, 100])

    expect(bars(shell).map(root => root.hasAttribute('data-gutter'))).toEqual([false, false])
    expect(shell.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="corner"]')!.hasAttribute('hidden'))
      .toBe(true)
  })
})

describe('transfer 两侧列表各一路自绘条', () => {
  const ITEMS = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]
  function mountTransfer(): void {
    render(() => h(XhTransferRoot, { collection: ITEMS, defaultValue: ['b'] }, () => [
      h(XhTransferSourcePanel, null, () => [h(XhTransferList, null, () => ITEMS.map(item =>
        h(XhTransferItem, { value: item.value, side: 'source' }, () => [h(XhTransferItemText, null, () => item.label)]),
      ))]),
      h(XhTransferTargetPanel, null, () => [h(XhTransferList, null, () => ITEMS.map(item =>
        h(XhTransferItem, { value: item.value, side: 'target' }, () => [h(XhTransferItemText, null, () => item.label)]),
      ))]),
    ]))
  }

  it('条子挂在 root 上、贴层锚定、紧跟在各自的列表后面，两轴都摆、走 6px 缺省档', async () => {
    mountTransfer()
    await settle()

    const root = part('transfer', 'root')
    const lists = [...root.querySelectorAll<HTMLElement>('[data-scope="transfer"][data-part="list"]')]
    expect(lists).toHaveLength(2)
    const roots = bars(root)
    expect(roots).toHaveLength(4)
    for (const list of lists) {
      expect(list.getAttribute('data-xh-scrollbar')).toBe('2')
      const own = [list.nextElementSibling, list.nextElementSibling?.nextElementSibling] as HTMLElement[]
      expect(own.map(node => node?.getAttribute('data-orientation'))).toEqual(['vertical', 'horizontal'])
      for (const node of own) {
        expect(node.getAttribute('data-anchor')).toBe('layer')
        expect(node.getAttribute('data-size')).toBeNull()
        expect(node.hasAttribute('data-xh-part')).toBe(false)
      }
    }
  })
})

describe('json-viewer 不接自绘条', () => {
  function mountViewer(view: 'tree' | 'text') {
    const current = ref(view)
    render(() => h(XhJsonViewerRoot, { value: { a: 1, b: [2, 3] }, view: current.value }))
    return current
  }

  it('树档与原文档都走原生细条：root 上不挂条子，容器不带 data-xh-scrollbar', async () => {
    const current = mountViewer('tree')
    await settle()

    expect(bars(part('json-viewer', 'root'))).toHaveLength(0)
    expect(part('json-viewer', 'tree').hasAttribute('data-xh-scrollbar')).toBe(false)

    current.value = 'text'
    await settle()

    expect(bars(part('json-viewer', 'root'))).toHaveLength(0)
    expect(part('json-viewer', 'text').hasAttribute('data-xh-scrollbar')).toBe(false)
  })
})
