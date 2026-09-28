/**
 * 工具条的溢出收纳：放不下的条目按次序收进行尾「更多」钮弹出的菜单。
 * 收纳由挂载后的量测决定，jsdom 没有排版，这里把几何量逐个伪造成一排定宽的格子。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/core'
import type { ToolbarItemProps, ToolbarSchema } from '../src/toolbar/index'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectToolbar, toolbarMachine, toolbarOverflowMenuProps } from '../src/toolbar/index'

type Props = ToolbarSchema['props']

/** 结构描述：条目、分隔线与分组，末尾可带「更多」钮。 */
type Node
  = | { kind: 'item', value: string, disabled?: boolean, attrs?: Record<string, string>, text?: string }
    | { kind: 'separator' }
    | { kind: 'group', children: readonly { value: string, attrs?: Record<string, string>, text?: string }[] }

const listeners = new WeakMap<Element, Map<string, EventListener>>()
const written = new WeakMap<Element, Set<string>>()

/**
 * 把 connect 产出打到真实节点上（适配器 spread 的最小复刻），可重复调用以模拟重渲染。
 * 与适配器一样只撤自己写过的属性：作者写在条目上的 hidden 不归连接层管。
 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  let bound = listeners.get(el)
  if (!bound) {
    bound = new Map()
    listeners.set(el, bound)
  }
  let mine = written.get(el)
  if (!mine) {
    mine = new Set()
    written.set(el, mine)
  }
  for (const [key, value] of Object.entries(props)) {
    const isEvent = key.startsWith('on') && key.length > 2 && key[2]! >= 'A' && key[2]! <= 'Z'
    if (isEvent) {
      const name = key.slice(2).toLowerCase()
      const prev = bound.get(name)
      if (prev)
        el.removeEventListener(name, prev)
      if (typeof value === 'function') {
        el.addEventListener(name, value as EventListener)
        bound.set(name, value as EventListener)
      }
      continue
    }
    if (value === undefined || value === null || value === false) {
      if (mine.delete(key))
        el.removeAttribute(key)
      continue
    }
    mine.add(key)
    el.setAttribute(key, value === true ? '' : String(value))
  }
}

const ITEM = 40
const TRIGGER = 32

/**
 * 伪造一排横排格子：露着的条目与「更多」钮按文档序从行首排开，条目宽 40、钮宽 32，
 * 分隔线与分组不占宽度；root 的宽度由 width() 现读，改了它再派一次 resize 即模拟容器变宽变窄。
 */
function fakeRow(root: HTMLElement, width: () => number): void {
  const flow = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[data-part="item"], [data-part="overflow-trigger"]')]
    .filter(el => !el.hidden)
  const sizeOf = (el: HTMLElement): number => (el.dataset.part === 'overflow-trigger' ? TRIGGER : ITEM)
  const box = (el: HTMLElement): { start: number, size: number } | null => {
    if (el.hidden)
      return null
    let start = 0
    for (const other of flow()) {
      if (other === el)
        break
      start += sizeOf(other)
    }
    return { start, size: sizeOf(el) }
  }
  const stub = (el: HTMLElement, get: () => { start: number, size: number } | null): void => {
    Object.defineProperty(el, 'offsetWidth', { configurable: true, get: () => get()?.size ?? 0 })
    Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => (get() ? 32 : 0) })
    el.getBoundingClientRect = () => {
      const b = get()
      const left = b?.start ?? 0
      const w = b?.size ?? 0
      return { left, right: left + w, top: 0, bottom: 32, width: w, height: 32, x: left, y: 0, toJSON: () => ({}) } as DOMRect
    }
  }
  for (const el of root.querySelectorAll<HTMLElement>('button'))
    stub(el, () => box(el))
  stub(root, () => ({ start: 0, size: width() }))
  Object.defineProperty(root, 'clientWidth', { configurable: true, get: () => width() })
}

interface Toolbar {
  service: Service<ToolbarSchema>
  root: HTMLElement
  items: HTMLElement[]
  trigger: HTMLElement
  render: () => void
  setWidth: (next: number) => void
}

function mountToolbar(nodes: readonly Node[], props: Props = {}, initialWidth = 1000): Toolbar {
  let width = initialWidth
  const runtime = createVanillaRuntime()
  const service = createService(toolbarMachine, { props: () => props, runtime })
  const root = document.createElement('div')
  const items: HTMLElement[] = []
  const declared: ToolbarItemProps[] = []
  const groups: HTMLElement[] = []
  const separators: HTMLElement[] = []
  const addItem = (parent: HTMLElement, item: { value: string, disabled?: boolean, attrs?: Record<string, string>, text?: string }): void => {
    const el = document.createElement('button')
    for (const [k, v] of Object.entries(item.attrs ?? {}))
      el.setAttribute(k, v)
    el.textContent = item.text ?? item.value
    parent.append(el)
    items.push(el)
    declared.push({ value: item.value, disabled: item.disabled })
  }
  for (const node of nodes) {
    if (node.kind === 'item') {
      addItem(root, node)
    }
    else if (node.kind === 'separator') {
      const el = document.createElement('div')
      root.append(el)
      separators.push(el)
    }
    else {
      const group = document.createElement('div')
      root.append(group)
      groups.push(group)
      for (const child of node.children)
        addItem(group, child)
    }
  }
  const trigger = document.createElement('button')
  root.append(trigger)
  document.body.append(root)

  const render = (): void => {
    const api = connectToolbar(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    for (const el of groups) spread(el, api.getGroupProps() as Record<string, unknown>)
    for (const el of separators) spread(el, api.getSeparatorProps() as Record<string, unknown>)
    declared.forEach((item, i) => spread(items[i]!, api.getItemProps(item) as Record<string, unknown>))
    spread(trigger, api.getOverflowTriggerProps() as Record<string, unknown>)
  }
  render()
  fakeRow(root, () => width)
  service.refs.set('getRootEl', () => root)
  runtime.subscribe(render)
  runtime.start()
  render()
  return {
    service,
    root,
    items,
    trigger,
    render,
    setWidth: (next) => {
      width = next
    },
  }
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

async function resize(bar: Toolbar, width: number): Promise<void> {
  bar.setWidth(width)
  window.dispatchEvent(new Event('resize'))
  await nextFrame()
  bar.render()
}

function press(bar: Toolbar, key: string): boolean {
  const target = (document.activeElement as HTMLElement | null) ?? bar.root
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  bar.render()
  return event.defaultPrevented
}

const FOUR: readonly Node[] = [
  { kind: 'item', value: 'a' },
  { kind: 'item', value: 'b' },
  { kind: 'item', value: 'c' },
  { kind: 'item', value: 'd' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

describe('toolbar 溢出收纳', () => {
  it('放得下时一个不收，「更多」钮收着', () => {
    const bar = mountToolbar(FOUR, {}, 200)
    expect(bar.service.context.get('overflowItems')).toEqual([])
    expect(bar.items.map(el => el.hidden)).toEqual([false, false, false, false])
    expect(bar.trigger.hidden).toBe(true)
  })

  it('放不下时按次序从尾部收：给「更多」钮让出行尾，放得下几个露几个', () => {
    // 4 × 40 = 160 放不进 130；让出钮的 32 后剩 98，前两个（到 80）放得下
    const bar = mountToolbar(FOUR, {}, 130)
    expect(bar.service.context.get('overflowItems').map(item => item.value)).toEqual(['c', 'd'])
    expect(bar.items.map(el => el.hidden)).toEqual([false, false, true, true])
    expect(bar.trigger.hidden).toBe(false)
    expect(connectToolbar(bar.service, normalizeProps).overflowItems.map(item => item.value)).toEqual(['c', 'd'])
  })

  it('容器变宽变窄都重量：变宽后收起的条目放回来，钮随之收起', async () => {
    const bar = mountToolbar(FOUR, {}, 130)
    await resize(bar, 90)
    // 让出钮后剩 58，只放得下第一个
    expect(bar.items.map(el => el.hidden)).toEqual([false, true, true, true])
    await resize(bar, 170)
    expect(bar.items.map(el => el.hidden)).toEqual([false, false, false, false])
    expect(bar.trigger.hidden).toBe(true)
  })

  it('没放「更多」钮就不收：条目照常排开，由皮肤折行', () => {
    const bar = mountToolbar(FOUR, {}, 60)
    bar.trigger.remove()
    window.dispatchEvent(new Event('resize'))
    return nextFrame().then(() => {
      bar.render()
      expect(bar.service.context.get('overflowItems')).toEqual([])
      expect(bar.items.every(el => !el.hidden)).toBe(true)
    })
  })

  it('作者自己藏起来的条目不参与收纳，也不会被放出来', () => {
    const bar = mountToolbar([
      { kind: 'item', value: 'a' },
      { kind: 'item', value: 'b', attrs: { hidden: '' } },
      { kind: 'item', value: 'c' },
    ], {}, 90)
    // 露着的只有 a、c，两格 80 放得进 90
    expect(bar.service.context.get('overflowItems')).toEqual([])
    expect(bar.items[1]!.hidden).toBe(true)
  })
})

describe('toolbar 「更多」菜单的条目', () => {
  it('菜单文字按可及名取：aria-label、aria-labelledby、条目文字', () => {
    const label = document.createElement('span')
    label.id = 'outside-label'
    label.textContent = '居中对齐'
    document.body.append(label)
    const bar = mountToolbar([
      { kind: 'item', value: 'a' },
      { kind: 'item', value: 'bold', attrs: { 'aria-label': '加粗' }, text: 'B' },
      { kind: 'item', value: 'center', attrs: { 'aria-labelledby': 'outside-label' } },
      { kind: 'item', value: 'copy', text: '  复制\n  ' },
    ], {}, 80)
    expect(bar.service.context.get('overflowItems').map(item => item.label)).toEqual(['加粗', '居中对齐', '复制'])
  })

  it('写了 aria-pressed 的条目是开关：菜单里是勾选项，勾没勾随按下态；禁用照搬', () => {
    const bar = mountToolbar([
      { kind: 'item', value: 'a' },
      { kind: 'item', value: 'bold', attrs: { 'aria-pressed': 'true' } },
      { kind: 'item', value: 'italic', attrs: { 'aria-pressed': 'false' } },
      { kind: 'item', value: 'copy', disabled: true },
    ], {}, 80)
    const menu = toolbarOverflowMenuProps(bar.service)
    expect(menu.collection).toEqual([
      { value: 'bold', label: 'bold', disabled: false, kind: 'checkbox', separatorBefore: false, closeOnSelect: true },
      { value: 'italic', label: 'italic', disabled: false, kind: 'checkbox', separatorBefore: false, closeOnSelect: true },
      { value: 'copy', label: 'copy', disabled: true, kind: 'item', separatorBefore: false, closeOnSelect: true },
    ])
    expect(menu.checkboxValue).toEqual(['bold'])
  })

  it('分组与分隔线在菜单里画成分隔线：跨段的相邻两项之间才有', () => {
    const bar = mountToolbar([
      { kind: 'item', value: 'a' },
      { kind: 'group', children: [{ value: 'b' }, { value: 'c' }] },
      { kind: 'separator' },
      { kind: 'item', value: 'd' },
      { kind: 'item', value: 'e' },
    ], {}, 80)
    const items = bar.service.context.get('overflowItems')
    expect(items.map(item => [item.value, item.separatorBefore])).toEqual([
      ['b', false],
      ['c', false],
      ['d', true],
      ['e', false],
    ])
  })

  it('菜单落位：横排贴钮下方与结束缘对齐，竖排贴侧面、rtl 换到另一侧；整条禁用时菜单也禁用', () => {
    expect(toolbarOverflowMenuProps(mountToolbar(FOUR).service).placement).toBe('bottom-end')
    expect(toolbarOverflowMenuProps(mountToolbar(FOUR, { orientation: 'vertical' }).service).placement).toBe('right-end')
    expect(toolbarOverflowMenuProps(mountToolbar(FOUR, { orientation: 'vertical', dir: 'rtl' }).service).placement).toBe('left-end')
    expect(toolbarOverflowMenuProps(mountToolbar(FOUR, { disabled: true, size: 'sm' }).service)).toMatchObject({ disabled: true, size: 'sm' })
  })

  it('一个都没收时菜单受控关着，有收起的条目才交回菜单自己开合', async () => {
    const bar = mountToolbar(FOUR, {}, 130)
    expect(toolbarOverflowMenuProps(bar.service).open).toBeUndefined()
    await resize(bar, 400)
    expect(bar.service.context.get('overflowItems')).toEqual([])
    expect(toolbarOverflowMenuProps(bar.service).open).toBe(false)
  })

  it('菜单里选中一项：替收起的条目触发它自己的点击', () => {
    const bar = mountToolbar(FOUR, {}, 130)
    const onClick = vi.fn()
    bar.items[3]!.addEventListener('click', onClick)
    toolbarOverflowMenuProps(bar.service).onSelect?.({ value: 'd' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('toolbar 「更多」钮', () => {
  it('钮接 Action Control 的 icon 档、ghost 形态，与条目同档；可及名缺省 More，可由 translations 换', () => {
    const bar = mountToolbar(FOUR, { size: 'lg' }, 130)
    const props = connectToolbar(bar.service, normalizeProps).getOverflowTriggerProps() as Record<string, unknown>
    expect(props).toMatchObject({
      'data-scope': 'toolbar',
      'data-part': 'overflow-trigger',
      'type': 'button',
      'aria-label': 'More',
      'aria-disabled': 'false',
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-size': 'lg',
      'tabindex': -1,
    })
    expect(props.hidden).toBeUndefined()
    const named = mountToolbar(FOUR, { translations: { overflowTrigger: '更多操作' } })
    expect((connectToolbar(named.service, normalizeProps).getOverflowTriggerProps() as Record<string, unknown>)['aria-label']).toBe('更多操作')
  })

  it('方向键把「更多」钮当最后一站：跳过收起的条目，End 落到钮上，尽头回绕', () => {
    const bar = mountToolbar(FOUR, {}, 130)
    bar.items[1]!.focus()
    bar.render()
    expect(press(bar, 'ArrowRight')).toBe(true)
    expect(document.activeElement).toBe(bar.trigger)
    expect(bar.service.context.get('overflowTriggerFocused')).toBe(true)
    // 钮拿着焦点时它占 Tab 位，条目与容器都让出
    expect(bar.trigger.getAttribute('tabindex')).toBe('0')
    expect(bar.root.getAttribute('tabindex')).toBe('-1')
    expect(bar.items.map(el => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '-1'])
    expect(press(bar, 'ArrowRight')).toBe(true)
    expect(document.activeElement).toBe(bar.items[0])
    expect(press(bar, 'ArrowLeft')).toBe(true)
    expect(document.activeElement).toBe(bar.trigger)
    expect(press(bar, 'ArrowLeft')).toBe(true)
    expect(document.activeElement).toBe(bar.items[1])
    expect(press(bar, 'End')).toBe(true)
    expect(document.activeElement).toBe(bar.trigger)
    expect(press(bar, 'Home')).toBe(true)
    expect(document.activeElement).toBe(bar.items[0])
  })

  it('条目已经处理过的键不再走位：菜单触发器用上下键展开菜单时，工具条放过它', () => {
    const bar = mountToolbar(FOUR, {}, 1000)
    bar.items[0]!.addEventListener('keydown', event => event.preventDefault())
    bar.items[0]!.focus()
    bar.render()
    press(bar, 'ArrowRight')
    expect(document.activeElement).toBe(bar.items[0])
  })

  it('竖排：钮上的上下键归工具条走位，并拦下事件，菜单触发器不再拿它展开', () => {
    const bar = mountToolbar(FOUR, { orientation: 'vertical' }, 130)
    // 竖排量的是块向：把伪造的横排格子换成竖排
    for (const el of [bar.root, ...bar.items, bar.trigger]) {
      const rect = el.getBoundingClientRect.bind(el)
      const width = Object.getOwnPropertyDescriptor(el, 'offsetWidth')!.get!.bind(el)
      Object.defineProperty(el, 'offsetHeight', { configurable: true, get: width })
      el.getBoundingClientRect = () => {
        const r = rect()
        return { ...r, top: r.left, bottom: r.right, height: r.width, width: 32 } as DOMRect
      }
    }
    Object.defineProperty(bar.root, 'clientHeight', { configurable: true, get: () => 130 })
    window.dispatchEvent(new Event('resize'))
    return nextFrame().then(() => {
      bar.render()
      expect(bar.trigger.hidden).toBe(false)
      bar.trigger.focus()
      bar.render()
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
      bar.trigger.dispatchEvent(event)
      bar.render()
      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(bar.items[1])
    })
  })

  it('焦点所在的条目被收进菜单时，焦点交给「更多」钮', async () => {
    const bar = mountToolbar(FOUR, {}, 200)
    bar.items[3]!.focus()
    bar.render()
    await resize(bar, 130)
    await Promise.resolve()
    bar.render()
    expect(bar.items[3]!.hidden).toBe(true)
    expect(document.activeElement).toBe(bar.trigger)
    expect(bar.service.context.get('overflowTriggerFocused')).toBe(true)
  })

  it('焦点离开整条后锚点清空，容器重新认领 Tab 位', () => {
    const bar = mountToolbar(FOUR, {}, 130)
    bar.trigger.focus()
    bar.render()
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    bar.root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: outside }))
    bar.render()
    expect(bar.service.context.get('overflowTriggerFocused')).toBe(false)
    expect(bar.root.getAttribute('tabindex')).toBe('0')
    expect(bar.trigger.getAttribute('tabindex')).toBe('-1')
  })
})
