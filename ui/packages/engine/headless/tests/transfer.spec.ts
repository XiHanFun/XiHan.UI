// @vitest-environment jsdom
import type { TransferApi, TransferItem, TransferSchema, TransferSide } from '../src/transfer'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectTransfer,
  transferCheckState,
  transferIsCheckable,
  transferMachine,
  transferMove,
  transferOperableValues,
  transferSideOf,
  transferToggleAll,
  transferToggleValue,
  transferVisibleItems,
} from '../src/transfer'

type Props = TransferSchema['props']

/**
 * 四个条目：banana 禁用（导航跳过它、勾不动、也搬不动，但它仍可聚焦、仍是方向键起点）。
 * 标签用拉丁字母，搜索按子串匹配得上；只有 Banana 含 "ban"，
 * 用它筛出来的正好是一个禁用项——"可操作集合为空"那条路才走得到。
 */
const ITEMS: TransferItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * 「按键落到哪个节点上」「焦点搬完去了哪儿」这类事实必须有活 DOM 才立得住。
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
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (key === 'value' && el instanceof HTMLInputElement) {
      el.value = String(raw)
      continue
    }
    el.setAttribute(key, raw === true ? '' : String(raw))
  }
}

interface PanelEls {
  panel: HTMLElement
  title: HTMLElement
  count: HTMLElement
  selectAll: HTMLButtonElement
  search: HTMLInputElement
  list: HTMLElement
  collection: Map<string, { item: HTMLElement, text: HTMLElement, checkbox: HTMLElement }>
}

interface Harness {
  api: () => TransferApi
  root: HTMLElement
  side: (side: TransferSide) => PanelEls
  item: (side: TransferSide, value: string) => HTMLElement
  toTarget: HTMLButtonElement
  toSource: HTMLButtonElement
  setProps: (next: Partial<Props>) => void
  value: () => string[]
  selected: () => string[]
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { collection: ITEMS, ...initial }
  // 作者标记镜像的是机器手上的那份 items：两侧都挂全集，不属于本侧的那一份由 connect 隐去
  const collection = props.collection!
  const runtime = createVanillaRuntime()
  const service = createService(transferMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const root = doc.createElement('div')

  const build = (): PanelEls => {
    const panel = doc.createElement('div')
    const header = doc.createElement('div')
    const title = doc.createElement('span')
    const count = doc.createElement('span')
    const selectAll = doc.createElement('button')
    const search = doc.createElement('input')
    const list = doc.createElement('div')
    header.append(title, count, selectAll)
    panel.append(header, search, list)
    const map = new Map<string, { item: HTMLElement, text: HTMLElement, checkbox: HTMLElement }>()
    for (const spec of collection) {
      const item = doc.createElement('div')
      const checkbox = doc.createElement('span')
      const text = doc.createElement('span')
      text.textContent = spec.label
      item.append(checkbox, text)
      list.appendChild(item)
      map.set(spec.value, { item, text, checkbox })
    }
    return { panel, title, count, selectAll, search, list, collection: map }
  }

  const panels: Record<TransferSide, PanelEls> = { source: build(), target: build() }
  const toTarget = doc.createElement('button')
  const toSource = doc.createElement('button')
  root.append(panels.source.panel, toTarget, toSource, panels.target.panel)
  // header 是纯结构节点，这里不额外标 part：套件那侧才需要它，本文件只验行为
  doc.body.appendChild(root)

  const render = (): void => {
    const api = connectTransfer(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(toTarget, api.getToTargetTriggerProps() as Record<string, unknown>)
    spread(toSource, api.getToSourceTriggerProps() as Record<string, unknown>)
    for (const side of ['source', 'target'] as const) {
      const p = panels[side]
      spread(p.panel, api.getPanelProps({ side }) as Record<string, unknown>)
      spread(p.title, api.getPanelTitleProps({ side }) as Record<string, unknown>)
      spread(p.count, api.getPanelCountProps({ side }) as Record<string, unknown>)
      spread(p.selectAll, api.getSelectAllTriggerProps({ side }) as Record<string, unknown>)
      spread(p.search, api.getSearchProps({ side }) as Record<string, unknown>)
      spread(p.list, api.getListProps({ side }) as Record<string, unknown>)
      for (const [value, els] of p.collection) {
        const item = { value, side }
        spread(els.item, api.getItemProps(item) as Record<string, unknown>)
        spread(els.text, api.getItemTextProps(item) as Record<string, unknown>)
        spread(els.checkbox, api.getItemCheckboxProps(item) as Record<string, unknown>)
      }
    }
  }

  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectTransfer(service, normalizeProps),
    root,
    side: s => panels[s],
    item: (s, v) => panels[s].collection.get(v)!.item,
    toTarget,
    toSource,
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
    value: () => service.context.get('value'),
    selected: () => service.context.get('selected'),
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement, init: MouseEventInit = {}): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
}

function typeIn(el: HTMLInputElement, text: string): void {
  el.value = text
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

/** 当下持有焦点的元素；按键一律从它发出（键盘处理器在 list 上收口，靠冒泡）。 */
function active(): HTMLElement {
  return (document.activeElement as HTMLElement | null) ?? document.body
}

function focusedValue(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

/** 某一侧当下显形的条目值，按文档序。 */
function shownOn(h: Harness, side: TransferSide): string[] {
  return [...h.side(side).list.querySelectorAll<HTMLElement>('[data-part="item"]')]
    .filter(el => !el.hasAttribute('hidden'))
    .map(el => el.getAttribute('data-value')!)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('两侧集合的推导', () => {
  it('不在 value 里的一律算左侧', () => {
    expect(transferSideOf([], 'apple')).toBe('source')
    expect(transferSideOf(['apple'], 'apple')).toBe('target')
    expect(transferSideOf(['apple'], 'cherry')).toBe('source')
  })

  it('分侧之后顺序恒为 collection 原序，与 value 里的排列无关', () => {
    // value 故意倒着写：右侧仍按 collection 原序出，两个适配器才不会各排各的
    const target = transferVisibleItems(ITEMS, ['durian', 'apple'], 'target')
    expect(target.map(i => i.value)).toEqual(['apple', 'durian'])
    expect(transferVisibleItems(ITEMS, ['durian', 'apple'], 'source').map(i => i.value))
      .toEqual(['banana', 'cherry'])
  })

  it('搜索在分侧之后再套一层，缺省按标签大小写不敏感包含', () => {
    expect(transferVisibleItems(ITEMS, [], 'source', 'BAN').map(i => i.value)).toEqual(['banana'])
    expect(transferVisibleItems(ITEMS, [], 'source', 'r').map(i => i.value)).toEqual(['cherry', 'durian'])
    // 纯空白按"没搜"处理：敲一个空格不该把整份列表清空
    expect(transferVisibleItems(ITEMS, [], 'source', '   ')).toHaveLength(4)
  })

  it('自定义 filter 接管匹配规则，且拿到的是 trim 过的非空串', () => {
    const filter = vi.fn((item: TransferItem, q: string) => item.value.startsWith(q))
    expect(transferVisibleItems(ITEMS, [], 'source', '  ch  ', filter).map(i => i.value)).toEqual(['cherry'])
    expect(filter.mock.calls.every(([, q]) => q === 'ch')).toBe(true)
    // 空搜索根本不调谓词
    filter.mockClear()
    transferVisibleItems(ITEMS, [], 'source', '', filter)
    expect(filter).not.toHaveBeenCalled()
  })

  it('可操作 = 可见且未禁用', () => {
    expect(transferOperableValues(transferVisibleItems(ITEMS, [], 'source')))
      .toEqual(['apple', 'cherry', 'durian'])
    // 搜索把可操作的全筛掉、只剩一个禁用项：这一侧此刻一件事都做不了
    expect(transferOperableValues(transferVisibleItems(ITEMS, [], 'source', 'ban'))).toEqual([])
  })
})

describe('三态推导', () => {
  const operable = ['apple', 'cherry', 'durian']

  it('全选 / 半选 / 空各归各位', () => {
    expect(transferCheckState(operable, [])).toBe('none')
    expect(transferCheckState(operable, ['cherry'])).toBe('some')
    expect(transferCheckState(operable, ['apple', 'cherry', 'durian'])).toBe('all')
  })

  it('勾中的禁用项不算进来：它不在可操作集合里', () => {
    expect(transferCheckState(operable, ['banana'])).toBe('none')
    expect(transferCheckState(operable, ['banana', 'apple', 'cherry', 'durian'])).toBe('all')
  })

  it('可操作集合为空时恒为 none，不硬凑一个 all', () => {
    expect(transferCheckState([], [])).toBe('none')
    expect(transferCheckState([], ['banana'])).toBe('none')
  })
})

describe('全选与勾选切换', () => {
  it('没全勾就补齐，已全勾就一并取消', () => {
    expect(transferToggleAll(['a', 'b'], [])).toEqual(['a', 'b'])
    expect(transferToggleAll(['a', 'b'], ['a'])).toEqual(['a', 'b'])
    expect(transferToggleAll(['a', 'b'], ['a', 'b'])).toEqual([])
  })

  it('只动这批可操作值：够不着的勾选原样留着', () => {
    // x 是被搜索藏起来（或禁用）的勾选，全选与取消全选都不该碰它
    expect(transferToggleAll(['a', 'b'], ['x', 'a', 'b'])).toEqual(['x'])
    expect(transferToggleAll(['a', 'b'], ['x'])).toEqual(['x', 'a', 'b'])
    expect(transferToggleAll([], ['x'])).toEqual(['x'])
  })

  it('翻转单个值按点击先后追加', () => {
    expect(transferToggleValue([], 'a')).toEqual(['a'])
    expect(transferToggleValue(['b'], 'a')).toEqual(['b', 'a'])
    expect(transferToggleValue(['b', 'a'], 'b')).toEqual(['a'])
  })
})

describe('搬运后的集合与勾选集', () => {
  it('往右搬：进 value，并从勾选集合里退出', () => {
    expect(transferMove({ value: [], selected: ['apple', 'cherry'], moving: ['apple'], to: 'target' }))
      .toEqual({ value: ['apple'], selected: ['cherry'] })
  })

  it('往左搬：退出 value，勾选同样清掉', () => {
    expect(transferMove({ value: ['apple', 'cherry'], selected: ['apple'], moving: ['apple'], to: 'source' }))
      .toEqual({ value: ['cherry'], selected: [] })
  })

  it('已经在目的地的值不会重复进集合', () => {
    expect(transferMove({ value: ['apple'], selected: [], moving: ['apple', 'apple', 'cherry'], to: 'target' }).value)
      .toEqual(['apple', 'cherry'])
  })

  it('没勾中任何东西时是恒等变换', () => {
    const before = { value: ['apple'], selected: ['cherry'] }
    expect(transferMove({ ...before, moving: [], to: 'target' })).toEqual(before)
  })

  it('oneWay 把往回搬整个封死，往右照常', () => {
    const state = { value: ['apple', 'cherry'], selected: ['apple'] }
    expect(transferMove({ ...state, moving: ['apple'], to: 'source', oneWay: true }))
      .toEqual({ value: ['apple', 'cherry'], selected: ['apple'] })
    expect(transferMove({ value: [], selected: ['apple'], moving: ['apple'], to: 'target', oneWay: true }))
      .toEqual({ value: ['apple'], selected: [] })
  })

  it('oneWay 下右侧不接受勾选，左侧照常', () => {
    expect(transferIsCheckable('source', true)).toBe(true)
    expect(transferIsCheckable('target', true)).toBe(false)
    expect(transferIsCheckable('target', false)).toBe(true)
  })
})

describe('连接层：初始形态', () => {
  it('两侧各挂全集，不属于本侧的那一份带 hidden', () => {
    const h = mount({ defaultValue: ['cherry'] })
    expect(shownOn(h, 'source')).toEqual(['apple', 'banana', 'durian'])
    expect(shownOn(h, 'target')).toEqual(['cherry'])
    // 同一个 value 的两个节点：归属那一侧显形，另一侧隐去但不卸载
    expect(h.item('target', 'cherry').hasAttribute('hidden')).toBe(false)
    expect(h.item('source', 'cherry').hasAttribute('hidden')).toBe(true)
    expect(h.item('source', 'cherry').isConnected).toBe(true)
  })

  it('list 是 listbox，条目 role=option 且勾选/禁用两态都显式给出', () => {
    const h = mount()
    const list = h.side('source').list
    expect(list.getAttribute('role')).toBe('listbox')
    expect(list.getAttribute('aria-multiselectable')).toBe('true')
    expect(list.getAttribute('aria-disabled')).toBe('false')
    expect(list.getAttribute('aria-labelledby')).toBe(h.side('source').title.id)
    const apple = h.item('source', 'apple')
    expect(apple.getAttribute('role')).toBe('option')
    expect(apple.getAttribute('aria-selected')).toBe('false')
    expect(apple.getAttribute('aria-disabled')).toBe('false')
    // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
    expect(apple.hasAttribute('disabled')).toBe(false)
    expect(h.item('source', 'banana').getAttribute('aria-disabled')).toBe('true')
    expect(h.item('source', 'banana').hasAttribute('disabled')).toBe(false)
  })

  it('计数只出数字：可见数与勾中数各一个属性', () => {
    const h = mount({ defaultValue: ['cherry'], defaultSelected: ['apple'] })
    expect(h.side('source').count.getAttribute('data-count')).toBe('3')
    expect(h.side('source').count.getAttribute('data-checked-count')).toBe('1')
    expect(h.side('target').count.getAttribute('data-count')).toBe('1')
    expect(h.side('target').count.getAttribute('data-checked-count')).toBe('0')
  })

  it('没勾中任何东西时两个搬运按钮都是原生禁用', () => {
    const h = mount({ defaultValue: ['cherry'] })
    expect(h.toTarget.disabled).toBe(true)
    expect(h.toSource.disabled).toBe(true)
    expect(h.toTarget.getAttribute('type')).toBe('button')
    expect(h.toSource.getAttribute('type')).toBe('button')
  })

  it('搜索框默认隐去，searchable 打开才显形', () => {
    expect(mount().side('source').search.hasAttribute('hidden')).toBe(true)
    const h = mount({ searchable: true })
    expect(h.side('source').search.hasAttribute('hidden')).toBe(false)
    expect(h.side('source').search.getAttribute('aria-controls')).toBe(h.side('source').list.id)
  })
})

describe('连接层：勾选与搬运', () => {
  it('点条目切换勾选，按钮随之解禁；搬完 value 变、勾选清空、按钮回到禁用', () => {
    const onValueChange = vi.fn()
    const onSelectedChange = vi.fn()
    const h = mount({ onValueChange, onSelectedChange })

    click(h.item('source', 'apple'))
    expect(h.selected()).toEqual(['apple'])
    expect(h.item('source', 'apple').getAttribute('aria-selected')).toBe('true')
    expect(h.toTarget.disabled).toBe(false)
    expect(onSelectedChange).toHaveBeenLastCalledWith({ selected: ['apple'] })

    click(h.toTarget)
    expect(h.value()).toEqual(['apple'])
    expect(h.selected()).toEqual([])
    expect(shownOn(h, 'source')).toEqual(['banana', 'cherry', 'durian'])
    expect(shownOn(h, 'target')).toEqual(['apple'])
    expect(h.toTarget.disabled).toBe(true)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['apple'] })
  })

  it('禁用条目勾不动：点它、以及直接送事件都改不了勾选集合', () => {
    const h = mount()
    click(h.item('source', 'banana'))
    expect(h.selected()).toEqual([])
    // 程序化入口同样过不去：守卫落在动作里，不是只落在 DOM 上
    h.api().toggle('banana')
    expect(h.selected()).toEqual([])
  })

  it('隐去的那一份点不动：它不属于本侧', () => {
    const h = mount({ defaultValue: ['cherry'] })
    click(h.item('source', 'cherry'))
    expect(h.selected()).toEqual([])
    click(h.item('target', 'cherry'))
    expect(h.selected()).toEqual(['cherry'])
  })

  it('往回搬：右侧勾中的回到左侧', () => {
    const h = mount({ defaultValue: ['apple', 'cherry'] })
    click(h.item('target', 'cherry'))
    expect(h.toSource.disabled).toBe(false)
    click(h.toSource)
    expect(h.value()).toEqual(['apple'])
    expect(h.selected()).toEqual([])
    expect(shownOn(h, 'source')).toEqual(['banana', 'cherry', 'durian'])
  })

  it('搬运只认可见的：被搜索藏起来的勾选原地不动', () => {
    const h = mount({ searchable: true })
    click(h.item('source', 'apple'))
    click(h.item('source', 'cherry'))
    typeIn(h.side('source').search, 'ch')
    // apple 被筛掉了，勾还在但不参与这一次搬运
    expect(h.selected()).toEqual(['apple', 'cherry'])
    click(h.toTarget)
    expect(h.value()).toEqual(['cherry'])
    expect(h.selected()).toEqual(['apple'])
  })
})

describe('连接层：全选格三态', () => {
  it('空 → 半选 → 全选，半选输出 aria-checked=mixed', () => {
    const h = mount()
    const trigger = h.side('source').selectAll
    expect(trigger.getAttribute('aria-checked')).toBe('false')
    expect(trigger.getAttribute('data-state')).toBe('none')

    click(h.item('source', 'apple'))
    expect(trigger.getAttribute('aria-checked')).toBe('mixed')
    expect(trigger.getAttribute('data-state')).toBe('some')

    click(h.item('source', 'cherry'))
    click(h.item('source', 'durian'))
    expect(trigger.getAttribute('aria-checked')).toBe('true')
    expect(trigger.getAttribute('data-state')).toBe('all')
  })

  it('点全选格勾中全部可操作条目（禁用项不进），再点一次取消', () => {
    const h = mount()
    click(h.side('source').selectAll)
    expect(h.selected()).toEqual(['apple', 'cherry', 'durian'])
    click(h.side('source').selectAll)
    expect(h.selected()).toEqual([])
  })

  it('全选只动本侧：另一侧的勾选纹丝不动', () => {
    const h = mount({ defaultValue: ['cherry'], defaultSelected: ['cherry'] })
    click(h.side('source').selectAll)
    expect(h.selected()).toEqual(['cherry', 'apple', 'durian'])
    expect(h.side('target').selectAll.getAttribute('aria-checked')).toBe('true')
  })

  it('本侧一个可操作条目都没有时全选格是原生禁用', () => {
    const h = mount({ searchable: true })
    typeIn(h.side('source').search, 'ban')
    // 只剩下禁用的 banana
    expect(shownOn(h, 'source')).toEqual(['banana'])
    expect(h.side('source').selectAll.disabled).toBe(true)
    // 禁用的表单控件上 el.click() 会被激活行为短路，直接派事件才验得到守卫
    h.side('source').selectAll.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(h.selected()).toEqual([])
  })
})

describe('连接层：roving tabindex 与焦点', () => {
  it('每侧只有一个 Tab 停靠点，焦点进来后容器让位', () => {
    const h = mount()
    const list = h.side('source').list
    expect(list.getAttribute('tabindex')).toBe('0')
    list.focus()
    expect(focusedValue()).toBe('apple')
    expect(list.getAttribute('tabindex')).toBe('-1')
    expect(h.item('source', 'apple').getAttribute('tabindex')).toBe('0')
    // 另一侧不受影响，仍由容器兜底
    expect(h.side('target').list.getAttribute('tabindex')).toBe('0')
  })

  it('焦点进入落在勾中项上，不是落在首项', () => {
    const h = mount({ defaultSelected: ['cherry'] })
    expect(h.item('source', 'cherry').getAttribute('tabindex')).toBe('0')
    h.side('source').list.focus()
    expect(focusedValue()).toBe('cherry')
  })

  it('方向键跳过禁用项、尽头回绕，且一路不改勾选', () => {
    const h = mount()
    h.side('source').list.focus()
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('cherry')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('durian')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('apple')
    press(active(), 'End')
    expect(focusedValue()).toBe('durian')
    press(active(), 'Home')
    expect(focusedValue()).toBe('apple')
    expect(h.selected()).toEqual([])
  })

  it('方向键不跨侧：左栏走到尽头也不会跑到右栏去', () => {
    const h = mount({ defaultValue: ['cherry', 'durian'] })
    h.side('source').list.focus()
    expect(focusedValue()).toBe('apple')
    // 左栏此刻只有 apple 与禁用的 banana
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('apple')
    expect(h.side('source').list.contains(active())).toBe(true)
  })

  it('space 切换焦点条目的勾选；禁用条目上按了也不认', () => {
    const h = mount()
    h.side('source').list.focus()
    press(active(), ' ')
    expect(h.selected()).toEqual(['apple'])
    press(active(), ' ')
    expect(h.selected()).toEqual([])
    h.item('source', 'banana').focus()
    press(active(), 'Enter')
    expect(h.selected()).toEqual([])
  })

  it('shift+方向键扩选：移动焦点并切换落点，往回走即摘掉', () => {
    const h = mount({ defaultSelected: ['apple'] })
    h.side('source').list.focus()
    expect(focusedValue()).toBe('apple')
    press(active(), 'ArrowDown', { shiftKey: true })
    expect(focusedValue()).toBe('cherry')
    expect(h.selected()).toEqual(['apple', 'cherry'])
    press(active(), 'ArrowUp', { shiftKey: true })
    expect(focusedValue()).toBe('apple')
    expect(h.selected()).toEqual(['cherry'])
  })

  it('ctrl+A 全选本侧可操作条目，再按一次取消', () => {
    const h = mount()
    h.side('source').list.focus()
    press(active(), 'a', { ctrlKey: true })
    expect(h.selected()).toEqual(['apple', 'cherry', 'durian'])
    press(active(), 'a', { ctrlKey: true })
    expect(h.selected()).toEqual([])
  })

  it('持有焦点的条目被搬走后锚点自动作废，这一侧退回容器兜底', () => {
    const h = mount()
    h.side('source').list.focus()
    press(active(), ' ')
    expect(h.selected()).toEqual(['apple'])
    // 直接送事件搬运：不经触发节点，焦点不被安排，锚点得靠投影自己作废
    h.api().move('target')
    expect(h.value()).toEqual(['apple'])
    // apple 在左侧已经隐去，它不能再认领 tabindex=0，否则这一侧一个停靠点都没有
    expect(h.item('source', 'apple').getAttribute('tabindex')).toBe('-1')
    expect(h.side('source').list.getAttribute('tabindex')).toBe('0')
  })

  it('搬运按钮持有焦点时，搬完焦点落到目的地那一侧的列表上', () => {
    const h = mount()
    click(h.item('source', 'apple'))
    h.toTarget.focus()
    expect(active()).toBe(h.toTarget)
    click(h.toTarget)
    // 按钮此刻已变禁用、不可聚焦；焦点必须有去处，否则键盘用户当场掉回 body
    expect(h.toTarget.disabled).toBe(true)
    expect(h.side('target').list.contains(active())).toBe(true)
  })

  it('按钮没持有焦点时不抢焦点：判据是"本节点当下正持有焦点"', () => {
    const h = mount()
    click(h.item('source', 'apple'))
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    click(h.toTarget)
    expect(h.value()).toEqual(['apple'])
    expect(active()).toBe(outside)
  })
})

describe('连接层：列表内的横向搬运（dir 的用处）', () => {
  it('arrowRight 把本侧勾中的搬到右边，焦点落到右栏列表内', () => {
    const h = mount()
    h.side('source').list.focus()
    press(active(), ' ')
    press(active(), 'ArrowRight')
    expect(h.value()).toEqual(['apple'])
    expect(h.side('target').list.contains(active())).toBe(true)
  })

  it('方向指向本侧、或此刻搬不动时，这个键放行给页面', () => {
    const h = mount()
    h.side('source').list.focus()
    // 一个都没勾：搬不动，键不该被吞
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(false)
    press(active(), ' ')
    // 左栏按"往左"：本侧就是目的地，无事可做
    expect(press(active(), 'ArrowLeft').defaultPrevented).toBe(false)
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(true)
  })

  it('dir=rtl 时左右语义对调', () => {
    const h = mount({ dir: 'rtl' })
    h.side('source').list.focus()
    press(active(), ' ')
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(false)
    press(active(), 'ArrowLeft')
    expect(h.value()).toEqual(['apple'])
  })
})

describe('连接层：oneWay', () => {
  it('右侧不接受勾选，往回搬那条路恒禁用，复选格也不在场', () => {
    const h = mount({ oneWay: true, defaultValue: ['cherry'] })
    expect(h.toSource.disabled).toBe(true)
    expect(h.side('target').list.getAttribute('aria-multiselectable')).toBe('false')
    expect(h.side('target').selectAll.disabled).toBe(true)
    expect(h.side('target').collection.get('cherry')!.checkbox.hasAttribute('hidden')).toBe(true)
    expect(h.side('source').collection.get('apple')!.checkbox.hasAttribute('hidden')).toBe(false)

    click(h.item('target', 'cherry'))
    expect(h.selected()).toEqual([])
    // 程序化入口同样封死
    h.api().toggle('cherry')
    expect(h.selected()).toEqual([])
    h.api().move('source')
    expect(h.value()).toEqual(['cherry'])
  })

  it('往右照常', () => {
    const h = mount({ oneWay: true })
    click(h.item('source', 'apple'))
    expect(h.toTarget.disabled).toBe(false)
    click(h.toTarget)
    expect(h.value()).toEqual(['apple'])
  })
})

describe('连接层：搜索', () => {
  it('输入即过滤本侧，另一侧不受影响', () => {
    const h = mount({ searchable: true, defaultValue: ['cherry', 'durian'] })
    typeIn(h.side('source').search, 'app')
    expect(shownOn(h, 'source')).toEqual(['apple'])
    expect(shownOn(h, 'target')).toEqual(['cherry', 'durian'])
    typeIn(h.side('target').search, 'dur')
    expect(shownOn(h, 'target')).toEqual(['durian'])
  })

  it('关掉 searchable 时残留的搜索串一律按空处理', () => {
    const h = mount({ searchable: true })
    typeIn(h.side('source').search, 'app')
    expect(shownOn(h, 'source')).toEqual(['apple'])
    h.setProps({ searchable: false })
    expect(shownOn(h, 'source')).toEqual(['apple', 'banana', 'cherry', 'durian'])
    expect(h.side('source').search.hasAttribute('hidden')).toBe(true)
  })

  it('被藏起来的勾选不对外声称自己勾着，搜索清空后原封不动地回来', () => {
    const h = mount({ searchable: true })
    click(h.item('source', 'apple'))
    typeIn(h.side('source').search, 'ch')
    // 勾还在集合里，但节点已隐去：一个看不见的节点声称"已选中"只会骗读屏
    expect(h.selected()).toEqual(['apple'])
    expect(h.item('source', 'apple').getAttribute('aria-selected')).toBe('false')
    expect(h.side('source').selectAll.getAttribute('aria-checked')).toBe('false')
    typeIn(h.side('source').search, '')
    expect(h.item('source', 'apple').getAttribute('aria-selected')).toBe('true')
    expect(h.side('source').selectAll.getAttribute('aria-checked')).toBe('mixed')
  })

  it('被搜索藏起来的条目不再是导航落点', () => {
    const h = mount({ searchable: true })
    h.side('source').list.focus()
    expect(focusedValue()).toBe('apple')
    typeIn(h.side('source').search, 'r')
    // apple 隐去了：锚点作废，容器重新兜底
    expect(h.item('source', 'apple').getAttribute('tabindex')).toBe('-1')
    expect(h.side('source').list.getAttribute('tabindex')).toBe('0')
    // 焦点此刻还挂在已隐去的 apple 上；先真的离场，再从列表外重新进来
    active().blur()
    h.side('source').list.focus()
    expect(focusedValue()).toBe('cherry')
  })
})

describe('连接层：整体禁用与受控', () => {
  it('整体禁用：三个按钮都是原生禁用，条目转 aria-disabled 且勾不动', () => {
    const h = mount({ disabled: true, defaultSelected: ['apple'], defaultValue: ['cherry'] })
    expect(h.toTarget.disabled).toBe(true)
    expect(h.toSource.disabled).toBe(true)
    expect(h.side('source').selectAll.disabled).toBe(true)
    expect(h.side('source').search.disabled).toBe(true)
    expect(h.side('source').list.getAttribute('aria-disabled')).toBe('true')
    expect(h.item('source', 'durian').getAttribute('aria-disabled')).toBe('true')
    click(h.item('source', 'durian'))
    expect(h.selected()).toEqual(['apple'])
    // 直接派事件绕过原生禁用的短路，验的是连接层与动作里的守卫
    h.toTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(h.value()).toEqual(['cherry'])
  })

  it('受控 value：宿主不写回则两侧纹丝不动，回调照发', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: ['cherry'], onValueChange })
    click(h.item('source', 'apple'))
    click(h.toTarget)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['cherry', 'apple'] })
    expect(shownOn(h, 'target')).toEqual(['cherry'])
    h.setProps({ value: ['cherry', 'apple'] })
    expect(shownOn(h, 'target')).toEqual(['apple', 'cherry'])
  })

  it('受控 selected：同样只发意图', () => {
    const onSelectedChange = vi.fn()
    const h = mount({ selected: [], onSelectedChange })
    click(h.item('source', 'apple'))
    expect(onSelectedChange).toHaveBeenLastCalledWith({ selected: ['apple'] })
    expect(h.item('source', 'apple').getAttribute('aria-selected')).toBe('false')
  })
})
