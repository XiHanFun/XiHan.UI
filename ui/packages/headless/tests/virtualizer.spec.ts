// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type { VirtualizerApi, VirtualizerSchema } from '../src/virtualizer'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import {
  connectVirtualizer,
  findVirtualizerItem,
  resolveVirtualizerEstimate,
  resolveVirtualizerLanes,
  resolveVirtualizerOverscan,
  VIRTUALIZER_DEFAULT_OVERSCAN,
  VIRTUALIZER_EMPTY_SNAPSHOT,
  virtualizerContentStyle,
  virtualizerItemStyle,
  virtualizerMachine,
  virtualizerSnapshotEqual,
} from '../src/virtualizer'

type Props = VirtualizerSchema['props']
type Dict = Record<string, unknown>

// ───────────────────────── 纯函数：不碰 DOM、不认识状态机 ─────────────────────────

const ITEM = { index: 3, key: 3, start: 90, end: 120, size: 30, lane: 0 }

describe('resolveVirtualizerOverscan', () => {
  it('没给就用默认的 5', () => {
    expect(resolveVirtualizerOverscan(undefined)).toBe(VIRTUALIZER_DEFAULT_OVERSCAN)
    expect(VIRTUALIZER_DEFAULT_OVERSCAN).toBe(5)
  })

  it('给了就用给的，0 也当数', () => {
    expect(resolveVirtualizerOverscan(2)).toBe(2)
    expect(resolveVirtualizerOverscan(0)).toBe(0)
  })

  it('负数与非数收成 0 / 默认：内核不接受负的过扫描', () => {
    expect(resolveVirtualizerOverscan(-3)).toBe(0)
    expect(resolveVirtualizerOverscan(Number.NaN)).toBe(5)
  })
})

describe('resolveVirtualizerLanes', () => {
  it('缺省是单列', () => {
    expect(resolveVirtualizerLanes(undefined)).toBe(1)
  })

  it('0 与负数兜到 1', () => {
    // 分道数为 0 会让内核的分道数组长度为 0，整份列表算不出区间
    expect(resolveVirtualizerLanes(0)).toBe(1)
    expect(resolveVirtualizerLanes(-2)).toBe(1)
  })

  it('小数取整', () => {
    expect(resolveVirtualizerLanes(3.7)).toBe(3)
  })
})

describe('resolveVirtualizerEstimate', () => {
  it('函数原样透传', () => {
    const fn = (index: number): number => index * 2
    expect(resolveVirtualizerEstimate(fn)).toBe(fn)
  })

  it('数字包成常量函数：WC 侧属性只能是字符串，等高列表不必写函数', () => {
    const fn = resolveVirtualizerEstimate(32)
    expect(fn(0)).toBe(32)
    expect(fn(999)).toBe(32)
  })

  it('没给按 0 算', () => {
    expect(resolveVirtualizerEstimate(undefined)(0)).toBe(0)
  })
})

describe('virtualizerSnapshotEqual', () => {
  const base = { items: [ITEM], totalSize: 300, startIndex: 3, endIndex: 3 }

  it('逐字段相等即相等（引用不同也算）', () => {
    expect(virtualizerSnapshotEqual(base, { items: [{ ...ITEM }], totalSize: 300, startIndex: 3, endIndex: 3 })).toBe(true)
  })

  it('总长、区间、条数、任一条目字段变了都算变了', () => {
    expect(virtualizerSnapshotEqual(base, { ...base, totalSize: 301 })).toBe(false)
    expect(virtualizerSnapshotEqual(base, { ...base, startIndex: 2 })).toBe(false)
    expect(virtualizerSnapshotEqual(base, { ...base, endIndex: 4 })).toBe(false)
    expect(virtualizerSnapshotEqual(base, { ...base, items: [] })).toBe(false)
    expect(virtualizerSnapshotEqual(base, { ...base, items: [{ ...ITEM, start: 91 }] })).toBe(false)
  })

  it('没有上一份时不算相等', () => {
    expect(virtualizerSnapshotEqual(base, undefined)).toBe(false)
  })
})

describe('findVirtualizerItem', () => {
  it('按下标取，取不到给 undefined（即"这条此刻不在窗口里"）', () => {
    expect(findVirtualizerItem([ITEM], 3)).toBe(ITEM)
    expect(findVirtualizerItem([ITEM], 4)).toBeUndefined()
    expect(findVirtualizerItem(VIRTUALIZER_EMPTY_SNAPSHOT.items, 0)).toBeUndefined()
  })
})

describe('virtualizerContentStyle', () => {
  it('竖向把总长写进块轴，行内轴清空交还样式表', () => {
    expect(virtualizerContentStyle(3000, false)).toEqual({ blockSize: '3000px', inlineSize: '' })
  })

  it('横向反过来', () => {
    expect(virtualizerContentStyle(3000, true)).toEqual({ inlineSize: '3000px', blockSize: '' })
  })

  it('两条轴的键每帧都写全：只写新键的话换向时会被两轴一起钉死', () => {
    expect(Object.keys(virtualizerContentStyle(0, false)).sort()).toEqual(['blockSize', 'inlineSize'])
  })

  it('实测尺寸是浮点数，留两位小数免得两个适配器拼出不同的串', () => {
    expect(virtualizerContentStyle(100 / 3, false).blockSize).toBe('33.33px')
  })
})

describe('virtualizerItemStyle', () => {
  it('竖向单列：只写位移，交叉轴交还样式表', () => {
    expect(virtualizerItemStyle(ITEM, { horizontal: false, lanes: 1 })).toEqual({
      insetBlockStart: '90px',
      insetInlineStart: '',
      inlineSize: '',
      blockSize: '',
    })
  })

  it('主轴尺寸一律不写：写了就把测量钉死在估算值上，measureElement 再也收敛不了', () => {
    const style = virtualizerItemStyle(ITEM, { horizontal: false, lanes: 1 })
    expect(style.blockSize).toBe('')
  })

  it('横向单列：位移落在行内轴', () => {
    expect(virtualizerItemStyle(ITEM, { horizontal: true, lanes: 1 })).toEqual({
      insetInlineStart: '90px',
      insetBlockStart: '',
      blockSize: '',
      inlineSize: '',
    })
  })

  it('多列时交叉轴归连接层，按道数均分', () => {
    expect(virtualizerItemStyle({ ...ITEM, lane: 1 }, { horizontal: false, lanes: 2 })).toEqual({
      insetBlockStart: '90px',
      insetInlineStart: '50%',
      inlineSize: '50%',
      blockSize: '',
    })
  })

  it('除不尽时留两位小数：不截尾巴两个适配器会拼出不同的串', () => {
    const style = virtualizerItemStyle({ ...ITEM, lane: 2 }, { horizontal: false, lanes: 3 })
    expect(style.insetInlineStart).toBe('66.67%')
    expect(style.inlineSize).toBe('33.33%')
  })

  it('不在窗口里的条目四个键全清空：被复用的节点不许带着上一轮的位移停在半空', () => {
    expect(virtualizerItemStyle(undefined, { horizontal: false, lanes: 2 })).toEqual({
      insetBlockStart: '',
      insetInlineStart: '',
      blockSize: '',
      inlineSize: '',
    })
  })
})

// ───────────────────────── 机器 + 连接层：桩掉 rect 与滚动量 ─────────────────────────

interface Rig {
  service: Service<VirtualizerSchema>
  viewport: HTMLElement
  content: HTMLElement
  api: () => VirtualizerApi
  setProps: (next: Props) => void
  /** 换一个视口尺寸（不派任何事件：jsdom 没有 ResizeObserver，与真实的降级环境一样）。 */
  resize: (size: number) => void
  /** 原生滚动：改滚动量再派 scroll 事件，与浏览器同序。 */
  scroll: (offset: number) => void
  scrollCalls: Array<{ top?: number, left?: number, behavior?: string }>
  stop: () => void
}

/**
 * jsdom 不做布局：offsetHeight / offsetWidth 恒是 0，内核会判定"视口一条都排不下"
 * （calculateRange 遇到 outerSize === 0 直接给 null），一条也不会渲。
 *
 * 这里把视口桩成 100×100，滚动量做成可读可写，滚动上限（scrollHeight）跟着组件算出的
 * 总长走——浏览器里正是 content 被撑高后视口报出来的那个数，内核夹滚动位置时读它。
 *
 * scrollTo 只在滚动量真的变了时才派 scroll 事件，与浏览器同行为：
 * 内核每次接上滚动容器都会把当前滚动位置原样写回一次（_willUpdate 的收尾动作），
 * 无条件派事件的话，挂载当场就会被判成"用户正在滚"。
 */
function stubViewport(
  el: HTMLElement,
  calls: Rig['scrollCalls'],
  size: () => number,
  maxSize: () => number,
): void {
  let top = 0
  let left = 0
  const write = (axis: 'top' | 'left', value: number): void => {
    const next = Math.min(Math.max(value, 0), Math.max(0, maxSize() - size()))
    const changed = axis === 'top' ? next !== top : next !== left
    if (axis === 'top')
      top = next
    else
      left = next
    if (changed)
      el.dispatchEvent(new Event('scroll'))
  }
  Object.defineProperties(el, {
    offsetHeight: { configurable: true, get: size },
    offsetWidth: { configurable: true, get: size },
    clientHeight: { configurable: true, get: size },
    clientWidth: { configurable: true, get: size },
    scrollHeight: { configurable: true, get: () => maxSize() },
    scrollWidth: { configurable: true, get: () => maxSize() },
    // 直接赋值不派事件：与浏览器一致，用例要观察就自己派
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = v } },
    scrollLeft: { configurable: true, get: () => left, set: (v: number) => { left = v } },
  })
  el.scrollTo = ((options: { top?: number, left?: number, behavior?: string }) => {
    calls.push(options)
    if (options.top != null)
      write('top', options.top)
    if (options.left != null)
      write('left', options.left)
  }) as HTMLElement['scrollTo']
}

function makeRig(initial: Props = {}, initialSize = 100): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(virtualizerMachine, { props: () => props.get(), runtime })

  const make = (part: string): HTMLElement => {
    const el = document.createElement('div')
    el.setAttribute('data-scope', 'virtualizer')
    el.setAttribute('data-part', part)
    return el
  }
  const root = make('root')
  const viewport = make('viewport')
  const content = make('content')
  viewport.appendChild(content)
  root.appendChild(viewport)
  document.body.appendChild(root)

  const scrollCalls: Rig['scrollCalls'] = []
  let size = initialSize
  stubViewport(viewport, scrollCalls, () => size, () => service.context.get('snapshot').totalSize)

  service.refs.set('getViewportEl', () => viewport)
  service.refs.set('getContentEl', () => content)

  runtime.start()

  return {
    service,
    viewport,
    content,
    scrollCalls,
    api: () => connectVirtualizer(service, normalizeProps),
    resize: (next) => {
      size = next
    },
    setProps: next => props.set({ ...props.get(), ...next }),
    scroll: (offset) => {
      const horizontal = props.get().horizontal ?? false
      if (horizontal)
        viewport.scrollLeft = offset
      else
        viewport.scrollTop = offset
      viewport.dispatchEvent(new Event('scroll'))
    },
    stop: () => {
      runtime.stop()
      root.remove()
    },
  }
}

/** 内核的建立推迟了一拍（queueMicrotask），等它跑完再断言。 */
async function settle(): Promise<void> {
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await new Promise<void>(resolve => queueMicrotask(resolve))
}

const rigs: Rig[] = []
function rig(initial?: Props, initialSize?: number): Rig {
  const created = makeRig(initial, initialSize)
  rigs.push(created)
  return created
}

afterEach(() => {
  while (rigs.length) rigs.pop()!.stop()
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/** 该渲的下标序列，断言里反复要用。 */
function indexes(r: Rig): number[] {
  return r.api().virtualItems.map(item => item.index)
}

function itemProps(r: Rig, index: number): Dict {
  return r.api().getItemProps({ index }) as Dict
}

// 视口 100、每条 30：一屏排得下 0..3（第 4 条起点已在 100 之外）
const LIST: Props = { count: 1000, estimateSize: 30 }

describe('区间与总尺寸', () => {
  it('给定 count / estimateSize / 视口尺寸，算出可视区间与总长', async () => {
    const r = rig(LIST)
    await settle()
    expect(r.api().totalSize).toBe(30000)
    expect(r.api().startIndex).toBe(0)
    expect(r.api().endIndex).toBe(3)
  })

  it('过扫描默认 5：可视区往后多渲 5 条，往前不够就贴到 0', async () => {
    const r = rig(LIST)
    await settle()
    expect(indexes(r)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('overscan 给 0 就只渲可视区那几条', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    expect(indexes(r)).toEqual([0, 1, 2, 3])
  })

  it('滚动量决定窗口落在哪：滚到 300 时首条变成第 10 条', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    r.scroll(300)
    expect(r.api().startIndex).toBe(10)
    expect(r.api().endIndex).toBe(13)
    expect(indexes(r)).toEqual([10, 11, 12, 13])
  })

  it('条目位移与尺寸来自内核：第 10 条起点就是 300', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    r.scroll(300)
    expect(r.api().virtualItems[0]).toEqual({ index: 10, key: 10, start: 300, end: 330, size: 30, lane: 0 })
  })

  it('还没量到视口尺寸时（无 DOM 环境）快照恒为空，不产生 NaN', () => {
    const runtime = createVanillaRuntime()
    const service = createService(virtualizerMachine, { props: () => LIST, runtime })
    runtime.start()
    const api = connectVirtualizer(service, normalizeProps)
    expect(api.virtualItems).toEqual([])
    expect(api.totalSize).toBe(0)
    expect(api.startIndex).toBe(null)
    runtime.stop()
  })

  it('gap 计进位移与总长', async () => {
    const r = rig({ ...LIST, gap: 10, overscan: 0 })
    await settle()
    // 每条 30 + 间距 10：第 1 条从 40 起，总长 1000 条 + 999 段间距
    expect(r.api().virtualItems[1]!.start).toBe(40)
    expect(r.api().totalSize).toBe(30000 + 999 * 10)
  })

  it('paddingStart / paddingEnd 计进总长，首条从 paddingStart 处起算', async () => {
    const r = rig({ ...LIST, paddingStart: 16, paddingEnd: 24, overscan: 0 })
    await settle()
    expect(r.api().virtualItems[0]!.start).toBe(16)
    expect(r.api().totalSize).toBe(16 + 30000 + 24)
  })

  it('scrollMargin：位移折算回"距 content 起点"，作者不必自己减', async () => {
    const r = rig({ ...LIST, scrollMargin: 200, overscan: 0 })
    await settle()
    // 列表整体下移了 200，但对外报的仍是距 content 起点的位移
    expect(r.api().virtualItems[0]!.start).toBe(0)
    expect(r.api().totalSize).toBe(30000)
    // 视口滚了 200 才刚好露出第一条
    r.scroll(200)
    expect(r.api().startIndex).toBe(0)
    r.scroll(500)
    expect(r.api().startIndex).toBe(10)
  })

  it('getItemKey 决定条目身份', async () => {
    const r = rig({ ...LIST, overscan: 0, getItemKey: index => `row-${index}` })
    await settle()
    expect(r.api().virtualItems[0]!.key).toBe('row-0')
  })

  it('横向列表量的是行内轴，读的是 scrollLeft', async () => {
    const r = rig({ ...LIST, horizontal: true, overscan: 0 })
    await settle()
    expect(r.api().horizontal).toBe(true)
    r.scroll(300)
    expect(r.api().startIndex).toBe(10)
    expect(r.viewport.scrollLeft).toBe(300)
    expect(r.viewport.scrollTop).toBe(0)
  })

  it('多列网格：条目轮流落到各道上，总长按行算', async () => {
    const r = rig({ count: 100, estimateSize: 30, lanes: 2, overscan: 0 })
    await settle()
    expect(r.api().lanes).toBe(2)
    const items = r.api().virtualItems
    expect(items[0]!.lane).toBe(0)
    expect(items[1]!.lane).toBe(1)
    // 同一行的两条起点相同
    expect(items[1]!.start).toBe(items[0]!.start)
    // 100 条铺成 50 行
    expect(r.api().totalSize).toBe(50 * 30)
  })
})

describe('prop 变化', () => {
  it('count 变了立刻重算：数据换了一批不会还照着旧长度渲', async () => {
    const r = rig(LIST)
    await settle()
    expect(r.api().totalSize).toBe(30000)
    r.setProps({ count: 10 })
    expect(r.api().totalSize).toBe(300)
    // 可视区仍是 0..3，过扫描 5 条到 8；总共只有 10 条，末尾按 count 夹住
    expect(indexes(r)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('estimateSize 变了重排', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    r.setProps({ estimateSize: 50 })
    expect(r.api().totalSize).toBe(50000)
    expect(indexes(r)).toEqual([0, 1])
  })

  it('overscan 变了立刻多渲/少渲', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    expect(indexes(r)).toEqual([0, 1, 2, 3])
    r.setProps({ overscan: 1 })
    expect(indexes(r)).toEqual([0, 1, 2, 3, 4])
  })

  it('prop 变化顺带把视口重新量一遍：挂载时还没撑开的容器不会永远停在"一条都排不下"', async () => {
    // 容器初始尺寸为 0（还没布局 / 父级 display:none），内核会判定一条都排不下
    const r = rig({ estimateSize: 30, overscan: 0 }, 0)
    await settle()
    expect(r.api().virtualItems).toEqual([])

    r.resize(100)
    r.setProps({ count: 12 })
    expect(indexes(r)).toEqual([0, 1, 2, 3])
  })

  it('count 收缩到窗口以内时不留下越界下标', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    r.scroll(300)
    expect(indexes(r)).toEqual([10, 11, 12, 13])
    r.setProps({ count: 5 })
    expect(indexes(r).every(i => i < 5)).toBe(true)
  })
})

describe('onChange', () => {
  it('窗口变了才回调，滚一点点但区间没变不回调', async () => {
    const onChange = vi.fn()
    const r = rig({ ...LIST, overscan: 0, onChange })
    await settle()
    onChange.mockClear()

    // 30px 一条：滚 5px 还落在同一条上，区间不变
    r.scroll(5)
    const afterTinyScroll = onChange.mock.calls.length
    r.scroll(6)
    expect(onChange.mock.calls.length).toBe(afterTinyScroll)

    r.scroll(300)
    const details = onChange.mock.calls.at(-1)![0] as { startIndex: number, totalSize: number, virtualItems: unknown[] }
    expect(details.startIndex).toBe(10)
    expect(details.totalSize).toBe(30000)
    expect(details.virtualItems).toHaveLength(4)
  })

  it('快照没变就不重写 context：内核每被问一次都产出新对象，无条件写等于每次滚动白重渲', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    const before = r.service.context.get('snapshot')
    r.scroll(5)
    expect(r.service.context.get('snapshot')).toBe(before)
    r.scroll(300)
    expect(r.service.context.get('snapshot')).not.toBe(before)
  })
})

describe('滚动状态', () => {
  it('滚动时进 scrolling，停手一段时间后回 idle', async () => {
    vi.useFakeTimers()
    const r = rig(LIST)
    await settle()
    expect(r.service.state.get()).toBe('idle')
    expect(r.api().scrolling).toBe(false)

    r.scroll(300)
    expect(r.service.state.get()).toBe('scrolling')
    expect((r.api().getRootProps() as Dict)['data-scrolling']).toBe('')

    // 内核自带停手判定（默认 150ms 防抖）
    vi.advanceTimersByTime(200)
    expect(r.service.state.get()).toBe('idle')
    expect((r.api().getRootProps() as Dict)['data-scrolling']).toBeUndefined()
  })
})

describe('命令式方法', () => {
  it('scrollToIndex 把视口滚到那一条，align 透传给内核', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    r.api().scrollToIndex(100)
    // 第 100 条起点 3000，align 默认 start
    expect(r.scrollCalls.at(-1)).toMatchObject({ top: 3000 })
    expect(r.viewport.scrollTop).toBe(3000)
    expect(r.api().startIndex).toBe(100)

    r.api().scrollToIndex(200, { align: 'end' })
    // 贴结束缘：末缘 6030 减去视口 100 → 滚到 5930
    expect(r.scrollCalls.at(-1)).toMatchObject({ top: 5930 })
    expect(r.api().endIndex).toBe(200)
  })

  it('measureElement 把真实尺寸回喂给内核，位移与总长随之变', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    const node = document.createElement('div')
    // 内核按 data-index 反查节点是第几条，这个属性由 connect 写上去
    node.setAttribute('data-index', String(itemProps(r, 0)['data-index']))
    Object.defineProperty(node, 'offsetHeight', { configurable: true, get: () => 90 })
    r.viewport.appendChild(node)

    r.api().measureElement(node)
    // 第 0 条从 30 长到 90：总长多出 60，第 1 条起点跟着挪到 90
    expect(r.api().totalSize).toBe(30000 + 60)
    expect(r.api().virtualItems[1]!.start).toBe(90)
  })

  it('measureElement 传 null 不炸', async () => {
    const r = rig(LIST)
    await settle()
    expect(() => r.api().measureElement(null)).not.toThrow()
  })

  it('收起来的条目不量：display:none 的节点量出来是 0，喂回去会把那条真的压塌', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    // 第 50 条此刻不在窗口里，connect 会给它写 hidden
    expect(itemProps(r, 50).hidden).toBe(true)

    const node = document.createElement('div')
    node.setAttribute('data-index', '50')
    Object.defineProperty(node, 'offsetHeight', { configurable: true, get: () => 0 })
    r.viewport.appendChild(node)

    r.api().measureElement(node)
    expect(r.api().totalSize).toBe(30000)
  })

  it('measure 把视口重新量一遍：没有 ResizeObserver 的环境靠它跟上尺寸变化', async () => {
    const r = rig({ ...LIST, overscan: 0 }, 0)
    await settle()
    expect(r.api().virtualItems).toEqual([])

    r.resize(100)
    r.api().measure()
    expect(indexes(r)).toEqual([0, 1, 2, 3])
  })

  it('内核还没建起来时 measure 是空转，不往没跑起来的机器上送事件', () => {
    const r = rig(LIST)
    // 刻意不 settle：Vue 在 render 期就求值 connect，那时机器还没起，送事件会直接抛
    expect(() => r.api().measure()).not.toThrow()
  })

  it('measure 丢掉实测尺寸重新按估算值排', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    const node = document.createElement('div')
    node.setAttribute('data-index', '0')
    Object.defineProperty(node, 'offsetHeight', { configurable: true, get: () => 90 })
    r.viewport.appendChild(node)
    r.api().measureElement(node)
    expect(r.api().totalSize).toBe(30060)

    r.api().measure()
    expect(r.api().totalSize).toBe(30000)
  })
})

describe('连接层产出', () => {
  it('content 的总长写进内联样式，另一条轴清空', async () => {
    const r = rig(LIST)
    await settle()
    const style = (r.api().getContentProps() as Dict).style as Dict
    expect(style.blockSize).toBe('30000px')
    expect(style.inlineSize).toBe('')
  })

  it('窗口里的条目：位移写内联样式、带 data-index，不收起', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    r.scroll(300)
    const props = itemProps(r, 11)
    expect(props['data-index']).toBe(11)
    expect(props['data-lane']).toBe(0)
    expect(props.hidden).toBeUndefined()
    expect((props.style as Dict).insetBlockStart).toBe('330px')
  })

  it('窗口外的条目收起来而不是被卸载，且不留残余位移', async () => {
    const r = rig({ ...LIST, overscan: 0 })
    await settle()
    r.scroll(300)
    const props = itemProps(r, 0)
    expect(props.hidden).toBe(true)
    expect(props['data-lane']).toBeUndefined()
    expect((props.style as Dict).insetBlockStart).toBe('')
  })

  it('视口占一个 Tab 位，且一个事件处理器都不挂：滚动与按键全归浏览器', async () => {
    const r = rig(LIST)
    await settle()
    const props = r.api().getViewportProps() as Dict
    expect(props.tabindex).toBe(0)
    expect(Object.keys(props).filter(key => /^on[A-Z]/.test(key))).toEqual([])
  })

  it('方向写在 root 与 viewport 上，横向时跟着翻', async () => {
    const vertical = rig(LIST)
    await settle()
    expect((vertical.api().getRootProps() as Dict)['data-orientation']).toBe('vertical')

    const horizontal = rig({ ...LIST, horizontal: true })
    await settle()
    expect((horizontal.api().getRootProps() as Dict)['data-orientation']).toBe('horizontal')
    expect((horizontal.api().getViewportProps() as Dict)['data-orientation']).toBe('horizontal')
  })

  it('连接层不碰 DOM：内核还没建起来时求值也拿得到一份完整产出', () => {
    const r = rig(LIST)
    // 刻意不 settle：此刻效应还没跑，内核不存在
    const api = r.api()
    expect(api.totalSize).toBe(0)
    expect((api.getContentProps() as Dict).style).toEqual({ blockSize: '0px', inlineSize: '' })
    expect((api.getItemProps({ index: 0 }) as Dict).hidden).toBe(true)
    // 命令式方法此刻是空转，不该抛
    expect(() => api.scrollToIndex(3)).not.toThrow()
  })
})

describe('停机', () => {
  it('摘掉视口上的滚动监听', async () => {
    const r = rig(LIST)
    await settle()
    const removeSpy = vi.spyOn(r.viewport, 'removeEventListener')
    r.stop()
    rigs.pop()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('停机后残留的内核回调不再写 context、也不再送事件', async () => {
    vi.useFakeTimers()
    const r = rig(LIST)
    await settle()
    r.scroll(300)
    const snapshot = r.service.context.get('snapshot')

    r.stop()
    rigs.pop()
    // 内核那只 150ms 的停手防抖计时器在停机后仍会走完并回调一次；
    // 少了"这台内核还在任吗"的判据，这一下会去写已经作废的 context
    expect(() => vi.advanceTimersByTime(500)).not.toThrow()
    expect(r.service.context.get('snapshot')).toBe(snapshot)
  })

  it('还没建起来就被卸载：效应不会往已停的机器上挂监听器', async () => {
    const r = rig(LIST)
    const addSpy = vi.spyOn(r.viewport, 'addEventListener')
    // 不 settle，直接停：推迟那一拍跑起来时应当发现自己已被弃用
    r.stop()
    rigs.pop()
    await settle()
    expect(r.service.refs.get('getVirtualizer')()).toBe(null)
    expect(addSpy).not.toHaveBeenCalled()
  })
})
