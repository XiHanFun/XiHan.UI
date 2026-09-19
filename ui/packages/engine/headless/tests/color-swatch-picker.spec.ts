// @vitest-environment jsdom

import type { Service } from '@xihan-ui/core'
import type { ColorSwatchPickerSchema } from '../src/color-swatch-picker'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { colorSwatchPickerMachine, connectColorSwatchPicker } from '../src/color-swatch-picker'

type Props = ColorSwatchPickerSchema['props']
type Dict = Record<string, unknown>

const COLORS = ['#e11d48', '#f59e0b', '#10b981']

function makeService(props: Props = {}): Service<ColorSwatchPickerSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(colorSwatchPickerMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function api(service: Service<ColorSwatchPickerSchema>) {
  return connectColorSwatchPicker(service, normalizeProps)
}

/** 把 connect 的产出打到真节点上：方向键与进组落焦要查活 DOM。 */
function mount(service: Service<ColorSwatchPickerSchema>, values = COLORS): { root: HTMLElement, items: HTMLElement[], paint: () => void } {
  const root = document.createElement('div')
  document.body.append(root)
  const items = values.map(() => {
    const el = document.createElement('div')
    root.append(el)
    return el
  })
  const paint = (): void => {
    const a = api(service)
    Object.entries(a.getRootProps() as Dict).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number')
        root.setAttribute(k, String(v))
    })
    items.forEach((el, i) => {
      Object.entries(a.getItemProps({ value: values[i]! }) as Dict).forEach(([k, v]) => {
        if (typeof v === 'string' || typeof v === 'number')
          el.setAttribute(k, String(v))
        else if (v == null)
          el.removeAttribute(k)
      })
    })
  }
  paint()
  return { root, items, paint }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('colorSwatchPickerMachine', () => {
  it('点一格即选中并记锚点；选中按颜色比，写法不同也算同一格', () => {
    const onValueChange = vi.fn()
    const s = makeService({ defaultValue: 'rgb(225, 29, 72)', onValueChange })
    expect(api(s).isSelected('#e11d48')).toBe(true)
    expect(api(s).isSelected('#F59E0B')).toBe(false)
    ;((api(s).getItemProps({ value: '#f59e0b' }) as Dict).onClick as () => void)()
    expect(api(s).value).toBe('#f59e0b')
    expect(api(s).focusedValue).toBe('#f59e0b')
    expect(onValueChange).toHaveBeenCalledWith({ value: '#f59e0b' })
  })

  it('禁用与只读都选不动：禁用格仍可聚焦、记锚点', () => {
    const ro = makeService({ defaultValue: '#e11d48', readOnly: true })
    ;((api(ro).getItemProps({ value: '#f59e0b' }) as Dict).onClick as () => void)()
    expect(api(ro).value).toBe('#e11d48')
    const s = makeService({ defaultValue: '#e11d48', swatches: [{ value: '#e11d48' }, { value: '#f59e0b', disabled: true }] })
    ;((api(s).getItemProps({ value: '#f59e0b' }) as Dict).onClick as () => void)()
    expect(api(s).value).toBe('#e11d48')
    ;((api(s).getItemProps({ value: '#f59e0b' }) as Dict).onFocus as () => void)()
    expect(api(s).focusedValue).toBe('#f59e0b')
    expect((api(s).getItemProps({ value: '#f59e0b' }) as Dict)['aria-disabled']).toBe('true')
  })

  it('setValue 与表单重置；离组清锚点', () => {
    const s = makeService({ defaultValue: '#e11d48' })
    s.send({ type: 'VALUE.SET', value: '#10b981' })
    expect(api(s).value).toBe('#10b981')
    s.send({ type: 'VALUE.SET', value: null })
    expect(api(s).value).toBeNull()
    s.send({ type: 'FORM.RESET' })
    expect(api(s).value).toBe('#e11d48')
    s.send({ type: 'ITEM.FOCUS', value: '#e11d48' })
    s.send({ type: 'GROUP.BLUR' })
    expect(api(s).focusedValue).toBeNull()
  })
})

describe('connectColorSwatchPicker 投影', () => {
  it('根是 radiogroup，格子是 radio 且名字直给；锚点格独占 Tab 位', () => {
    const s = makeService({ defaultValue: '#f59e0b', swatches: [{ value: '#e11d48', label: '品牌红' }, { value: '#f59e0b' }] })
    expect(api(s).getRootProps()).toMatchObject({ 'role': 'radiogroup', 'aria-label': 'Color swatches', 'tabindex': 0 })
    const first = api(s).getItemProps({ value: '#e11d48' }) as Dict
    expect(first).toMatchObject({ 'role': 'radio', 'aria-checked': 'false', 'aria-label': '品牌红', 'tabindex': -1, 'data-value': '#e11d48' })
    const second = api(s).getItemProps({ value: '#f59e0b' }) as Dict
    expect(second).toMatchObject({ 'aria-checked': 'true', 'aria-label': 'Color #f59e0b', 'tabindex': 0, 'data-state': 'checked' })
    expect(api(s).swatches).toEqual([
      { value: '#e11d48', label: '品牌红', disabled: false },
      { value: '#f59e0b', label: '#f59e0b', disabled: false },
    ])
  })

  it('标题只随整组置灰：单格禁用不投影到 label', () => {
    const partial = makeService({ swatches: [{ value: '#e11d48' }, { value: '#f59e0b', disabled: true }] })
    const label = api(partial).getLabelProps() as Dict
    expect(label.id).toBe((api(partial).getRootProps() as Dict)['aria-labelledby'])
    expect(label['data-disabled']).toBeUndefined()
    const whole = makeService({ disabled: true })
    expect((api(whole).getLabelProps() as Dict)['data-disabled']).toBe('')
  })

  it('色块经家族属性投影颜色；解析不出的串不画颜色层；表单影子是 radio', () => {
    const s = makeService({ defaultValue: '#e11d48', name: 'accent', size: 'lg' })
    const swatch = api(s).getSwatchProps({ value: '#e11d48' }) as Dict
    expect(swatch).toMatchObject({ 'aria-hidden': true, 'data-xh-swatch': '', 'data-xh-swatch-size': 'lg', 'data-state': 'checked' })
    expect((swatch.style as Dict)['--xh-_swatch-color']).toBe('rgba(225, 29, 72, 1)')
    expect(((api(s).getSwatchProps({ value: 'tomato' }) as Dict).style as Dict)['--xh-_swatch-color']).toBe('')
    expect(api(s).getHiddenInputProps({ value: '#e11d48' })).toMatchObject({ type: 'radio', name: 'accent', value: '#e11d48', checked: true, inert: true })
    expect((api(s).getHiddenInputProps({ value: '#f59e0b' }) as Dict).checked).toBe(false)
  })

  it('方向键在活 DOM 里移焦点并选中，末格回绕；只读时焦点照走不落值；Space 选中', () => {
    const s = makeService({ defaultValue: '#e11d48' })
    const { root, items, paint } = mount(s)
    items[0]!.focus()
    ;((api(s).getItemProps({ value: COLORS[0]! }) as Dict).onFocus as () => void)()
    // 事件对象的 currentTarget 只读：真派发，且每次先把最新的属性打回节点（锚点的 tabindex 在变）
    const dispatch = (k: string): void => {
      paint()
      root.addEventListener('keydown', (api(s).getRootProps() as Dict).onKeyDown as EventListener, { once: true })
      root.dispatchEvent(new KeyboardEvent('keydown', { key: k, cancelable: true, bubbles: true }))
    }
    dispatch('ArrowRight')
    expect(api(s).value).toBe(COLORS[1])
    expect(document.activeElement).toBe(items[1])
    dispatch('ArrowRight')
    dispatch('ArrowRight')
    expect(api(s).value).toBe(COLORS[0])
    ;(items[2] as HTMLElement).focus()
    ;((api(s).getItemProps({ value: COLORS[2]! }) as Dict).onFocus as () => void)()
    const space = new KeyboardEvent('keydown', { key: ' ', cancelable: true })
    ;((api(s).getItemProps({ value: COLORS[2]! }) as Dict).onKeyDown as (e: KeyboardEvent) => void)(space)
    expect(space.defaultPrevented).toBe(true)
    expect(api(s).value).toBe(COLORS[2])
  })

  it('只读：方向键移焦点但不落值', () => {
    const s = makeService({ defaultValue: '#e11d48', readOnly: true })
    const { root, items } = mount(s)
    items[0]!.focus()
    root.addEventListener('keydown', (api(s).getRootProps() as Dict).onKeyDown as EventListener, { once: true })
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true, bubbles: true }))
    expect(document.activeElement).toBe(items[1])
    expect(api(s).value).toBe('#e11d48')
  })
})

describe('按压通道', () => {
  type Handlers = Record<string, unknown> & {
    onKeyDown: (e: KeyboardEvent) => void
    onKeyUp: (e: KeyboardEvent) => void
    onBlur: () => void
    onPointerDown: (e: PointerEvent) => void
    onPointerUp: () => void
    onPointerCancel: () => void
  }
  const key = (name: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent =>
    new KeyboardEvent('keydown', { key: name, cancelable: true, ...init })
  const touch = { pointerType: 'touch' } as PointerEvent
  const mouse = { pointerType: 'mouse' } as PointerEvent
  const itemOf = (s: Service<ColorSwatchPickerSchema>, value: string): Handlers => api(s).getItemProps({ value }) as Handlers
  const pressed = (s: Service<ColorSwatchPickerSchema>, value: string): boolean => itemOf(s, value)['data-pressed'] === ''

  /** props 挂在 signal 上：途中转禁用那一路要靠 watch 的 track 复查，普通对象压根不会跑。 */
  function makeReactive(initial: Props = {}): { service: Service<ColorSwatchPickerSchema>, setProps: (next: Props) => void } {
    const runtime = createVanillaRuntime()
    const props = runtime.signal<Props>(initial)
    const service = createService(colorSwatchPickerMachine, { props: () => props.get(), runtime })
    runtime.start()
    return { service, setProps: next => props.set({ ...props.get(), ...next }) }
  }

  it('按住 Space 投影 data-pressed 并在 keydown 那一刻选中，长按重复键不重报，抬起撤下；另一格的 keyup 不串；Enter 不是激活键', () => {
    const s = makeService({ defaultValue: '#e11d48' })
    const down = key(' ')
    itemOf(s, COLORS[1]!).onKeyDown(down)
    expect(down.defaultPrevented).toBe(true)
    expect(pressed(s, COLORS[1]!)).toBe(true)
    expect(pressed(s, COLORS[0]!)).toBe(false)
    expect(api(s).value).toBe(COLORS[1])
    itemOf(s, COLORS[1]!).onKeyDown(key(' ', { repeat: true }))
    expect(pressed(s, COLORS[1]!)).toBe(true)
    itemOf(s, COLORS[0]!).onKeyUp(key(' '))
    expect(pressed(s, COLORS[1]!)).toBe(true)
    itemOf(s, COLORS[1]!).onKeyUp(key(' '))
    expect(pressed(s, COLORS[1]!)).toBe(false)

    itemOf(s, COLORS[2]!).onKeyDown(key('Enter'))
    expect(pressed(s, COLORS[2]!)).toBe(false)
    expect(api(s).value).toBe(COLORS[1])

    itemOf(s, COLORS[2]!).onKeyDown(key(' '))
    expect(pressed(s, COLORS[2]!)).toBe(true)
    itemOf(s, COLORS[2]!).onBlur()
    expect(pressed(s, COLORS[2]!)).toBe(false)
  })

  it('触屏按下进按压面，抬起或取消撤下；鼠标按下不走这一路；按压不改选中', () => {
    const s = makeService({ defaultValue: '#e11d48' })
    itemOf(s, COLORS[1]!).onPointerDown(mouse)
    expect(pressed(s, COLORS[1]!)).toBe(false)
    itemOf(s, COLORS[1]!).onPointerDown(touch)
    expect(pressed(s, COLORS[1]!)).toBe(true)
    itemOf(s, COLORS[1]!).onPointerCancel()
    expect(pressed(s, COLORS[1]!)).toBe(false)
    itemOf(s, COLORS[1]!).onPointerDown(touch)
    itemOf(s, COLORS[1]!).onPointerUp()
    expect(pressed(s, COLORS[1]!)).toBe(false)
    expect(api(s).value).toBe(COLORS[0])
  })

  it('禁用的格子不进；整组禁用或只读谁都不进', () => {
    const item = makeService({ swatches: [{ value: COLORS[0]!, disabled: true }, { value: COLORS[1]! }] })
    itemOf(item, COLORS[0]!).onKeyDown(key(' '))
    itemOf(item, COLORS[0]!).onPointerDown(touch)
    expect(pressed(item, COLORS[0]!)).toBe(false)
    itemOf(item, COLORS[1]!).onPointerDown(touch)
    expect(pressed(item, COLORS[1]!)).toBe(true)

    const disabled = makeService({ disabled: true })
    itemOf(disabled, COLORS[1]!).onKeyDown(key(' '))
    itemOf(disabled, COLORS[1]!).onPointerDown(touch)
    expect(pressed(disabled, COLORS[1]!)).toBe(false)

    const readOnly = makeService({ readOnly: true })
    itemOf(readOnly, COLORS[1]!).onKeyDown(key(' '))
    itemOf(readOnly, COLORS[1]!).onPointerDown(touch)
    expect(pressed(readOnly, COLORS[1]!)).toBe(false)
  })

  it('按住途中整组转入禁用或只读即松开', () => {
    const disabled = makeReactive()
    itemOf(disabled.service, COLORS[1]!).onPointerDown(touch)
    expect(pressed(disabled.service, COLORS[1]!)).toBe(true)
    disabled.setProps({ disabled: true })
    expect(pressed(disabled.service, COLORS[1]!)).toBe(false)

    const readOnly = makeReactive()
    itemOf(readOnly.service, COLORS[1]!).onPointerDown(touch)
    expect(pressed(readOnly.service, COLORS[1]!)).toBe(true)
    readOnly.setProps({ readOnly: true })
    expect(pressed(readOnly.service, COLORS[1]!)).toBe(false)
  })
})
