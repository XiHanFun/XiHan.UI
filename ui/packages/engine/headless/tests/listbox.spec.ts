// @vitest-environment jsdom
import type { ListboxApi, ListboxSchema } from '../src/listbox'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectListbox, listboxMachine } from '../src/listbox'

type Props = ListboxSchema['props']

/** 条目声明的唯一事实源：与作者写在部件上的声明等价，绝不从 DOM 回读（那会读到机器自己写的）。 */
const ITEMS = [
  { value: 'apple', text: 'Apple', group: 'common' },
  { value: 'banana', text: 'Banana', group: 'common', disabled: true },
  { value: 'cherry', text: 'Cherry', group: 'common' },
  { value: 'durian', text: 'Durian', group: 'rare' },
] as const

const GROUPS = ['common', 'rare'] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * "按键落到哪个条目上"这类事实必须有活 DOM 才立得住。
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
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  api: () => ListboxApi
  root: HTMLElement
  content: HTMLElement
  item: (value: string) => HTMLElement
  groupEl: (value: string) => HTMLElement
  groupLabel: (value: string) => HTMLElement
  setProps: (next: Partial<Props>) => void
  render: () => void
  value: () => string[]
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(listboxMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const root = doc.createElement('div')
  const label = doc.createElement('span')
  label.textContent = '水果'
  const content = doc.createElement('div')
  root.append(label, content)

  const groupEls = new Map<string, HTMLElement>()
  const groupLabels = new Map<string, HTMLElement>()
  for (const g of GROUPS) {
    const el = doc.createElement('div')
    const gl = doc.createElement('span')
    gl.textContent = g
    el.appendChild(gl)
    content.appendChild(el)
    groupEls.set(g, el)
    groupLabels.set(g, gl)
  }

  const itemEls = new Map<string, HTMLElement>()
  const textEls = new Map<string, HTMLElement>()
  for (const item of ITEMS) {
    const el = doc.createElement('div')
    const text = doc.createElement('span')
    text.textContent = item.text
    el.appendChild(text)
    groupEls.get(item.group)!.appendChild(el)
    itemEls.set(item.value, el)
    textEls.set(item.value, text)
  }
  doc.body.appendChild(root)

  const render = (): void => {
    const api = connectListbox(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    for (const g of GROUPS) {
      spread(groupEls.get(g)!, api.getGroupProps({ value: g }) as Record<string, unknown>)
      spread(groupLabels.get(g)!, api.getGroupLabelProps({ value: g }) as Record<string, unknown>)
    }
    for (const item of ITEMS) {
      const decl = { value: item.value, disabled: 'disabled' in item ? item.disabled : false }
      spread(itemEls.get(item.value)!, api.getItemProps(decl) as Record<string, unknown>)
      spread(textEls.get(item.value)!, api.getItemTextProps(decl) as Record<string, unknown>)
    }
  }

  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectListbox(service, normalizeProps),
    root,
    content,
    item: v => itemEls.get(v)!,
    groupEl: v => groupEls.get(v)!,
    groupLabel: v => groupLabels.get(v)!,
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
    render,
    value: () => service.context.get('value'),
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

function focused(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

function tabStops(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="listbox"]')]
    .filter(el => el.getAttribute('tabindex') === '0')
    .map(el => el.getAttribute('data-part')!)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('listboxMachine 选中集合', () => {
  it('裸串是单选简写，内部一律归一成数组', () => {
    expect(mount({ defaultValue: 'apple' }).value()).toEqual(['apple'])
    expect(mount({ defaultValue: ['apple', 'cherry'], selectionMode: 'multiple' }).value()).toEqual(['apple', 'cherry'])
    expect(mount().value()).toEqual([])
  })

  it('单选：选中即替换，切换退化成选中（点两下不该把列表点空）', () => {
    const h = mount({ defaultValue: 'apple' })
    h.api().select('cherry')
    expect(h.value()).toEqual(['cherry'])
    h.api().toggle('cherry')
    expect(h.value()).toEqual(['cherry'])
  })

  it('复选：切换增删，setValue 去重', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.api().toggle('apple')
    h.api().toggle('cherry')
    expect(h.value()).toEqual(['apple', 'cherry'])
    h.api().toggle('apple')
    expect(h.value()).toEqual(['cherry'])
    h.api().setValue(['durian', 'durian', 'apple'])
    expect(h.value()).toEqual(['durian', 'apple'])
  })

  it('单选下 setValue 截断到一个：公开 API 造不出 UI 造不出的选中集合', () => {
    const h = mount()
    h.api().setValue(['apple', 'cherry'])
    expect(h.value()).toEqual(['apple'])
  })

  it('受控：内部值纹丝不动，回调照发；宿主写回后才生效', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: 'apple', onValueChange })
    h.api().select('cherry')
    expect(h.value()).toEqual(['apple'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['cherry'] })
    h.setProps({ value: 'cherry' })
    expect(h.value()).toEqual(['cherry'])
  })

  it('同一份选中值重复写入不重复通知：数组按元素比，不看引用', () => {
    const onValueChange = vi.fn()
    const h = mount({ selectionMode: 'multiple', defaultValue: ['apple'], onValueChange })
    h.api().setValue(['apple'])
    expect(onValueChange).not.toHaveBeenCalled()
    h.api().setValue(['apple', 'cherry'])
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })
})

describe('connectListbox 属性输出', () => {
  it('content 是 listbox：aria-multiselectable / aria-orientation / 标题关联都显式给出', () => {
    const h = mount()
    expect(h.content.getAttribute('role')).toBe('listbox')
    // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是多选"
    expect(h.content.getAttribute('aria-multiselectable')).toBe('false')
    expect(h.content.getAttribute('aria-orientation')).toBe('vertical')
    expect(h.content.getAttribute('aria-disabled')).toBe('false')
    expect(h.content.getAttribute('aria-labelledby')).toBe(h.root.querySelector('[data-part="label"]')!.id)
  })

  it('aria-multiselectable 随 selectionMode：single 为 false，multiple 与 extended 为 true', () => {
    expect(mount({ selectionMode: 'single' }).content.getAttribute('aria-multiselectable')).toBe('false')
    expect(mount({ selectionMode: 'multiple' }).content.getAttribute('aria-multiselectable')).toBe('true')
    expect(mount({ selectionMode: 'extended' }).content.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('条目：role=option + aria-selected/aria-disabled 显式给，且绝不输出原生 disabled', () => {
    const h = mount({ defaultValue: 'apple' })
    const apple = h.item('apple')
    const banana = h.item('banana')
    expect(apple.getAttribute('role')).toBe('option')
    expect(apple.getAttribute('aria-selected')).toBe('true')
    expect(apple.getAttribute('data-state')).toBe('checked')
    expect(banana.getAttribute('aria-selected')).toBe('false')
    expect(banana.getAttribute('aria-disabled')).toBe('true')
    expect(banana.hasAttribute('disabled')).toBe(false)
    expect(apple.getAttribute('aria-disabled')).toBe('false')
  })

  it('分组：group 的 aria-labelledby 指向本组标题', () => {
    const h = mount()
    expect(h.groupEl('common').getAttribute('role')).toBe('group')
    expect(h.groupEl('common').getAttribute('aria-labelledby')).toBe(h.groupLabel('common').id)
    expect(h.groupEl('rare').getAttribute('aria-labelledby')).toBe(h.groupLabel('rare').id)
    expect(h.groupLabel('common').id).not.toBe(h.groupLabel('rare').id)
  })

  it('整列禁用：条目全部转 aria-disabled，root/content 带禁用标记', () => {
    const h = mount({ disabled: true })
    expect(h.content.getAttribute('aria-disabled')).toBe('true')
    expect(h.root.getAttribute('data-disabled')).toBe('')
    for (const item of ITEMS)
      expect(h.item(item.value).getAttribute('aria-disabled')).toBe('true')
  })
})

describe('roving tabindex', () => {
  it('焦点在列表外：容器兜底占 Tab 位，条目全部退出', () => {
    const h = mount()
    expect(h.content.getAttribute('tabindex')).toBe('0')
    expect(tabStops()).toEqual(['content'])
  })

  it('选中值不在列表里时容器仍兜底：否则整组一个 Tab 停靠点都没有', () => {
    // 判据若写成"锚点为空才兜底"，这里锚点是 ghost（非空）→ 容器让位，
    // 而没有任何条目认领得了 ghost → 零个 Tab 位，键盘再也进不来
    const h = mount({ value: 'ghost' })
    expect(h.content.getAttribute('tabindex')).toBe('0')
    expect(tabStops()).toEqual(['content'])
  })

  it('有选中值时锚点条目认领 Tab 位；焦点进组后容器让位，整组恒只有一个停靠点', () => {
    const h = mount({ defaultValue: 'cherry' })
    expect(h.item('cherry').getAttribute('tabindex')).toBe('0')
    h.content.focus()
    // 焦点落在选中项上，不是首项
    expect(focused()).toBe('cherry')
    expect(h.content.getAttribute('tabindex')).toBe('-1')
    expect(tabStops()).toEqual(['item'])
  })

  it('无选中时焦点进组落首个可停留条目', () => {
    const h = mount()
    h.content.focus()
    expect(focused()).toBe('apple')
  })

  it('选中项禁用时焦点进组退回首个可停留条目', () => {
    const h = mount({ defaultValue: 'banana' })
    h.content.focus()
    expect(focused()).toBe('apple')
  })

  it('焦点离开列表即清锚点，容器重新兜底', () => {
    const h = mount()
    h.content.focus()
    expect(h.content.getAttribute('tabindex')).toBe('-1')
    h.item('apple').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    expect(h.content.getAttribute('tabindex')).toBe('0')
    expect(h.api().focusedValue).toBeNull()
  })

  it('焦点在列表内部挪动不算离场', () => {
    const h = mount()
    h.content.focus()
    h.item('apple').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: h.item('cherry') }))
    expect(h.api().focusedValue).toBe('apple')
  })

  it('持有焦点的条目被移出 DOM：不补报离场就零个 Tab 停靠点', () => {
    // 浏览器不会为"被移除的节点带走了焦点"派 focusout（Chrome 如此），
    // 机器读不到这件事。两个适配器因此都在条目离场时补报 LIST.BLUR ——
    // 这条用例钉的正是"不补报会怎样"，删掉适配器那段代码时它是唯一说得清后果的地方。
    const h = mount()
    h.content.focus()
    h.item('apple').remove()
    h.render()
    expect(h.api().focusedValue).toBe('apple')
    // 锚点指着一个已经不在文档里的条目：没人认领 tabindex=0，容器又判自己"焦点在组内"让了位
    expect(tabStops()).toEqual([])
    // 补报之后容器立刻回到兜底位（适配器发的是同一个 LIST.BLUR，这里借 focusout 走同一条路）
    h.content.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    expect(tabStops()).toEqual(['content'])
  })
})

describe('方向键导航', () => {
  it('跳过禁用条目，跨分组照常走', () => {
    const h = mount()
    h.content.focus()
    expect(focused()).toBe('apple')
    press(h.item('apple'), 'ArrowDown')
    expect(focused()).toBe('cherry')
    // durian 在另一个分组里：集合按 content 归属查，中间隔着 group 不影响
    press(h.item('cherry'), 'ArrowDown')
    expect(focused()).toBe('durian')
  })

  it('禁用条目仍可聚焦，且仍是方向键的起点', () => {
    const h = mount()
    h.item('banana').focus()
    expect(focused()).toBe('banana')
    press(h.item('banana'), 'ArrowDown')
    expect(focused()).toBe('cherry')
  })

  it('尽头回绕，loop=false 时原地不动', () => {
    const h = mount()
    h.content.focus()
    press(h.item('apple'), 'ArrowUp')
    expect(focused()).toBe('durian')
    press(h.item('durian'), 'ArrowDown')
    expect(focused()).toBe('apple')

    const fixed = mount({ loop: false })
    fixed.content.focus()
    press(fixed.item('apple'), 'ArrowUp')
    expect(focused()).toBe('apple')
  })

  it('home / End 到端点', () => {
    const h = mount()
    h.content.focus()
    press(h.item('apple'), 'End')
    expect(focused()).toBe('durian')
    press(h.item('durian'), 'Home')
    expect(focused()).toBe('apple')
  })

  it('方向键只搬焦点，不改选中值', () => {
    const h = mount({ defaultValue: 'apple' })
    h.content.focus()
    press(h.item('apple'), 'ArrowDown')
    expect(focused()).toBe('cherry')
    expect(h.value()).toEqual(['apple'])
    expect(h.item('cherry').getAttribute('aria-selected')).toBe('false')
    expect(h.item('cherry').getAttribute('data-highlighted')).toBe('')
  })

  it('轴外的方向键不归导航管，也就绝不吞掉（页面滚动与读屏要用）', () => {
    const h = mount({ orientation: 'horizontal' })
    h.content.focus()
    const event = press(h.item('apple'), 'ArrowDown')
    expect(event.defaultPrevented).toBe(false)
    expect(focused()).toBe('apple')
    press(h.item('apple'), 'ArrowRight')
    expect(focused()).toBe('cherry')
  })

  it('dir=rtl 只对调水平轴：ArrowLeft 变成下一个', () => {
    const h = mount({ orientation: 'horizontal', dir: 'rtl' })
    h.content.focus()
    press(h.item('apple'), 'ArrowLeft')
    expect(focused()).toBe('cherry')
  })

  it('带 Ctrl 的方向键归浏览器与读屏，列表不接', () => {
    const h = mount()
    h.content.focus()
    const event = press(h.item('apple'), 'End', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(focused()).toBe('apple')
  })
})

describe('确认键与点击', () => {
  it('单选：Space / Enter 选中焦点条目并替换原有选中', () => {
    const h = mount({ defaultValue: 'apple' })
    h.content.focus()
    press(h.item('apple'), 'ArrowDown')
    const event = press(h.item('cherry'), ' ')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['cherry'])
    press(h.item('cherry'), 'ArrowDown')
    press(h.item('durian'), 'Enter')
    expect(h.value()).toEqual(['durian'])
  })

  it('复选：Space 切换而不是替换', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.content.focus()
    press(h.item('apple'), ' ')
    press(h.item('apple'), 'ArrowDown')
    press(h.item('cherry'), ' ')
    expect(h.value()).toEqual(['apple', 'cherry'])
    press(h.item('cherry'), ' ')
    expect(h.value()).toEqual(['apple'])
  })

  it('extended：裸确认替换，Ctrl+Space 只切换这一个', () => {
    const h = mount({ selectionMode: 'extended' })
    h.content.focus()
    press(h.item('apple'), ' ')
    expect(h.value()).toEqual(['apple'])
    press(h.item('apple'), 'ArrowDown')
    press(h.item('cherry'), ' ', { ctrlKey: true })
    expect(h.value()).toEqual(['apple', 'cherry'])
    press(h.item('cherry'), ' ')
    expect(h.value()).toEqual(['cherry'])
  })

  it('焦点停在禁用条目上时确认键不认', () => {
    const h = mount()
    h.item('banana').focus()
    press(h.item('banana'), ' ')
    expect(h.value()).toEqual([])
  })

  it('点击选中；单选替换、复选切换', () => {
    const single = mount()
    click(single.item('apple'))
    click(single.item('cherry'))
    expect(single.value()).toEqual(['cherry'])

    const multi = mount({ selectionMode: 'multiple' })
    click(multi.item('apple'))
    click(multi.item('cherry'))
    expect(multi.value()).toEqual(['apple', 'cherry'])
    click(multi.item('apple'))
    expect(multi.value()).toEqual(['cherry'])
  })

  it('禁用条目点不动', () => {
    const h = mount({ defaultValue: 'apple' })
    click(h.item('banana'))
    expect(h.value()).toEqual(['apple'])
  })

  it('整列禁用：键盘与点击都改不了选中值', () => {
    const h = mount({ defaultValue: 'apple', disabled: true })
    h.item('cherry').focus()
    press(h.item('cherry'), ' ')
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple'])
  })
})

describe('extended 的修饰键扩选', () => {
  it('shift 点击选中整段，往回点即收窄（替换而不是并集）', () => {
    const h = mount({ selectionMode: 'extended' })
    click(h.item('apple'))
    click(h.item('durian'), { shiftKey: true })
    // banana 禁用，不进选中集合
    expect(h.value()).toEqual(['apple', 'cherry', 'durian'])
    click(h.item('cherry'), { shiftKey: true })
    expect(h.value()).toEqual(['apple', 'cherry'])
  })

  it('shift 区间起点由最近一次非区间选中决定，区间连点不会把起点带跑', () => {
    const h = mount({ selectionMode: 'extended' })
    click(h.item('cherry'))
    click(h.item('durian'), { shiftKey: true })
    expect(h.value()).toEqual(['cherry', 'durian'])
    // 起点仍是 cherry：若被区间连选改成 durian，这一下会只剩 durian 一个
    click(h.item('apple'), { shiftKey: true })
    expect(h.value()).toEqual(['apple', 'cherry'])
  })

  it('ctrl 点击加选单个，裸点回到替换', () => {
    const h = mount({ selectionMode: 'extended' })
    click(h.item('apple'))
    click(h.item('cherry'), { ctrlKey: true })
    expect(h.value()).toEqual(['apple', 'cherry'])
    click(h.item('durian'))
    expect(h.value()).toEqual(['durian'])
  })

  it('shift+方向键：焦点移动并切换落点，往回走即把刚扩进来的摘掉', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.content.focus()
    press(h.item('apple'), ' ')
    press(h.item('apple'), 'ArrowDown', { shiftKey: true })
    expect(focused()).toBe('cherry')
    expect(h.value()).toEqual(['apple', 'cherry'])
    press(h.item('cherry'), 'ArrowUp', { shiftKey: true })
    expect(focused()).toBe('apple')
    expect(h.value()).toEqual(['cherry'])
  })

  it('单选下 Shift+方向键只搬焦点', () => {
    const h = mount({ defaultValue: 'apple' })
    h.content.focus()
    press(h.item('apple'), 'ArrowDown', { shiftKey: true })
    expect(focused()).toBe('cherry')
    expect(h.value()).toEqual(['apple'])
  })

  it('ctrl+A 全选可选条目，再按一次取消；单选列表不接这个键', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.content.focus()
    const event = press(h.item('apple'), 'a', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['apple', 'cherry', 'durian'])
    press(h.item('apple'), 'a', { ctrlKey: true })
    expect(h.value()).toEqual([])

    const single = mount()
    single.content.focus()
    const passed = press(single.item('apple'), 'a', { ctrlKey: true })
    expect(passed.defaultPrevented).toBe(false)
    expect(single.value()).toEqual([])
  })

  it('ctrl+A 取消全选时不动禁用条目上的选中', () => {
    const h = mount({ selectionMode: 'multiple', defaultValue: ['banana', 'apple'] })
    h.content.focus()
    press(h.item('apple'), 'a', { ctrlKey: true })
    expect(h.value()).toEqual(['banana', 'apple', 'cherry', 'durian'])
    press(h.item('apple'), 'a', { ctrlKey: true })
    expect(h.value()).toEqual(['banana'])
  })
})

describe('连打检索', () => {
  it('按首字母把焦点移到匹配条目，不改选中值', () => {
    const h = mount({ defaultValue: 'apple' })
    h.content.focus()
    const event = press(h.item('apple'), 'c')
    expect(event.defaultPrevented).toBe(true)
    expect(focused()).toBe('cherry')
    expect(h.value()).toEqual(['apple'])
  })

  it('跳过禁用条目：敲 b 落不到 banana 上', () => {
    const h = mount()
    h.content.focus()
    press(h.item('apple'), 'b')
    expect(focused()).toBe('apple')
  })

  it('缓冲区非空时空格算词中间的字符，不当确认键', () => {
    const h = mount()
    h.content.focus()
    press(h.item('apple'), 'c')
    expect(focused()).toBe('cherry')
    press(h.item('cherry'), ' ')
    // 查询串变成 "c "，匹配不上任何条目：焦点不动、更不该把 cherry 选中
    expect(h.value()).toEqual([])
  })

  it('typeahead 关掉后可打印字符一律放行', () => {
    const h = mount({ typeahead: false })
    h.content.focus()
    const event = press(h.item('apple'), 'c')
    expect(event.defaultPrevented).toBe(false)
    expect(focused()).toBe('apple')
    // 关掉检索后空格恒是确认键
    press(h.item('apple'), ' ')
    expect(h.value()).toEqual(['apple'])
  })

  it('焦点离开列表即丢缓冲：下次进来第一个字母不会被拼进上一轮', () => {
    const h = mount()
    h.content.focus()
    press(h.item('apple'), 'c')
    expect(focused()).toBe('cherry')
    h.item('cherry').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    h.content.focus()
    // 缓冲若没清，这一下的查询串会是 "cd"，谁也匹配不上
    press(h.item('apple'), 'd')
    expect(focused()).toBe('durian')
  })
})
