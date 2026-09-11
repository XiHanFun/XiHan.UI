// @vitest-environment jsdom
import type { Anchor, PositionEnginePort, PositionOptions, PositionResult, RuntimeConfig } from '@xihan-ui/core'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { MentionApi, MentionSchema } from '../src/mention'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectMention, mentionMachine } from '../src/mention'

type Props = MentionSchema['props']

/** 候选的唯一事实源：与作者写在部件上的声明等价，绝不从 DOM 回读（那会读到机器自己写的）。 */
const PEOPLE = [
  { value: 'lilei', text: '李雷' },
  { value: 'hanmeimei', text: '韩梅梅' },
  { value: 'ghost', text: '幽灵', disabled: true },
  { value: 'poly', text: 'Poly' },
] as const

const ALL = PEOPLE.map(p => p.value)

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'readonly'])
// 输入框的 value 只能走 DOM property：用户敲过字之后 dirty flag 一立，
// setAttribute('value') 就只改默认值、再也影响不到框里显示的内容
const PROP_KEYS = new Set(['value'])

/** 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle，value 落 property）。 */
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
      // 值一样就别重写：重复赋值会把光标弹到末尾
      if ((el as unknown as Record<string, unknown>)[key] !== raw)
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
  api: () => MentionApi
  root: HTMLElement
  input: HTMLInputElement
  content: HTMLElement
  positioner: HTMLElement
  send: (event: MentionSchema['event']) => void
  /** 引擎回报并写进 context 的位置结果。 */
  position: () => PositionResult | null
  /** 把锚点 / 浮层 ref 换成空的，用来验它们缺席时不挂订阅。 */
  clearRef: (key: 'getInputEl' | 'getFloatingEl') => void
  item: (value: string) => HTMLElement
  /** 换一批候选：过滤是调用方的活儿，这里模拟它按查询串重渲列表。 */
  setItems: (values: readonly string[]) => void
  setProps: (next: Partial<Props>) => void
  state: () => string
  value: () => string
  query: () => string | null
  highlighted: () => string | null
}

interface Options {
  /** 收到 onQueryChange 就按前缀过滤候选——真实调用方的最小形态。 */
  filterOnQuery?: boolean
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
  const props = runtime.signal<Partial<Props>>({ ...initial })

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const input = doc.createElement('input')
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  positioner.append(content)
  root.append(input, positioner)
  doc.body.appendChild(root)

  const itemEls = new Map<string, HTMLElement>()
  for (const person of PEOPLE) {
    const el = doc.createElement('div')
    const text = doc.createElement('span')
    text.textContent = person.text
    el.appendChild(text)
    itemEls.set(person.value, el)
  }
  let visible: string[] = [...ALL]

  const onQueryChange: Props['onQueryChange'] = (details) => {
    initial.onQueryChange?.(details)
    if (!options.filterOnQuery)
      return
    const q = (details.query ?? '').toLowerCase()
    // eslint-disable-next-line ts/no-use-before-define
    setItems(ALL.filter(v => v.startsWith(q)))
  }

  const service = createService(mentionMachine, {
    props: () => ({ ...props.get(), onQueryChange }),
    runtime,
    scope,
  })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => {
    const handle = config.layerRegistry.register({
      kind: 'popover',
      node: () => content,
      branches: () => [input],
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
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)
  service.refs.set('getInputEl', () => input)

  const render = (): void => {
    const api = connectMention(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(input, api.getInputProps() as Record<string, unknown>)
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    for (const value of visible) {
      const person = PEOPLE.find(p => p.value === value)!
      const decl = { value: person.value, disabled: 'disabled' in person ? person.disabled : false }
      spread(itemEls.get(value)!, api.getItemProps(decl) as Record<string, unknown>)
    }
    // 适配器的职责：每次把 DOM 提交完就如实上报一次候选集合
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
  runtime.subscribe(render)
  render()

  return {
    api: () => connectMention(service, normalizeProps),
    root,
    input,
    content,
    positioner,
    send: event => service.send(event),
    position: () => service.context.get('position'),
    clearRef: (key) => {
      if (key === 'getFloatingEl')
        service.refs.set('getFloatingEl', () => null)
      else
        service.refs.set('getInputEl', () => null)
    },
    item: v => itemEls.get(v)!,
    setItems,
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    state: () => service.state.get(),
    value: () => service.context.get('value'),
    query: () => service.context.get('trigger')?.query ?? null,
    highlighted: () => service.context.get('highlightedValue'),
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function release(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

/** 打字：把整段正文写进框里、把光标摆到指定位置，再派原生 input 事件。 */
function type(input: HTMLInputElement, text: string, caret = text.length): void {
  input.value = text
  input.setSelectionRange(caret, caret)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** 只挪光标，不改正文。 */
function moveCaret(input: HTMLInputElement, caret: number): void {
  input.setSelectionRange(caret, caret)
  release(input, 'ArrowLeft')
}

/** flush 在 vanilla 运行时是一枚微任务；消解层的交互再等一枚微任务武装。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  document.body.innerHTML = ''
})

describe('按前缀在光标处触发', () => {
  it('挂载即收起，正文为空', () => {
    const m = mount()
    expect(m.state()).toBe('closed')
    expect(m.value()).toBe('')
    expect(m.query()).toBeNull()
  })

  it('敲下前缀即开，查询串随打字变长', () => {
    const m = mount()
    type(m.input, '@')
    expect(m.state()).toBe('open')
    expect(m.query()).toBe('')
    type(m.input, '@li')
    expect(m.query()).toBe('li')
  })

  it('前缀前面不是行首也不是空白就不开：邮箱不误触发', () => {
    const m = mount()
    type(m.input, '写信给 foo@bar')
    expect(m.state()).toBe('closed')
    expect(m.query()).toBeNull()
  })

  it('把查询串删干净退回到前缀之前即收起', () => {
    const m = mount()
    type(m.input, '@li')
    expect(m.state()).toBe('open')
    type(m.input, '')
    expect(m.state()).toBe('closed')
  })

  it('查询串里出现空白即收起：提及不跨词', () => {
    const m = mount()
    type(m.input, '@li')
    expect(m.state()).toBe('open')
    type(m.input, '@li ')
    expect(m.state()).toBe('closed')
  })

  it('正文没变、光标挪出查询串也收起', () => {
    const m = mount()
    type(m.input, '你好 @li')
    expect(m.state()).toBe('open')
    moveCaret(m.input, 1)
    expect(m.state()).toBe('closed')
  })

  it('光标挪回查询串里又开起来', () => {
    const m = mount()
    type(m.input, '你好 @li')
    moveCaret(m.input, 1)
    expect(m.state()).toBe('closed')
    moveCaret(m.input, 6)
    expect(m.state()).toBe('open')
    expect(m.query()).toBe('li')
  })

  it('多种前缀并存，onQueryChange 报回是哪一个前缀触发的', () => {
    const seen: Array<string | null> = []
    const m = mount({ triggerPrefix: ['@', '#'], onQueryChange: d => seen.push(d.prefix) })
    type(m.input, '#tag')
    expect(m.api().activePrefix).toBe('#')
    type(m.input, '#tag @li')
    expect(m.api().activePrefix).toBe('@')
    expect(seen).toContain('#')
    expect(seen).toContain('@')
  })

  it('禁用时一律不开', () => {
    const m = mount({ disabled: true })
    type(m.input, '@li')
    expect(m.state()).toBe('closed')
  })

  it('开合各只通知一次：查询串接着变长不再重复报 open', () => {
    const opens: boolean[] = []
    const m = mount({ onOpenChange: d => opens.push(d.open) })
    type(m.input, '@')
    type(m.input, '@l')
    type(m.input, '@li')
    expect(opens).toEqual([true])
    type(m.input, '')
    expect(opens).toEqual([true, false])
  })
})

describe('把候选插回正文中间', () => {
  it('回车提交高亮候选：只换掉查询串，前后文一字不动', async () => {
    const m = mount({ defaultValue: '' }, { filterOnQuery: true })
    type(m.input, '请 @li 看一下', 5)
    await tick()
    expect(m.highlighted()).toBe('lilei')
    const event = press(m.input, 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(m.value()).toBe('请 @李雷  看一下')
    expect(m.state()).toBe('closed')
  })

  it('提交后光标落在插入内容之后', async () => {
    const m = mount({}, { filterOnQuery: true })
    type(m.input, '@li')
    await tick()
    press(m.input, 'Enter')
    await tick()
    expect(m.input.value).toBe('@李雷 ')
    expect(m.input.selectionStart).toBe(4)
  })

  it('提交完不会立刻又弹回来：插入内容末尾那个空格挡住了同一处的重算', async () => {
    const m = mount({}, { filterOnQuery: true })
    type(m.input, '@li')
    await tick()
    press(m.input, 'Enter')
    release(m.input, 'Enter')
    await tick()
    expect(m.state()).toBe('closed')
  })

  it('点候选与回车走同一条路；禁用候选点不动', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    click(m.item('ghost'))
    expect(m.value()).toBe('@')
    expect(m.state()).toBe('open')
    click(m.item('hanmeimei'))
    expect(m.value()).toBe('@韩梅梅 ')
    expect(m.state()).toBe('closed')
  })

  it('onSelect 报回是哪一条候选、用的哪个前缀', async () => {
    const picked: Array<{ value: string, label: string, prefix: string }> = []
    const m = mount({ onSelect: d => picked.push(d) })
    type(m.input, '@')
    await tick()
    click(m.item('poly'))
    expect(picked).toEqual([{ value: 'poly', label: 'Poly', prefix: '@' }])
  })

  it('提及可以插在两段正文之间，尾巴保持原样', async () => {
    const m = mount({}, { filterOnQuery: true })
    // 光标停在 "@han" 之后，后面还跟着一段
    type(m.input, '开会 @han 记得来', 7)
    await tick()
    press(m.input, 'Enter')
    expect(m.value()).toBe('开会 @韩梅梅  记得来')
  })

  it('没有可提交的候选时回车不被吞：正文照常换行，只收起浮层', async () => {
    const m = mount({}, { filterOnQuery: true })
    type(m.input, '@zzz')
    await tick()
    expect(m.highlighted()).toBeNull()
    const event = press(m.input, 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(m.state()).toBe('closed')
    expect(m.value()).toBe('@zzz')
  })

  it('受控正文：组件只发 onValueChange，父没写回就不自改', async () => {
    const seen: string[] = []
    const m = mount({ value: '@li', onValueChange: d => seen.push(d.value) })
    type(m.input, '@li')
    await tick()
    press(m.input, 'Enter')
    expect(seen).toContain('@李雷 ')
    // 受控值没被父写回，机器读到的还是 prop
    expect(m.value()).toBe('@li')
    m.setProps({ value: '@李雷 ' })
    expect(m.value()).toBe('@李雷 ')
  })
})

describe('候选导航与高亮', () => {
  it('展开即高亮首条，方向键跳过禁用候选', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    expect(m.highlighted()).toBe('lilei')
    press(m.input, 'ArrowDown')
    expect(m.highlighted()).toBe('hanmeimei')
    press(m.input, 'ArrowDown')
    // ghost 禁用，直接跨过去
    expect(m.highlighted()).toBe('poly')
  })

  it('方向键走到尽头回绕，loop=false 时停住', async () => {
    const looped = mount()
    type(looped.input, '@')
    await tick()
    press(looped.input, 'ArrowUp')
    expect(looped.highlighted()).toBe('poly')

    const stuck = mount({ loop: false })
    type(stuck.input, '@')
    await tick()
    press(stuck.input, 'ArrowUp')
    expect(stuck.highlighted()).toBe('lilei')
  })

  it('高亮经 aria-activedescendant 上报，焦点不搬到候选上', async () => {
    const m = mount()
    m.input.focus()
    type(m.input, '@')
    await tick()
    const id = m.item('lilei').getAttribute('id')
    expect(m.input.getAttribute('aria-activedescendant')).toBe(id)
    expect(document.activeElement).toBe(m.input)
    expect(m.item('lilei').hasAttribute('tabindex')).toBe(false)
  })

  it('查询串变窄后高亮改停到还在的首条，不留悬空 id', async () => {
    const m = mount({}, { filterOnQuery: true })
    type(m.input, '@')
    await tick()
    press(m.input, 'ArrowDown')
    expect(m.highlighted()).toBe('hanmeimei')
    type(m.input, '@P')
    await tick()
    expect(m.highlighted()).toBe('poly')
  })

  it('指针划过即把高亮搬过去', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    m.item('poly').dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))
    expect(m.highlighted()).toBe('poly')
  })

  it('收起时高亮清空，aria-activedescendant 整条缺席', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    type(m.input, '')
    expect(m.highlighted()).toBeNull()
    expect(m.input.hasAttribute('aria-activedescendant')).toBe(false)
  })
})

describe('escape 与失焦', () => {
  it('escape 收起且正文不变；光标不挪走就不再自动展开', async () => {
    const m = mount()
    type(m.input, '@li')
    await tick()
    m.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await tick()
    expect(m.state()).toBe('closed')
    expect(m.value()).toBe('@li')
    // 同一处接着打字也不再弹回来
    type(m.input, '@lil')
    expect(m.state()).toBe('closed')
  })

  it('换一处触发点即恢复自动展开', async () => {
    const m = mount()
    type(m.input, '@li')
    await tick()
    m.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await tick()
    type(m.input, '@li @h')
    expect(m.state()).toBe('open')
  })

  it('tab 收起且不拦按键，焦点按 Tab 序列自然离开', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    const event = press(m.input, 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(m.state()).toBe('closed')
  })

  it('焦点离开整个组件即收起', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    m.input.dispatchEvent(new FocusEvent('blur', { bubbles: false, relatedTarget: document.body }))
    expect(m.state()).toBe('closed')
  })
})

describe('正文输入不被抢', () => {
  it('收起态一条按键都不接管', () => {
    const m = mount()
    for (const key of ['Enter', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'])
      expect(press(m.input, key).defaultPrevented).toBe(false)
  })

  it('展开态的 Home / End 照样归光标，不被拿去跳候选', async () => {
    const m = mount()
    type(m.input, '@li')
    await tick()
    expect(press(m.input, 'Home').defaultPrevented).toBe(false)
    expect(press(m.input, 'End').defaultPrevented).toBe(false)
    expect(m.highlighted()).toBe('lilei')
  })

  it('输入法组合期间的按键一律不接', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    const event = press(m.input, 'Enter', { isComposing: true })
    expect(event.defaultPrevented).toBe(false)
    expect(m.state()).toBe('open')
  })

  it('带修饰键的组合归浏览器', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    expect(press(m.input, 'ArrowDown', { metaKey: true }).defaultPrevented).toBe(false)
  })
})

describe('公开 API 与无障碍属性', () => {
  it('setValue 整段改写正文并收起浮层', async () => {
    const m = mount()
    type(m.input, '@li')
    await tick()
    m.api().setValue('换成别的话')
    expect(m.value()).toBe('换成别的话')
    expect(m.state()).toBe('closed')
  })

  it('输入框写足组合框那一套属性，彼此互指', () => {
    const m = mount()
    expect(m.input.getAttribute('role')).toBe('combobox')
    expect(m.input.getAttribute('type')).toBe('text')
    expect(m.input.getAttribute('aria-expanded')).toBe('false')
    expect(m.input.getAttribute('aria-haspopup')).toBe('listbox')
    expect(m.input.getAttribute('aria-autocomplete')).toBe('list')
    expect(m.input.getAttribute('aria-controls')).toBe(m.content.getAttribute('id'))
  })

  it('展开时 aria-expanded 翻成 true', async () => {
    const m = mount()
    type(m.input, '@li')
    await tick()
    expect(m.state()).toBe('open')
    expect(m.input.getAttribute('aria-expanded')).toBe('true')
  })

  it('浮层自带可及名字：role=listbox 必须有名字，而这里没有可指的标题部件', () => {
    expect(mount().content.getAttribute('aria-label')).toBe('Mentions')
    expect(mount({ translations: { content: '提及谁' } }).content.getAttribute('aria-label')).toBe('提及谁')
  })

  it('输入框的可及名字与占位文字不给就整条不输出，作者写在部件上的那份留得住', () => {
    const silent = mount().api().getInputProps() as Record<string, unknown>
    expect('aria-label' in silent).toBe(false)
    expect('placeholder' in silent).toBe(false)

    const named = mount({ translations: { input: '正文' }, placeholder: '说点什么' })
    expect(named.input.getAttribute('aria-label')).toBe('正文')
    expect(named.input.getAttribute('placeholder')).toBe('说点什么')
  })

  it('候选是 option，被标为 selected 的恒是当前高亮那一条', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    expect(m.item('lilei').getAttribute('role')).toBe('option')
    expect(m.item('lilei').getAttribute('aria-selected')).toBe('true')
    expect(m.item('hanmeimei').getAttribute('aria-selected')).toBe('false')
    // 集合条目一律 aria-disabled：原生 disabled 不派 click，禁用守卫就走不到
    expect(m.item('ghost').getAttribute('aria-disabled')).toBe('true')
    expect(m.item('ghost').hasAttribute('disabled')).toBe(false)
  })

  it('给了 collection 就按数据取显示文本与禁用，条目部件只报 value', () => {
    const m = mount({
      collection: [
        { value: 'lilei', label: '李雷' },
        { value: 'ghost', label: '幽灵', disabled: true },
      ],
    })
    expect(m.api().collection).toEqual([
      { value: 'lilei', label: '李雷', disabled: false },
      { value: 'ghost', label: '幽灵', disabled: true },
    ])
    const props = m.api().getItemProps({ value: 'ghost' }) as Record<string, unknown>
    expect(props['aria-disabled']).toBe('true')
  })

  it('浮层坐标走视口系，与定位引擎那一侧对齐', () => {
    const style = (mount().api().getPositionerProps() as { style: Record<string, string> }).style
    expect(style.position).toBe('fixed')
  })

  it('只读标记在定位层上再打一次：候选被搬到 portal 落点，根上那份够不着', () => {
    const readOnly = mount({ readOnly: true })
    expect((readOnly.api().getRootProps() as Record<string, unknown>)['data-readonly']).toBe('')
    expect((readOnly.api().getPositionerProps() as Record<string, unknown>)['data-readonly']).toBe('')
    // 常态整条缺席，皮肤那边 [data-readonly] 才选得干净
    expect((mount().api().getPositionerProps() as Record<string, unknown>)['data-readonly']).toBeUndefined()
  })

  it('候选按下指针即拦掉：不拦的话输入框会失焦、浮层随即收起', async () => {
    const m = mount()
    type(m.input, '@')
    await tick()
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true })
    m.item('lilei').dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('异步候选', () => {
  it('查询串变了先交出去，候选晚一拍到也接得住', async () => {
    vi.useFakeTimers()
    try {
      const m = mount()
      m.setItems([])
      type(m.input, '@li')
      expect(m.state()).toBe('open')
      expect(m.highlighted()).toBeNull()
      // 宿主查完远端才把候选放进来
      m.setItems(['lilei'])
      expect(m.highlighted()).toBe('lilei')
    }
    finally {
      vi.useRealTimers()
    }
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

function pointerDown(el: HTMLElement): void {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
}

const RESULT: PositionResult = { x: 12, y: 34, placement: 'bottom-start', hidden: false }

describe('mention 浮层定位', () => {
  it('等 DOM 落定才挂：进入展开态那一刻还没碰引擎，一拍之后才把输入框与浮层交进去', async () => {
    const engine = fakeEngine()
    const m = mount({}, { position: engine.port })
    m.send({ type: 'OPEN' })
    expect(engine.calls).toHaveLength(0)
    await tick()
    expect(engine.calls).toHaveLength(1)
    // 提及的定位锚点就是输入框本体
    expect(engine.calls[0]!.anchor).toBe(m.input)
    expect(engine.calls[0]!.floating).toBe(m.positioner)
  })

  it('交给引擎的参数：缺省 bottom-start 与 8px，坐标系走视口，要可用空间，不要箭头', async () => {
    const engine = fakeEngine()
    const m = mount({}, { position: engine.port })
    m.send({ type: 'OPEN' })
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
    const m = mount({ placement: 'top-end', offset: 2, dir: 'rtl' }, { position: engine.port })
    m.send({ type: 'OPEN' })
    await tick()
    const options = engine.calls[0]!.options
    expect(options.placement).toBe('top-end')
    expect(options.offset).toBe(2)
    expect(options.dir).toBe('rtl')
  })

  it('引擎回报的结果写进 context，连接层据此认落位', async () => {
    const engine = fakeEngine()
    const m = mount({}, { position: engine.port })
    m.send({ type: 'OPEN' })
    await tick()
    expect((m.api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBeUndefined()
    engine.calls[0]!.emit(RESULT)
    expect(m.position()).toEqual(RESULT)
    expect((m.api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBe('')
  })

  it('重新展开先把上一轮坐标清掉：再次落位之前不算已定位', async () => {
    const engine = fakeEngine()
    const m = mount({}, { position: engine.port })
    m.send({ type: 'OPEN' })
    await tick()
    engine.calls[0]!.emit(RESULT)
    m.send({ type: 'CLOSE' })
    // 收起中坐标还留着，退场要用
    expect(m.position()).toEqual(RESULT)
    m.send({ type: 'OPEN' })
    expect(m.position()).toBeNull()
  })

  it('收起即撤订阅', async () => {
    const engine = fakeEngine()
    const m = mount({}, { position: engine.port })
    m.send({ type: 'OPEN' })
    await tick()
    expect(engine.stops()).toBe(0)
    m.send({ type: 'CLOSE' })
    expect(engine.stops()).toBe(1)
  })

  it('展开当拍又收起：那一拍到来时不再挂订阅', async () => {
    const engine = fakeEngine()
    const m = mount({}, { position: engine.port })
    m.send({ type: 'OPEN' })
    m.send({ type: 'CLOSE' })
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('输入框或浮层缺席就不挂', async () => {
    const engine = fakeEngine()
    const noAnchor = mount({}, { position: engine.port })
    noAnchor.clearRef('getInputEl')
    noAnchor.send({ type: 'OPEN' })
    await tick()
    expect(engine.calls).toHaveLength(0)

    const noFloating = mount({}, { position: engine.port })
    noFloating.clearRef('getFloatingEl')
    noFloating.send({ type: 'OPEN' })
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('没有引擎照常转移，只是没有位置结果', async () => {
    const m = mount()
    m.send({ type: 'OPEN' })
    await tick()
    expect(m.state()).toBe('open')
    expect(m.position()).toBeNull()
  })
})

describe('mention 浮层的层与消解', () => {
  it('escape 走消解层：收起并把这一处记下，光标不挪走就不再自动展开', async () => {
    const onOpenChange = vi.fn()
    const m = mount({ onOpenChange })
    type(m.input, '@li')
    await tick()
    press(document.body, 'Escape')
    expect(m.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
    type(m.input, '@lil')
    expect(m.state()).toBe('closed')
  })

  it('层外按下指针收起；与 escape 不是一回事——它不记触发点，同一处接着打字照常弹回来', async () => {
    const onOpenChange = vi.fn()
    const m = mount({ onOpenChange })
    type(m.input, '@li')
    await tick()
    pointerDown(document.body)
    expect(m.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
    type(m.input, '@lil')
    expect(m.state()).toBe('open')
  })

  it('焦点跑到层外不由消解层收口：那一路归输入框自己的 blur，两处都认会为同一次离场发两遍', async () => {
    const onOpenChange = vi.fn()
    const m = mount({ onOpenChange })
    m.send({ type: 'OPEN' })
    await tick()
    onOpenChange.mockClear()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    expect(m.state()).toBe('open')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('收起之后这一层不再吃 Escape', async () => {
    const onOpenChange = vi.fn()
    const m = mount({ onOpenChange })
    m.send({ type: 'OPEN' })
    await tick()
    m.send({ type: 'CLOSE' })
    onOpenChange.mockClear()
    press(document.body, 'Escape')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('不挂焦点域：展开不搬焦点，收起也不归还——焦点全程留在输入框', async () => {
    const m = mount()
    m.input.focus()
    m.send({ type: 'OPEN' })
    await frames()
    expect(document.activeElement).toBe(m.input)
    m.send({ type: 'CLOSE' })
    await frames()
    expect(document.activeElement).toBe(m.input)
  })

  it('逆序拆：先撤消解层的订阅，最后才把层移出栈', async () => {
    const order: string[] = []
    const m = mount({}, { onLayerDispose: () => order.push('layer') })
    m.send({ type: 'OPEN' })
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
    m.send({ type: 'CLOSE' })
    spy.mockRestore()
    expect(order).toEqual(['dismiss', 'layer'])
  })
})
