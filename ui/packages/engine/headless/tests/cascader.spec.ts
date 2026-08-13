// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/kernel'
import type { VanillaRuntime } from '@xihan-ui/machine/vanilla'
import type { CascaderApi, CascaderNode, CascaderSchema } from '../src/cascader'
import { createCounterIdGenerator, createRuntimeConfig, createScope, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cascaderBuildColumns,
  cascaderBuildLevels,
  cascaderIndexNodes,
  cascaderMachine,
  cascaderNodeAt,
  cascaderParentPath,
  cascaderPathKey,
  cascaderPathLabels,
  cascaderPathText,
  cascaderSamePath,
  cascaderStepColumn,
  cascaderTruncatePath,
  connectCascader,
} from '../src/cascader'

type Props = CascaderSchema['props']

/**
 * 三层数据。wenzhou 禁用（方向键跳过它，但它仍可聚焦、仍是导航起点）；
 * taiwan 的 children 是空数组——级联里那算叶子（右边开一列空的没有意义），
 * 这一条与 Tree 刚好相反，得有用例守着。
 */
const COLLECTION: CascaderNode[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'Xihu' },
          { value: 'yuhang', label: 'Yuhang' },
        ],
      },
      { value: 'ningbo', label: 'Ningbo', children: [{ value: 'jiangbei', label: 'Jiangbei' }] },
      { value: 'wenzhou', label: 'Wenzhou', disabled: true },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [{ value: 'nanjing', label: 'Nanjing', children: [{ value: 'xuanwu', label: 'Xuanwu' }] }],
  },
  { value: 'taiwan', label: 'Taiwan', children: [] },
  { value: 'macau', label: 'Macau' },
]

// ────────────────────────────── 纯函数 ──────────────────────────────

describe('cascaderBuildColumns：从展开路径推出该显示哪几列', () => {
  const valuesOf = (path: readonly string[]): string[][] =>
    cascaderBuildColumns(COLLECTION, path).map(column => column.items.map(item => item.value))

  it('空路径只开根列', () => {
    expect(valuesOf([])).toEqual([['zhejiang', 'jiangsu', 'taiwan', 'macau']])
  })

  it('每往右走一段就多开一列，列里装的是那一段的子节点', () => {
    expect(valuesOf(['zhejiang'])).toEqual([
      ['zhejiang', 'jiangsu', 'taiwan', 'macau'],
      ['hangzhou', 'ningbo', 'wenzhou'],
    ])
    expect(valuesOf(['zhejiang', 'hangzhou'])).toEqual([
      ['zhejiang', 'jiangsu', 'taiwan', 'macau'],
      ['hangzhou', 'ningbo', 'wenzhou'],
      ['xihu', 'yuhang'],
    ])
  })

  it('列的父路径与层号逐列递进，条目的 path 是从根算起的整条路径', () => {
    const columns = cascaderBuildColumns(COLLECTION, ['zhejiang', 'hangzhou'])
    expect(columns.map(c => [c.level, c.parentPath])).toEqual([
      [0, []],
      [1, ['zhejiang']],
      [2, ['zhejiang', 'hangzhou']],
    ])
    expect(columns[2]!.items[0]!.path).toEqual(['zhejiang', 'hangzhou', 'xihu'])
    expect(columns[2]!.items[0]!.level).toBe(2)
  })

  it('叶子右边不再开列：children 是空数组的也算叶子（与 Tree 相反）', () => {
    expect(valuesOf(['zhejiang', 'wenzhou'])).toHaveLength(2)
    expect(valuesOf(['taiwan'])).toHaveLength(1)
    expect(valuesOf(['macau'])).toHaveLength(1)
  })

  it('路径走不通就地收尾：这一段不在本列里，右边一列都不开', () => {
    expect(valuesOf(['ghost'])).toHaveLength(1)
    // hangzhou 是 zhejiang 的子节点，不在 jiangsu 的子列里
    expect(valuesOf(['jiangsu', 'hangzhou'])).toEqual([
      ['zhejiang', 'jiangsu', 'taiwan', 'macau'],
      ['nanjing'],
    ])
  })

  it('自引用的 collection 不会把列铺到无穷远', () => {
    const loopNode: CascaderNode = { value: 'a', label: 'A', children: [] }
    loopNode.children = [loopNode]
    expect(cascaderBuildColumns([loopNode], ['a', 'a', 'a']).length).toBeLessThanOrEqual(2)
  })
})

describe('cascaderTruncatePath：路径的增删就是列的增删', () => {
  it('在第 level 列另选一个：左边留着，第 level 段换掉，右边全砍', () => {
    const path = ['zhejiang', 'hangzhou', 'xihu']
    expect(cascaderTruncatePath(path, 1, 'ningbo')).toEqual(['zhejiang', 'ningbo'])
    expect(cascaderTruncatePath(path, 0, 'jiangsu')).toEqual(['jiangsu'])
    expect(cascaderTruncatePath(path, 2, 'yuhang')).toEqual(['zhejiang', 'hangzhou', 'yuhang'])
  })

  it('level 等于当前长度即追加一段；越界钳住，不在路径中间留空洞', () => {
    expect(cascaderTruncatePath(['zhejiang'], 1, 'hangzhou')).toEqual(['zhejiang', 'hangzhou'])
    expect(cascaderTruncatePath(['zhejiang'], 9, 'hangzhou')).toEqual(['zhejiang', 'hangzhou'])
    expect(cascaderTruncatePath(['zhejiang'], -3, 'jiangsu')).toEqual(['jiangsu'])
  })

  it('砍掉的段真的让列少了：把截短后的路径喂回去，列数跟着降', () => {
    const deep = ['zhejiang', 'hangzhou']
    expect(cascaderBuildColumns(COLLECTION, deep)).toHaveLength(3)
    // 回到第 0 列另选一个，第 2 列就没了
    expect(cascaderBuildColumns(COLLECTION, cascaderTruncatePath(deep, 0, 'jiangsu'))).toHaveLength(2)
  })

  it('原路径不被改写：截断产出的是新数组', () => {
    const path = ['zhejiang', 'hangzhou']
    cascaderTruncatePath(path, 1, 'ningbo')
    expect(path).toEqual(['zhejiang', 'hangzhou'])
  })
})

describe('cascaderBuildLevels：作者写标记用的静态层', () => {
  it('按深度摊开全树，与展开路径无关', () => {
    expect(cascaderBuildLevels(COLLECTION).map(l => l.items.map(i => i.value))).toEqual([
      ['zhejiang', 'jiangsu', 'taiwan', 'macau'],
      ['hangzhou', 'ningbo', 'wenzhou', 'nanjing'],
      ['xihu', 'yuhang', 'jiangbei', 'xuanwu'],
    ])
  })

  it('层里每个条目都带着自己的整条路径与禁用标记', () => {
    const level1 = cascaderBuildLevels(COLLECTION)[1]!
    expect(level1.items.find(i => i.value === 'nanjing')!.path).toEqual(['jiangsu', 'nanjing'])
    expect(level1.items.find(i => i.value === 'wenzhou')!.disabled).toBe(true)
    expect(level1.items.find(i => i.value === 'hangzhou')!.branch).toBe(true)
    expect(level1.items.find(i => i.value === 'wenzhou')!.branch).toBe(false)
  })

  it('空集合摊不出任何层', () => {
    expect(cascaderBuildLevels([])).toEqual([])
  })
})

describe('路径的取名、比对与列内导航', () => {
  it('逐段取 label，缺省退回 value；走不通的段原样保留', () => {
    expect(cascaderPathLabels(COLLECTION, ['zhejiang', 'hangzhou', 'xihu'])).toEqual(['Zhejiang', 'Hangzhou', 'Xihu'])
    expect(cascaderPathLabels([{ value: 'bare' }], ['bare'])).toEqual(['bare'])
    expect(cascaderPathLabels(COLLECTION, ['zhejiang', 'ghost'])).toEqual(['Zhejiang', 'ghost'])
  })

  it('整条路径用分隔符连起来', () => {
    expect(cascaderPathText(COLLECTION, ['zhejiang', 'hangzhou'], ' / ')).toBe('Zhejiang / Hangzhou')
    expect(cascaderPathText(COLLECTION, [], ' / ')).toBe('')
  })

  it('cascaderNodeAt 认整条路径，不是认值：中途断了给 null', () => {
    expect(cascaderNodeAt(COLLECTION, ['zhejiang', 'hangzhou'])?.branch).toBe(true)
    expect(cascaderNodeAt(COLLECTION, ['zhejiang', 'wenzhou'])?.branch).toBe(false)
    expect(cascaderNodeAt(COLLECTION, ['jiangsu', 'hangzhou'])).toBeNull()
    expect(cascaderNodeAt(COLLECTION, [])).toBeNull()
  })

  it('路径键按内容比，拼不出歧义', () => {
    expect(cascaderPathKey(['a', 'b'])).not.toBe(cascaderPathKey(['a-b']))
    expect(cascaderPathKey(['a', 'b'])).toBe(cascaderPathKey(['a', 'b']))
    expect(cascaderSamePath(['a'], ['a'])).toBe(true)
    expect(cascaderSamePath(['a'], ['a', 'b'])).toBe(false)
    expect(cascaderSamePath(null, null)).toBe(true)
    expect(cascaderSamePath(null, [])).toBe(false)
    expect(cascaderParentPath(['a', 'b'])).toEqual(['a'])
    expect(cascaderParentPath([])).toEqual([])
  })

  it('列内走一步跳过禁用条目，loop 决定首尾回不回绕', () => {
    const column = cascaderBuildColumns(COLLECTION, ['zhejiang'])[1]!
    // ningbo 的下一个是禁用的 wenzhou，跳过它回绕到 hangzhou
    expect(cascaderStepColumn(column.items, 'ningbo', 'next', { loop: true })?.value).toBe('hangzhou')
    expect(cascaderStepColumn(column.items, 'ningbo', 'next', { loop: false })).toBeNull()
    expect(cascaderStepColumn(column.items, null, 'last', { loop: false })?.value).toBe('ningbo')
    expect(cascaderStepColumn([], null, 'first')).toBeNull()
  })

  it('全树索引按值取元信息，重名以先出现的为准', () => {
    const index = cascaderIndexNodes(COLLECTION)
    expect(index.get('xihu')!.path).toEqual(['zhejiang', 'hangzhou', 'xihu'])
    expect(index.get('ghost')).toBeUndefined()
    const dup = cascaderIndexNodes([
      { value: 'a', children: [{ value: 'dup', label: 'first' }] },
      { value: 'b', children: [{ value: 'dup', label: 'second' }] },
    ])
    expect(dup.get('dup')!.label).toBe('first')
  })
})

// ────────────────────────────── 活 DOM 宿主 ──────────────────────────────

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'readonly', 'required'])

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * 「按键落到哪一列的哪一条上」这类事实必须有活 DOM 才立得住。
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
    if (BOOLEAN_ATTRS.has(key)) {
      el.toggleAttribute(key, Boolean(raw))
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface ItemEls {
  item: HTMLElement
  text: HTMLElement
  indicator: HTMLElement
}

interface Harness {
  api: () => CascaderApi
  trigger: HTMLButtonElement
  valueText: HTMLElement
  clear: HTMLButtonElement
  content: HTMLElement
  column: (level: number) => HTMLElement
  item: (value: string) => ItemEls
  /** 摘掉一个条目（模拟调用方换数据）。 */
  removeItem: (value: string) => void
  /**
   * 把焦点送到当前锚点条目上。真实环境里这件事归焦点域（排在 rAF 上），
   * 同步用例里就地补一步——键盘处理器在 content 上收口，焦点不在条目里按键就冒泡不上去。
   */
  focusAnchor: () => void
  send: (event: CascaderSchema['event']) => void
  setProps: (next: Partial<Props>) => void
  state: () => string
  value: () => string[][]
  activePath: () => string[]
  focusedPath: () => string[] | null
  /** 当下没带 hidden 的列的层号。 */
  shownColumns: () => number[]
  /** 某一列里当下露着面的条目值。 */
  shownItems: (level: number) => string[]
  /** 整个控件在 Tab 序列里的停靠点，按 part 名列出。 */
  tabStops: () => string[]
}

const runtimes: VanillaRuntime[] = []

function mount(initial: Partial<Props> = {}): Harness {
  const doc = document
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  // props 挂在 signal 上：布尔态受控（open）靠 watch 里的 track 回写，
  // 而 track 只在有值真的变过时才复查——直接改一个普通对象，宿主的写回就被静默吞掉了
  const props = runtime.signal<Partial<Props>>({ collection: COLLECTION, ...initial })
  // 作者标记镜像的是机器手上的那份 collection：两边不同源的话，
  // 算出来的可见条目在 DOM 里一个也找不到，用例会假绿
  const collection = props.get().collection!

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const label = doc.createElement('span')
  label.textContent = '归属地'
  const trigger = doc.createElement('button')
  const valueText = doc.createElement('span')
  const indicator = doc.createElement('span')
  const clear = doc.createElement('button')
  trigger.append(valueText, indicator)
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  positioner.appendChild(content)
  root.append(label, trigger, clear, positioner)

  // 作者标记是**静态**的：每层一个列、层内节点各一个条目，全都常挂着，
  // 当下该露面的是哪些由连接层用 hidden 收口
  const columns: HTMLElement[] = []
  const items = new Map<string, ItemEls>()
  for (const level of cascaderBuildLevels(collection)) {
    const columnEl = doc.createElement('div')
    for (const meta of level.items) {
      const item = doc.createElement('div')
      const itemIndicator = doc.createElement('span')
      itemIndicator.textContent = '✓'
      const text = doc.createElement('span')
      text.textContent = meta.label
      item.append(itemIndicator, text)
      columnEl.appendChild(item)
      items.set(meta.value, { item, text, indicator: itemIndicator })
    }
    columns.push(columnEl)
    content.appendChild(columnEl)
  }
  doc.body.appendChild(root)

  const service = createService(cascaderMachine, { props: () => props.get(), runtime, scope })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换
    branches: () => [trigger],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)

  const render = (): void => {
    const api = connectCascader(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(valueText, api.getValueTextProps() as Record<string, unknown>)
    valueText.textContent = api.displayText
    spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
    spread(clear, api.getClearTriggerProps() as Record<string, unknown>)
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    columns.forEach((el, level) => spread(el, api.getColumnProps({ level }) as Record<string, unknown>))
    for (const [value, els] of items) {
      const item = { value }
      spread(els.item, api.getItemProps(item) as Record<string, unknown>)
      spread(els.text, api.getItemTextProps(item) as Record<string, unknown>)
      spread(els.indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }
  }

  runtime.start()
  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectCascader(service, normalizeProps),
    trigger: trigger as HTMLButtonElement,
    valueText,
    clear: clear as HTMLButtonElement,
    content,
    column: level => columns[level]!,
    item: value => items.get(value)!,
    removeItem: (value) => {
      items.get(value)!.item.remove()
      items.delete(value)
      render()
    },
    focusAnchor: () => {
      const path = service.context.get('focusedPath')
      const value = path?.[path.length - 1]
      if (value != null)
        items.get(value)?.item.focus()
    },
    send: event => service.send(event),
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    state: () => service.state.get(),
    value: () => service.context.get('value'),
    activePath: () => service.context.get('activePath'),
    focusedPath: () => service.context.get('focusedPath'),
    shownColumns: () => columns
      .map((el, level) => (el.hasAttribute('hidden') ? -1 : level))
      .filter(level => level >= 0),
    shownItems: level => [...columns[level]!.children]
      .filter(el => !el.hasAttribute('hidden'))
      .map(el => el.getAttribute('data-value') ?? '?'),
    tabStops: () => [...root.querySelectorAll<HTMLElement>('[data-scope="cascader"]')]
      .filter(el => el.getAttribute('tabindex') === '0')
      .map(el => el.getAttribute('data-part') ?? '?'),
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

function hover(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('pointerenter', { bubbles: true, cancelable: true }))
}

/** 当下持有焦点的元素，按键一律从它发出（键盘处理器在 content 上收口，靠冒泡）。 */
function active(): HTMLElement {
  return (document.activeElement as HTMLElement | null) ?? document.body
}

function focusedValue(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  document.body.innerHTML = ''
})

describe('开合与受控', () => {
  it('默认收起，defaultOpen 决定初态', () => {
    expect(mount().state()).toBe('closed')
    expect(mount({ defaultOpen: true }).state()).toBe('open')
  })

  it('点 trigger 开合并通知；收起态 content 带 hidden、展开后摘掉', () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(h.trigger.getAttribute('aria-expanded')).toBe('false')

    click(h.trigger)
    expect(h.state()).toBe('open')
    expect(h.content.hasAttribute('hidden')).toBe(false)
    expect(h.trigger.getAttribute('aria-expanded')).toBe('true')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: true })

    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
  })

  it('受控 open：点 trigger 只发意图不自改状态，宿主写回后才转移', () => {
    const onOpenChange = vi.fn()
    const h = mount({ open: false, onOpenChange })
    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })

    h.setProps({ open: true })
    expect(h.state()).toBe('open')
    // 宿主写回不是新的用户意图，不再发一次
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  it('trigger 上的确认键与上下键都展开，且被吞掉不再合成一次 click', () => {
    const h = mount()
    const event = press(h.trigger, 'Enter')
    expect(h.state()).toBe('open')
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('选中路径与回显', () => {
  it('单条路径是简写，内部一律归一成路径集合', () => {
    expect(mount({ defaultValue: ['zhejiang', 'hangzhou'] }).value()).toEqual([['zhejiang', 'hangzhou']])
    expect(mount({ defaultValue: [['zhejiang'], ['jiangsu']], multiple: true }).value())
      .toEqual([['zhejiang'], ['jiangsu']])
    expect(mount().value()).toEqual([])
  })

  it('value-text 显示的是整条路径，分隔符可换', () => {
    const h = mount({ defaultValue: ['zhejiang', 'hangzhou', 'xihu'] })
    expect(h.api().valueText).toBe('Zhejiang / Hangzhou / Xihu')
    expect(h.valueText.textContent).toBe('Zhejiang / Hangzhou / Xihu')
    h.setProps({ separator: ' > ' })
    expect(h.api().valueText).toBe('Zhejiang > Hangzhou > Xihu')
  })

  it('无选中时显示 placeholder，并把 data-placeholder 打在 trigger 与 value-text 上', () => {
    const h = mount({ placeholder: '请选择' })
    expect(h.api().valueText).toBeNull()
    expect(h.api().displayText).toBe('请选择')
    expect(h.trigger.getAttribute('data-placeholder')).toBe('')
    expect(h.valueText.getAttribute('data-placeholder')).toBe('')
  })

  it('多选把多条路径连成一串；valuePath 只报第一条', () => {
    const h = mount({ multiple: true, defaultValue: [['zhejiang', 'hangzhou'], ['macau']] })
    expect(h.api().displayText).toBe('Zhejiang / Hangzhou, Macau')
    expect(h.api().valuePath).toEqual(['zhejiang', 'hangzhou'])
  })

  it('setValue 单选截断到一条、多选按内容去重', () => {
    const single = mount()
    single.api().setValue([['macau'], ['taiwan']])
    expect(single.value()).toEqual([['macau']])

    const multi = mount({ multiple: true })
    multi.api().setValue([['macau'], ['macau'], ['taiwan']])
    expect(multi.value()).toEqual([['macau'], ['taiwan']])
  })
})

describe('列的展开与截断', () => {
  it('无选中值展开：锚点落到首个条目但不带出它的子列，只开根列', () => {
    const h = mount()
    click(h.trigger)
    expect(h.focusedPath()).toEqual(['zhejiang'])
    expect(h.activePath()).toEqual([])
    expect(h.shownColumns()).toEqual([0])
    expect(h.item('zhejiang').item.getAttribute('data-highlighted')).toBe('')
    expect(h.item('zhejiang').item.getAttribute('data-active')).toBeNull()
  })

  it('首个条目是叶子时只开根列', () => {
    const h = mount({ collection: [{ value: 'macau', label: 'Macau' }] })
    click(h.trigger)
    expect(h.shownColumns()).toEqual([0])
  })

  it('点靠左那一列的另一个条目，它右边原有的列全被砍掉', () => {
    const h = mount({ defaultOpen: true })
    click(h.item('zhejiang').item)
    click(h.item('hangzhou').item)
    expect(h.shownColumns()).toEqual([0, 1, 2])
    expect(h.shownItems(2)).toEqual(['xihu', 'yuhang'])

    // 回到第 1 列另选一个：第 2 列换成它的子节点，第 3 列（本例中已无）不再存在
    click(h.item('ningbo').item)
    expect(h.activePath()).toEqual(['zhejiang', 'ningbo'])
    expect(h.shownItems(2)).toEqual(['jiangbei'])

    // 回到第 0 列另选一个：第 1 列换内容，第 2 列整列消失
    click(h.item('jiangsu').item)
    expect(h.activePath()).toEqual(['jiangsu'])
    expect(h.shownColumns()).toEqual([0, 1])
    expect(h.shownItems(1)).toEqual(['nanjing'])
  })

  it('点叶子不开新列：空 children 的条目也是叶子', () => {
    const h = mount({ defaultOpen: true })
    click(h.item('taiwan').item)
    expect(h.shownColumns()).toEqual([0])
    expect(h.item('taiwan').item.getAttribute('aria-haspopup')).toBeNull()
    expect(h.item('taiwan').item.getAttribute('data-branch')).toBeNull()
    expect(h.item('zhejiang').item.getAttribute('aria-haspopup')).toBe('listbox')
    expect(h.item('zhejiang').item.getAttribute('data-branch')).toBe('')
  })

  it('展开路径上的条目带 data-active，被砍掉的那些一并复位', () => {
    const h = mount({ defaultOpen: true })
    click(h.item('zhejiang').item)
    expect(h.item('zhejiang').item.getAttribute('data-active')).toBe('')

    click(h.item('jiangsu').item)
    expect(h.item('zhejiang').item.getAttribute('data-active')).toBeNull()
    expect(h.item('jiangsu').item.getAttribute('data-active')).toBe('')
  })

  it('条目不带 aria-expanded：option 不收这个属性，展开与否只留在 data-active 上', () => {
    const h = mount({ defaultOpen: true })
    click(h.item('zhejiang').item)
    for (const value of ['zhejiang', 'taiwan', 'hangzhou'])
      expect(h.item(value).item.hasAttribute('aria-expanded')).toBe(false)
  })

  it('收起的列与条目只是带 hidden，作者节点一个都没被卸载', () => {
    const h = mount({ defaultOpen: true })
    expect(h.column(2).hasAttribute('hidden')).toBe(true)
    expect(h.item('xihu').item.hasAttribute('hidden')).toBe(true)
    expect(h.item('xihu').item.isConnected).toBe(true)
    click(h.item('zhejiang').item)
    click(h.item('hangzhou').item)
    expect(h.column(2).hasAttribute('hidden')).toBe(false)
    expect(h.item('xihu').item.hasAttribute('hidden')).toBe(false)
    // 同一层里不属于当前父节点的那些照样收着
    expect(h.item('nanjing').item.hasAttribute('hidden')).toBe(true)
  })

  it('收起态展开路径是空的：只有根列与它的条目露着，深层的列与条目全收着', () => {
    const h = mount({ defaultValue: ['zhejiang', 'hangzhou', 'xihu'] })
    expect(h.activePath()).toEqual([])
    expect(h.shownColumns()).toEqual([0])
    expect(h.shownItems(0)).toEqual(['zhejiang', 'jiangsu', 'taiwan', 'macau'])
    expect(h.item('hangzhou').item.hasAttribute('hidden')).toBe(true)
    expect(h.item('xihu').item.hasAttribute('hidden')).toBe(true)
  })

  it('展开时把列一路铺到选中路径上，焦点落在末项', () => {
    const h = mount({ defaultValue: ['zhejiang', 'hangzhou', 'xihu'] })
    click(h.trigger)
    expect(h.activePath()).toEqual(['zhejiang', 'hangzhou', 'xihu'])
    expect(h.focusedPath()).toEqual(['zhejiang', 'hangzhou', 'xihu'])
    expect(h.shownColumns()).toEqual([0, 1, 2])
  })

  it('选中路径过期（数据换了走不通）时退回它走得到的那一列的首项', () => {
    const h = mount({ defaultValue: ['zhejiang', 'ghost'] })
    click(h.trigger)
    expect(h.focusedPath()).toEqual(['zhejiang', 'hangzhou'])
    expect(h.activePath()).toEqual(['zhejiang', 'hangzhou'])
  })

  it('选中条目自己禁用时落点退回本列首项，展开路径跟着落点走而不是跟着选中值走', () => {
    const h = mount({ defaultValue: ['zhejiang', 'wenzhou'] })
    click(h.trigger)
    expect(h.focusedPath()).toEqual(['zhejiang', 'hangzhou'])
    expect(h.activePath()).toEqual(['zhejiang', 'hangzhou'])
  })

  it('setActivePath 直接改展开路径，不碰选中值', () => {
    const h = mount({ defaultOpen: true })
    h.api().setActivePath(['jiangsu', 'nanjing'])
    expect(h.shownColumns()).toEqual([0, 1, 2])
    expect(h.shownItems(2)).toEqual(['xuanwu'])
    expect(h.value()).toEqual([])
  })
})

describe('悬停展开', () => {
  it('expandTrigger=hover：划过条目就开子列，但不抢键盘焦点', () => {
    const h = mount({ defaultOpen: true, expandTrigger: 'hover' })
    const before = h.focusedPath()
    hover(h.item('jiangsu').item)
    expect(h.activePath()).toEqual(['jiangsu'])
    expect(h.shownItems(1)).toEqual(['nanjing'])
    expect(h.focusedPath()).toEqual(before)
  })

  it('expandTrigger=click（缺省）时划过不改变任何列', () => {
    const h = mount({ defaultOpen: true })
    click(h.item('zhejiang').item)
    hover(h.item('jiangsu').item)
    expect(h.activePath()).toEqual(['zhejiang'])
    expect(h.shownItems(1)).toEqual(['hangzhou', 'ningbo', 'wenzhou'])
  })

  it('悬停禁用条目不改列', () => {
    const h = mount({ defaultOpen: true, expandTrigger: 'hover' })
    hover(h.item('zhejiang').item)
    hover(h.item('wenzhou').item)
    expect(h.activePath()).toEqual(['zhejiang'])
  })
})

describe('键盘：列内走、进子列、回上一列', () => {
  it('上下键只在当前这一列里走，禁用条目跳过', () => {
    const h = mount({ defaultOpen: true })
    h.focusAnchor()
    expect(focusedValue()).toBe('zhejiang')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('jiangsu')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('taiwan')
    press(active(), 'End')
    expect(focusedValue()).toBe('macau')
    // loop 默认开，末项回绕到首项
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('zhejiang')
    press(active(), 'Home')
    expect(focusedValue()).toBe('zhejiang')
  })

  it('loop=false 时首尾不回绕', () => {
    const h = mount({ defaultOpen: true, loop: false })
    h.focusAnchor()
    press(active(), 'ArrowUp')
    expect(focusedValue()).toBe('zhejiang')
    expect(h.state()).toBe('open')
  })

  it('右键先把子列铺到焦点条目上，再按一次才走进去；左键退回上一列并把当前列收掉', () => {
    const h = mount({ defaultOpen: true })
    h.focusAnchor()
    expect(h.shownColumns()).toEqual([0])
    press(active(), 'ArrowRight')
    expect(focusedValue()).toBe('zhejiang')
    expect(h.activePath()).toEqual(['zhejiang'])
    expect(h.shownColumns()).toEqual([0, 1])

    press(active(), 'ArrowRight')
    expect(focusedValue()).toBe('hangzhou')
    expect(h.activePath()).toEqual(['zhejiang', 'hangzhou'])
    expect(h.shownColumns()).toEqual([0, 1, 2])

    press(active(), 'ArrowLeft')
    expect(focusedValue()).toBe('zhejiang')
    expect(h.activePath()).toEqual(['zhejiang'])
    expect(h.shownColumns()).toEqual([0, 1])
  })

  it('上下键走到别的条目时，它右边原有的列跟着换成新条目的子列', () => {
    const h = mount({ defaultOpen: true })
    h.focusAnchor()
    press(active(), 'ArrowRight')
    press(active(), 'ArrowRight')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('ningbo')
    expect(h.shownItems(2)).toEqual(['jiangbei'])
  })

  it('叶子上的右键与根列上的左键都不吞，放行给页面', () => {
    const h = mount({ defaultOpen: true })
    h.focusAnchor()
    const back = press(active(), 'ArrowLeft')
    expect(back.defaultPrevented).toBe(false)
    expect(focusedValue()).toBe('zhejiang')

    press(active(), 'ArrowDown')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('taiwan')
    const into = press(active(), 'ArrowRight')
    expect(into.defaultPrevented).toBe(false)
    expect(focusedValue()).toBe('taiwan')
  })

  it('dir=rtl 把左右键整体对调', () => {
    const h = mount({ defaultOpen: true, dir: 'rtl' })
    h.focusAnchor()
    press(active(), 'ArrowLeft')
    expect(focusedValue()).toBe('zhejiang')
    expect(h.activePath()).toEqual(['zhejiang'])
    press(active(), 'ArrowLeft')
    expect(focusedValue()).toBe('hangzhou')
    press(active(), 'ArrowRight')
    expect(focusedValue()).toBe('zhejiang')
    expect(h.activePath()).toEqual(['zhejiang'])
  })

  it('tab 收起浮层但不吞键，焦点按序列自然离开', () => {
    const h = mount({ defaultOpen: true })
    h.focusAnchor()
    const event = press(active(), 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(h.state()).toBe('closed')
  })

  it('带 Ctrl/Meta 的组合一概不归浮层管', () => {
    const h = mount({ defaultOpen: true })
    h.focusAnchor()
    const event = press(active(), 'ArrowDown', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(focusedValue()).toBe('zhejiang')
    expect(h.state()).toBe('open')
  })
})

describe('选中：叶子落值收起，分支看 changeOnSelect', () => {
  it('enter 选中叶子：落值、收起、先值后开合', () => {
    const onValueChange = vi.fn()
    const onOpenChange = vi.fn()
    const h = mount({ defaultOpen: true, onValueChange, onOpenChange })
    h.focusAnchor()
    press(active(), 'ArrowRight')
    press(active(), 'ArrowRight')
    press(active(), 'ArrowRight')
    expect(focusedValue()).toBe('xihu')

    press(active(), 'Enter')
    expect(h.value()).toEqual([['zhejiang', 'hangzhou', 'xihu']])
    expect(h.state()).toBe('closed')
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [['zhejiang', 'hangzhou', 'xihu']] })
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
  })

  it('点叶子与 Enter 同语义', () => {
    const h = mount({ defaultOpen: true })
    click(h.item('macau').item)
    expect(h.value()).toEqual([['macau']])
    expect(h.state()).toBe('closed')
  })

  it('changeOnSelect 关（缺省）：点分支只展开子列，一个值都不落，浮层也不收起', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultOpen: true, onValueChange })
    click(h.item('zhejiang').item)
    expect(h.value()).toEqual([])
    expect(onValueChange).not.toHaveBeenCalled()
    expect(h.state()).toBe('open')
    expect(h.shownColumns()).toEqual([0, 1])
  })

  it('changeOnSelect 开：点分支同时落值，但浮层仍不收起（还要接着往右挑）', () => {
    const h = mount({ defaultOpen: true, changeOnSelect: true })
    click(h.item('zhejiang').item)
    expect(h.value()).toEqual([['zhejiang']])
    expect(h.state()).toBe('open')
    expect(h.valueText.textContent).toBe('Zhejiang')

    click(h.item('hangzhou').item)
    expect(h.value()).toEqual([['zhejiang', 'hangzhou']])
    expect(h.state()).toBe('open')
  })

  it('多选：确认键切换而不是替换，浮层不收起', () => {
    const h = mount({ defaultOpen: true, multiple: true })
    click(h.item('macau').item)
    expect(h.value()).toEqual([['macau']])
    expect(h.state()).toBe('open')
    click(h.item('taiwan').item)
    expect(h.value()).toEqual([['macau'], ['taiwan']])
    // 再点一次就取消掉
    click(h.item('macau').item)
    expect(h.value()).toEqual([['taiwan']])
    expect(h.column(0).getAttribute('aria-multiselectable')).toBe('true')
  })

  it('选中的是整条路径而不是末项：同名末项落在别的路径上不算选中', () => {
    const h = mount({ defaultValue: ['zhejiang', 'hangzhou'] })
    expect(h.api().isSelected('hangzhou')).toBe(true)
    expect(h.api().isSelected('ningbo')).toBe(false)
    expect(h.item('hangzhou').item.getAttribute('aria-selected')).toBe('true')
    expect(h.item('ningbo').item.getAttribute('aria-selected')).toBe('false')
  })

  it('受控 value：点条目只发意图不自改选中态，宿主写回后才切换', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultOpen: true, value: ['macau'], onValueChange })
    click(h.item('taiwan').item)
    expect(h.value()).toEqual([['macau']])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [['taiwan']] })

    h.setProps({ value: ['taiwan'] })
    expect(h.value()).toEqual([['taiwan']])
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })
})

describe('禁用、只读与清空', () => {
  it('禁用条目点不动，但它仍带 aria-disabled、绝不输出原生 disabled，也仍可聚焦', () => {
    const h = mount({ defaultOpen: true, changeOnSelect: true })
    click(h.item('zhejiang').item)
    const wenzhou = h.item('wenzhou').item
    expect(wenzhou.getAttribute('aria-disabled')).toBe('true')
    expect(wenzhou.hasAttribute('disabled')).toBe(false)
    expect(wenzhou.getAttribute('tabindex')).toBe('-1')

    const before = h.value()
    click(wenzhou)
    expect(h.value()).toEqual(before)

    // 焦点是事实不是许可：停上去之后方向键从它起步
    wenzhou.focus()
    expect(h.focusedPath()).toEqual(['zhejiang', 'wenzhou'])
    press(active(), 'ArrowUp')
    expect(focusedValue()).toBe('ningbo')
  })

  it('整控件禁用：trigger 用原生 disabled，浮层展不开，条目一律 aria-disabled', () => {
    const h = mount({ disabled: true, defaultValue: ['macau'] })
    expect(h.trigger.hasAttribute('disabled')).toBe(true)
    // 原生 disabled 的按钮上 click() 会被激活行为短路，手工派一次才碰得到守卫
    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(h.item('macau').item.getAttribute('aria-disabled')).toBe('true')
    expect(h.clear.hasAttribute('disabled')).toBe(true)
  })

  it('只读：浮层照常展开、列照常浏览，但选中值改不动、也清不掉', () => {
    const h = mount({ readOnly: true, defaultValue: ['macau'] })
    click(h.trigger)
    expect(h.state()).toBe('open')
    expect(h.trigger.getAttribute('aria-readonly')).toBe('true')
    click(h.item('taiwan').item)
    expect(h.value()).toEqual([['macau']])
    expect(h.clear.hasAttribute('disabled')).toBe(true)
    // 浏览不受影响
    press(active(), 'ArrowRight')
    expect(h.shownColumns()).toEqual([0])
  })

  it('清空按钮：按下不把焦点从 trigger 挪走，清完值归零、按钮自己也就按不动了', () => {
    const h = mount({ defaultValue: ['zhejiang', 'hangzhou'], placeholder: '请选择' })
    expect(h.clear.hasAttribute('disabled')).toBe(false)
    const down = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
    h.clear.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)

    click(h.clear)
    expect(h.value()).toEqual([])
    expect(h.valueText.textContent).toBe('请选择')
    expect(h.clear.hasAttribute('disabled')).toBe(true)
    expect(document.activeElement).toBe(h.trigger)
  })
})

describe('roving tabindex 与 ARIA 骨架', () => {
  it('收起态整个控件只剩 trigger 一个入口；展开后恰好一个条目认领 Tab 位', () => {
    const h = mount()
    expect(h.tabStops()).toEqual([])
    click(h.trigger)
    expect(h.tabStops()).toEqual(['item'])
    expect(h.item('zhejiang').item.getAttribute('tabindex')).toBe('0')
    expect(h.item('jiangsu').item.getAttribute('tabindex')).toBe('-1')
  })

  it('数据空到一个条目都没有时，由 content 兜底进 Tab 序列', () => {
    const h = mount({ collection: [], defaultOpen: true })
    expect(h.focusedPath()).toBeNull()
    expect(h.content.getAttribute('tabindex')).toBe('0')
  })

  it('持有焦点的条目被移出 DOM：锚点重挑，Tab 位不会一个都不剩', () => {
    const h = mount({ defaultOpen: true })
    expect(h.focusedPath()).toEqual(['zhejiang'])
    h.removeItem('zhejiang')
    h.send({ type: 'ITEM.LOST' })
    expect(h.focusedPath()).toEqual(['zhejiang'])
    // 条目没了但锚点仍指得回 collection：换一份没有它的数据，锚点才真的挪走
    h.setProps({ collection: COLLECTION.slice(1) })
    h.send({ type: 'ITEM.LOST' })
    expect(h.focusedPath()).toEqual(['jiangsu'])
  })

  it('列是 listbox、条目是 option，层号与 id 都产出得出来', () => {
    const h = mount({ defaultOpen: true })
    click(h.item('zhejiang').item)
    expect(h.column(0).getAttribute('role')).toBe('listbox')
    expect(h.column(0).getAttribute('aria-orientation')).toBe('vertical')
    expect(h.column(0).getAttribute('aria-multiselectable')).toBe('false')
    expect(h.column(0).getAttribute('data-level')).toBe('0')
    expect(h.item('zhejiang').item.getAttribute('role')).toBe('option')
    expect(h.item('xihu').item.getAttribute('data-level')).toBe('2')
    // 子列的名字取展开它的那个条目，读屏才播报得出「浙江，列表」
    expect(h.column(1).getAttribute('aria-labelledby')).toBe(h.item('zhejiang').item.getAttribute('id'))
    expect(h.column(0).getAttribute('aria-labelledby')).not.toBe(h.column(1).getAttribute('aria-labelledby'))
  })

  it('trigger 扮演 combobox，名字取标题加当前值', () => {
    const h = mount()
    expect(h.trigger.getAttribute('role')).toBe('combobox')
    expect(h.trigger.getAttribute('aria-haspopup')).toBe('listbox')
    expect(h.trigger.getAttribute('aria-controls')).toBe(h.content.getAttribute('id'))
    expect(h.trigger.getAttribute('aria-labelledby'))
      .toBe(`${h.trigger.getAttribute('aria-labelledby')!.split(' ')[0]} ${h.valueText.getAttribute('id')}`)
  })

  it('条目一系共用同一份状态标记，样式层各处对得上', () => {
    const h = mount({ defaultOpen: true, defaultValue: ['macau'] })
    const macau = h.item('macau')
    expect(macau.item.getAttribute('data-selected')).toBe('')
    expect(macau.text.getAttribute('data-selected')).toBe('')
    expect(macau.indicator.getAttribute('data-selected')).toBe('')
    expect(macau.indicator.getAttribute('aria-hidden')).toBe('true')
  })
})
