// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { SelectApi, SelectSchema } from '../src/select'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectSelect, selectMachine } from '../src/select'

type Props = SelectSchema['props']

/** 条目的唯一事实源：与作者写在部件上的声明等价，绝不从 DOM 回读。 */
const ITEMS = [
  { value: 'apple', text: 'Apple' },
  { value: 'banana', text: 'Banana' },
  { value: 'cherry', text: 'Cherry' },
] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'required', 'multiple'])

/** 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle）。 */
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
    if (key === 'style')
      continue
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (BOOLEAN_ATTRS.has(key)) {
      el.toggleAttribute(key, Boolean(raw))
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  api: () => SelectApi
  root: HTMLElement
  form: HTMLFormElement | null
  trigger: HTMLButtonElement
  clear: HTMLButtonElement
  indicator: HTMLElement
  valueTextEl: HTMLElement
  content: HTMLElement
  list: HTMLElement
  footer: HTMLElement
  hiddenSelect: HTMLSelectElement
  item: (value: string) => HTMLElement
  setProps: (next: Partial<Props>) => void
  state: () => string
  value: () => string[]
  valueText: () => string[]
  highlighted: () => string | null
}

interface MountOptions {
  /** 这些条目每帧自报禁用，等价于作者写在条目部件上的 disabled 声明。 */
  disabledItems?: readonly string[]
  /** 把 root 包进一个 form，用于走原生提交出口。 */
  inForm?: boolean
}

const runtimes: VanillaRuntime[] = []

function mount(initial: Partial<Props> = {}, options: MountOptions = {}): Harness {
  const doc = document
  const disabledItems = new Set(options.disabledItems ?? [])
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  // props 挂在 signal 上：受控回写靠 watch 里的 track，改普通对象会被静默吞掉
  const props = runtime.signal<Partial<Props>>({ ...initial })

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const hiddenSelect = doc.createElement('select')
  const label = doc.createElement('label')
  label.textContent = '水果'
  const trigger = doc.createElement('button')
  const valueTextEl = doc.createElement('span')
  const indicator = doc.createElement('span')
  trigger.append(valueTextEl, indicator)
  // 清空钮是 trigger 的兄弟（按钮不能套按钮）
  const clear = doc.createElement('button')
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  // list 是列表框本体，条目住在它里面；footer 是它的兄弟，两个适配器铺的都是这个形状
  const list = doc.createElement('div')
  const footer = doc.createElement('div')
  content.append(list, footer)
  positioner.appendChild(content)
  root.append(hiddenSelect, label, trigger, clear, positioner)
  const form = options.inForm ? doc.createElement('form') : null
  if (form) {
    form.appendChild(root)
    doc.body.appendChild(form)
  }
  else {
    doc.body.appendChild(root)
  }

  const itemEls = new Map<string, HTMLElement>()
  const textEls = new Map<string, HTMLElement>()
  const indicatorEls = new Map<string, HTMLElement>()
  for (const item of ITEMS) {
    const el = doc.createElement('div')
    const text = doc.createElement('span')
    text.textContent = item.text
    const mark = doc.createElement('span')
    el.append(text, mark)
    list.appendChild(el)
    itemEls.set(item.value, el)
    textEls.set(item.value, text)
    indicatorEls.set(item.value, mark)
  }

  const service = createService(selectMachine, {
    props: () => ({ ...props.get() }),
    runtime,
    scope,
  })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [trigger],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)

  const render = (): void => {
    const api = connectSelect(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(valueTextEl, api.getValueTextProps() as Record<string, unknown>)
    valueTextEl.textContent = api.displayText
    spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
    spread(clear, api.getClearTriggerProps() as Record<string, unknown>)
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    spread(list, api.getListProps() as Record<string, unknown>)
    spread(footer, api.getFooterProps() as Record<string, unknown>)
    spread(hiddenSelect, api.getHiddenSelectProps() as Record<string, unknown>)
    // 影子选项按当前值补齐，与两个适配器同语义：选中态一律靠 option.selected 表达
    hiddenSelect.textContent = ''
    const blank = doc.createElement('option')
    blank.value = ''
    hiddenSelect.appendChild(blank)
    for (const [i, v] of api.value.entries()) {
      const option = doc.createElement('option')
      option.value = v
      option.textContent = api.valueText[i] ?? v
      option.selected = true
      hiddenSelect.appendChild(option)
    }
    for (const item of ITEMS) {
      const decl = { value: item.value, disabled: disabledItems.has(item.value) }
      spread(itemEls.get(item.value)!, api.getItemProps(decl) as Record<string, unknown>)
      spread(textEls.get(item.value)!, api.getItemTextProps(decl) as Record<string, unknown>)
      spread(indicatorEls.get(item.value)!, api.getItemIndicatorProps(decl) as Record<string, unknown>)
    }
  }

  runtime.start()
  runtime.subscribe(render)
  render()

  return {
    api: () => connectSelect(service, normalizeProps),
    root,
    form,
    trigger,
    clear,
    indicator,
    valueTextEl,
    content,
    list,
    footer,
    hiddenSelect,
    item: v => itemEls.get(v)!,
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    state: () => service.state.get(),
    value: () => service.context.get('value'),
    valueText: () => service.context.get('valueText'),
    highlighted: () => service.context.get('highlightedValue'),
  }
}

/** flush 在 vanilla 运行时是 queueMicrotask；消解层的监听器注册还要过一个 setTimeout。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function press(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

/** 条目拿到焦点即认领高亮锚点（禁用条目同样认领）。 */
function focus(el: HTMLElement): void {
  el.dispatchEvent(new FocusEvent('focus'))
}

/** 表单出口的实际提交内容：以字段名重复对的形式读出。 */
function formEntries(form: HTMLFormElement): [string, string][] {
  return [...new FormData(form).entries()].map(([k, v]) => [k, String(v)])
}

/** 影子 select 的选中态：读全部 selectedOptions 的 value。 */
function submitted(el: HTMLSelectElement): string[] {
  return [...el.selectedOptions].map(o => o.value).filter(v => v !== '')
}

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  document.body.innerHTML = ''
})

describe('selectMachine 值的形状与不变量', () => {
  it('选中值裸串是单选简写，null 是「受控但无选中」，内部一律归一成数组', () => {
    expect(mount({ defaultValue: 'apple' }).value()).toEqual(['apple'])
    expect(mount({ defaultValue: ['apple', 'cherry'], multiple: true }).value()).toEqual(['apple', 'cherry'])
    expect(mount({ defaultValue: null }).value()).toEqual([])
    expect(mount().value()).toEqual([])
  })

  it('单选下 setValue 截断到一个，多选去重：公开 API 造不出 UI 造不出的选中集合', () => {
    const single = mount()
    single.api().setValue(['apple', 'cherry'])
    expect(single.value()).toEqual(['apple'])

    const multi = mount({ multiple: true })
    multi.api().setValue(['apple', 'apple', 'cherry'])
    expect(multi.value()).toEqual(['apple', 'cherry'])
  })

  it('受控入参同样过不变量：单选传数组只认第一个', () => {
    expect(mount({ value: ['apple', 'cherry'] }).value()).toEqual(['apple'])
    expect(mount({ value: ['apple', 'apple'], multiple: true }).value()).toEqual(['apple'])
  })

  it('值按元素比：宿主每次传形状相同的新数组不重复发 onValueChange', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: ['apple'], multiple: true, onValueChange })
    h.setProps({ value: ['apple'] })
    h.setProps({ value: ['apple'] })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('setValue 收裸串按单选简写处理，不当字符序列拆', async () => {
    const single = mount()
    single.api().setValue('apple')
    expect(single.value()).toEqual(['apple'])
    await tick()
    expect(single.valueText()).toEqual(['Apple'])
    expect(single.api().displayText).toBe('Apple')

    const multi = mount({ multiple: true })
    multi.api().setValue('apple')
    expect(multi.value()).toEqual(['apple'])
    await tick()
    expect(multi.api().displayText).toBe('Apple')
  })

  it('multiple 运行期翻 false：非受控集合截回单选不变量并把这次收缩通知出去', async () => {
    const onValueChange = vi.fn()
    const h = mount({ multiple: true, defaultValue: ['apple', 'cherry'], onValueChange })
    await tick()
    expect(h.value()).toEqual(['apple', 'cherry'])

    h.setProps({ multiple: false })
    await tick()
    expect(h.value()).toEqual(['apple'])
    expect(onValueChange.mock.calls).toEqual([[{ value: ['apple'] }]])
  })

  it('multiple 运行期翻 false：值受控时只是重新归一，不代宿主改集合也不发通知', async () => {
    const onValueChange = vi.fn()
    const h = mount({ multiple: true, value: ['apple', 'cherry'], onValueChange })
    await tick()
    expect(h.value()).toEqual(['apple', 'cherry'])

    h.setProps({ multiple: false })
    await tick()
    // 受控值每次现算，截断是归一的结果而不是一次写入
    expect(h.value()).toEqual(['apple'])
    expect(onValueChange).not.toHaveBeenCalled()

    h.setProps({ multiple: true })
    await tick()
    expect(h.value()).toEqual(['apple', 'cherry'])
  })
})

describe('selectMachine 单选', () => {
  it('点条目落值并收起，先值后开合', async () => {
    const events: string[] = []
    const h = mount({
      defaultOpen: true,
      onValueChange: d => events.push(`value:${d.value.join(',')}`),
      onOpenChange: d => events.push(`open:${d.open}`),
    })
    await tick()
    click(h.item('banana'))
    expect(h.value()).toEqual(['banana'])
    expect(h.state()).toBe('closed')
    expect(events).toEqual(['value:banana', 'open:false'])
  })

  it('再点另一项是整体替换而不是累加', async () => {
    const h = mount({ defaultOpen: true })
    await tick()
    click(h.item('banana'))
    h.setProps({ open: undefined })
    h.api().setOpen(true)
    await tick()
    click(h.item('cherry'))
    expect(h.value()).toEqual(['cherry'])
  })

  it('值受控：点条目只发 onValueChange，不自改选中态', async () => {
    const onValueChange = vi.fn()
    const h = mount({ value: 'apple', defaultOpen: true, onValueChange })
    await tick()
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['cherry'] })
  })

  it('content 报 aria-multiselectable=false', () => {
    expect(mount().list.getAttribute('aria-multiselectable')).toBe('false')
  })
})

describe('selectMachine 多选', () => {
  it('点条目在集合里累加且列表不收起', async () => {
    const h = mount({ multiple: true, defaultOpen: true })
    await tick()
    click(h.item('apple'))
    expect(h.value()).toEqual(['apple'])
    expect(h.state()).toBe('open')
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple', 'cherry'])
    expect(h.state()).toBe('open')
  })

  it('点已选中的项即取消选中', async () => {
    const h = mount({ multiple: true, defaultOpen: true, defaultValue: ['apple', 'cherry'] })
    await tick()
    click(h.item('apple'))
    expect(h.value()).toEqual(['cherry'])
  })

  it('多选不发 open-change：选完留在展开态继续选', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ multiple: true, defaultOpen: true, onOpenChange })
    await tick()
    click(h.item('apple'))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('多选且 open 受控时选中不误发关闭意图', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ multiple: true, open: true, onOpenChange })
    await tick()
    click(h.item('apple'))
    expect(h.value()).toEqual(['apple'])
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('多选 + 值受控：点条目发出的是「加上这一项之后」的完整集合', async () => {
    const onValueChange = vi.fn()
    const h = mount({ multiple: true, value: ['apple'], defaultOpen: true, onValueChange })
    await tick()
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['apple', 'cherry'] })
  })

  it('content 报 aria-multiselectable=true', () => {
    expect(mount({ multiple: true }).list.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('展开时高亮锚点落在首个选中项上', async () => {
    const h = mount({ multiple: true, defaultValue: ['banana', 'cherry'] })
    h.api().setOpen(true)
    await tick()
    expect(h.highlighted()).toBe('banana')
  })

  it('自报禁用的条目点不进集合，键盘确认同样不认', async () => {
    const h = mount({ multiple: true, defaultOpen: true }, { disabledItems: ['banana'] })
    await tick()
    expect(h.item('banana').getAttribute('aria-disabled')).toBe('true')

    click(h.item('banana'))
    expect(h.value()).toEqual([])

    // 禁用条目照样认领锚点，但确认键不把它选进来
    focus(h.item('banana'))
    expect(h.highlighted()).toBe('banana')
    const enter = press(h.content, 'Enter')
    expect(h.value()).toEqual([])
    expect(enter.defaultPrevented).toBe(false)

    click(h.item('cherry'))
    expect(h.value()).toEqual(['cherry'])
  })

  it('确认键 Enter 与 Space 都切换高亮条目的选中态且不收起列表', async () => {
    const h = mount({ multiple: true, defaultOpen: true })
    await tick()
    // 无选中值打开不预落锚点，第一按先锚定首项；再按一次挪到次项，
    // 证明确认键认的是高亮而不是第一项
    press(h.content, 'ArrowDown')
    expect(h.highlighted()).toBe('apple')
    press(h.content, 'ArrowDown')
    expect(h.highlighted()).toBe('banana')

    const enter = press(h.content, 'Enter')
    expect(enter.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['banana'])
    expect(h.state()).toBe('open')

    press(h.content, 'Enter')
    expect(h.value()).toEqual([])
    expect(h.state()).toBe('open')

    const space = press(h.content, ' ')
    expect(space.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['banana'])
    expect(h.state()).toBe('open')

    press(h.content, ' ')
    expect(h.value()).toEqual([])
    expect(h.state()).toBe('open')
  })

  it('集合按点击先后排列，不跟文档序对齐', async () => {
    const h = mount({ multiple: true, defaultOpen: true })
    await tick()
    click(h.item('cherry'))
    click(h.item('apple'))
    expect(h.value()).toEqual(['cherry', 'apple'])
    await tick()
    expect(h.valueText()).toEqual(['Cherry', 'Apple'])
    expect(h.api().displayText).toBe('Cherry, Apple')
  })

  it('重新展开时锚点按文档序挑首个选中项，不跟点击序走', async () => {
    const h = mount({ multiple: true, defaultOpen: true })
    await tick()
    click(h.item('cherry'))
    click(h.item('apple'))
    expect(h.value()).toEqual(['cherry', 'apple'])

    h.api().setOpen(false)
    await tick()
    expect(h.state()).toBe('closed')
    h.api().setOpen(true)
    await tick()
    // 集合首项是 cherry，但列表里排在前面的 apple 才是锚点
    expect(h.highlighted()).toBe('apple')
  })
})

describe('selectSelect 显示文本与表单出口', () => {
  it('无选中显示 placeholder 并给出 data-placeholder', () => {
    const h = mount({ placeholder: '请选择' })
    expect(h.api().displayText).toBe('请选择')
    expect(h.valueTextEl.hasAttribute('data-placeholder')).toBe(true)
  })

  it('单选显示选中项文本，多选按逗号连起来', async () => {
    const single = mount({ defaultValue: 'banana' })
    await tick()
    expect(single.api().displayText).toBe('Banana')

    const multi = mount({ multiple: true, defaultValue: ['apple', 'cherry'] })
    await tick()
    expect(multi.valueText()).toEqual(['Apple', 'Cherry'])
    expect(multi.api().displayText).toBe('Apple, Cherry')
    expect(multi.valueTextEl.hasAttribute('data-placeholder')).toBe(false)
  })

  // 条目要等适配器提交完 DOM 才带得上身份标记，那之前逐项退回值本身，不留空位
  it('文本尚未从 DOM 结算出来时逐项退回值本身，不显示占位', () => {
    const h = mount({ multiple: true, defaultValue: ['apple', 'cherry'], placeholder: '请选择' })
    expect(h.valueText()).toEqual(['apple', 'cherry'])
    expect(h.api().displayText).toBe('apple, cherry')
  })

  it('某个选中值在列表里没有对应条目时只有该项退回值本身，其余项文本不受牵连', async () => {
    const h = mount({ multiple: true })
    h.api().setValue(['apple', 'durian', 'cherry'])
    await tick()
    expect(h.value()).toEqual(['apple', 'durian', 'cherry'])
    expect(h.valueText()).toEqual(['Apple', 'durian', 'Cherry'])
    expect(h.api().displayText).toBe('Apple, durian, Cherry')
  })

  it('setValue([]) 清空：显示回占位、data-placeholder 回来、影子 select 只剩空串选项', async () => {
    const h = mount({ name: 'fruit', multiple: true, defaultValue: ['apple', 'cherry'], placeholder: '请选择' })
    await tick()
    expect(h.api().displayText).toBe('Apple, Cherry')
    expect(h.valueTextEl.hasAttribute('data-placeholder')).toBe(false)

    h.api().setValue([])
    await tick()
    expect(h.value()).toEqual([])
    expect(h.valueText()).toEqual([])
    expect(h.api().displayText).toBe('请选择')
    expect(h.valueTextEl.textContent).toBe('请选择')
    expect(h.valueTextEl.hasAttribute('data-placeholder')).toBe(true)
    expect([...h.hiddenSelect.options].map(o => o.value)).toEqual([''])
    expect(submitted(h.hiddenSelect)).toEqual([])
  })

  it('条目自报选中态：aria-selected 与 data-state 只认在集合里的值', () => {
    const h = mount({ multiple: true, defaultValue: ['apple', 'cherry'] })
    expect(h.item('apple').getAttribute('aria-selected')).toBe('true')
    expect(h.item('banana').getAttribute('aria-selected')).toBe('false')
    expect(h.item('cherry').getAttribute('data-state')).toBe('checked')
    expect(h.item('banana').getAttribute('data-state')).toBe('unchecked')
  })

  it('影子 select 靠 option.selected 表达选中，required 判得出「没选」', () => {
    const empty = mount({ name: 'fruit', required: true })
    expect(submitted(empty.hiddenSelect)).toEqual([])
    expect(empty.hiddenSelect.checkValidity()).toBe(false)

    const single = mount({ name: 'fruit', required: true, defaultValue: 'banana' })
    expect(single.hiddenSelect.value).toBe('banana')
    expect(single.hiddenSelect.checkValidity()).toBe(true)

    const multi = mount({ name: 'fruit', required: true, multiple: true, defaultValue: ['apple', 'cherry'] })
    expect(multi.hiddenSelect.multiple).toBe(true)
    expect(submitted(multi.hiddenSelect)).toEqual(['apple', 'cherry'])
    expect(multi.hiddenSelect.checkValidity()).toBe(true)
  })

  it('多选无选中时空串选项不被算作一次选中', () => {
    const h = mount({ name: 'fruit', required: true, multiple: true })
    expect(submitted(h.hiddenSelect)).toEqual([])
    expect(h.hiddenSelect.checkValidity()).toBe(false)
  })
})

describe('selectSelect 原生表单提交', () => {
  it('多选以重复的同名字段带出全部选中值，顺序跟集合走', async () => {
    const h = mount({ name: 'v', multiple: true, defaultOpen: true }, { inForm: true })
    await tick()
    click(h.item('cherry'))
    click(h.item('apple'))
    await tick()
    expect(formEntries(h.form!)).toEqual([['v', 'cherry'], ['v', 'apple']])
  })

  it('空集合不产出该字段：空串选项只为让 required 判得出「没选」', () => {
    const h = mount({ name: 'v', multiple: true, required: true }, { inForm: true })
    const data = new FormData(h.form!)
    expect(data.has('v')).toBe(false)
    expect(data.getAll('v')).toEqual([])
    expect(h.hiddenSelect.checkValidity()).toBe(false)
  })

  it('disabled 时整份不进提交', async () => {
    const h = mount({ name: 'v', multiple: true, defaultValue: ['apple', 'cherry'], disabled: true }, { inForm: true })
    await tick()
    expect(h.hiddenSelect.disabled).toBe(true)
    expect(formEntries(h.form!)).toEqual([])
  })
})

describe('selectSelect 列表框的名字', () => {
  const labelId = (h: Harness): string => h.root.querySelector('[data-part="label"]')!.id

  it('trigger 扮演 combobox：aria-haspopup 报列表框、aria-controls 指向它', () => {
    const h = mount()
    expect(h.trigger.getAttribute('role')).toBe('combobox')
    expect(h.trigger.getAttribute('aria-haspopup')).toBe('listbox')
    expect(h.trigger.getAttribute('aria-controls')).toBe(h.list.id)
  })

  it('名字与 trigger 同源：标题 + 当前值', () => {
    const h = mount({ defaultValue: 'apple' })
    expect(h.list.getAttribute('role')).toBe('listbox')
    expect(h.list.getAttribute('aria-labelledby')).toBe(`${labelId(h)} ${h.valueTextEl.id}`)
    expect(h.list.getAttribute('aria-labelledby')).toBe(h.trigger.getAttribute('aria-labelledby'))
  })

  // 指针打开不预落锚点，焦点歇在容器上：那一刻读屏只报得出它的名字与角色
  it('两个名字部件都没渲染时退回可写的兜底名，不留一个没名字的列表框', () => {
    const h = mount()
    expect(h.list.getAttribute('aria-label')).toBe('Options')
    h.setProps({ translations: { content: '城市' } })
    expect(h.list.getAttribute('aria-label')).toBe('城市')
  })
})

describe('selectSelect 收起态连打检索', () => {
  it('单选整体替换选中值且不展开', () => {
    const h = mount()
    press(h.trigger, 'c')
    expect(h.value()).toEqual(['cherry'])
    expect(h.state()).toBe('closed')
  })

  it('多选只增不减：敲字母把匹配项加进集合，再敲一次是幂等的', () => {
    const h = mount({ multiple: true, defaultValue: ['apple'] })
    press(h.trigger, 'c')
    expect(h.value()).toEqual(['apple', 'cherry'])
    press(h.trigger, 'c')
    expect(h.value()).toEqual(['apple', 'cherry'])
    expect(h.state()).toBe('closed')
  })
})

describe('selectSelect 清空按钮', () => {
  it('不占 Tab 位但对读屏可见；可及名走 translations.clearTrigger', () => {
    const h = mount({ defaultValue: 'apple' })
    expect(h.clear.getAttribute('tabindex')).toBe('-1')
    expect(h.clear.hasAttribute('aria-hidden')).toBe(false)
    expect(h.clear.getAttribute('aria-label')).toBe('Clear')
    h.setProps({ translations: { clearTrigger: '清空所选' } })
    expect(h.clear.getAttribute('aria-label')).toBe('清空所选')
  })

  it('没值 / 禁用 / 只读时整个 hidden 不灰留位；有值时顶替指示符', () => {
    const empty = mount()
    expect(empty.clear.hasAttribute('hidden')).toBe(true)
    expect(empty.indicator.hasAttribute('data-clearable')).toBe(false)
    expect(empty.api().canClear).toBe(false)

    const h = mount({ defaultValue: 'apple' })
    expect(h.clear.hasAttribute('hidden')).toBe(false)
    expect(h.clear.hasAttribute('disabled')).toBe(false)
    expect(h.clear.hasAttribute('data-disabled')).toBe(false)
    expect(h.clear.hasAttribute('data-state')).toBe(false)
    expect(h.indicator.hasAttribute('data-clearable')).toBe(true)
    expect(h.api().canClear).toBe(true)

    h.setProps({ disabled: true })
    expect(h.clear.hasAttribute('hidden')).toBe(true)
    h.setProps({ disabled: false, readOnly: true })
    expect(h.clear.hasAttribute('hidden')).toBe(true)
    expect(h.indicator.hasAttribute('data-clearable')).toBe(false)
  })

  it('按下不把焦点从 trigger 挪走；点完清空、不展开、焦点送回 trigger', () => {
    const h = mount({ defaultValue: ['apple', 'cherry'], multiple: true, placeholder: '请选择' })
    const down = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
    h.clear.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)

    click(h.clear)
    expect(h.value()).toEqual([])
    expect(h.valueTextEl.textContent).toBe('请选择')
    expect(h.state()).toBe('closed')
    expect(h.clear.hasAttribute('hidden')).toBe(true)
    expect(document.activeElement).toBe(h.trigger)
  })

  it('api.clear 走同一条路：清空并通知一次', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultValue: 'apple', onValueChange })
    h.api().clear()
    expect(h.value()).toEqual([])
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith({ value: [] })
  })
})

describe('selectSelect 只读', () => {
  it('浮层照常展开、条目照常浏览，但选中值改不动、也清不掉', async () => {
    const h = mount({ readOnly: true, defaultValue: 'apple' })
    expect(h.trigger.getAttribute('aria-readonly')).toBe('true')
    expect(h.trigger.hasAttribute('disabled')).toBe(false)
    click(h.trigger)
    await tick()
    expect(h.state()).toBe('open')
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple'])
    expect(h.state()).toBe('open')
    press(h.content, 'ArrowDown')
    expect(h.highlighted()).toBe('banana')
    press(h.content, 'Enter')
    expect(h.value()).toEqual(['apple'])
    h.api().clear()
    expect(h.value()).toEqual(['apple'])
    h.api().setValue('cherry')
    expect(h.value()).toEqual(['apple'])
  })

  it('收起态连打与键盘清空都不动值', () => {
    const h = mount({ readOnly: true, defaultValue: 'apple' })
    press(h.trigger, 'c')
    expect(h.value()).toEqual(['apple'])
    press(h.trigger, 'Delete')
    expect(h.value()).toEqual(['apple'])
  })
})

describe('selectSelect 键盘清空', () => {
  it('delete 清空全部，列表不展开', () => {
    const h = mount({ defaultValue: ['apple', 'cherry'], multiple: true })
    const event = press(h.trigger, 'Delete')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual([])
    expect(h.state()).toBe('closed')
  })

  it('backspace 单选清空、多选去掉最后一个', () => {
    const single = mount({ defaultValue: 'apple' })
    press(single.trigger, 'Backspace')
    expect(single.value()).toEqual([])

    const multi = mount({ defaultValue: ['apple', 'cherry'], multiple: true })
    press(multi.trigger, 'Backspace')
    expect(multi.value()).toEqual(['apple'])
    press(multi.trigger, 'Backspace')
    expect(multi.value()).toEqual([])
    expect(multi.state()).toBe('closed')
  })

  it('没值或禁用时不吞键', () => {
    const h = mount()
    expect(press(h.trigger, 'Delete').defaultPrevented).toBe(false)
    expect(press(h.trigger, 'Backspace').defaultPrevented).toBe(false)
    h.api().setValue('apple')
    h.setProps({ disabled: true })
    expect(press(h.trigger, 'Delete').defaultPrevented).toBe(false)
    expect(h.value()).toEqual(['apple'])
  })
})
