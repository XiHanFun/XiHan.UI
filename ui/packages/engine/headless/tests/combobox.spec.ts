// @vitest-environment jsdom
import type { Anchor, PositionEnginePort, PositionOptions, PositionResult, RuntimeConfig } from '@xihan-ui/core'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { ComboboxApi, ComboboxSchema } from '../src/combobox'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { comboboxMachine, connectCombobox } from '../src/combobox'

type Props = ComboboxSchema['props']

/** 候选的唯一事实源：与作者写在部件上的声明等价，绝不从 DOM 回读（那会读到机器自己写的）。 */
const ITEMS = [
  { value: 'apple', text: 'Apple' },
  { value: 'banana', text: 'Banana', disabled: true },
  { value: 'cherry', text: 'Cherry' },
  { value: 'durian', text: 'Durian' },
] as const

const ALL = ITEMS.map(i => i.value)

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'readonly', 'required', 'multiple'])
// 输入框的 value 只能走 DOM property：用户敲过字之后 dirty flag 一立，
// setAttribute('value') 就只改默认值、再也影响不到框里显示的内容
const PROP_KEYS = new Set(['value'])

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle，value 落 property）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * "按键把高亮移到了哪个候选"这类事实必须有活 DOM 才立得住。
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
    if (key === 'style')
      continue
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (PROP_KEYS.has(key)) {
      (el as unknown as Record<string, unknown>)[key] = raw
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
  api: () => ComboboxApi
  root: HTMLElement
  control: HTMLElement
  positioner: HTMLElement
  send: (event: ComboboxSchema['event']) => void
  position: () => PositionResult | null
  /** 换掉锚点 / 浮层 ref，用来验它们缺席时不挂订阅。 */
  setRef: (key: 'getAnchorEl' | 'getFloatingEl', value: () => HTMLElement | null) => void
  input: HTMLInputElement
  trigger: HTMLButtonElement
  clear: HTMLButtonElement
  content: HTMLElement
  emptyEl: HTMLElement
  item: (value: string) => HTMLElement
  /** 换一批候选：过滤是调用方的活儿，这里模拟它按输入串重渲列表。 */
  setItems: (values: readonly string[]) => void
  setProps: (next: Partial<Props>) => void
  render: () => void
  state: () => string
  value: () => string[]
  inputValue: () => string
}

interface Options {
  /** 收到 onInputValueChange 就按前缀过滤候选——真实调用方的最小形态。 */
  filterOnInput?: boolean
  /** 定位引擎；不给即缺省，机器照常转移但不产出位置结果。 */
  position?: PositionEnginePort
  /** 本层被移出层栈时调一次，用来记拆除顺序。 */
  onLayerDispose?: () => void
}

const runtimes: VanillaRuntime[] = []

function mount(initial: Partial<Props> = {}, options: Options = {}): Harness {
  const doc = document
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  // props 挂在 signal 上：布尔态受控（open）靠 watch 里的 track 回写，
  // 而 track 只在有值真的变过时才复查——直接改一个普通对象，宿主的写回就被静默吞掉了
  const props = runtime.signal<Partial<Props>>({ ...initial })

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const label = doc.createElement('label')
  label.textContent = '水果'
  const control = doc.createElement('div')
  const input = doc.createElement('input')
  const trigger = doc.createElement('button')
  const clear = doc.createElement('button')
  control.append(input, trigger, clear)
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  const emptyEl = doc.createElement('div')
  emptyEl.textContent = '无匹配项'
  positioner.append(content, emptyEl)
  root.append(label, control, positioner)
  doc.body.appendChild(root)

  const itemEls = new Map<string, HTMLElement>()
  const textEls = new Map<string, HTMLElement>()
  for (const item of ITEMS) {
    const el = doc.createElement('div')
    const text = doc.createElement('span')
    text.textContent = item.text
    el.appendChild(text)
    itemEls.set(item.value, el)
    textEls.set(item.value, text)
  }
  let visible: string[] = [...ALL]

  const onInputValueChange: Props['onInputValueChange'] = (details) => {
    initial.onInputValueChange?.(details)
    if (!options.filterOnInput)
      return
    const q = details.inputValue.toLowerCase()
    // eslint-disable-next-line ts/no-use-before-define
    setItems(ALL.filter(v => ITEMS.find(i => i.value === v)!.text.toLowerCase().startsWith(q)))
  }

  const service = createService(comboboxMachine, {
    props: () => ({ ...props.get(), onInputValueChange }),
    runtime,
    scope,
  })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => {
    const handle = config.layerRegistry.register({
      kind: 'popover',
      node: () => content,
      // 整个输入行记为本层分支：点它算层内交互，开合交给输入框与触发按钮自己切换
      branches: () => [control],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    return {
      layer: handle.layer,
      dispose: () => {
        handle.dispose()
        options.onLayerDispose?.()
      },
    }
  })
  if (options.position)
    service.refs.set('position', options.position)
  service.refs.set('getAnchorEl', () => control)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)
  service.refs.set('getInputEl', () => input)

  const render = (): void => {
    const api = connectCombobox(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(control, api.getControlProps() as Record<string, unknown>)
    spread(input, api.getInputProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(clear, api.getClearTriggerProps() as Record<string, unknown>)
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    spread(emptyEl, api.getEmptyProps() as Record<string, unknown>)
    for (const value of visible) {
      const item = ITEMS.find(i => i.value === value)!
      const decl = { value: item.value, disabled: 'disabled' in item ? item.disabled : false }
      spread(itemEls.get(value)!, api.getItemProps(decl) as Record<string, unknown>)
      spread(textEls.get(value)!, api.getItemTextProps(decl) as Record<string, unknown>)
    }
    // 适配器的职责：每次把 DOM 提交完就如实上报一次候选集合（过滤是调用方做的，机器无从预知）
    if (service.getStatus() === 'Started')
      service.send({ type: 'ITEMS.SYNC' })
  }

  const setItems = (values: readonly string[]): void => {
    visible = [...values]
    content.textContent = ''
    for (const value of visible) content.appendChild(itemEls.get(value)!)
    render()
  }

  setItems(ALL)
  runtime.start()
  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectCombobox(service, normalizeProps),
    root,
    control,
    positioner,
    send: event => service.send(event),
    position: () => service.context.get('position'),
    setRef: (key, value) => service.refs.set(key, value),
    input,
    trigger,
    clear,
    content,
    emptyEl,
    item: v => itemEls.get(v)!,
    setItems,
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    render,
    state: () => service.state.get(),
    value: () => service.context.get('value'),
    inputValue: () => service.context.get('inputValue'),
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

/** pointerdown 用 MouseEvent 合成：jsdom 里它同样带 button，处理器只读这一个字段。 */
function pointerDown(el: EventTarget): MouseEvent {
  const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
  el.dispatchEvent(event)
  return event
}

function type(input: HTMLInputElement, text: string): void {
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** flush 在 vanilla 运行时是一枚微任务；消解层的交互再等一枚微任务武装。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  document.body.innerHTML = ''
})

describe('comboboxMachine 状态与受控', () => {
  it('默认收起，defaultOpen 决定初态', () => {
    expect(mount().state()).toBe('closed')
    expect(mount({ defaultOpen: true }).state()).toBe('open')
  })

  it('选中值裸串是单选简写，内部一律归一成数组', () => {
    expect(mount({ defaultValue: 'apple' }).value()).toEqual(['apple'])
    expect(mount({ defaultValue: ['apple', 'cherry'], multiple: true }).value()).toEqual(['apple', 'cherry'])
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

  it('开合受控：内部不自改状态，只发 onOpenChange；宿主写回才生效', () => {
    const onOpenChange = vi.fn()
    const h = mount({ open: false, onOpenChange })
    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })
    h.setProps({ open: true })
    expect(h.state()).toBe('open')
  })

  it('输入串受控：内部纹丝不动，回调照发', () => {
    const onInputValueChange = vi.fn()
    const h = mount({ inputValue: 'ap', onInputValueChange })
    type(h.input, 'app')
    expect(h.inputValue()).toBe('ap')
    expect(onInputValueChange).toHaveBeenCalledWith({ inputValue: 'app' })
    h.setProps({ inputValue: 'app' })
    expect(h.inputValue()).toBe('app')
  })

  it('选中值受控：点候选只发 onValueChange，不自改选中态', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: 'apple', defaultOpen: true, onValueChange })
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['cherry'] })
  })

  it('挂载即把输入框填成选中项的文字（未给 defaultInputValue 时）', async () => {
    const h = mount({ defaultValue: 'cherry' })
    await tick()
    expect(h.inputValue()).toBe('Cherry')
    expect(h.input.value).toBe('Cherry')
    // 给了输入串就归调用方，不代填
    const kept = mount({ defaultValue: 'cherry', defaultInputValue: '' })
    await tick()
    expect(kept.inputValue()).toBe('')
  })
})

describe('connectCombobox 属性输出', () => {
  it('输入框是 combobox：展开态、受控列表、补全模式与名字都显式给出', () => {
    const h = mount()
    expect(h.input.getAttribute('role')).toBe('combobox')
    expect(h.input.getAttribute('aria-expanded')).toBe('false')
    expect(h.input.getAttribute('aria-controls')).toBe(h.content.id)
    expect(h.input.getAttribute('aria-haspopup')).toBe('listbox')
    expect(h.input.getAttribute('aria-autocomplete')).toBe('list')
    expect(h.input.getAttribute('aria-invalid')).toBe('false')
    expect(h.input.hasAttribute('aria-activedescendant')).toBe(false)
    expect(h.root.querySelector('label')!.getAttribute('for')).toBe(h.input.id)
  })

  it('清空按钮对读屏不隐藏，靠 aria-label 报名，文案可经 translations 覆盖', () => {
    const props = mount().api().getClearTriggerProps() as Record<string, unknown>
    expect(props['aria-hidden']).toBeUndefined()
    expect(props['aria-label']).toBe('Clear')
    const named = mount({ translations: { clearTrigger: '清空' } })
    expect(named.clear.getAttribute('aria-label')).toBe('清空')
  })

  it('inputBehavior=autocomplete 时 aria-autocomplete 报 both', () => {
    expect(mount({ inputBehavior: 'autocomplete' }).input.getAttribute('aria-autocomplete')).toBe('both')
    expect(mount({ inputBehavior: 'autohighlight' }).input.getAttribute('aria-autocomplete')).toBe('list')
  })

  it('列表是 listbox：多选与否显式给出，收起时 hidden，且永不进 Tab 序列', () => {
    const h = mount()
    expect(h.content.getAttribute('role')).toBe('listbox')
    expect(h.content.getAttribute('aria-multiselectable')).toBe('false')
    expect(h.content.getAttribute('tabindex')).toBe('-1')
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(mount({ multiple: true }).content.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('候选是 option：选中/禁用两态显式给出，带稳定 id，且绝不输出原生 disabled 或 tabindex', () => {
    const h = mount({ defaultValue: 'apple' })
    const apple = h.item('apple')
    const banana = h.item('banana')
    expect(apple.getAttribute('role')).toBe('option')
    expect(apple.getAttribute('aria-selected')).toBe('true')
    expect(apple.getAttribute('data-state')).toBe('checked')
    expect(apple.getAttribute('data-value')).toBe('apple')
    expect(apple.id).toBeTruthy()
    expect(banana.getAttribute('aria-selected')).toBe('false')
    expect(banana.getAttribute('aria-disabled')).toBe('true')
    expect(banana.hasAttribute('disabled')).toBe(false)
    expect(apple.getAttribute('aria-disabled')).toBe('false')
    // 焦点恒在输入框：候选既不该被 Tab 停靠，也不承载焦点
    expect(apple.hasAttribute('tabindex')).toBe(false)
  })

  it('候选 id 对含空格的值也是单个 IDREF（aria-activedescendant 只认一个）', () => {
    const h = mount()
    const id = (h.api().getItemProps({ value: 'red apple' }) as Record<string, unknown>).id as string
    expect(id).not.toMatch(/\s/)
    expect(id).not.toBe((h.api().getItemProps({ value: 'red_apple' }) as Record<string, unknown>).id)
  })

  it('触发按钮与清空按钮都退出 Tab 序列：整个组合框只占一个 Tab 位', () => {
    const h = mount()
    expect(h.trigger.getAttribute('tabindex')).toBe('-1')
    expect(h.clear.getAttribute('tabindex')).toBe('-1')
    expect(h.input.hasAttribute('tabindex')).toBe(false)
  })
})

describe('焦点恒在输入框（aria-activedescendant 模型）', () => {
  it('方向键展开并移高亮，焦点一步都不离开输入框', () => {
    const h = mount()
    h.input.focus()
    press(h.input, 'ArrowDown')
    expect(h.state()).toBe('open')
    expect(document.activeElement).toBe(h.input)
    expect(h.input.getAttribute('aria-activedescendant')).toBe(h.item('apple').id)
    expect(h.item('apple').getAttribute('data-highlighted')).toBe('')

    press(h.input, 'ArrowDown')
    expect(document.activeElement).toBe(h.input)
    expect(h.input.getAttribute('aria-activedescendant')).toBe(h.item('cherry').id)
  })

  it('列表上的 pointerdown 被拦下：不拦，点候选会把焦点从输入框上带走', () => {
    const h = mount({ defaultOpen: true })
    const onItem = pointerDown(h.item('apple'))
    expect(onItem.defaultPrevented).toBe(true)
    const onTrigger = pointerDown(h.trigger)
    expect(onTrigger.defaultPrevented).toBe(true)
  })

  it('收起态没有高亮可指，aria-activedescendant 整个缺席', () => {
    const h = mount()
    h.input.focus()
    press(h.input, 'ArrowDown')
    expect(h.input.hasAttribute('aria-activedescendant')).toBe(true)
    press(h.input, 'Tab')
    expect(h.state()).toBe('closed')
    expect(h.input.hasAttribute('aria-activedescendant')).toBe(false)
  })
})

describe('键盘', () => {
  it('收起态 ArrowDown 落首个候选、ArrowUp 落末个', () => {
    const down = mount()
    press(down.input, 'ArrowDown')
    expect(down.api().highlightedValue).toBe('apple')

    const up = mount()
    press(up.input, 'ArrowUp')
    expect(up.api().highlightedValue).toBe('durian')
  })

  it('alt+ArrowDown 展开但不预选，alt+ArrowUp 收起', () => {
    const h = mount()
    press(h.input, 'ArrowDown', { altKey: true })
    expect(h.state()).toBe('open')
    expect(h.api().highlightedValue).toBeNull()
    press(h.input, 'ArrowUp', { altKey: true })
    expect(h.state()).toBe('closed')
  })

  it('展开态方向键跳过禁用候选、尽头回绕；loop=false 时原地不动', () => {
    const h = mount()
    press(h.input, 'ArrowDown')
    // banana 禁用，直接跨过去
    press(h.input, 'ArrowDown')
    expect(h.api().highlightedValue).toBe('cherry')
    press(h.input, 'ArrowDown')
    expect(h.api().highlightedValue).toBe('durian')
    press(h.input, 'ArrowDown')
    expect(h.api().highlightedValue).toBe('apple')
    press(h.input, 'ArrowUp')
    expect(h.api().highlightedValue).toBe('durian')

    const fixed = mount({ loop: false })
    press(fixed.input, 'ArrowDown')
    press(fixed.input, 'ArrowUp')
    expect(fixed.api().highlightedValue).toBe('apple')
  })

  it('home/End 只在展开态归候选导航；收起态放行给光标', () => {
    const h = mount()
    const passed = press(h.input, 'End')
    expect(passed.defaultPrevented).toBe(false)
    expect(h.state()).toBe('closed')

    press(h.input, 'ArrowDown')
    const taken = press(h.input, 'End')
    expect(taken.defaultPrevented).toBe(true)
    expect(h.api().highlightedValue).toBe('durian')
    press(h.input, 'Home')
    expect(h.api().highlightedValue).toBe('apple')
  })

  it('enter 选中高亮候选：输入串换成它的文本、列表收起', () => {
    const onValueChange = vi.fn()
    const h = mount({ onValueChange })
    press(h.input, 'ArrowDown')
    press(h.input, 'ArrowDown')
    const event = press(h.input, 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['cherry'])
    expect(h.inputValue()).toBe('Cherry')
    expect(h.input.value).toBe('Cherry')
    expect(h.state()).toBe('closed')
    expect(onValueChange).toHaveBeenCalledWith({ value: ['cherry'] })
  })

  it('收起态的 Enter 放行：组合框没展开就没有理由拦下表单提交', () => {
    const h = mount()
    const event = press(h.input, 'Enter')
    expect(event.defaultPrevented).toBe(false)
  })

  it('高亮停在禁用候选上时确认键不认', () => {
    const h = mount({ defaultOpen: true })
    // 键盘走不到禁用项，直接经 API 把高亮塞进去，守卫才碰得到
    h.item('banana').dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))
    expect(h.api().highlightedValue).toBeNull()
    press(h.input, 'Enter')
    expect(h.value()).toEqual([])
  })

  it('tab 收起但不拦按键：焦点要按 Tab 序列自然离开', () => {
    const h = mount({ defaultOpen: true })
    const event = press(h.input, 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(h.state()).toBe('closed')
  })

  it('escape 分两拍：先摘高亮，高亮已空才收起', async () => {
    const h = mount()
    press(h.input, 'ArrowDown')
    expect(h.api().highlightedValue).toBe('apple')
    // Hub 监听同步在场；本层参与者延后一拍武装（免得打开事件立刻把自己关掉）
    await tick()

    const first = press(h.input, 'Escape')
    expect(first.defaultPrevented).toBe(true)
    expect(h.api().highlightedValue).toBeNull()
    expect(h.state()).toBe('open')

    press(h.input, 'Escape')
    expect(h.state()).toBe('closed')
  })

  it('打字即展开，并把输入串原样报给调用方去过滤', () => {
    const onInputValueChange = vi.fn()
    const h = mount({ onInputValueChange })
    type(h.input, 'ch')
    expect(h.state()).toBe('open')
    expect(h.inputValue()).toBe('ch')
    expect(onInputValueChange).toHaveBeenCalledWith({ inputValue: 'ch' })
    // 过滤不由组件做：候选一个没少
    expect(h.content.children.length).toBe(ALL.length)
  })
})

describe('多选', () => {
  it('选中即并入集合、清空输入串，且列表不收起', () => {
    const h = mount({ multiple: true, defaultOpen: true })
    click(h.item('apple'))
    expect(h.value()).toEqual(['apple'])
    expect(h.inputValue()).toBe('')
    expect(h.state()).toBe('open')
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple', 'cherry'])
    // 再点一次即摘掉
    click(h.item('apple'))
    expect(h.value()).toEqual(['cherry'])
  })

  it('输入串为空时退格删掉最后一个已选项', () => {
    const h = mount({ multiple: true, defaultValue: ['apple', 'cherry'] })
    const event = press(h.input, 'Backspace')
    expect(event.defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['apple'])
  })

  it('输入串还有字时退格归输入框，一个已选项都不动', () => {
    const h = mount({ multiple: true, defaultValue: ['apple'], defaultInputValue: 'ch' })
    const event = press(h.input, 'Backspace')
    expect(event.defaultPrevented).toBe(false)
    expect(h.value()).toEqual(['apple'])
  })

  it('单选下退格不删选中值', () => {
    const h = mount({ defaultValue: 'apple', defaultInputValue: '' })
    press(h.input, 'Backspace')
    expect(h.value()).toEqual(['apple'])
  })
})

describe('自定义值与失焦复原', () => {
  it('allowCustomValue：回车把列表里没有的输入串收成选中值', () => {
    const h = mount({ allowCustomValue: true })
    type(h.input, 'kiwi')
    // 没有高亮（inputBehavior 默认不预选）
    expect(h.api().highlightedValue).toBeNull()
    press(h.input, 'Enter')
    expect(h.value()).toEqual(['kiwi'])
    expect(h.state()).toBe('closed')
  })

  it('不许自定义值时回车只收起，选中值不动', () => {
    const h = mount()
    type(h.input, 'kiwi')
    press(h.input, 'Enter')
    expect(h.value()).toEqual([])
    expect(h.state()).toBe('closed')
  })

  it('失焦复原：没提交的字收回成选中项的文本', async () => {
    const h = mount({ defaultValue: 'cherry' })
    await tick()
    expect(h.inputValue()).toBe('Cherry')
    type(h.input, 'kiw')
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }))
    expect(h.inputValue()).toBe('Cherry')
    expect(h.value()).toEqual(['cherry'])
    expect(h.state()).toBe('closed')
  })

  it('失焦时焦点仍在组件内部（如落到触发按钮）不算离场', () => {
    const h = mount({ defaultOpen: true, defaultInputValue: 'kiw' })
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: h.trigger }))
    expect(h.state()).toBe('open')
    expect(h.inputValue()).toBe('kiw')
  })

  it('allowCustomValue 下失焦把输入串收成值', () => {
    const h = mount({ allowCustomValue: true })
    type(h.input, 'kiwi')
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }))
    expect(h.value()).toEqual(['kiwi'])
    expect(h.inputValue()).toBe('kiwi')
  })

  it('allowCustomValue 下选完候选再失焦：值仍是候选的 value，不会被换成它的显示文本', () => {
    // 选中 value="cherry"、框里显示 "Cherry"；失焦那一路若无条件把输入串收成值，
    // 值会从 cherry 变成 Cherry——提交上去的就是个不存在的选项
    const h = mount({ allowCustomValue: true })
    press(h.input, 'ArrowDown')
    press(h.input, 'ArrowDown')
    press(h.input, 'Enter')
    expect(h.value()).toEqual(['cherry'])
    h.input.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }))
    expect(h.value()).toEqual(['cherry'])
    expect(h.inputValue()).toBe('Cherry')
  })

  it('allowCustomValue 下没改字就按回车：不把值换成显示文本', () => {
    const h = mount({ allowCustomValue: true })
    press(h.input, 'ArrowDown')
    press(h.input, 'ArrowDown')
    press(h.input, 'Enter')
    // 再展开一次，这回不动高亮直接回车
    press(h.input, 'ArrowDown', { altKey: true })
    expect(h.api().highlightedValue).toBeNull()
    press(h.input, 'Enter')
    expect(h.value()).toEqual(['cherry'])
    expect(h.state()).toBe('closed')
  })
})

describe('候选集合变化：空态与悬空高亮', () => {
  it('候选筛空时 empty 节点显形，收起后又让位', () => {
    const h = mount({ defaultOpen: true })
    expect(h.emptyEl.hasAttribute('hidden')).toBe(true)
    h.setItems([])
    expect(h.emptyEl.hasAttribute('hidden')).toBe(false)
    expect(h.api().empty).toBe(true)
    press(h.input, 'Tab')
    expect(h.emptyEl.hasAttribute('hidden')).toBe(true)
  })

  it('首帧还没结算过候选条数时不判空：否则有候选也会闪一下空态', () => {
    const h = mount({ defaultOpen: true })
    expect(h.api().empty).toBe(false)
    expect(h.emptyEl.hasAttribute('hidden')).toBe(true)
  })

  it('loading 只在零候选时显示状态层；已有候选继续可见并仅由 listbox 报 busy', () => {
    const h = mount({ defaultOpen: true, loading: true })
    const loadingProps = (): Record<string, unknown> => h.api().getLoadingProps() as Record<string, unknown>

    expect(h.content.getAttribute('aria-busy')).toBe('true')
    expect(loadingProps().hidden).toBe(true)
    press(h.input, 'ArrowDown')
    expect(h.api().highlightedValue).toBe('apple')

    h.setItems([])
    expect(h.api().highlightedValue).toBeNull()
    expect(h.input.hasAttribute('aria-activedescendant')).toBe(false)
    expect(loadingProps().hidden).toBeUndefined()
    press(h.input, 'ArrowDown')
    expect(h.api().highlightedValue).toBeNull()
  })

  it('高亮项被筛掉即摘掉：留着会让 aria-activedescendant 指向不存在的 id', () => {
    const h = mount()
    press(h.input, 'ArrowDown')
    press(h.input, 'ArrowDown')
    expect(h.api().highlightedValue).toBe('cherry')
    h.setItems(['apple', 'durian'])
    expect(h.api().highlightedValue).toBeNull()
    expect(h.input.hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('候选还在就不动高亮', () => {
    const h = mount()
    press(h.input, 'ArrowDown')
    h.setItems(['apple', 'durian'])
    expect(h.api().highlightedValue).toBe('apple')
  })
})

describe('inputBehavior', () => {
  it('默认 none：打完字一个候选也不预选', async () => {
    const h = mount({ filterOnInput: true } as Partial<Props>, { filterOnInput: true })
    type(h.input, 'c')
    await tick()
    expect(h.api().highlightedValue).toBeNull()
  })

  it('autohighlight：每次输入后把高亮落到首个可选候选，回车即提交它', async () => {
    const h = mount({ inputBehavior: 'autohighlight' }, { filterOnInput: true })
    type(h.input, 'b')
    await tick()
    // banana 禁用，首个可选是空——过滤后只剩 banana，于是没有可选候选
    expect(h.api().highlightedValue).toBeNull()

    type(h.input, 'c')
    await tick()
    expect(h.api().highlightedValue).toBe('cherry')
    press(h.input, 'Enter')
    expect(h.value()).toEqual(['cherry'])
  })

  it('autocomplete：把输入框补成首个候选的文本，补出来的那段是选区', async () => {
    const h = mount({ inputBehavior: 'autocomplete' }, { filterOnInput: true })
    type(h.input, 'ch')
    await tick()
    expect(h.inputValue()).toBe('Cherry')
    expect(h.input.value).toBe('Cherry')
    expect([h.input.selectionStart, h.input.selectionEnd]).toEqual([2, 6])
  })

  it('autocomplete 删字时不补：否则退格补回来、字永远删不掉', async () => {
    const h = mount({ inputBehavior: 'autocomplete' }, { filterOnInput: true })
    type(h.input, 'ch')
    await tick()
    expect(h.inputValue()).toBe('Cherry')
    // 退格：从 "Cherry" 删到 "Cherr"
    type(h.input, 'Cherr')
    await tick()
    expect(h.inputValue()).toBe('Cherr')
  })
})

describe('禁用与只读', () => {
  it('禁用：输入框与下拉钮用原生 disabled、清空钮收起，键盘展不开列表', () => {
    const h = mount({ disabled: true })
    expect(h.input.hasAttribute('disabled')).toBe(true)
    expect(h.trigger.hasAttribute('disabled')).toBe(true)
    expect(h.clear.hasAttribute('hidden')).toBe(true)
    expect(h.clear.hasAttribute('disabled')).toBe(false)
    expect(h.root.getAttribute('data-disabled')).toBe('')
    press(h.input, 'ArrowDown')
    expect(h.state()).toBe('closed')
  })

  it('只读：文字仍可选可复制，但展开与选中都不发生', () => {
    const h = mount({ readOnly: true, defaultValue: 'apple' })
    expect(h.input.hasAttribute('readonly')).toBe(true)
    expect(h.input.hasAttribute('disabled')).toBe(false)
    press(h.input, 'ArrowDown')
    expect(h.state()).toBe('closed')
    // 只读时清空按钮也按不动
    expect(h.api().canClear).toBe(false)
    // 候选仍在文档里（只是随 content 一起 hidden），点得到——所以守卫必须写在点击处理器里
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple'])
  })

  it('禁用：候选点不动', () => {
    const h = mount({ disabled: true, defaultValue: 'apple' })
    click(h.item('cherry'))
    expect(h.value()).toEqual(['apple'])
  })

  it('invalid 一路打到输入框与根节点', () => {
    const h = mount({ invalid: true })
    expect(h.input.getAttribute('aria-invalid')).toBe('true')
    expect(h.input.getAttribute('data-invalid')).toBe('')
    expect(h.root.getAttribute('data-invalid')).toBe('')
  })
})

describe('触发按钮与清空按钮', () => {
  it('触发按钮切换开合，展开时高亮落在已选项上', () => {
    const h = mount({ defaultValue: 'cherry' })
    click(h.trigger)
    expect(h.state()).toBe('open')
    expect(h.api().highlightedValue).toBe('cherry')
    click(h.trigger)
    expect(h.state()).toBe('closed')
  })

  it('已选项不在候选里时展开不预选：候选是调用方筛过的，不替用户挑一个他没看过的', () => {
    const h = mount({ defaultValue: 'cherry' })
    h.setItems(['apple', 'durian'])
    click(h.trigger)
    expect(h.api().highlightedValue).toBeNull()
  })

  it('清空按钮：没东西可清时只收起不置灰，清完选中值与输入串都空', async () => {
    const h = mount()
    expect(h.clear.hasAttribute('hidden')).toBe(true)
    expect(h.clear.hasAttribute('disabled')).toBe(false)
    expect(h.clear.hasAttribute('data-disabled')).toBe(false)
    const nothing = mount({ defaultValue: 'apple' })
    await tick()
    expect(nothing.clear.hasAttribute('hidden')).toBe(false)
    click(nothing.clear)
    expect(nothing.value()).toEqual([])
    expect(nothing.inputValue()).toBe('')
  })
})

describe('消解层', () => {
  it('层外按下指针即收起；层只在展开期间待在栈里', async () => {
    const h = mount()
    press(h.input, 'ArrowDown')
    expect(h.state()).toBe('open')
    await tick()

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    pointerDown(outside)
    expect(h.state()).toBe('closed')

    // 收起后层已出栈：同一次层外交互不该再触发任何转移
    pointerDown(outside)
    expect(h.state()).toBe('closed')
  })

  it('点输入行内部不算层外交互', async () => {
    const h = mount()
    press(h.input, 'ArrowDown')
    await tick()
    pointerDown(h.trigger)
    expect(h.state()).toBe('open')
  })
})

describe('组合框 · 展开按钮的名字', () => {
  const label = (h: ReturnType<typeof mount>): unknown =>
    (h.api().getTriggerProps() as Record<string, unknown>)['aria-label']

  it('钮里只有一枚箭头，缺省也得有个名字', () => {
    expect(label(mount())).toBe('Show suggestions')
  })

  it('作者给了文案就用作者那份，清空钮那句不受牵连', () => {
    const h = mount({ translations: { trigger: '展开候选' } })
    expect(label(h)).toBe('展开候选')
    expect((h.api().getClearTriggerProps() as Record<string, unknown>)['aria-label']).toBe('Clear')
  })
})

/** 记账用的假定位引擎：每次 attach 的入参原样收下，撤订阅也记一笔。 */
function fakeEngine(): {
  port: PositionEnginePort
  calls: { anchor: Anchor, floating: HTMLElement, options: PositionOptions, emit: (r: PositionResult) => void }[]
  stops: () => number
} {
  const calls: { anchor: Anchor, floating: HTMLElement, options: PositionOptions, emit: (r: PositionResult) => void }[] = []
  let stops = 0
  return {
    calls,
    stops: () => stops,
    port: {
      attach: (anchor, floating, options, onResult) => {
        calls.push({ anchor, floating, options, emit: onResult })
        return () => {
          stops += 1
        }
      },
    },
  }
}

/** 等 n 帧：焦点域若真挂了，落焦重试排在 rAF 上。 */
async function frames(n = 5): Promise<void> {
  for (let i = 0; i < n; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

const RESULT: PositionResult = { x: 12, y: 34, placement: 'bottom-start', hidden: false }

describe('comboboxCombobox 浮层定位', () => {
  it('等 DOM 落定才挂：进入展开态那一刻还没碰引擎，一拍之后才把锚点与浮层交进去', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN' })
    expect(engine.calls).toHaveLength(0)
    await tick()
    expect(engine.calls).toHaveLength(1)
    expect(engine.calls[0]!.anchor).toBe(h.control)
    expect(engine.calls[0]!.floating).toBe(h.positioner)
  })

  it('交给引擎的参数：缺省 bottom-start 与 8px，坐标系走视口，要可用空间，不要箭头', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN' })
    await tick()
    const options = engine.calls[0]!.options
    expect(options.placement).toBe('bottom-start')
    expect(options.offset).toBe(8)
    expect(options.strategy).toBe('fixed')
    expect(options.size).toBe(true)
    expect(options.dir).toBeUndefined()
    expect(options.arrow).toBeUndefined()
  })

  it('placement / offset / dir 由 props 覆盖', async () => {
    const engine = fakeEngine()
    const h = mount({ placement: 'top-end', offset: 2, dir: 'rtl' }, { position: engine.port })
    h.send({ type: 'OPEN' })
    await tick()
    const options = engine.calls[0]!.options
    expect(options.placement).toBe('top-end')
    expect(options.offset).toBe(2)
    expect(options.dir).toBe('rtl')
  })

  it('引擎回报的结果写进 context，连接层据此认落位', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN' })
    await tick()
    expect((h.api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBeUndefined()
    engine.calls[0]!.emit(RESULT)
    expect(h.position()).toEqual(RESULT)
    expect((h.api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBe('')
  })

  it('重新展开先把上一轮坐标清掉：再次落位之前不算已定位', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN' })
    await tick()
    engine.calls[0]!.emit(RESULT)
    h.send({ type: 'CLOSE' })
    // 收起中坐标还留着，退场要用
    expect(h.position()).toEqual(RESULT)
    h.send({ type: 'OPEN' })
    expect(h.position()).toBeNull()
  })

  it('收起即撤订阅', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN' })
    await tick()
    expect(engine.stops()).toBe(0)
    h.send({ type: 'CLOSE' })
    expect(engine.stops()).toBe(1)
  })

  it('展开当拍又收起：那一拍到来时不再挂订阅', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.send({ type: 'OPEN' })
    h.send({ type: 'CLOSE' })
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('锚点或浮层缺席就不挂', async () => {
    const engine = fakeEngine()
    const noAnchor = mount({}, { position: engine.port })
    noAnchor.setRef('getAnchorEl', () => null)
    noAnchor.send({ type: 'OPEN' })
    await tick()
    expect(engine.calls).toHaveLength(0)

    const noFloating = mount({}, { position: engine.port })
    noFloating.setRef('getFloatingEl', () => null)
    noFloating.send({ type: 'OPEN' })
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('没有引擎照常转移，只是没有位置结果', async () => {
    const h = mount()
    h.send({ type: 'OPEN' })
    await tick()
    expect(h.state()).toBe('open')
    expect(h.position()).toBeNull()
  })
})

describe('comboboxCombobox 浮层的层与消解', () => {
  it('escape 走两拍：先摘掉高亮，再按一次才收起', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    h.input.focus()
    press(h.input, 'ArrowDown')
    await tick()
    expect(h.state()).toBe('open')
    expect(h.api().highlightedValue).toBe('apple')

    press(document.body, 'Escape')
    expect(h.state()).toBe('open')
    expect(h.api().highlightedValue).toBeNull()

    press(document.body, 'Escape')
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
  })

  it('层外按下指针收起', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    h.send({ type: 'OPEN' })
    await tick()
    pointerDown(document.body)
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
  })

  it('焦点跑到层外不由消解层收口：那一路归输入框自己的 blur，两处都认会为同一次离场发两遍', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    h.send({ type: 'OPEN' })
    await tick()
    onOpenChange.mockClear()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    expect(h.state()).toBe('open')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('收起之后这一层不再吃 Escape', async () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    h.send({ type: 'OPEN' })
    await tick()
    h.send({ type: 'CLOSE' })
    onOpenChange.mockClear()
    press(document.body, 'Escape')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('不挂焦点域：展开不搬焦点，收起也不归还——焦点全程留在输入框', async () => {
    const h = mount()
    h.input.focus()
    h.send({ type: 'OPEN' })
    await frames()
    expect(document.activeElement).toBe(h.input)
    h.send({ type: 'CLOSE' })
    await frames()
    expect(document.activeElement).toBe(h.input)
  })

  it('逆序拆：先撤消解层的订阅，最后才把层移出栈', async () => {
    const order: string[] = []
    const h = mount({}, { onLayerDispose: () => order.push('layer') })
    h.send({ type: 'OPEN' })
    await tick()
    const remove = document.removeEventListener.bind(document)
    const spy = vi.spyOn(document, 'removeEventListener').mockImplementation(((type: string, listener: EventListener, opts?: boolean | EventListenerOptions) => {
      // pointerdown 只有消解层摘；focusout 是焦点域的标记，这一族根本不该出现
      if (type === 'pointerdown')
        order.push('dismiss')
      if (type === 'focusout')
        order.push('focus-scope')
      remove(type, listener, opts)
    }) as typeof document.removeEventListener)
    h.send({ type: 'CLOSE' })
    spy.mockRestore()
    expect(order).toEqual(['dismiss', 'layer'])
  })
})
