/**
 * 键盘导航要真实的活 DOM：条目集合是在事件那一刻现查的，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/machine'
import type { ToolbarItemProps, ToolbarSchema } from '../src/toolbar/index'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectToolbar, toolbarMachine } from '../src/toolbar/index'

type Props = ToolbarSchema['props']

interface Harness {
  service: Service<ToolbarSchema>
  /** 模拟宿主写回 props（运行期改配置）。 */
  setProps: (next: Props) => void
}

function makeService(initial: Props = {}): Harness {
  // props 对象身份固定、字段可改：解释器按身份缓存归一化结果，改字段即被下一次 prop() 读到
  const props: Props = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(toolbarMachine, { props: () => props, runtime })
  runtime.start()
  return { service, setProps: next => Object.assign(props, next) }
}

function api(service: Service<ToolbarSchema>) {
  return connectToolbar(service, normalizeProps)
}

function rootProps(service: Service<ToolbarSchema>): Record<string, unknown> {
  return api(service).getRootProps() as Record<string, unknown>
}

function itemProps(service: Service<ToolbarSchema>, item: ToolbarItemProps): Record<string, unknown> {
  return api(service).getItemProps(item) as Record<string, unknown>
}

describe('toolbarMachine 焦点锚点', () => {
  it('初始无锚点；聚焦条目记下，离场清空', () => {
    const { service } = makeService()
    // cell 初值走 defaultValue，connect 侧再归一成 null；锚点判据两者都收
    expect(api(service).focusedValue).toBeNull()
    service.send({ type: 'ITEM.FOCUS', value: 'bold' })
    expect(service.context.get('focusedValue')).toBe('bold')
    service.send({ type: 'ITEM.FOCUS', value: 'italic' })
    expect(service.context.get('focusedValue')).toBe('italic')
    service.send({ type: 'TOOLBAR.BLUR' })
    expect(service.context.get('focusedValue')).toBeNull()
  })

  it('锚点没变就不必重复上报：同一个值送两次仍是同一个锚点', () => {
    const { service } = makeService()
    service.send({ type: 'ITEM.FOCUS', value: 'bold' })
    service.send({ type: 'ITEM.FOCUS', value: 'bold' })
    expect(service.context.get('focusedValue')).toBe('bold')
    // 焦点离场后再离场一次不会把机器送进别的状态
    service.send({ type: 'TOOLBAR.BLUR' })
    service.send({ type: 'TOOLBAR.BLUR' })
    expect(service.context.get('focusedValue')).toBeNull()
    expect(service.getStatus()).toBe('Started')
  })
})

describe('connectToolbar ARIA', () => {
  it('root：role=toolbar 带 aria-orientation，aria-disabled 显式给 false', () => {
    const { service } = makeService()
    const root = rootProps(service)
    expect(root.role).toBe('toolbar')
    expect(root['aria-orientation']).toBe('horizontal')
    // 显式 false 是"明确说了没禁用"，省略只是"没说"
    expect(root['aria-disabled']).toBe('false')
    expect(root['data-orientation']).toBe('horizontal')
    expect(root['data-disabled']).toBeUndefined()
  })

  it('orientation=vertical：aria-orientation 与 data-orientation 一并跟着换', () => {
    const { service } = makeService({ orientation: 'vertical' })
    const root = rootProps(service)
    expect(root['aria-orientation']).toBe('vertical')
    expect(root['data-orientation']).toBe('vertical')
  })

  it('整条禁用：root 打 aria-disabled=true 与 data-disabled，条目全部转禁用', () => {
    const { service } = makeService({ disabled: true })
    const root = rootProps(service)
    expect(root['aria-disabled']).toBe('true')
    expect(root['data-disabled']).toBe('')
    const item = itemProps(service, { value: 'bold' })
    expect(item['aria-disabled']).toBe('true')
    expect(item['data-disabled']).toBe('')
  })

  it('整条禁用时容器退出 Tab 序列：进去了方向键也不响应，那就是个死停靠点', () => {
    expect(rootProps(makeService({ disabled: true }).service).tabindex).toBeUndefined()
    // 没禁用时照旧兜底
    expect(rootProps(makeService().service).tabindex).toBe(0)
  })

  it('group：role=group 且不给 aria-orientation（它不在 group 的支持列表里）', () => {
    const { service } = makeService({ orientation: 'vertical' })
    const group = api(service).getGroupProps() as Record<string, unknown>
    expect(group.role).toBe('group')
    expect(group['aria-orientation']).toBeUndefined()
    // 排布信息只走 data-*
    expect(group['data-orientation']).toBe('vertical')
  })

  it('separator：朝向恒与主轴垂直，aria 与 data 两路一致', () => {
    const across = makeService({ orientation: 'horizontal' })
    const sepH = api(across.service).getSeparatorProps() as Record<string, unknown>
    expect(sepH.role).toBe('separator')
    // 横排工具条里的分隔线是竖线
    expect(sepH['aria-orientation']).toBe('vertical')
    expect(sepH['data-orientation']).toBe('vertical')
    expect(api(across.service).separatorOrientation).toBe('vertical')

    const down = makeService({ orientation: 'vertical' })
    const sepV = api(down.service).getSeparatorProps() as Record<string, unknown>
    expect(sepV['aria-orientation']).toBe('horizontal')
    expect(sepV['data-orientation']).toBe('horizontal')
  })

  it('条目：aria-disabled 显式，绝不输出原生 disabled，也绝不覆盖 role', () => {
    const { service } = makeService()
    const plain = itemProps(service, { value: 'bold' })
    expect(plain['aria-disabled']).toBe('false')
    expect(plain['data-disabled']).toBeUndefined()
    expect(plain['data-value']).toBe('bold')
    // 条目是作者自己的控件，角色与按下态归它自己
    expect(plain.role).toBeUndefined()

    const off = itemProps(service, { value: 'italic', disabled: true })
    expect(off['aria-disabled']).toBe('true')
    expect(off['data-disabled']).toBe('')
    // 原生 disabled 不可聚焦、也不派 click，禁用条目就当不成方向键起点
    expect(off.disabled).toBeUndefined()
  })
})

describe('connectToolbar roving tabindex', () => {
  it('焦点在条外：条目全 -1，容器兜底 0', () => {
    const { service } = makeService()
    expect(rootProps(service).tabindex).toBe(0)
    expect(itemProps(service, { value: 'bold' }).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'italic' }).tabindex).toBe(-1)
  })

  it('焦点在条内：锚点条目占 0，容器让位让 Tab 能离开本条', () => {
    const { service } = makeService()
    service.send({ type: 'ITEM.FOCUS', value: 'italic' })
    expect(rootProps(service).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'bold' }).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'italic' }).tabindex).toBe(0)
  })

  it('禁用条目照样能当锚点：它仍要可聚焦、仍是方向键的起点', () => {
    const { service } = makeService()
    service.send({ type: 'ITEM.FOCUS', value: 'italic' })
    const off = itemProps(service, { value: 'italic', disabled: true })
    expect(off.tabindex).toBe(0)
    expect(off['aria-disabled']).toBe('true')
  })

  it('锚点条目被删后 Tab 位归还容器：适配器上报离场，否则整条键盘不可达', () => {
    const { service } = makeService()
    service.send({ type: 'ITEM.FOCUS', value: 'gone' })
    // 锚点指着一个不存在的条目，此刻没有任何条目认领 0，容器也已让位——这是必须补救的窗口
    expect(rootProps(service).tabindex).toBe(-1)
    service.send({ type: 'TOOLBAR.BLUR' })
    expect(rootProps(service).tabindex).toBe(0)
  })
})

// ── 键盘导航：需要活 DOM，条目集合是在事件那一刻现查的 ──

const listeners = new WeakMap<Element, Map<string, EventListener>>()

/** 把 connect 产出打到真实节点上（适配器 spread 的最小复刻），可重复调用以模拟重渲染。 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  let bound = listeners.get(el)
  if (!bound) {
    bound = new Map()
    listeners.set(el, bound)
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
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(value))
  }
}

/** 结构描述：工具条里除条目外还夹着分隔线与分组，导航必须原样跨过它们。 */
type Node
  = | { kind: 'item', value: string, disabled?: boolean }
    | { kind: 'separator' }
    | { kind: 'group', children: readonly { value: string, disabled?: boolean }[] }

interface Toolbar {
  root: HTMLElement
  items: HTMLElement[]
  /** 重新求值 connect 并打回节点上，等价于宿主的一次重渲染。 */
  render: () => void
  /** 当前持有焦点的条目下标，-1 表示焦点不在任何条目上。 */
  focusedIndex: () => number
}

function mountToolbar(service: Service<ToolbarSchema>, nodes: readonly Node[]): Toolbar {
  const root = document.createElement('div')
  const items: HTMLElement[] = []
  const declared: ToolbarItemProps[] = []
  const groups: HTMLElement[] = []
  const separators: HTMLElement[] = []

  const addItem = (parent: HTMLElement, item: ToolbarItemProps): void => {
    const el = document.createElement('button')
    parent.appendChild(el)
    items.push(el)
    declared.push(item)
  }

  for (const node of nodes) {
    if (node.kind === 'item') {
      addItem(root, { value: node.value, disabled: node.disabled })
      continue
    }
    if (node.kind === 'separator') {
      const el = document.createElement('div')
      root.appendChild(el)
      separators.push(el)
      continue
    }
    const group = document.createElement('div')
    root.appendChild(group)
    groups.push(group)
    for (const child of node.children)
      addItem(group, { value: child.value, disabled: child.disabled })
  }
  document.body.appendChild(root)

  const render = (): void => {
    const a = api(service)
    spread(root, a.getRootProps() as Record<string, unknown>)
    for (const el of groups) spread(el, a.getGroupProps() as Record<string, unknown>)
    for (const el of separators) spread(el, a.getSeparatorProps() as Record<string, unknown>)
    declared.forEach((item, i) => spread(items[i]!, a.getItemProps(item) as Record<string, unknown>))
  }
  render()
  return {
    root,
    items,
    render,
    focusedIndex: () => items.indexOf(document.activeElement as HTMLElement),
  }
}

/** 派一次真实按键并重渲染，返回事件是否被拦下（拦下 = 这个键归导航管）。 */
function press(bar: Toolbar, key: string, init: KeyboardEventInit = {}): boolean {
  const target = (document.activeElement as HTMLElement | null) ?? bar.root
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  bar.render()
  return event.defaultPrevented
}

afterEach(() => {
  document.body.innerHTML = ''
})

const BAR: readonly Node[] = [
  { kind: 'item', value: 'bold' },
  { kind: 'item', value: 'italic', disabled: true },
  { kind: 'item', value: 'underline' },
]

describe('connectToolbar 方向键沿主轴走', () => {
  it('横排只收左右键：跳过禁用条目，尽头回绕', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    bar.items[0]!.focus()
    bar.render()

    expect(press(bar, 'ArrowRight')).toBe(true)
    // 禁用的 italic 被跳过
    expect(bar.focusedIndex()).toBe(2)
    expect(service.context.get('focusedValue')).toBe('underline')
    // 尽头回绕
    expect(press(bar, 'ArrowRight')).toBe(true)
    expect(bar.focusedIndex()).toBe(0)
    expect(press(bar, 'ArrowLeft')).toBe(true)
    expect(bar.focusedIndex()).toBe(2)
  })

  it('横排里的上下键原样放行：页面滚动与读屏还要用', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    bar.items[0]!.focus()
    bar.render()
    expect(press(bar, 'ArrowDown')).toBe(false)
    expect(bar.focusedIndex()).toBe(0)
    expect(press(bar, 'ArrowUp')).toBe(false)
    expect(bar.focusedIndex()).toBe(0)
  })

  it('竖排只收上下键，左右键原样放行', () => {
    const { service } = makeService({ orientation: 'vertical' })
    const bar = mountToolbar(service, BAR)
    bar.items[0]!.focus()
    bar.render()

    expect(press(bar, 'ArrowDown')).toBe(true)
    expect(bar.focusedIndex()).toBe(2)
    expect(press(bar, 'ArrowUp')).toBe(true)
    expect(bar.focusedIndex()).toBe(0)
    expect(press(bar, 'ArrowRight')).toBe(false)
    expect(bar.focusedIndex()).toBe(0)
    expect(press(bar, 'ArrowLeft')).toBe(false)
    expect(bar.focusedIndex()).toBe(0)
  })

  it('home / End 到端点，禁用条目不当端点', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, [
      { kind: 'item', value: 'a', disabled: true },
      { kind: 'item', value: 'b' },
      { kind: 'item', value: 'c' },
      { kind: 'item', value: 'd', disabled: true },
    ])
    bar.items[1]!.focus()
    bar.render()
    expect(press(bar, 'End')).toBe(true)
    expect(bar.focusedIndex()).toBe(2)
    expect(press(bar, 'Home')).toBe(true)
    expect(bar.focusedIndex()).toBe(1)
  })

  it('loop=false：撞到尽头停在原地，不回绕也不空跳', () => {
    const { service } = makeService({ loop: false })
    const bar = mountToolbar(service, BAR)
    bar.items[2]!.focus()
    bar.render()
    press(bar, 'ArrowRight')
    expect(bar.focusedIndex()).toBe(2)
    press(bar, 'ArrowLeft')
    expect(bar.focusedIndex()).toBe(0)
    press(bar, 'ArrowLeft')
    expect(bar.focusedIndex()).toBe(0)
  })

  it('dir=rtl：水平主轴上左右键语义对调', () => {
    const { service } = makeService({ dir: 'rtl' })
    const bar = mountToolbar(service, [
      { kind: 'item', value: 'a' },
      { kind: 'item', value: 'b' },
      { kind: 'item', value: 'c' },
    ])
    bar.items[1]!.focus()
    bar.render()
    expect(press(bar, 'ArrowLeft')).toBe(true)
    expect(bar.focusedIndex()).toBe(2)
    expect(press(bar, 'ArrowRight')).toBe(true)
    expect(bar.focusedIndex()).toBe(1)
  })

  it('带修饰键的组合不归导航管：Ctrl+Home 交回浏览器', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    bar.items[2]!.focus()
    bar.render()
    expect(press(bar, 'Home', { ctrlKey: true })).toBe(false)
    expect(bar.focusedIndex()).toBe(2)
  })

  it('整条禁用：方向键不接管，也不 preventDefault', () => {
    const { service } = makeService({ disabled: true })
    const bar = mountToolbar(service, BAR)
    bar.items[0]!.focus()
    bar.render()
    expect(press(bar, 'ArrowRight')).toBe(false)
    expect(bar.focusedIndex()).toBe(0)
  })

  it('分隔线与分组不入导航：方向键跨过分隔线、走进分组里的条目', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, [
      { kind: 'item', value: 'bold' },
      { kind: 'separator' },
      { kind: 'group', children: [{ value: 'left' }, { value: 'right' }] },
    ])
    bar.items[0]!.focus()
    bar.render()
    press(bar, 'ArrowRight')
    // 分隔线不是条目，直接落到分组内的第一个
    expect(bar.focusedIndex()).toBe(1)
    expect(service.context.get('focusedValue')).toBe('left')
    press(bar, 'ArrowRight')
    expect(bar.focusedIndex()).toBe(2)
    // 分组不切断集合：从组内末项继续走会回绕到组外的首项
    press(bar, 'ArrowRight')
    expect(bar.focusedIndex()).toBe(0)
  })

  it('条目现查活 DOM：运行期插进来的条目立刻参与导航', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, [{ kind: 'item', value: 'a' }, { kind: 'item', value: 'c' }])
    bar.items[0]!.focus()
    bar.render()

    const extra = document.createElement('button')
    spread(extra, api(service).getItemProps({ value: 'b' }) as Record<string, unknown>)
    bar.root.insertBefore(extra, bar.items[1]!)

    press(bar, 'ArrowRight')
    expect(document.activeElement).toBe(extra)
  })

  it('运行期改 orientation：主轴当场换到另一对方向键上', () => {
    const { service, setProps } = makeService()
    const bar = mountToolbar(service, BAR)
    bar.items[0]!.focus()
    bar.render()
    expect(press(bar, 'ArrowDown')).toBe(false)

    setProps({ orientation: 'vertical' })
    bar.render()
    expect(press(bar, 'ArrowDown')).toBe(true)
    expect(bar.focusedIndex()).toBe(2)
  })
})

describe('connectToolbar 单一 Tab 位与焦点进出', () => {
  /** Tab 停靠点的总数：条目里认领 0 的个数 + 容器是否兜底。恒等于 1。 */
  function tabStops(bar: Toolbar): number {
    const claimed = bar.items.filter(el => el.getAttribute('tabindex') === '0').length
    return claimed + (bar.root.getAttribute('tabindex') === '0' ? 1 : 0)
  }

  it('整条自始至终只有一个 Tab 停靠点', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    expect(tabStops(bar)).toBe(1)
    // 无锚点时是容器兜底
    expect(bar.root.getAttribute('tabindex')).toBe('0')

    bar.items[0]!.focus()
    bar.render()
    expect(tabStops(bar)).toBe(1)
    expect(bar.root.getAttribute('tabindex')).toBe('-1')
    expect(bar.items[0]!.getAttribute('tabindex')).toBe('0')

    press(bar, 'ArrowRight')
    expect(tabStops(bar)).toBe(1)
    expect(bar.items[2]!.getAttribute('tabindex')).toBe('0')
  })

  it('焦点从条外落到容器：转投第一个可停留条目', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    bar.root.focus()
    bar.render()
    expect(bar.focusedIndex()).toBe(0)
    expect(service.context.get('focusedValue')).toBe('bold')
  })

  it('已有锚点时容器转投回锚点，兑现 tabindex=0 的承诺', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    service.send({ type: 'ITEM.FOCUS', value: 'underline' })
    bar.render()
    // 焦点其实还在条外（只有锚点被记下），容器仍要能接住并转投
    bar.root.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }))
    expect(bar.focusedIndex()).toBe(2)
  })

  it('锚点已禁用时退回首个可停留条目', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, [
      { kind: 'item', value: 'a' },
      { kind: 'item', value: 'b' },
      { kind: 'item', value: 'c', disabled: true },
    ])
    service.send({ type: 'ITEM.FOCUS', value: 'c' })
    bar.render()
    bar.root.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }))
    expect(bar.focusedIndex()).toBe(0)
  })

  it('整条禁用时容器压根不可聚焦，也就无所谓往哪儿投', () => {
    const { service } = makeService({ disabled: true })
    const bar = mountToolbar(service, BAR)
    bar.render()
    bar.root.focus()
    // 没有 tabindex 的 div 聚不上焦；从前它是可聚焦的，进去之后方向键又一概不响应
    expect(document.activeElement).not.toBe(bar.root)
    expect(bar.focusedIndex()).toBe(-1)
  })

  it('条内 Shift+Tab 往外退时容器不抢焦点，否则人被困在条里', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    const spy = vi.spyOn(bar.items[0]!, 'focus')
    bar.root.dispatchEvent(new FocusEvent('focus', { relatedTarget: bar.items[1] }))
    expect(spy).not.toHaveBeenCalled()
  })

  it('条内换焦点不清锚点，退到条外才清、容器随即收回 Tab 位', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    bar.items[0]!.focus()
    bar.render()
    expect(service.context.get('focusedValue')).toBe('bold')

    // 条内流转：relatedTarget 仍在容器内，锚点必须留着，否则容器会抢回 Tab 位
    bar.root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: bar.items[2] }))
    expect(service.context.get('focusedValue')).toBe('bold')

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    bar.root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }))
    expect(service.context.get('focusedValue')).toBeNull()
    bar.render()
    expect(bar.root.getAttribute('tabindex')).toBe('0')
  })

  it('禁用条目被点到也记锚点：方向键才知道从哪儿起步', () => {
    const { service } = makeService()
    const bar = mountToolbar(service, BAR)
    bar.items[1]!.focus()
    bar.render()
    expect(service.context.get('focusedValue')).toBe('italic')
    expect(bar.items[1]!.getAttribute('tabindex')).toBe('0')
    // 从禁用条目起步照样走得动
    press(bar, 'ArrowRight')
    expect(bar.focusedIndex()).toBe(2)
  })
})
