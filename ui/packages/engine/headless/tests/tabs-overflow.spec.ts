// @vitest-environment jsdom
// 标签带放不下时的「更多」下拉：列出此刻没有整个露在可见区里的标签，选中一项即选中并挪进可见区。
// jsdom 不排版，排布几何（offsetLeft / offsetWidth / clientWidth）逐个打上；补间按减弱动效一步到位。
import type { TabsSchema } from '../src/tabs'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectTabs, tabsMachine, tabsOverflowMenuProps } from '../src/tabs'

type Dict = Record<string, unknown>

const VALUES = ['a', 'b', 'c', 'd', 'e']
const COLLECTION = VALUES.map(value => ({ value, label: `标签 ${value.toUpperCase()}` }))

/** 每枚标签在主轴上占 100，首尾相接；标签带只露得出 250，两端翻页钮各 36。 */
const SPAN = 100
const VIEWPORT = 250
const ARROW = 36

function geometry(el: HTMLElement, values: Partial<Record<'offsetLeft' | 'offsetTop' | 'offsetWidth' | 'offsetHeight' | 'clientWidth' | 'clientHeight', number>>): void {
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(el, key, { configurable: true, value })
}

interface MountOptions {
  viewport?: number
  arrows?: boolean
  /** 标签自己的文字；不给则标签里没有文字，下拉的文字退回 collection 里的 label。 */
  text?: Partial<Record<string, string>>
  /** 标签上写的属性（aria-label、aria-disabled）。 */
  attrs?: Partial<Record<string, Record<string, string>>>
  /** 在 root 里、标签带之后放一颗「更多」钮：主轴上的长度与是否露着。 */
  overflowTrigger?: { size: number, hidden: boolean }
}

function mount(props: Partial<TabsSchema['props']> = {}, options: MountOptions = {}) {
  const onValueChange = vi.fn()
  const runtime = createVanillaRuntime()
  const service = createService(tabsMachine, {
    runtime,
    props: () => ({ collection: COLLECTION, defaultValue: 'a', onValueChange, ...props }) as TabsSchema['props'],
  })
  runtime.start()

  const part = (name: string, tag = 'div'): HTMLElement => {
    const el = document.createElement(tag)
    el.setAttribute('data-scope', 'tabs')
    el.setAttribute('data-part', name)
    return el
  }
  const root = part('root')
  const list = part('list')
  root.append(list)
  const horizontal = (props.orientation ?? 'horizontal') === 'horizontal'
  const viewport = options.viewport ?? VIEWPORT
  geometry(list, horizontal ? { clientWidth: viewport, clientHeight: 36 } : { clientWidth: 120, clientHeight: viewport })

  const prev = part('prev-trigger', 'button')
  const next = part('next-trigger', 'button')
  if (options.arrows !== false) {
    geometry(prev, { offsetWidth: ARROW, offsetHeight: ARROW })
    geometry(next, { offsetWidth: ARROW, offsetHeight: ARROW })
    list.append(prev)
  }
  VALUES.forEach((value, i) => {
    const el = part('trigger', 'button')
    el.setAttribute('data-value', value)
    for (const [k, v] of Object.entries(options.attrs?.[value] ?? {}))
      el.setAttribute(k, v)
    el.textContent = options.text?.[value] ?? ''
    // rtl 横排里 DOM 首项排在最右：位置按倒序给
    const slot = horizontal && props.dir === 'rtl' ? VALUES.length - 1 - i : i
    geometry(el, horizontal
      ? { offsetLeft: slot * SPAN, offsetTop: 0, offsetWidth: SPAN, offsetHeight: 36 }
      : { offsetLeft: 0, offsetTop: slot * SPAN, offsetWidth: 120, offsetHeight: SPAN })
    list.append(el)
  })
  if (options.arrows !== false)
    list.append(next)
  if (options.overflowTrigger) {
    const trigger = part('overflow-trigger', 'button')
    trigger.hidden = options.overflowTrigger.hidden
    geometry(trigger, { offsetWidth: options.overflowTrigger.size, offsetHeight: options.overflowTrigger.size })
    root.append(trigger)
  }
  document.body.append(root)
  service.refs.set('getListEl', () => list)

  return {
    service,
    list,
    onValueChange,
    api: () => connectTabs(service, normalizeProps),
    scroll: () => service.context.get('scroll'),
    scrollMax: () => service.context.get('scrollMax'),
    /** 列在下拉里的标签值，文档序。 */
    listed: () => service.context.get('overflowItems').map(item => item.value),
    /**
     * 让机器量一次标签带（真实宿主由 ResizeObserver / 首帧触发），再等一帧：钮的露面与收起排在下一帧写回。
     */
    measure: async () => {
      window.dispatchEvent(new Event('resize'))
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    },
  }
}

beforeEach(() => {
  document.body.innerHTML = ''
  setMotionOverride('reduce')
})

afterEach(() => {
  setMotionOverride(null)
})

describe('标签页 · 「更多」钮', () => {
  it('放得下：一个不列，钮收着', async () => {
    const t = mount({}, { viewport: 600 })
    await t.measure()
    expect(t.api().overflowItems).toEqual([])
    expect((t.api().getOverflowTriggerProps() as Dict).hidden).toBe(true)
  })

  it('钮在 tablist 之外、自占 Tab 位：不写 tabindex、不对读屏隐藏，接 Action Control icon 档 ghost 面、档位随 size', async () => {
    const t = mount({ size: 'sm' })
    await t.measure()
    const props = t.api().getOverflowTriggerProps() as Dict
    expect(props.type).toBe('button')
    expect(props['aria-label']).toBe('More tabs')
    expect(props.hidden).toBeUndefined()
    expect(props.tabindex).toBeUndefined()
    expect(props.tabIndex).toBeUndefined()
    expect(props['aria-hidden']).toBeUndefined()
    expect(props['data-orientation']).toBe('horizontal')
    expect(props['data-xh-action-control']).toBe('')
    expect(props['data-xh-action-profile']).toBe('icon')
    expect(props['data-xh-action-variant']).toBe('ghost')
    expect(props['data-xh-action-size']).toBe('sm')
  })

  it('可及名由 translations.overflowTrigger 换成本地文案', async () => {
    const t = mount({ translations: { overflowTrigger: '更多标签' } })
    expect((t.api().getOverflowTriggerProps() as Dict)['aria-label']).toBe('更多标签')
  })
})

describe('标签页 · 下拉列出可见区外的标签', () => {
  it('起头：起始侧的翻页钮收着不让位，结束侧让出翻页钮那一截；没整个露出来的都列，半露的也算', async () => {
    const t = mount()
    await t.measure()
    // 可见区 [0, 250 - 36]：a、b 整个露着，c 露了一截
    expect(t.listed()).toEqual(['c', 'd', 'e'])
    expect((t.api().getOverflowTriggerProps() as Dict).hidden).toBeUndefined()
  })

  it('可见区随位移走：翻一页后两端都让出翻页钮，窗口两侧的标签都列出，文档序', async () => {
    const t = mount()
    await t.measure()
    t.service.send({ type: 'SCROLL.NEXT' })
    // 位移 200，可见区 [236, 414]：只有 d 整个露着
    expect(t.scroll()).toBe(VIEWPORT * 0.8)
    expect(t.listed()).toEqual(['a', 'b', 'c', 'e'])
    t.service.send({ type: 'SCROLL.NEXT' })
    // 挪到头：结束侧的钮收起不再让位，可见区 [286, 500]
    expect(t.scroll()).toBe(t.scrollMax())
    expect(t.listed()).toEqual(['a', 'b', 'c'])
  })

  it('没放翻页钮时可见区就是整条标签带', async () => {
    const t = mount({}, { arrows: false })
    await t.measure()
    expect(t.listed()).toEqual(['c', 'd', 'e'])
    t.service.send({ type: 'SCROLL.BY', delta: 100 })
    // 可见区 [100, 350]：b、c 整个露着
    expect(t.listed()).toEqual(['a', 'd', 'e'])
  })

  it('下拉里的文字按读屏取名的先后：aria-label、自己的文字，都没有取 collection 的 label；禁用照实带上', async () => {
    const t = mount({}, {
      attrs: { d: { 'aria-label': '第四个' }, e: { 'aria-disabled': 'true' } },
      text: { c: '  第三个\n  标签 ' },
    })
    await t.measure()
    expect(t.api().overflowItems).toEqual([
      { value: 'c', label: '第三个 标签', disabled: false },
      { value: 'd', label: '第四个', disabled: false },
      { value: 'e', label: '标签 E', disabled: true },
    ])
  })

  it('作者藏起来的标签不在标签带里，也不列', async () => {
    const t = mount()
    geometry(t.list.querySelector<HTMLElement>('[data-value="e"]')!, { offsetWidth: 0, offsetHeight: 0 })
    await t.measure()
    expect(t.listed()).toEqual(['c', 'd'])
  })

  it('外层变宽到放得下：一个不列，钮收起', async () => {
    const t = mount()
    await t.measure()
    expect(t.listed().length).toBeGreaterThan(0)
    geometry(t.list, { clientWidth: 600 })
    await t.measure()
    expect(t.listed()).toEqual([])
    expect((t.api().getOverflowTriggerProps() as Dict).hidden).toBe(true)
  })

  it('rtl 横排：DOM 首项排在最右，起头露着的仍是 a、b', async () => {
    const t = mount({ dir: 'rtl' })
    await t.measure()
    expect(t.listed()).toEqual(['c', 'd', 'e'])
  })

  it('竖排量块轴，钮随主轴投影 data-orientation', async () => {
    const t = mount({ orientation: 'vertical' })
    await t.measure()
    expect(t.listed()).toEqual(['c', 'd', 'e'])
    expect((t.api().getOverflowTriggerProps() as Dict)['data-orientation']).toBe('vertical')
  })
})

describe('标签页 · 「更多」钮的有无只取决于全部标签放不放得下', () => {
  it('钮的露面排到下一帧：跟着位移上限同步重算的那一次只换项、不改钮的有无（钮一露面标签带就变短，不在尺寸观察的回调里改排布）', async () => {
    const t = mount()
    window.dispatchEvent(new Event('resize'))
    expect(t.scrollMax()).toBeGreaterThan(0)
    expect(t.listed()).toEqual([])
    expect((t.api().getOverflowTriggerProps() as Dict).hidden).toBe(true)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    expect(t.listed()).toEqual(['c', 'd', 'e'])
    expect((t.api().getOverflowTriggerProps() as Dict).hidden).toBeUndefined()
  })

  it('钮露着、占走标签带一截时：让回这一截就放得下，判放得下，钮收起', async () => {
    // 五枚标签共 500，标签带此刻只剩 470（钮占走了 40）；让回 40 即放得下
    const t = mount({}, { viewport: 470, overflowTrigger: { size: 40, hidden: false } })
    await t.measure()
    expect(t.scrollMax()).toBe(0)
    expect(t.listed()).toEqual([])
    expect((t.api().getOverflowTriggerProps() as Dict).hidden).toBe(true)
  })

  it('钮收着时同样的标签带长度放不下：判放不下，钮露面', async () => {
    const t = mount({}, { viewport: 470, overflowTrigger: { size: 40, hidden: true } })
    await t.measure()
    expect(t.scrollMax()).toBe(30)
    expect(t.listed().length).toBeGreaterThan(0)
  })

  it('让回钮那一截仍放不下：位移上限按标签带此刻的长度算', async () => {
    const t = mount({}, { viewport: 400, overflowTrigger: { size: 40, hidden: false } })
    await t.measure()
    expect(t.scrollMax()).toBe(100)
  })
})

describe('标签页 · 在下拉里选中', () => {
  it('选中那个标签并把它挪进可见区；它随之不再列在下拉里', async () => {
    const t = mount()
    await t.measure()
    t.service.send({ type: 'OVERFLOW.SELECT', value: 'e' })
    expect(t.api().value).toBe('e')
    expect(t.onValueChange).toHaveBeenCalledExactlyOnceWith({ value: 'e' })
    expect(t.scroll()).toBe(t.scrollMax())
    expect(t.listed()).not.toContain('e')
  })

  it('选中的就是当前标签（被挪到可见区外）：选中不变，照样挪回可见区', async () => {
    const t = mount()
    await t.measure()
    t.service.send({ type: 'SCROLL.NEXT' })
    t.service.send({ type: 'SCROLL.NEXT' })
    expect(t.listed()).toContain('a')
    t.service.send({ type: 'OVERFLOW.SELECT', value: 'a' })
    expect(t.api().value).toBe('a')
    expect(t.onValueChange).not.toHaveBeenCalled()
    expect(t.scroll()).toBe(0)
  })

  it('受控：只发 onValueChange 不改选中，标签仍挪进可见区', async () => {
    const t = mount({ value: 'a' })
    await t.measure()
    t.service.send({ type: 'OVERFLOW.SELECT', value: 'd' })
    expect(t.onValueChange).toHaveBeenCalledExactlyOnceWith({ value: 'd' })
    expect(t.api().value).toBe('a')
    // d 的终点 400 对齐可见区终点（位移 + 250 - 36）
    expect(t.scroll()).toBe(400 - (VIEWPORT - ARROW))
  })

  it('禁用的标签选不中，标签带也不动', async () => {
    const t = mount({}, { attrs: { e: { 'aria-disabled': 'true' } } })
    await t.measure()
    t.service.send({ type: 'OVERFLOW.SELECT', value: 'e' })
    expect(t.api().value).toBe('a')
    expect(t.onValueChange).not.toHaveBeenCalled()
    expect(t.scroll()).toBe(0)
  })
})

describe('标签页 · 「更多」下拉的菜单 props', () => {
  it('条目是可见区外的标签，普通命令项、选完即收，禁用照带；有条目时交回菜单自己开合', async () => {
    const t = mount({}, { attrs: { e: { 'aria-disabled': 'true' } } })
    await t.measure()
    const props = tabsOverflowMenuProps(t.service)
    expect(props.collection).toEqual([
      { value: 'c', label: '标签 C', disabled: false, kind: 'item', separatorBefore: false, closeOnSelect: true },
      { value: 'd', label: '标签 D', disabled: false, kind: 'item', separatorBefore: false, closeOnSelect: true },
      { value: 'e', label: '标签 E', disabled: true, kind: 'item', separatorBefore: false, closeOnSelect: true },
    ])
    expect(props.open).toBeUndefined()
    expect(props.checkboxValue).toEqual([])
    expect(props.placement).toBe('bottom-end')
  })

  it('一项都没有时菜单受控关着', async () => {
    const t = mount({}, { viewport: 600 })
    await t.measure()
    expect(tabsOverflowMenuProps(t.service).open).toBe(false)
  })

  it('落位随主轴与方向：横排贴在钮下方与结束缘对齐，竖排贴在钮的侧面、rtl 换到左侧；尺寸档与方向随标签页', () => {
    expect(tabsOverflowMenuProps(mount({ orientation: 'vertical' }).service).placement).toBe('right-end')
    const rtl = tabsOverflowMenuProps(mount({ orientation: 'vertical', dir: 'rtl', size: 'lg' }).service)
    expect(rtl.placement).toBe('left-end')
    expect(rtl.dir).toBe('rtl')
    expect(rtl.size).toBe('lg')
  })

  it('菜单的 onSelect 即「更多」下拉里选中：选中那个标签', async () => {
    const t = mount()
    await t.measure()
    tabsOverflowMenuProps(t.service).onSelect?.({ value: 'd' })
    expect(t.api().value).toBe('d')
  })
})
