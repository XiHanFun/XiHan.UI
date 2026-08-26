// @vitest-environment jsdom
//
// 轴不止一条、壳不止 positioner 的那几个宿主。
// 这里钉住五件事：条子挂在各自的壳上、是滚动层的兄弟；建出来的节点一个 data-xh-part 都不带；
// 摆出来的轴与宿主报的一致（cascader 只摆横的，tree-select 与 json-viewer 两条都摆）；
// 双轴的让位跟着另一条轴的实测溢出走、交叉口只画在竖条里；
// json-viewer 两档互斥，条子跟到此刻在场的那个容器。
import type { Orientation } from '@xihan-ui/kernel'
import { DIAGNOSTIC_CODES, onDiagnostic, setDiagnosticsDedupe } from '@xihan-ui/kernel'
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
  XhJsonViewerRoot,
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
    scope: 'date-picker',
    axes: ['vertical'],
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
    scope: 'json-viewer',
    axes: ['vertical', 'horizontal'],
    shell: 'root',
    layer: 'tree',
    overlay: false,
    mount: async () => {
      render(() => h(XhJsonViewerRoot, { value: { orderNo: 'SO-1', items: [{ sku: 'A', qty: 2 }] } }))
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

describe('json-viewer 两档互斥', () => {
  function mountViewer(view: 'tree' | 'text') {
    const current = ref(view)
    render(() => h(XhJsonViewerRoot, { value: { a: 1, b: [2, 3] }, view: current.value }))
    return current
  }

  it('树档：条子跟着 tree，pre 不在场', async () => {
    mountViewer('tree')
    await settle()

    const root = part('json-viewer', 'root')
    expect(bars(root)).toHaveLength(2)
    expect(part('json-viewer', 'tree').getAttribute('data-xh-scrollbar')).toBe('2')
    expect(document.querySelector('[data-scope="json-viewer"][data-part="text"]')).toBeNull()
  })

  it('原文档：条子跟着 pre', async () => {
    mountViewer('text')
    await settle()

    const root = part('json-viewer', 'root')
    expect(bars(root)).toHaveLength(2)
    expect(part('json-viewer', 'text').getAttribute('data-xh-scrollbar')).toBe('2')
  })

  it('换档后条子还在壳上，跟到此刻在场的那个容器', async () => {
    const current = mountViewer('tree')
    await settle()
    const before = bars(part('json-viewer', 'root'))

    current.value = 'text'
    await settle()

    const root = part('json-viewer', 'root')
    // 条子由同一组机器摆出，换档不重建
    expect(bars(root)).toEqual(before)
    expect(part('json-viewer', 'text').getAttribute('data-xh-scrollbar')).toBe('2')
  })

  it('换档不投「找不到滚动容器」的诊断', async () => {
    // 直接收诊断而不是盯 console：同一条诊断整个进程只打印一次，盯 console 会把这条判据变成恒真
    const codes: string[] = []
    setDiagnosticsDedupe(false)
    const off = onDiagnostic(record => void codes.push(record.code))
    try {
      const current = mountViewer('tree')
      await settle()
      codes.length = 0

      current.value = 'text'
      await settle()

      // 旧容器的 ref 置空与新容器挂上之间，条子不该空跑一轮
      expect(codes).not.toContain(DIAGNOSTIC_CODES.scrollbarMissingScrollable)
    }
    finally {
      off()
      setDiagnosticsDedupe(true)
    }
  })
})
