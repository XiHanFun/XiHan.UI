/**
 * 键盘导航要真实的活 DOM：条目集合是在事件那一刻现查的，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/machine'
import type { ToggleGroupItemProps, ToggleGroupSchema, ToggleGroupValueChangeDetails } from '../src/toggle-group/index'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectToggleGroup,
  normalizeToggleGroupValue,
  sameToggleGroupValue,
  toggleGroupMachine,
  toToggleGroupChangeValue,
} from '../src/toggle-group/index'

type Props = ToggleGroupSchema['props']

interface Harness {
  service: Service<ToggleGroupSchema>
  /** 模拟宿主写回 props（受控回写、运行期改配置）。 */
  setProps: (next: Props) => void
  changes: ToggleGroupValueChangeDetails[]
}

function makeService(initial: Props = {}): Harness {
  const changes: ToggleGroupValueChangeDetails[] = []
  // props 对象身份固定、字段可改：解释器按身份缓存归一化结果，改字段即被下一次 prop() 读到
  const props: Props = { ...initial, onValueChange: d => changes.push(d) }
  const runtime = createVanillaRuntime()
  const service = createService(toggleGroupMachine, { props: () => props, runtime })
  runtime.start()
  return {
    service,
    setProps: next => Object.assign(props, next),
    changes,
  }
}

function api(service: Service<ToggleGroupSchema>) {
  return connectToggleGroup(service, normalizeProps)
}

function rootProps(service: Service<ToggleGroupSchema>): Record<string, unknown> {
  return api(service).getRootProps() as Record<string, unknown>
}

function itemProps(service: Service<ToggleGroupSchema>, item: ToggleGroupItemProps): Record<string, unknown> {
  return api(service).getItemProps(item) as Record<string, unknown>
}

describe('toggle-group 值归一化', () => {
  it('undefined 原样透传：那是"非受控"的唯一表达，归一成空数组会把控件锁死', () => {
    expect(normalizeToggleGroupValue(undefined, false)).toBeUndefined()
    expect(normalizeToggleGroupValue(undefined, true)).toBeUndefined()
  })

  it('null 是"受控且无选中"，归一成空数组', () => {
    expect(normalizeToggleGroupValue(null, false)).toEqual([])
    expect(normalizeToggleGroupValue(null, true)).toEqual([])
  })

  it('单值与数组都收，重复值去掉', () => {
    expect(normalizeToggleGroupValue('a', true)).toEqual(['a'])
    expect(normalizeToggleGroupValue(['a', 'b', 'a'], true)).toEqual(['a', 'b'])
  })

  it('单选只留第一个：多出来的既报不出去也点不掉', () => {
    expect(normalizeToggleGroupValue(['a', 'b'], false)).toEqual(['a'])
    expect(normalizeToggleGroupValue([], false)).toEqual([])
  })

  it('不改入参数组', () => {
    const input = ['b', 'a']
    normalizeToggleGroupValue(input, true)
    expect(input).toEqual(['b', 'a'])
  })

  it('对外形态跟着 multiple 变：单选给单值，多选给数组副本', () => {
    expect(toToggleGroupChangeValue(['a'], false)).toBe('a')
    expect(toToggleGroupChangeValue([], false)).toBeNull()
    const values = ['a', 'b']
    const out = toToggleGroupChangeValue(values, true)
    expect(out).toEqual(['a', 'b'])
    // 副本而非内部数组本身：作者拿去改不该反过来动到 context
    expect(out).not.toBe(values)
  })

  it('值相等按内容比，顺序算数，undefined 不等于任何值', () => {
    expect(sameToggleGroupValue(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(sameToggleGroupValue(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(sameToggleGroupValue([], [])).toBe(true)
    expect(sameToggleGroupValue([], undefined)).toBe(false)
  })
})

describe('toggleGroupMachine 选中集合', () => {
  it('defaultValue 收单值也收数组，单选下截成一个', () => {
    expect(makeService({ defaultValue: 'a' }).service.context.get('value')).toEqual(['a'])
    expect(makeService({ defaultValue: ['a', 'b'], multiple: true }).service.context.get('value')).toEqual(['a', 'b'])
    expect(makeService({ defaultValue: ['a', 'b'] }).service.context.get('value')).toEqual(['a'])
  })

  it('单选：选中一项挤掉其余，再点同一项即取消', () => {
    const { service, changes } = makeService({ defaultValue: 'a' })
    service.send({ type: 'ITEM.TOGGLE', value: 'b' })
    expect(service.context.get('value')).toEqual(['b'])
    service.send({ type: 'ITEM.TOGGLE', value: 'b' })
    expect(service.context.get('value')).toEqual([])
    // 单选模式的回调给单值，不是 ['b']——数组会把作者绑的字符串变量改成数组
    expect(changes).toEqual([{ value: 'b' }, { value: null }])
  })

  it('多选：逐项累加、逐项摘除', () => {
    const { service, changes } = makeService({ multiple: true })
    service.send({ type: 'ITEM.TOGGLE', value: 'a' })
    service.send({ type: 'ITEM.TOGGLE', value: 'b' })
    expect(service.context.get('value')).toEqual(['a', 'b'])
    service.send({ type: 'ITEM.TOGGLE', value: 'a' })
    expect(service.context.get('value')).toEqual(['b'])
    expect(changes).toEqual([{ value: ['a'] }, { value: ['a', 'b'] }, { value: ['b'] }])
  })

  it('disallowEmpty：最后一个选中项点不掉，也不发回调', () => {
    const { service, changes } = makeService({ defaultValue: 'a', disallowEmpty: true })
    service.send({ type: 'ITEM.TOGGLE', value: 'a' })
    expect(service.context.get('value')).toEqual(['a'])
    expect(changes).toEqual([])
    // 换一项仍然换得动：拦的是"清空"，不是"改动"
    service.send({ type: 'ITEM.TOGGLE', value: 'b' })
    expect(service.context.get('value')).toEqual(['b'])
  })

  it('disallowEmpty 在多选下同样只拦最后一个', () => {
    const { service } = makeService({ multiple: true, disallowEmpty: true, defaultValue: ['a', 'b'] })
    service.send({ type: 'ITEM.TOGGLE', value: 'a' })
    expect(service.context.get('value')).toEqual(['b'])
    service.send({ type: 'ITEM.TOGGLE', value: 'b' })
    expect(service.context.get('value')).toEqual(['b'])
  })

  it('公开 API 走同一套归一：单选截断、null 清空、disallowEmpty 下拦清空', () => {
    const single = makeService({ defaultValue: 'a' })
    single.service.send({ type: 'VALUE.SET', value: ['x', 'y'] })
    expect(single.service.context.get('value')).toEqual(['x'])
    single.service.send({ type: 'VALUE.SET', value: null })
    expect(single.service.context.get('value')).toEqual([])

    const guarded = makeService({ defaultValue: 'a', disallowEmpty: true })
    guarded.service.send({ type: 'VALUE.SET', value: null })
    expect(guarded.service.context.get('value')).toEqual(['a'])
  })

  it('值没变就不发回调（数组按内容比，不按引用比）', () => {
    const { service, changes } = makeService({ multiple: true, defaultValue: ['a', 'b'] })
    service.send({ type: 'VALUE.SET', value: ['a', 'b'] })
    expect(changes).toEqual([])
  })

  it('受控 value：内部不自改，只发意图；宿主写回后才变', () => {
    const { service, setProps, changes } = makeService({ value: 'a' })
    service.send({ type: 'ITEM.TOGGLE', value: 'b' })
    expect(service.context.get('value')).toEqual(['a'])
    expect(changes).toEqual([{ value: 'b' }])
    setProps({ value: 'b' })
    expect(service.context.get('value')).toEqual(['b'])
  })

  it('焦点锚点：激活与聚焦都记，离组清空', () => {
    const { service } = makeService()
    // cell 的初值走 defaultValue ?? value，两者都为空时落到 undefined；
    // 归一成 null 是 connect 的活儿，锚点判据（focusedValue == null）两者都收
    expect(api(service).focusedValue).toBeNull()
    service.send({ type: 'ITEM.FOCUS', value: 'b' })
    expect(service.context.get('focusedValue')).toBe('b')
    service.send({ type: 'ITEM.TOGGLE', value: 'c' })
    expect(service.context.get('focusedValue')).toBe('c')
    service.send({ type: 'GROUP.BLUR' })
    expect(service.context.get('focusedValue')).toBeNull()
  })
})

describe('connectToggleGroup ARIA 两套语义', () => {
  it('单选：root=radiogroup 带 aria-orientation，条目 role=radio + aria-checked', () => {
    const { service } = makeService({ defaultValue: 'a', orientation: 'vertical' })
    const root = rootProps(service)
    expect(root.role).toBe('radiogroup')
    expect(root['aria-orientation']).toBe('vertical')
    expect(root['data-orientation']).toBe('vertical')

    const on = itemProps(service, { value: 'a' })
    const off = itemProps(service, { value: 'b' })
    expect(on.role).toBe('radio')
    expect(on['aria-checked']).toBe('true')
    expect(on['data-state']).toBe('on')
    // 两套语义不混用：radiogroup 里出现 aria-pressed，读屏会念出自相矛盾的东西
    expect(on['aria-pressed']).toBeUndefined()
    // 未选中显式 false：省略是"没说"，显式 false 是"明确说了不是"
    expect(off['aria-checked']).toBe('false')
    expect(off['data-state']).toBe('off')
  })

  it('多选：root=group 且不给 aria-orientation，条目是原生 button + aria-pressed', () => {
    const { service } = makeService({ multiple: true, defaultValue: ['a'] })
    const root = rootProps(service)
    expect(root.role).toBe('group')
    // role=group 不收 aria-orientation，给了就是无效 ARIA；排布信息走 data-*
    expect(root['aria-orientation']).toBeUndefined()
    expect(root['data-orientation']).toBe('horizontal')

    const on = itemProps(service, { value: 'a' })
    const off = itemProps(service, { value: 'b' })
    expect(on.role).toBeUndefined()
    expect(on['aria-pressed']).toBe('true')
    expect(on['aria-checked']).toBeUndefined()
    expect(off['aria-pressed']).toBe('false')
  })

  it('条目是原生按钮且带 type=button：落在 form 里不该变成提交按钮', () => {
    const { service } = makeService()
    expect(itemProps(service, { value: 'a' }).type).toBe('button')
  })

  it('禁用一律 aria-disabled，绝不输出原生 disabled', () => {
    const { service } = makeService()
    const item = itemProps(service, { value: 'a', disabled: true })
    expect(item['aria-disabled']).toBe('true')
    expect(item.disabled).toBeUndefined()
    expect(item['data-disabled']).toBe('')
    expect(itemProps(service, { value: 'b' })['aria-disabled']).toBe('false')
  })

  it('整组禁用向下传导到每个条目，且点不动', () => {
    const { service, changes } = makeService({ disabled: true })
    expect(rootProps(service)['data-disabled']).toBe('')
    const item = itemProps(service, { value: 'a' })
    expect(item['aria-disabled']).toBe('true')
    ;(item.onClick as () => void)()
    expect(service.context.get('value')).toEqual([])
    expect(changes).toEqual([])
  })

  it('整组禁用时容器退出 Tab 序列：进去了方向键也不响应，那就是个死停靠点', () => {
    expect(rootProps(makeService({ disabled: true }).service).tabindex).toBeUndefined()
    expect(rootProps(makeService().service).tabindex).toBe(0)
  })

  it('禁用条目点不动，但聚焦仍记锚点（它还得当方向键起点）', () => {
    const { service } = makeService()
    const item = itemProps(service, { value: 'b', disabled: true })
    ;(item.onClick as () => void)()
    expect(service.context.get('value')).toEqual([])
    ;(item.onFocus as () => void)()
    expect(service.context.get('focusedValue')).toBe('b')
  })

  it('api 面：value 恒为数组，isSelected / setValue 按 multiple 归一', () => {
    const { service } = makeService({ defaultValue: 'a' })
    const a = api(service)
    expect(a.value).toEqual(['a'])
    expect(a.multiple).toBe(false)
    expect(a.isSelected('a')).toBe(true)
    expect(a.isSelected('b')).toBe(false)
    a.setValue(['b', 'c'])
    expect(service.context.get('value')).toEqual(['b'])
  })
})

describe('connectToggleGroup roving tabindex', () => {
  it('无选中无焦点：条目全 -1，容器兜底 0', () => {
    const { service } = makeService()
    expect(rootProps(service).tabindex).toBe(0)
    expect(itemProps(service, { value: 'a' }).tabindex).toBe(-1)
  })

  it('锚点跟第一个选中值走；多选时后选中的那些不再占 Tab 位', () => {
    const { service } = makeService({ multiple: true, defaultValue: ['b', 'c'] })
    expect(itemProps(service, { value: 'a' }).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'b' }).tabindex).toBe(0)
    expect(itemProps(service, { value: 'c' }).tabindex).toBe(-1)
  })

  it('焦点在组内：锚点跟焦点走，容器让位让 Tab 能离开本组', () => {
    const { service } = makeService({ defaultValue: 'a' })
    service.send({ type: 'ITEM.FOCUS', value: 'c' })
    expect(rootProps(service).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'a' }).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'c' }).tabindex).toBe(0)
  })

  it('锚点悬空（受控值不在选项里）时容器仍兜底，否则整组键盘再也进不来', () => {
    const { service } = makeService({ value: 'not-an-item' })
    // 判据是 focusedValue == null，不是 anchor == null：anchor 在这里非空却没人认领
    expect(rootProps(service).tabindex).toBe(0)
    expect(itemProps(service, { value: 'a' }).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'b' }).tabindex).toBe(-1)
  })

  it('rovingFocus 关掉：条目各占一个 Tab 位，容器不再兜底', () => {
    const { service } = makeService({ rovingFocus: false, defaultValue: 'a' })
    expect(rootProps(service).tabindex).toBe(-1)
    expect(itemProps(service, { value: 'a' }).tabindex).toBe(0)
    expect(itemProps(service, { value: 'b' }).tabindex).toBe(0)
    // 禁用条目仍可聚焦，同样留在 Tab 序列里
    expect(itemProps(service, { value: 'c', disabled: true }).tabindex).toBe(0)
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

interface Group {
  root: HTMLElement
  items: HTMLElement[]
  /** 重新求值 connect 并打回节点上，等价于宿主的一次重渲染。 */
  render: () => void
  /** 当前持有焦点的条目下标，-1 表示焦点不在任何条目上。 */
  focusedIndex: () => number
}

function mountGroup(service: Service<ToggleGroupSchema>, declared: readonly ToggleGroupItemProps[]): Group {
  const root = document.createElement('div')
  const items: HTMLElement[] = declared.map(() => document.createElement('button'))
  for (const el of items) root.appendChild(el)
  document.body.appendChild(root)

  const render = (): void => {
    const a = api(service)
    spread(root, a.getRootProps() as Record<string, unknown>)
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
function press(group: Group, key: string): boolean {
  const target = (document.activeElement as HTMLElement | null) ?? group.root
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  group.render()
  return event.defaultPrevented
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('connectToggleGroup 方向键导航', () => {
  const ITEMS: ToggleGroupItemProps[] = [{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }]

  it('四个方向键都响应，与 orientation 无关；禁用条目跳过', () => {
    const { service } = makeService({ orientation: 'horizontal' })
    const g = mountGroup(service, ITEMS)
    g.items[0]!.focus()
    g.render()

    expect(press(g, 'ArrowRight')).toBe(true)
    expect(g.focusedIndex()).toBe(2)
    // 横排组里按上下键同样要走：orientation 只描述视觉排布
    expect(press(g, 'ArrowUp')).toBe(true)
    expect(g.focusedIndex()).toBe(0)
    expect(press(g, 'ArrowDown')).toBe(true)
    expect(g.focusedIndex()).toBe(2)
    expect(press(g, 'ArrowLeft')).toBe(true)
    expect(g.focusedIndex()).toBe(0)
  })

  it('方向键只搬焦点，不改选中', () => {
    const { service, changes } = makeService({ defaultValue: 'a' })
    const g = mountGroup(service, ITEMS)
    g.items[0]!.focus()
    g.render()
    press(g, 'ArrowRight')
    expect(g.focusedIndex()).toBe(2)
    expect(service.context.get('value')).toEqual(['a'])
    expect(changes).toEqual([])
  })

  it('home / End 到端点，跳过禁用条目', () => {
    const { service } = makeService()
    const g = mountGroup(service, ITEMS)
    g.items[0]!.focus()
    g.render()
    expect(press(g, 'End')).toBe(true)
    expect(g.focusedIndex()).toBe(2)
    expect(press(g, 'Home')).toBe(true)
    expect(g.focusedIndex()).toBe(0)
  })

  it('loop 默认回绕；关掉后撞到尽头就停在原地', () => {
    const looped = makeService()
    const g1 = mountGroup(looped.service, ITEMS)
    g1.items[2]!.focus()
    g1.render()
    press(g1, 'ArrowRight')
    expect(g1.focusedIndex()).toBe(0)
    document.body.innerHTML = ''

    const capped = makeService({ loop: false })
    const g2 = mountGroup(capped.service, ITEMS)
    g2.items[2]!.focus()
    g2.render()
    press(g2, 'ArrowRight')
    expect(g2.focusedIndex()).toBe(2)
  })

  it('dir=rtl 对调左右键，上下键不受影响', () => {
    const { service } = makeService({ dir: 'rtl' })
    const g = mountGroup(service, [{ value: 'a' }, { value: 'b' }, { value: 'c' }])
    g.items[1]!.focus()
    g.render()
    press(g, 'ArrowLeft')
    expect(g.focusedIndex()).toBe(2)
    press(g, 'ArrowRight')
    expect(g.focusedIndex()).toBe(1)
    press(g, 'ArrowDown')
    expect(g.focusedIndex()).toBe(2)
  })

  it('不归导航管的键一律放行：Space 不被容器吞掉（否则页面滚动一起没了）', () => {
    const { service } = makeService()
    const g = mountGroup(service, ITEMS)
    g.items[0]!.focus()
    g.render()
    expect(press(g, ' ')).toBe(false)
    expect(g.focusedIndex()).toBe(0)
  })

  it('整组禁用：方向键不接管，也不 preventDefault', () => {
    const { service } = makeService({ disabled: true })
    const g = mountGroup(service, ITEMS)
    g.items[0]!.focus()
    g.render()
    expect(press(g, 'ArrowRight')).toBe(false)
    expect(g.focusedIndex()).toBe(0)
  })

  it('rovingFocus 关掉：方向键交回给页面，焦点靠 Tab 自己走', () => {
    const { service } = makeService({ rovingFocus: false })
    const g = mountGroup(service, ITEMS)
    g.items[0]!.focus()
    g.render()
    expect(press(g, 'ArrowRight')).toBe(false)
    expect(g.focusedIndex()).toBe(0)
  })

  it('条目现查活 DOM：运行期插进来的条目立刻参与导航', () => {
    const { service } = makeService()
    const g = mountGroup(service, [{ value: 'a' }, { value: 'c' }])
    g.items[0]!.focus()
    g.render()

    const extra = document.createElement('button')
    spread(extra, api(service).getItemProps({ value: 'b' }) as Record<string, unknown>)
    g.root.insertBefore(extra, g.items[1]!)

    press(g, 'ArrowRight')
    expect(document.activeElement).toBe(extra)
  })
})

describe('connectToggleGroup 焦点进出组', () => {
  const ITEMS: ToggleGroupItemProps[] = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]

  it('焦点从组外落到容器：转投锚点条目，兑现 tabindex=0 的承诺', () => {
    const { service } = makeService({ defaultValue: 'c' })
    const g = mountGroup(service, ITEMS)
    g.root.focus()
    g.render()
    expect(g.focusedIndex()).toBe(2)
    expect(service.context.get('focusedValue')).toBe('c')
  })

  it('锚点已禁用时退回首个可停留条目', () => {
    const { service } = makeService({ defaultValue: 'c' })
    const g = mountGroup(service, [{ value: 'a' }, { value: 'b' }, { value: 'c', disabled: true }])
    g.root.focus()
    g.render()
    expect(g.focusedIndex()).toBe(0)
  })

  it('组内换焦点不清锚点，退到组外才清', () => {
    const { service } = makeService()
    const g = mountGroup(service, ITEMS)
    g.items[1]!.focus()
    g.render()
    expect(service.context.get('focusedValue')).toBe('b')

    // 组内流转：relatedTarget 仍在容器内，锚点必须留着，否则容器会抢回 Tab 位
    g.root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: g.items[2] }))
    expect(service.context.get('focusedValue')).toBe('b')

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    g.root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }))
    expect(service.context.get('focusedValue')).toBeNull()
    g.render()
    expect(g.root.getAttribute('tabindex')).toBe('0')
  })

  it('组内 Shift+Tab 往外退时容器不抢焦点，否则人被困在组里', () => {
    const { service } = makeService()
    const g = mountGroup(service, ITEMS)
    const spy = vi.spyOn(g.items[0]!, 'focus')
    g.root.dispatchEvent(new FocusEvent('focus', { relatedTarget: g.items[1] }))
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('connectToggleGroup 点击激活', () => {
  it('点击切换该条目并把锚点搬过去', () => {
    const { service, changes } = makeService({ multiple: true })
    const g = mountGroup(service, [{ value: 'a' }, { value: 'b' }])
    g.items[0]!.click()
    g.render()
    expect(service.context.get('value')).toEqual(['a'])
    expect(service.context.get('focusedValue')).toBe('a')
    expect(g.items[0]!.getAttribute('aria-pressed')).toBe('true')
    expect(g.items[0]!.getAttribute('tabindex')).toBe('0')
    expect(g.items[1]!.getAttribute('tabindex')).toBe('-1')

    g.items[1]!.click()
    g.render()
    expect(service.context.get('value')).toEqual(['a', 'b'])
    expect(changes).toEqual([{ value: ['a'] }, { value: ['a', 'b'] }])
  })

  it('单选点击互斥，DOM 上的 aria-checked 跟着翻', () => {
    const { service } = makeService({ defaultValue: 'a' })
    const g = mountGroup(service, [{ value: 'a' }, { value: 'b' }])
    expect(g.items[0]!.getAttribute('aria-checked')).toBe('true')
    g.items[1]!.click()
    g.render()
    expect(g.items[0]!.getAttribute('aria-checked')).toBe('false')
    expect(g.items[1]!.getAttribute('aria-checked')).toBe('true')
    // 单选模式绝不出现 aria-pressed
    expect(g.items[1]!.hasAttribute('aria-pressed')).toBe(false)
  })
})
