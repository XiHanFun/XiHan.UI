// @vitest-environment jsdom
import type { AnchorSchema, AnchorValueChangeDetails } from '../src/anchor'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { anchorMachine, connectAnchor, resolveActiveAnchor } from '../src/anchor'

type Props = AnchorSchema['props']

const SECTIONS = ['intro', 'install', 'usage'] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯比对 connect 的返回值只能验静态属性，
 * 「点了当场切过去」这类事实必须有活 DOM 才立得住。
 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (key === 'style' || raw === undefined || raw === null || raw === false)
      continue
    el.setAttribute(key, String(raw))
  }
}

/** 给节点钉一个假的盒子：jsdom 不排版，所有 rect 恒为 0，判定线两侧的归属就无从谈起。 */
function stubRect(el: HTMLElement, box: { top: number, left?: number, width?: number, height?: number }): void {
  const { top, left = 0, width = 0, height = 0 } = box
  el.getBoundingClientRect = () => ({
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect
}

/**
 * 一整套活 DOM：nav > ul > li > a 三条目录，外加三个带 id 的目标区块。
 * 区块的位置由 stubRect 摆布，滚动就靠"改盒子 + 派 scroll 事件"模拟。
 */
function makeAnchor(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(anchorMachine, { props: () => props.get(), runtime })

  const root = document.createElement('nav')
  const list = document.createElement('ul')
  const links: HTMLAnchorElement[] = []
  const sections: HTMLElement[] = []
  for (const id of SECTIONS) {
    const item = document.createElement('li')
    const link = document.createElement('a')
    link.textContent = id
    item.appendChild(link)
    list.appendChild(item)
    links.push(link)

    const section = document.createElement('section')
    section.id = id
    // 默认摆在视口下方：不摆的话 jsdom 的 rect 恒为 0，三节会一齐压在判定线上
    stubRect(section, { top: 1000 * (sections.length + 1) })
    sections.push(section)
  }
  const indicator = document.createElement('div')
  list.appendChild(indicator)
  root.appendChild(list)
  document.body.append(root, ...sections)

  service.refs.set('getListEl', () => list)
  service.refs.set('getScrollEl', () => null)

  runtime.start()

  const wire = (): void => {
    const api = connectAnchor(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(list, api.getListProps() as Record<string, unknown>)
    spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
    links.forEach((el, i) => {
      spread(el, api.getLinkProps({ value: SECTIONS[i]! }) as Record<string, unknown>)
    })
  }
  // 每次状态变化都重新接线，与适配器同构（属性与处理器都跟着最新状态走）
  runtime.subscribe(wire)
  wire()

  return {
    service,
    root,
    list,
    links,
    sections,
    indicator,
    state: () => service.state.get(),
    // 两者皆缺省时 cell 初值是 undefined，归一成 null 再断言（连接层也是这么归一的）
    value: () => service.context.get('value') ?? null,
    api: () => connectAnchor(service, normalizeProps),
    /** 摆好区块位置再派一次滚动，模拟"用户滚到了这里"。 */
    scrollTo: (tops: readonly number[]) => {
      sections.forEach((el, i) => stubRect(el, { top: tops[i]! }))
      window.dispatchEvent(new Event('scroll'))
    },
    click: (index: number, init: MouseEventInit = {}) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
      links[index]!.dispatchEvent(event)
      return event
    },
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => {
      runtime.stop()
      root.remove()
      for (const el of sections) el.remove()
    },
  }
}

/** 观察器是 flush 推迟挂上的（首帧 DOM 还没就位）；等一个微任务它才开始工作。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  vi.useFakeTimers()
  // jsdom 的 window.scrollTo 只会往虚拟控制台丢一句"未实现"；换成 spy 才断言得了滚到哪
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('resolveActiveAnchor 判定哪一节算当前', () => {
  const T = (value: string, top: number) => ({ value, top })

  it('空清单没有当前项', () => {
    expect(resolveActiveAnchor([], 0, false)).toBeNull()
  })

  it('取最后一个越过判定线的：越过的可能不止一节', () => {
    // 判定线在 0：intro 与 install 都在线上方，usage 还在下面
    expect(resolveActiveAnchor([T('intro', -300), T('install', -20), T('usage', 400)], 0, false)).toBe('install')
  })

  it('一节都没越过就谁都不亮：首节前面的大图还占着屏，硬点亮首条就是说谎', () => {
    expect(resolveActiveAnchor([T('intro', 120), T('install', 800)], 0, false)).toBeNull()
  })

  it('offset 把判定线往下压：区块要多滚一段才算数', () => {
    const targets = [T('intro', -10), T('install', 40)]
    // 判定线在 0 时 install 还没到；压到 60 之后它就在线上方了
    expect(resolveActiveAnchor(targets, 0, false)).toBe('intro')
    expect(resolveActiveAnchor(targets, 60, false)).toBe('install')
  })

  it('压线容差：差半个像素也算越过（布局尺寸是小数，严格比较会卡在上一节）', () => {
    expect(resolveActiveAnchor([T('intro', -100), T('install', 60.5)], 60, false)).toBe('install')
    // 容差之外仍算没到
    expect(resolveActiveAnchor([T('intro', -100), T('install', 62)], 60, false)).toBe('intro')
  })

  it('滚到底：末条直接算当前，否则太短的末节永远高亮不了', () => {
    // 末节顶边还在判定线下方，但容器已经到底、再也滚不动了
    expect(resolveActiveAnchor([T('intro', -900), T('install', -200), T('usage', 700)], 0, true)).toBe('usage')
  })
})

describe('connectAnchor 静态输出', () => {
  it('root 是带名字的 nav 地标；dir 只在作者给了才写', () => {
    const bare = makeAnchor().api().getRootProps() as Record<string, unknown>
    expect(bare['data-scope']).toBe('anchor')
    expect(bare['data-part']).toBe('root')
    expect(bare['aria-label']).toBe('Anchor navigation')
    expect(bare['data-orientation']).toBe('vertical')
    expect(bare.dir).toBeUndefined()

    const named = makeAnchor({ dir: 'rtl', orientation: 'horizontal', translations: { root: '页内目录' } })
    const root = named.api().getRootProps() as Record<string, unknown>
    expect(root['aria-label']).toBe('页内目录')
    expect(root.dir).toBe('rtl')
    expect(root['data-orientation']).toBe('horizontal')
  })

  it('href 由目标 id 派生，作者不必再写一遍', () => {
    const link = makeAnchor().api().getLinkProps({ value: 'install' }) as Record<string, unknown>
    expect(link.href).toBe('#install')
    expect(link['data-value']).toBe('install')
  })

  it('当前那条报 aria-current=location（不是 page：指向的都是同一个页面）', () => {
    const c = makeAnchor({ defaultValue: 'install' })
    const api = c.api()
    const active = api.getLinkProps({ value: 'install' }) as Record<string, unknown>
    const other = api.getLinkProps({ value: 'intro' }) as Record<string, unknown>
    expect(active['aria-current']).toBe('location')
    expect(active['data-active']).toBe('')
    // aria-current 的默认值就是 "false"，省略即"不是当前项"
    expect(other['aria-current']).toBeUndefined()
    expect(other['data-active']).toBeUndefined()
    expect(api.isActive('install')).toBe(true)
    expect(api.isActive('intro')).toBe(false)
  })

  it('指示条是装饰：aria-hidden 恒真；没有激活项时整条收起', () => {
    const c = makeAnchor()
    const indicator = c.api().getIndicatorProps() as Record<string, unknown>
    expect(indicator['aria-hidden']).toBe('true')
    expect(indicator.hidden).toBe(true)
    expect(indicator.style).toBeUndefined()
  })
})

describe('anchor 指示条量测', () => {
  it('竖排：只写块轴那一条，位置是当前链接相对 list 的偏移', () => {
    const c = makeAnchor({ defaultValue: 'install' })
    stubRect(c.list, { top: 100, left: 20, width: 200, height: 300 })
    stubRect(c.links[1]!, { top: 140, left: 28, width: 160, height: 24 })
    // 值没变时不会自己重量；用 setValue 走一趟同一条路把量测顶起来
    c.api().setValue('intro')
    c.api().setValue('install')

    const indicator = c.api().getIndicatorProps() as Record<string, unknown>
    expect(indicator.hidden).toBeUndefined()
    // 交叉轴（贴边与粗细）归样式层，内联样式一个字都不该写
    expect(indicator.style).toEqual({ blockSize: '24px', insetBlockStart: '40px' })
  })

  // 激活项没变就没人去重量，指示条会一直停在旧位置上——而目录换行、字体加载完
  // 都会让它脚下的那条链接挪窝。
  it('窗口尺寸变了重量一次：激活项没动，位置照样跟着走', async () => {
    const c = makeAnchor()
    await settle()
    // 先滚到第二节，让激活项落在它身上
    c.scrollTo([-100, -10, 900])
    expect(c.value()).toBe('install')
    stubRect(c.list, { top: 0, left: 0, width: 200, height: 300 })
    stubRect(c.links[1]!, { top: 40, left: 0, width: 200, height: 24 })
    window.dispatchEvent(new Event('resize'))
    expect((c.api().getIndicatorProps() as Record<string, unknown>).style)
      .toEqual({ blockSize: '24px', insetBlockStart: '40px' })

    stubRect(c.links[1]!, { top: 96, left: 0, width: 200, height: 48 })
    window.dispatchEvent(new Event('resize'))
    expect((c.api().getIndicatorProps() as Record<string, unknown>).style)
      .toEqual({ blockSize: '48px', insetBlockStart: '96px' })
  })

  it('横排 + RTL：起始缘从右边量起，指示条不会跑到另一头', () => {
    const c = makeAnchor({ defaultValue: 'install', dir: 'rtl', orientation: 'horizontal' })
    stubRect(c.list, { top: 0, left: 0, width: 200, height: 300 })
    stubRect(c.links[1]!, { top: 0, left: 30, width: 160, height: 24 })
    c.api().setValue('intro')
    c.api().setValue('install')

    const style = (c.api().getIndicatorProps() as Record<string, unknown>).style as Record<string, string>
    // list 右边缘 200、链接右边缘 190 → 起始缘距离 10（按左边量的话会是 30）
    expect(style).toEqual({ inlineSize: '160px', insetInlineStart: '10px' })
  })
})

describe('anchor 点击', () => {
  it('smooth 关：不拦原生跳转，但激活项当场切过去（不等观察器）', () => {
    const seen: AnchorValueChangeDetails[] = []
    const c = makeAnchor({ onValueChange: d => seen.push(d) })
    const event = c.click(2)
    expect(event.defaultPrevented).toBe(false)
    expect(c.value()).toBe('usage')
    expect(seen).toEqual([{ value: 'usage' }])
    expect(c.state()).toBe('idle')
  })

  it('smooth 开：拦下原生跳转，按 offset 让开吸顶栏的高度滚过去', () => {
    const c = makeAnchor({ smooth: true, offset: 60 })
    stubRect(c.sections[1]!, { top: 400 })
    const event = c.click(1)
    expect(event.defaultPrevented).toBe(true)
    expect(c.value()).toBe('install')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 340, behavior: 'smooth' })
  })

  it('带修饰键的点击交回浏览器：新标签页照常开，也不改激活项', () => {
    const c = makeAnchor({ smooth: true })
    const event = c.click(1, { metaKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(c.value()).toBeNull()
  })

  it('受控 value：点击只发意图，内部不自改', () => {
    const seen: AnchorValueChangeDetails[] = []
    const c = makeAnchor({ value: 'intro', onValueChange: d => seen.push(d) })
    c.click(2)
    expect(c.value()).toBe('intro')
    expect(seen).toEqual([{ value: 'usage' }])

    c.setProps({ value: 'usage' })
    expect(c.value()).toBe('usage')
  })
})

describe('anchor 滚动观察', () => {
  it('滚动结算写回激活项：改的是 DOM 位置，不是谁调了 setValue', async () => {
    const c = makeAnchor()
    await settle()
    expect(c.value()).toBeNull()

    c.scrollTo([-10, 500, 900])
    expect(c.value()).toBe('intro')

    c.scrollTo([-600, -20, 400])
    expect(c.value()).toBe('install')

    // 又滚回顶部：一节都没越过判定线，激活项跟着退回空
    c.scrollTo([120, 700, 1100])
    expect(c.value()).toBeNull()
  })

  it('offset 参与结算：判定线压低后，压在吸顶栏底下的那一节才算当前', async () => {
    const c = makeAnchor({ offset: 80 })
    await settle()
    // install 顶边 140 还在判定线（80）下方，尚未滑到吸顶栏底下
    c.scrollTo([-10, 140, 900])
    expect(c.value()).toBe('intro')
    // 再滚一点，它的顶边越过了判定线
    c.scrollTo([-100, 60, 800])
    expect(c.value()).toBe('install')
  })

  it('作者给了 targets 就以清单为准：没渲染成链接的区块照样参与结算', async () => {
    const c = makeAnchor({ targets: ['intro', 'usage'] })
    await settle()
    // install 被排除在清单外，滚到它头上也不算数
    c.scrollTo([-500, -20, 400])
    expect(c.value()).toBe('intro')
    c.scrollTo([-900, -400, -10])
    expect(c.value()).toBe('usage')
  })

  it('挂载即结算一次：初次进页面就有当前项，不必等用户先滚一下', async () => {
    const c = makeAnchor()
    c.sections.forEach((el, i) => stubRect(el, { top: [-300, -10, 600][i]! }))
    await settle()
    expect(c.value()).toBe('install')
  })

  it('目标区块一个都没渲染出来时闭嘴：作者给的初值不该被抹掉', async () => {
    const c = makeAnchor({ defaultValue: 'usage' })
    for (const el of c.sections) el.remove()
    await settle()
    expect(c.value()).toBe('usage')
    window.dispatchEvent(new Event('scroll'))
    expect(c.value()).toBe('usage')
  })

  it('停机即断开观察：滚动监听不该留在窗口上', async () => {
    const removed = vi.spyOn(window, 'removeEventListener')
    const c = makeAnchor()
    await settle()
    c.stop()
    const types = removed.mock.calls.map(call => call[0])
    expect(types).toContain('scroll')
    expect(types).toContain('resize')
    removed.mockRestore()
  })
})

describe('anchor 平滑滚动期间的锁', () => {
  it('点了就锁住：滚动途中扫过的那几节不许把用户点的那条冲掉', async () => {
    const c = makeAnchor({ smooth: true })
    await settle()
    c.click(2)
    expect(c.state()).toBe('scrolling')
    expect(c.value()).toBe('usage')

    // 途中经过 install，观察器如实上报——这会儿它说的不是用户的意图
    c.scrollTo([-600, -20, 400])
    expect(c.value()).toBe('usage')
  })

  it('滚到目标那一刻解锁，此后观察器重新说了算', async () => {
    const c = makeAnchor({ smooth: true })
    await settle()
    c.click(2)
    c.scrollTo([-900, -400, -10])
    expect(c.state()).toBe('idle')
    expect(c.value()).toBe('usage')

    c.scrollTo([-600, -20, 400])
    expect(c.value()).toBe('install')
  })

  it('永远滚不到也不会卡死：兜底计时器到点就解锁', async () => {
    const c = makeAnchor({ smooth: true })
    await settle()
    c.click(2)
    c.scrollTo([-600, -20, 400])
    expect(c.value()).toBe('usage')

    vi.advanceTimersByTime(1000)
    expect(c.state()).toBe('idle')
    c.scrollTo([-600, -20, 400])
    expect(c.value()).toBe('install')
  })

  it('锁着的时候又点了别处：换目标重滚，兜底计时器跟着重开', async () => {
    const c = makeAnchor({ smooth: true })
    await settle()
    c.click(2)
    vi.advanceTimersByTime(800)
    c.click(0)
    expect(c.value()).toBe('intro')
    // 若计时器没重开，这一下就会解锁
    vi.advanceTimersByTime(300)
    expect(c.state()).toBe('scrolling')
    vi.advanceTimersByTime(700)
    expect(c.state()).toBe('idle')
  })

  it('smooth 关时不上锁：原生跳转是瞬时的，观察器下一拍就该说了算', async () => {
    const c = makeAnchor()
    await settle()
    c.click(2)
    expect(c.state()).toBe('idle')
    c.scrollTo([-600, -20, 400])
    expect(c.value()).toBe('install')
  })
})
