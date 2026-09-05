/**
 * 键盘导航与指示器量测都要真实的活 DOM：条目集合是在事件那一刻现查的，
 * 盒子也只有活节点才量得到，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/core'
import type { SegmentedItemProps, SegmentedSchema, SegmentedValueChangeDetails } from '../src/segmented'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectSegmented, resolveSegmentedIndicator, segmentedMachine } from '../src/segmented'

type Props = SegmentedSchema['props']

/** 三段：中间那段禁用，方向键该跳过它，但它仍可聚焦、仍是导航起点。 */
const ITEMS: readonly SegmentedItemProps[] = [
  { value: 'day' },
  { value: 'week', disabled: true },
  { value: 'month' },
]

/** 三段全放开：要分辨左右走向就不能有禁用段，否则两个方向都落在同一段上。 */
const ALL_ENABLED: readonly SegmentedItemProps[] = [
  { value: 'day' },
  { value: 'week' },
  { value: 'month' },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与两个适配器同一套翻译规则（on 之后全小写做事件名，其余落属性，
 * style 里的自定义属性走 setProperty）。
 * 有它才跑得到真实事件流——纯比对 connect 的返回值只能验静态属性，
 * 「方向键换段的同时把选中搬过去」这类事实必须有活 DOM 才立得住。
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
      const style = (raw ?? {}) as Record<string, string>
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

interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** 给节点钉一个假盒子：jsdom 不排版，所有 rect 恒为 0，指示器就永远量在原点上。 */
function stubRect(el: HTMLElement, box: Box): void {
  el.getBoundingClientRect = (): DOMRect => ({
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    right: box.left + box.width,
    bottom: box.top + box.height,
    x: box.left,
    y: box.top,
    toJSON: () => ({}),
  }) as DOMRect
}

/** 钉住根的内边距盒：绝对定位的偏移从这里起算，描边宽度要能被刨掉。 */
function stubPadBox(el: HTMLElement, border: number, width: number, height: number): void {
  for (const [key, value] of [['clientLeft', border], ['clientTop', border], ['clientWidth', width], ['clientHeight', height]] as const)
    Object.defineProperty(el, key, { value, configurable: true })
}

interface Harness {
  root: HTMLElement
  indicator: HTMLElement
  hiddenInput: HTMLInputElement
  item: (value: string) => HTMLButtonElement
  service: Service<SegmentedSchema>
  changes: SegmentedValueChangeDetails[]
  value: () => string | null
  setProps: (next: Partial<Props>) => void
  render: () => void
}

function mount(initial: Partial<Props> = {}, items: readonly SegmentedItemProps[] = ITEMS): Harness {
  const props: Partial<Props> = { ...initial }
  const changes: SegmentedValueChangeDetails[] = []

  const runtime = createVanillaRuntime()
  // 受控的 value 必须由 signal 承载：宿主写回要能把订阅者唤醒，
  // 直接改普通对象没有任何东西通知机器，重渲那一拍就永远等不到
  const valueSignal = runtime.signal<string | null | undefined>(initial.value)
  // 其余 props 的换代号：写它一次，依赖 props 的 tracker 才有机会重查。
  // 两个适配器那边这件事由框架的响应式代劳
  const propsVersion = runtime.signal(0)
  const service = createService(segmentedMachine, {
    props: () => ({
      ...props,
      value: valueSignal.get(),
      onValueChange: d => changes.push(d),
    }),
    runtime,
  })

  const root = document.createElement('div')
  const indicator = document.createElement('span')
  const hiddenInput = document.createElement('input')
  const buttons = new Map<string, HTMLButtonElement>()
  root.append(indicator)
  for (const item of items) {
    const button = document.createElement('button')
    button.textContent = item.value
    buttons.set(item.value, button)
    root.append(button)
  }
  root.append(hiddenInput)
  document.body.append(root)

  service.refs.set('getRootEl', () => root)
  runtime.start()

  const render = (): void => {
    const api = connectSegmented(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    for (const item of items)
      spread(buttons.get(item.value)!, api.getItemProps(item) as Record<string, unknown>)
    spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
    spread(hiddenInput, api.getHiddenInputProps() as Record<string, unknown>)
  }

  // 任一 cell 变化即重渲，与两个适配器同语义
  runtime.subscribe(render)
  render()

  return {
    root,
    indicator,
    hiddenInput,
    item: value => buttons.get(value)!,
    service,
    changes,
    value: () => service.context.get('value') ?? null,
    setProps: (next) => {
      Object.assign(props, next)
      if ('value' in next)
        valueSignal.set(next.value)
      propsVersion.set(v => v + 1)
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

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
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

afterEach(() => {
  document.body.innerHTML = ''
})

describe('resolveSegmentedIndicator 几何', () => {
  const root = { left: 100, top: 50, width: 300, height: 40 }

  it('ltr：起始缘从根的左缘量起', () => {
    expect(resolveSegmentedIndicator(root, { left: 200, top: 50, width: 100, height: 40 }, false)).toEqual({
      inlineStart: 100,
      inlineSize: 100,
      blockStart: 0,
      blockSize: 40,
    })
  })

  it('rtl：起始缘改从根的右缘往左量，最靠左那一段离起始缘最远', () => {
    const first = { left: 100, top: 50, width: 100, height: 40 }
    expect(resolveSegmentedIndicator(root, first, false).inlineStart).toBe(0)
    expect(resolveSegmentedIndicator(root, first, true)).toEqual({
      inlineStart: 200,
      inlineSize: 100,
      blockStart: 0,
      blockSize: 40,
    })
  })

  it('竖排：块轴偏移按条目顶边与根顶边的差算', () => {
    expect(resolveSegmentedIndicator(
      { left: 0, top: 0, width: 120, height: 120 },
      { left: 0, top: 80, width: 120, height: 40 },
      false,
    )).toEqual({ inlineStart: 0, inlineSize: 120, blockStart: 80, blockSize: 40 })
  })
})

describe('segmentedMachine 选中值', () => {
  it('非受控：点一段就落值并发出意图', () => {
    const h = mount({ defaultValue: 'day' })
    click(h.item('month'))
    expect(h.value()).toBe('month')
    expect(h.changes).toEqual([{ value: 'month' }])
  })

  it('受控：点击只发意图不自改，宿主写回后才切过去', () => {
    const h = mount({ value: 'day' })
    click(h.item('month'))
    expect(h.value()).toBe('day')
    expect(h.changes).toEqual([{ value: 'month' }])
    expect(h.item('month').getAttribute('aria-checked')).toBe('false')

    h.setProps({ value: 'month' })
    expect(h.item('month').getAttribute('aria-checked')).toBe('true')
    expect(h.item('day').getAttribute('aria-checked')).toBe('false')
  })

  it('表单重置：值回到 defaultValue', () => {
    const h = mount({ defaultValue: 'day' })
    h.service.send({ type: 'VALUE.SET', value: 'month' })
    expect(h.value()).toBe('month')
    h.service.send({ type: 'FORM.RESET' })
    expect(h.value()).toBe('day')
  })

  it('受控且宿主没声明 defaultValue：重置一动不动，一条意图都不发', () => {
    const h = mount({ value: 'day' })
    h.service.send({ type: 'FORM.RESET' })
    expect(h.value()).toBe('day')
    expect(h.changes).toEqual([])
  })
})

describe('connectSegmented ARIA', () => {
  it('root 是 radiogroup，段是 radio 且未选中也显式报 false', () => {
    const h = mount({ defaultValue: 'day' })
    expect(h.root.getAttribute('role')).toBe('radiogroup')
    expect(h.root.getAttribute('aria-orientation')).toBe('horizontal')
    expect(h.root.getAttribute('data-orientation')).toBe('horizontal')
    expect(h.item('day').getAttribute('role')).toBe('radio')
    expect(h.item('day').getAttribute('type')).toBe('button')
    expect(h.item('day').getAttribute('aria-checked')).toBe('true')
    expect(h.item('month').getAttribute('aria-checked')).toBe('false')
    expect(h.item('day').getAttribute('data-state')).toBe('checked')
    expect(h.item('month').getAttribute('data-state')).toBe('unchecked')
  })

  it('禁用段走 aria-disabled，绝不输出原生 disabled', () => {
    const h = mount()
    expect(h.item('week').getAttribute('aria-disabled')).toBe('true')
    expect(h.item('week').getAttribute('data-disabled')).toBe('')
    expect(h.item('week').hasAttribute('disabled')).toBe(false)
    expect(h.item('day').getAttribute('aria-disabled')).toBe('false')
    expect(h.item('day').hasAttribute('data-disabled')).toBe(false)
  })

  it('整组禁用向下传导到每一段，点击不落值', () => {
    const h = mount({ disabled: true, defaultValue: 'day' })
    expect(h.root.getAttribute('data-disabled')).toBe('')
    expect(h.item('month').getAttribute('aria-disabled')).toBe('true')
    click(h.item('month'))
    expect(h.value()).toBe('day')
    expect(h.changes).toEqual([])
  })

  it('只读：点不动值，但不降对比度也不禁用', () => {
    const h = mount({ readOnly: true, defaultValue: 'day' })
    expect(h.root.getAttribute('aria-readonly')).toBe('true')
    expect(h.item('month').getAttribute('aria-disabled')).toBe('false')
    click(h.item('month'))
    expect(h.value()).toBe('day')
    expect(h.changes).toEqual([])
  })

  it('校验与必填只发无障碍属性', () => {
    const h = mount({ invalid: true, required: true })
    expect(h.root.getAttribute('aria-invalid')).toBe('true')
    expect(h.root.getAttribute('aria-required')).toBe('true')
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.root.getAttribute('data-required')).toBe('')
  })
})

describe('connectSegmented roving tabindex', () => {
  it('无选中：容器占 Tab 位兜底，段全是 -1', () => {
    const h = mount()
    expect(h.root.getAttribute('tabindex')).toBe('0')
    for (const item of ITEMS)
      expect(h.item(item.value).getAttribute('tabindex')).toBe('-1')
  })

  it('有选中：选中段独占 Tab 位，容器仍兜底 0（锚点失效也进得来）', () => {
    const h = mount({ defaultValue: 'month' })
    expect(h.root.getAttribute('tabindex')).toBe('0')
    expect(h.item('month').getAttribute('tabindex')).toBe('0')
    expect(h.item('day').getAttribute('tabindex')).toBe('-1')
  })

  it('焦点进组后容器让位，离组再收回来', () => {
    const h = mount({ defaultValue: 'day' })
    h.item('day').focus()
    expect(h.root.getAttribute('tabindex')).toBe('-1')
    h.service.send({ type: 'GROUP.BLUR' })
    expect(h.root.getAttribute('tabindex')).toBe('0')
  })

  it('焦点从组外落到容器：转投已选中的那一段，没有选中项才落第一段', () => {
    const selected = mount({ defaultValue: 'month' })
    selected.root.dispatchEvent(new FocusEvent('focus', { bubbles: false }))
    expect(focusedValue()).toBe('month')

    document.body.innerHTML = ''
    const empty = mount()
    empty.root.dispatchEvent(new FocusEvent('focus', { bubbles: false }))
    expect(focusedValue()).toBe('day')
  })
})

describe('connectSegmented 方向键导航', () => {
  it('四个方向键都走，跳过禁用段，尽头回绕，且焦点跟着选中走', () => {
    const h = mount({ defaultValue: 'day' })
    h.item('day').focus()

    expect(press(h.item('day'), 'ArrowRight').defaultPrevented).toBe(true)
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('month')

    press(h.item('month'), 'ArrowRight')
    expect(focusedValue()).toBe('day')
    expect(h.value()).toBe('day')

    press(h.item('day'), 'ArrowUp')
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('month')
  })

  it('loop=false：走到尽头停住，不回绕也不换值', () => {
    const h = mount({ defaultValue: 'month', loop: false })
    h.item('month').focus()
    press(h.item('month'), 'ArrowRight')
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('month')
  })

  it('home / End 直达首末可停留段', () => {
    const h = mount({ defaultValue: 'month' })
    h.item('month').focus()
    press(h.item('month'), 'Home')
    expect(focusedValue()).toBe('day')
    expect(h.value()).toBe('day')

    press(h.item('day'), 'End')
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('month')
  })

  it('dir=rtl：左右键语义对调，上下键不受影响', () => {
    const h = mount({ defaultValue: 'day', dir: 'rtl' })
    h.item('day').focus()
    press(h.item('day'), 'ArrowLeft')
    expect(focusedValue()).toBe('month')
    press(h.item('month'), 'ArrowRight')
    expect(focusedValue()).toBe('day')
    press(h.item('day'), 'ArrowDown')
    expect(focusedValue()).toBe('month')
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

  it('只读：方向键照常移焦点，但一个值都不落', () => {
    const h = mount({ defaultValue: 'day', readOnly: true })
    h.item('day').focus()
    press(h.item('day'), 'ArrowRight')
    expect(focusedValue()).toBe('month')
    expect(h.value()).toBe('day')
    expect(h.changes).toEqual([])
  })

  it('整组禁用：方向键一概不响，也不吞按键', () => {
    const h = mount({ defaultValue: 'day', disabled: true })
    h.item('day').focus()
    expect(press(h.item('day'), 'ArrowRight').defaultPrevented).toBe(false)
    expect(h.value()).toBe('day')
  })

  it('不归导航管的键一律放行：容器不吞 Space，也不吞带修饰键的方向键', () => {
    const h = mount({ defaultValue: 'day' })
    h.item('day').focus()
    expect(press(h.item('day'), ' ').defaultPrevented).toBe(false)
    expect(press(h.item('day'), 'ArrowRight', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(h.value()).toBe('day')
  })

  it('禁用段仍可聚焦、仍是方向键的起点', () => {
    const h = mount()
    h.item('week').focus()
    expect(focusedValue()).toBe('week')
    press(h.item('week'), 'ArrowRight')
    expect(focusedValue()).toBe('month')
  })
})

describe('connectSegmented 表单出口', () => {
  it('给了 name 才带 name，值跟着选中走', () => {
    const h = mount({ name: 'range', defaultValue: 'day' })
    expect(h.hiddenInput.getAttribute('type')).toBe('hidden')
    expect(h.hiddenInput.getAttribute('name')).toBe('range')
    expect(h.hiddenInput.getAttribute('value')).toBe('day')
    click(h.item('month'))
    expect(h.hiddenInput.getAttribute('value')).toBe('month')
  })

  it('没给 name 即不参与提交；整组禁用时不提交出值', () => {
    const h = mount({ defaultValue: 'day' })
    expect(h.hiddenInput.hasAttribute('name')).toBe(false)
    expect(h.hiddenInput.hasAttribute('disabled')).toBe(false)

    document.body.innerHTML = ''
    // 属性在场即生效，具体落成空串还是 "true" 由适配器的布尔属性写法决定
    const off = mount({ name: 'range', defaultValue: 'day', disabled: true })
    expect(off.hiddenInput.hasAttribute('disabled')).toBe(true)
  })
})

describe('connectSegmented 指示器', () => {
  /** 把根与三段摆成一排 300×40 的盒子，每段 100 宽；根带 1px 描边。 */
  function layout(h: Harness): void {
    stubRect(h.root, { left: 100, top: 50, width: 302, height: 42 })
    stubPadBox(h.root, 1, 300, 40)
    stubRect(h.item('day'), { left: 101, top: 51, width: 100, height: 40 })
    stubRect(h.item('week'), { left: 201, top: 51, width: 100, height: 40 })
    stubRect(h.item('month'), { left: 301, top: 51, width: 100, height: 40 })
  }

  it('没有选中项时收起来，不占位', () => {
    const h = mount()
    expect(h.indicator.hasAttribute('hidden')).toBe(true)
    expect(h.indicator.getAttribute('aria-hidden')).toBe('true')
  })

  it('量测结果铺成四个私有槽，描边宽度已从起点刨掉', async () => {
    const h = mount({ defaultValue: 'week' })
    layout(h)
    h.service.send({ type: 'INDICATOR.MEASURE' })
    await flushed()
    h.render()

    expect(h.indicator.hasAttribute('hidden')).toBe(false)
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('100px')
    expect(slot(h.indicator, '--xh-_segmented-indicator-y')).toBe('0px')
    expect(slot(h.indicator, '--xh-_segmented-indicator-w')).toBe('100px')
    expect(slot(h.indicator, '--xh-_segmented-indicator-h')).toBe('40px')
    expect(h.indicator.getAttribute('data-value')).toBe('week')
  })

  it('换段就跟着挪：选中值一变自动重量，不用外面催', async () => {
    const h = mount({ defaultValue: 'day' })
    layout(h)
    h.service.send({ type: 'INDICATOR.MEASURE' })
    await flushed()
    h.render()
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('0px')

    click(h.item('month'))
    await flushed()
    h.render()
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('200px')
  })

  it('rtl：起始缘从右缘往左量', async () => {
    const h = mount({ defaultValue: 'day', dir: 'rtl' })
    layout(h)
    h.service.send({ type: 'INDICATOR.MEASURE' })
    await flushed()
    h.render()
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('200px')
  })

  // 皮肤写的是 inset-inline-start，它按包含块的计算方向解析；量测只认 prop 的话，
  // 整页 rtl 而作者没传 dir 时两边各说各话，指示器会落到错的那一段上
  it('祖先声明 rtl 而没给 dir：起始缘照样从右缘量起', async () => {
    const h = mount({ defaultValue: 'day' })
    reparentUnder(h.root, 'rtl')
    layout(h)
    h.service.send({ type: 'INDICATOR.MEASURE' })
    await flushed()
    h.render()
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('200px')
  })

  it('给了 dir 就以它为准：祖先是 rtl 也从左缘量起', async () => {
    const h = mount({ defaultValue: 'day', dir: 'ltr' })
    reparentUnder(h.root, 'rtl')
    layout(h)
    h.service.send({ type: 'INDICATOR.MEASURE' })
    await flushed()
    h.render()
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('0px')
  })

  it('collection 改了就自己重量：段宽变了而根没变，尺寸观察器不响', async () => {
    const h = mount({
      defaultValue: 'month',
      collection: [{ value: 'day', label: '日' }, { value: 'week', label: '周' }, { value: 'month', label: '月' }],
    })
    layout(h)
    h.service.send({ type: 'INDICATOR.MEASURE' })
    await flushed()
    h.render()
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('200px')

    // 首段文本变长把后两段整体推右；block 模式下根的宽度钉在父级上，根本身一动不动
    stubRect(h.item('day'), { left: 101, top: 51, width: 160, height: 40 })
    stubRect(h.item('week'), { left: 261, top: 51, width: 100, height: 40 })
    stubRect(h.item('month'), { left: 361, top: 51, width: 100, height: 40 })
    h.setProps({
      collection: [{ value: 'day', label: '按日统计' }, { value: 'week', label: '周' }, { value: 'month', label: '月' }],
    })
    await flushed()
    h.render()
    expect(slot(h.indicator, '--xh-_segmented-indicator-x')).toBe('260px')
  })

  it('不发 data-orientation：盒子横竖两向都由四个槽定死，皮肤没有按排布分支的规则', () => {
    const h = mount({ defaultValue: 'day', orientation: 'vertical' })
    expect(h.indicator.hasAttribute('data-orientation')).toBe(false)
    expect(h.root.getAttribute('data-orientation')).toBe('vertical')
  })
})
