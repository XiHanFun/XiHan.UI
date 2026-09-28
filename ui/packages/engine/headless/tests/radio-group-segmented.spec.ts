/**
 * radio-group 的 segmented 形态：滑块量测、形态切换、段内图标与 APG 键盘。
 * 键盘导航与滑块量测都要真实的活 DOM：条目集合是在事件那一刻现查的，盒子也只有活节点才量得到。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/core'
import type { RadioGroupItemProps, RadioGroupSchema, RadioGroupValueChangeDetails } from '../src/radio-group'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectRadioGroup, radioGroupAnatomy, radioGroupMachine } from '../src/radio-group'

type Props = RadioGroupSchema['props']

/** 三段：中间那段禁用，方向键该跳过它，但它仍可聚焦、仍是导航起点。 */
const ITEMS: readonly RadioGroupItemProps[] = [
  { value: 'day' },
  { value: 'week', disabled: true },
  { value: 'month' },
]

/** 三段全放开：要分辨左右走向就不能有禁用段，否则两个方向都落在同一段上。 */
const ALL_ENABLED: readonly RadioGroupItemProps[] = [
  { value: 'day' },
  { value: 'week' },
  { value: 'month' },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与两个适配器同一套翻译规则（on 之后全小写做事件名，其余落属性，
 * style 里的自定义属性走 setProperty，量不到时整组撤掉）。
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
    if (key === 'style') {
      const style = raw as Record<string, string> | undefined
      if (!style) {
        el.removeAttribute('style')
        continue
      }
      for (const [name, value] of Object.entries(style)) {
        if (name.startsWith('--'))
          el.style.setProperty(name, value)
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

/** 给段钉一个排布位：jsdom 不排版，offset* 恒为 0，滑块就永远量在原点上。offset* 从根的内衬边量起。 */
function stubOffset(el: HTMLElement, parent: HTMLElement, box: { left: number, top: number, width: number, height: number }): void {
  const values = { offsetLeft: box.left, offsetTop: box.top, offsetWidth: box.width, offsetHeight: box.height, offsetParent: parent }
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(el, key, { value, configurable: true })
}

/** 钉住根的内衬盒宽：RTL 下起始缘从它的右缘往左量。 */
function stubPadWidth(el: HTMLElement, width: number): void {
  Object.defineProperty(el, 'clientWidth', { value: width, configurable: true })
}

interface Harness {
  root: HTMLElement
  thumb: HTMLElement
  item: (value: string) => HTMLElement
  icon: (value: string) => HTMLElement
  service: Service<RadioGroupSchema>
  changes: RadioGroupValueChangeDetails[]
  value: () => string | null
  setProps: (next: Partial<Props>) => void
  render: () => void
}

function mount(initial: Partial<Props> = {}, items: readonly RadioGroupItemProps[] = ITEMS): Harness {
  const changes: RadioGroupValueChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ variant: 'segmented', ...initial })
  const service = createService(radioGroupMachine, {
    props: () => ({ ...props.get(), onValueChange: d => changes.push(d) }),
    runtime,
  })

  const root = document.createElement('div')
  const thumb = document.createElement('span')
  const nodes = new Map<string, HTMLElement>()
  const icons = new Map<string, HTMLElement>()
  root.append(thumb)
  for (const item of items) {
    const el = document.createElement('div')
    const icon = document.createElement('span')
    icon.textContent = '·'
    el.append(icon, item.value)
    nodes.set(item.value, el)
    icons.set(item.value, icon)
    root.append(el)
  }
  document.body.append(root)

  service.refs.set('getRootEl', () => root)
  runtime.start()

  const render = (): void => {
    const api = connectRadioGroup(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(thumb, api.getThumbProps() as Record<string, unknown>)
    for (const item of items) {
      spread(nodes.get(item.value)!, api.getItemProps(item) as Record<string, unknown>)
      spread(icons.get(item.value)!, api.getItemIconProps(item) as Record<string, unknown>)
    }
  }

  // 任一 cell 变化即重渲，与两个适配器同语义
  runtime.subscribe(render)
  render()

  return {
    root,
    thumb,
    item: value => nodes.get(value)!,
    icon: value => icons.get(value)!,
    service,
    changes,
    value: () => service.context.get('value') ?? null,
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    render,
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

/** 把整组挪进一个声明了方向的祖先里，模拟"整页 rtl 而作者没给组件传 dir"。 */
function reparentUnder(el: HTMLElement, direction: 'ltr' | 'rtl'): void {
  const host = document.createElement('div')
  host.setAttribute('dir', direction)
  document.body.append(host)
  host.append(el)
}

/** 焦点落在哪一段；焦点不在段上时返回 null。 */
function focusedValue(): string | null {
  const el = document.activeElement as HTMLElement | null
  return el?.getAttribute('data-part') === 'item' ? el.getAttribute('data-value') : null
}

/** 等一次 flush（vanilla 运行时的 flush 是 queueMicrotask）。 */
function flushed(): Promise<void> {
  return Promise.resolve()
}

function slot(el: HTMLElement, name: string): string {
  return el.style.getPropertyValue(name).trim()
}

/** 把三段在根的内衬盒里摆成一排 300×40，每段 100 宽。 */
function layout(h: Harness): void {
  stubPadWidth(h.root, 300)
  stubOffset(h.item('day'), h.root, { left: 0, top: 0, width: 100, height: 40 })
  stubOffset(h.item('week'), h.root, { left: 100, top: 0, width: 100, height: 40 })
  stubOffset(h.item('month'), h.root, { left: 200, top: 0, width: 100, height: 40 })
}

async function measured(h: Harness): Promise<void> {
  h.service.send({ type: 'THUMB.MEASURE' })
  await flushed()
  h.render()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('radio-group segmented 形态 · 投影', () => {
  it('根投影 data-variant=segmented，缺省横排；显式给了 orientation 就以它为准', () => {
    const h = mount()
    expect(h.root.getAttribute('data-variant')).toBe('segmented')
    expect(h.root.getAttribute('aria-orientation')).toBe('horizontal')
    expect(h.root.getAttribute('data-orientation')).toBe('horizontal')
    h.setProps({ orientation: 'vertical' })
    expect(h.root.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('list 与 card 形态仍缺省竖排', () => {
    const list = mount({ variant: undefined })
    expect(list.root.getAttribute('aria-orientation')).toBe('vertical')
    const card = mount({ variant: 'card' })
    expect(card.root.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('段是 radio，不投影 Action Control 行级配方：面与字由皮肤按轨道承载面写在段上', () => {
    const h = mount({ defaultValue: 'day' })
    const day = h.item('day')
    expect(day.getAttribute('role')).toBe('radio')
    expect(day.getAttribute('aria-checked')).toBe('true')
    for (const name of ['data-xh-action-control', 'data-xh-action-profile', 'data-xh-action-variant', 'data-xh-action-display', 'data-xh-action-size', 'data-xh-choice-card'])
      expect(day.hasAttribute(name)).toBe(false)
  })

  it('block 原样投影到根，缺省不输出', () => {
    const h = mount()
    expect(h.root.hasAttribute('data-block')).toBe(false)
    h.setProps({ block: true })
    expect(h.root.getAttribute('data-block')).toBe('')
  })

  it('api.variant 是结算后的形态：没传即 list', () => {
    const h = mount({ variant: undefined })
    expect(connectRadioGroup(h.service, normalizeProps).variant).toBe('list')
    h.setProps({ variant: 'segmented' })
    expect(connectRadioGroup(h.service, normalizeProps).variant).toBe('segmented')
  })
})

describe('radio-group segmented 形态 · APG 键盘', () => {
  it('enter 不选中也不进按压面，Space 才选中', () => {
    const h = mount({ defaultValue: 'day' })
    h.item('month').focus()
    const enter = press(h.item('month'), 'Enter')
    expect(enter.defaultPrevented).toBe(false)
    expect(h.value()).toBe('day')
    expect(h.item('month').hasAttribute('data-pressed')).toBe(false)
    expect(h.changes).toEqual([])

    expect(press(h.item('month'), ' ').defaultPrevented).toBe(true)
    expect(h.value()).toBe('month')
    expect(h.changes).toEqual([{ value: 'month' }])
  })

  it('home / End 不归单选组管：不移焦点、不换值，也不吞按键', () => {
    const h = mount({ defaultValue: 'month' })
    h.item('month').focus()
    expect(press(h.item('month'), 'Home').defaultPrevented).toBe(false)
    expect(press(h.item('month'), 'End').defaultPrevented).toBe(false)
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('month')
  })

  it('四个方向键都走，跳过禁用段，尽头回绕，焦点跟着选中走', () => {
    const h = mount({ defaultValue: 'day' })
    h.item('day').focus()
    expect(press(h.item('day'), 'ArrowRight').defaultPrevented).toBe(true)
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('month')
    press(h.item('month'), 'ArrowRight')
    expect(focusedValue()).toBe('day')
    press(h.item('day'), 'ArrowUp')
    expect(focusedValue()).toBe('month')
  })

  it('loop=false：走到尽头停住，不回绕也不换值', () => {
    const h = mount({ defaultValue: 'month', loop: false })
    h.item('month').focus()
    press(h.item('month'), 'ArrowRight')
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('month')
  })

  // 三段全放开才分得出左右：中间那段一禁用，从首段往两边走都落在末段上
  it('祖先声明 rtl 而没给 dir：左右键照样跟着视觉顺序对调', () => {
    const h = mount({ defaultValue: 'week' }, ALL_ENABLED)
    reparentUnder(h.root, 'rtl')
    h.item('week').focus()
    press(h.item('week'), 'ArrowRight')
    expect(focusedValue()).toBe('day')
  })

  it('给了 dir 就以它为准：祖先是 rtl 也按 ltr 走', () => {
    const h = mount({ defaultValue: 'week', dir: 'ltr' }, ALL_ENABLED)
    reparentUnder(h.root, 'rtl')
    h.item('week').focus()
    press(h.item('week'), 'ArrowRight')
    expect(focusedValue()).toBe('month')
  })
})

describe('radio-group segmented 形态 · 滑块', () => {
  it('没有选中项时收起来，不占位；对读屏隐藏', () => {
    const h = mount()
    expect(h.thumb.getAttribute('data-scope')).toBe('radio-group')
    expect(h.thumb.getAttribute('data-part')).toBe('thumb')
    expect(h.thumb.hasAttribute('hidden')).toBe(true)
    expect(h.thumb.getAttribute('aria-hidden')).toBe('true')
  })

  it('量测结果铺成私有槽，起点是根的内衬边；拉伸比在标准档恒为 0', async () => {
    const h = mount({ defaultValue: 'month' })
    layout(h)
    await measured(h)
    expect(h.thumb.hasAttribute('hidden')).toBe(false)
    expect(slot(h.thumb, '--xh-_radio-group-thumb-x')).toBe('200px')
    expect(slot(h.thumb, '--xh-_radio-group-thumb-y')).toBe('0px')
    expect(slot(h.thumb, '--xh-_radio-group-thumb-w')).toBe('100px')
    expect(slot(h.thumb, '--xh-_radio-group-thumb-h')).toBe('40px')
    expect(slot(h.thumb, '--xh-_radio-group-thumb-stretch')).toBe('0')
    expect(h.thumb.getAttribute('data-value')).toBe('month')
  })

  it('首次落位直接到位（data-instant），换段交给皮肤滑过去，同一段的重量又直接到位', async () => {
    const h = mount({ defaultValue: 'day' })
    layout(h)
    await measured(h)
    expect(h.thumb.hasAttribute('data-instant')).toBe(true)

    h.item('month').click()
    await flushed()
    h.render()
    expect(slot(h.thumb, '--xh-_radio-group-thumb-x')).toBe('200px')
    expect(h.thumb.hasAttribute('data-instant')).toBe(false)

    // 同一段因窗口变窄挪了落点：不拖尾，直接到位
    stubOffset(h.item('month'), h.root, { left: 180, top: 0, width: 90, height: 40 })
    await measured(h)
    expect(slot(h.thumb, '--xh-_radio-group-thumb-x')).toBe('180px')
    expect(h.thumb.hasAttribute('data-instant')).toBe(true)
  })

  it('rtl：起始缘从右缘往左量；祖先声明 rtl 而没给 dir 时同样如此，给了 dir 以它为准', async () => {
    const explicit = mount({ defaultValue: 'day', dir: 'rtl' })
    layout(explicit)
    await measured(explicit)
    expect(slot(explicit.thumb, '--xh-_radio-group-thumb-x')).toBe('200px')

    const inherited = mount({ defaultValue: 'day' })
    reparentUnder(inherited.root, 'rtl')
    layout(inherited)
    await measured(inherited)
    expect(slot(inherited.thumb, '--xh-_radio-group-thumb-x')).toBe('200px')

    const overridden = mount({ defaultValue: 'day', dir: 'ltr' })
    reparentUnder(overridden.root, 'rtl')
    layout(overridden)
    await measured(overridden)
    expect(slot(overridden.thumb, '--xh-_radio-group-thumb-x')).toBe('0px')
  })

  it('collection 改了就自己重量：段宽变了而根没变，尺寸观察器不响', async () => {
    const h = mount({
      defaultValue: 'month',
      collection: [{ value: 'day', label: '日' }, { value: 'week', label: '周' }, { value: 'month', label: '月' }],
    })
    layout(h)
    await measured(h)
    expect(slot(h.thumb, '--xh-_radio-group-thumb-x')).toBe('200px')

    // 首段文本变长把后两段整体推右；block 模式下根的宽度钉在父级上，根本身一动不动
    stubOffset(h.item('day'), h.root, { left: 0, top: 0, width: 160, height: 40 })
    stubOffset(h.item('week'), h.root, { left: 160, top: 0, width: 100, height: 40 })
    stubOffset(h.item('month'), h.root, { left: 260, top: 0, width: 100, height: 40 })
    h.setProps({
      collection: [{ value: 'day', label: '按日统计' }, { value: 'week', label: '周' }, { value: 'month', label: '月' }],
    })
    await flushed()
    h.render()
    expect(slot(h.thumb, '--xh-_radio-group-thumb-x')).toBe('260px')
  })

  it('形态换走就收起滑块，换回 segmented 立刻量出落点', async () => {
    const h = mount({ defaultValue: 'week', variant: 'list' }, ALL_ENABLED)
    layout(h)
    await measured(h)
    expect(h.thumb.hasAttribute('hidden')).toBe(true)

    h.setProps({ variant: 'segmented' })
    await flushed()
    h.render()
    expect(h.thumb.hasAttribute('hidden')).toBe(false)
    expect(slot(h.thumb, '--xh-_radio-group-thumb-x')).toBe('100px')

    h.setProps({ variant: 'card' })
    await flushed()
    h.render()
    expect(h.thumb.hasAttribute('hidden')).toBe(true)
  })

  it('不发 data-orientation：盒子横竖两向都由私有槽定死，皮肤没有按排布分支的规则', () => {
    const h = mount({ defaultValue: 'day', orientation: 'vertical' })
    expect(h.thumb.hasAttribute('data-orientation')).toBe(false)
    expect(h.root.getAttribute('data-orientation')).toBe('vertical')
  })
})

describe('radio-group 条目图标', () => {
  it('item-icon 排在 item 与 item-text 之间，thumb 排在 item 之前', () => {
    const names = radioGroupAnatomy.parts
    expect(names.indexOf('item-icon')).toBe(names.indexOf('item') + 1)
    expect(names.indexOf('item-text')).toBe(names.indexOf('item-icon') + 1)
    expect(names.indexOf('thumb')).toBeLessThan(names.indexOf('item'))
  })

  it('节点写了 icon 才有值，没写为 null', () => {
    const h = mount({
      collection: [
        { value: 'list', label: '列表', icon: '☰' },
        { value: 'grid', label: '网格' },
      ],
    }, [{ value: 'list' }, { value: 'grid' }])
    const api = connectRadioGroup(h.service, normalizeProps)
    expect(api.collection).toEqual([
      { value: 'list', label: '列表', description: null, icon: '☰', disabled: false },
      { value: 'grid', label: '网格', description: null, icon: null, disabled: false },
    ])
  })

  it('图标部件对读屏隐藏，选中、禁用与只读标记跟着条目走', () => {
    const h = mount({ defaultValue: 'day', readOnly: true })
    expect(h.icon('day').getAttribute('data-part')).toBe('item-icon')
    expect(h.icon('day').getAttribute('aria-hidden')).toBe('true')
    expect(h.icon('day').getAttribute('data-state')).toBe('checked')
    expect(h.icon('day').getAttribute('data-readonly')).toBe('')
    expect(h.icon('week').getAttribute('data-state')).toBe('unchecked')
    expect(h.icon('week').getAttribute('data-disabled')).toBe('')
  })
})
