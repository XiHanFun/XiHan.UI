import type { NumberFieldSchema, NumberFieldValueChangeDetails } from '../src/number-field'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectNumberField,
  NUMBER_FIELD_CHANGE_DELAY,
  NUMBER_FIELD_CHANGE_INTERVAL,
  NUMBER_FIELD_STEP,
  numberFieldMachine,
} from '../src/number-field'

type Props = NumberFieldSchema['props']

function makeField(initial: Props = {}) {
  const changes: NumberFieldValueChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onValueChange: d => changes.push(d) })
  const service = createService(numberFieldMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    changes,
    state: () => service.state.get(),
    api: () => connectNumberField(service, normalizeProps),
    input: () => connectNumberField(service, normalizeProps).getInputProps() as Record<string, unknown>,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    keydown: (key: string, extra: Partial<KeyboardEvent> = {}) => {
      const prevented = { value: false }
      const handler = connectNumberField(service, normalizeProps).getInputProps().onKeyDown as (e: unknown) => void
      handler({
        key,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        isComposing: false,
        keyCode: 0,
        preventDefault: () => {
          prevented.value = true
        },
        ...extra,
      })
      return prevented.value
    },
    stop: () => runtime.stop(),
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('numberFieldMachine 缺省与投影', () => {
  it('缺省空值：根带 data-empty，输入框是 text + spinbutton，不报 aria-valuenow；两个按钮都还能走', () => {
    const f = makeField()
    expect(f.state()).toBe('idle')
    expect(f.api().value).toBe('')
    expect(f.api().empty).toBe(true)
    expect(Number.isNaN(f.api().valueAsNumber)).toBe(true)
    expect(f.api().getRootProps()).toMatchObject({ 'data-empty': '' })
    expect(f.input()).toMatchObject({ type: 'text', role: 'spinbutton', inputmode: 'decimal', autocomplete: 'off' })
    expect(f.input()['aria-valuenow']).toBeUndefined()
    expect(f.api().canIncrement).toBe(true)
    expect(f.api().canDecrement).toBe(true)
    expect(NUMBER_FIELD_STEP).toBe(1)
    f.stop()
  })

  it('有值时 aria-value* 三件齐全，label 与 input 互指；贴着边界时那一侧的按钮禁用', () => {
    const f = makeField({ defaultValue: '10', min: 0, max: 10, name: 'qty', required: true })
    const input = f.input()
    expect(input).toMatchObject({ 'aria-valuenow': 10, 'aria-valuemin': 0, 'aria-valuemax': 10, 'name': 'qty', 'required': true })
    expect(input['aria-labelledby']).toBe((f.api().getLabelProps() as Record<string, unknown>).id)
    expect((f.api().getLabelProps() as Record<string, unknown>).for).toBe(input.id)
    expect(f.api().canIncrement).toBe(false)
    expect(f.api().canDecrement).toBe(true)
    const inc = f.api().getIncrementTriggerProps() as Record<string, unknown>
    expect(inc).toMatchObject({ 'type': 'button', 'disabled': true, 'data-disabled': '', 'tabindex': -1, 'aria-hidden': true })
    expect((f.api().getDecrementTriggerProps() as Record<string, unknown>).disabled).toBeUndefined()
    f.stop()
  })

  it('禁用 / 只读 / 无效落到 root、control 与 input 上；禁用与只读时两个按钮都不能走', () => {
    const f = makeField({ defaultValue: '3', disabled: true, invalid: true })
    expect(f.api().getRootProps()).toMatchObject({ 'data-disabled': '', 'data-invalid': '' })
    expect(f.api().getControlProps()).toMatchObject({ 'data-disabled': '', 'data-invalid': '' })
    expect(f.input()).toMatchObject({ 'disabled': true, 'aria-invalid': 'true' })
    expect(f.api().canIncrement).toBe(false)
    expect(f.api().canDecrement).toBe(false)
    f.stop()
    const r = makeField({ defaultValue: '3', readOnly: true })
    expect(r.input().readonly).toBe(true)
    expect(r.api().getControlProps()).toMatchObject({ 'data-readonly': '' })
    expect(r.input()).toMatchObject({ 'data-readonly': '' })
    expect(r.api().canIncrement).toBe(false)
    r.stop()
  })

  it('不写 variant 时 root 与 control 都落 outline；写 subtle 如实落', () => {
    const fallback = makeField()
    expect((fallback.api().getRootProps() as Record<string, unknown>)['data-variant']).toBe('outline')
    expect((fallback.api().getControlProps() as Record<string, unknown>)['data-variant']).toBe('outline')
    fallback.stop()
    const subtle = makeField({ variant: 'subtle' })
    expect((subtle.api().getRootProps() as Record<string, unknown>)['data-variant']).toBe('subtle')
    expect((subtle.api().getControlProps() as Record<string, unknown>)['data-variant']).toBe('subtle')
    subtle.stop()
  })

  it('只投影 Field Chrome 稳定角色、布局与尺寸，皮肤不反查组件 anatomy', () => {
    const fallback = makeField()
    expect(fallback.api().getControlProps()).toMatchObject({ 'data-xh-field-chrome': '', 'data-xh-field-size': 'md' })
    expect(fallback.input()).toMatchObject({ 'data-xh-field-input': '', 'data-xh-field-layout': 'single-line' })
    expect(fallback.api().getPrefixProps()).toMatchObject({ 'data-xh-field-affix': 'prefix' })
    expect(fallback.api().getSuffixProps()).toMatchObject({ 'data-xh-field-affix': 'suffix' })
    fallback.stop()
    const sm = makeField({ size: 'sm' })
    expect(sm.api().getControlProps()).toMatchObject({ 'data-xh-field-size': 'sm' })
    sm.stop()
  })

  it('加减钮走 Action Control 的 field-inset ghost 档并常显，尺寸随 size 缺省 md', () => {
    const f = makeField()
    for (const trigger of [f.api().getIncrementTriggerProps(), f.api().getDecrementTriggerProps()]) {
      expect(trigger).toMatchObject({
        'data-xh-action-control': '',
        'data-xh-action-profile': 'field-inset',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': 'md',
      })
    }
    f.stop()
    const lg = makeField({ size: 'lg' })
    expect(lg.api().getIncrementTriggerProps()).toMatchObject({ 'data-xh-action-size': 'lg' })
    lg.stop()
  })

  it('前后缀对读屏隐藏，名字只由 label 给', () => {
    const f = makeField()
    expect(f.api().getPrefixProps()).toMatchObject({ 'aria-hidden': true })
    expect(f.api().getSuffixProps()).toMatchObject({ 'aria-hidden': true })
    f.stop()
  })
})

describe('numberFieldMachine 步进', () => {
  it('increment / decrement 按 step 走并夹在 min / max 内，每次都通知', () => {
    const f = makeField({ defaultValue: '4', step: 2, max: 7 })
    f.api().increment()
    expect(f.api().value).toBe('6')
    f.api().increment()
    expect(f.api().value).toBe('7')
    f.api().decrement()
    expect(f.api().value).toBe('5')
    expect(f.changes.map(c => c.value)).toEqual(['6', '7', '5'])
    expect(f.changes.at(-1)).toEqual({ value: '5', valueAsNumber: 5 })
    f.stop()
  })

  it('方向键：ArrowUp/Down 走一步，PageUp/Down 走大步（缺省 step × 10），都拦下默认行为', () => {
    const f = makeField({ defaultValue: '0' })
    expect(f.keydown('ArrowUp')).toBe(true)
    expect(f.api().value).toBe('1')
    expect(f.keydown('PageUp')).toBe(true)
    expect(f.api().value).toBe('11')
    expect(f.keydown('PageDown')).toBe(true)
    expect(f.api().value).toBe('1')
    expect(f.keydown('ArrowDown')).toBe(true)
    expect(f.api().value).toBe('0')
    f.stop()
  })

  it('largeStep 给了就按它走；带修饰键或输入法组合中的按键不接', () => {
    const f = makeField({ defaultValue: '0', largeStep: 5 })
    f.keydown('PageUp')
    expect(f.api().value).toBe('5')
    expect(f.keydown('ArrowUp', { ctrlKey: true })).toBe(false)
    expect(f.keydown('ArrowUp', { isComposing: true })).toBe(false)
    expect(f.api().value).toBe('5')
    f.stop()
  })

  it('home/End 只在给了 min/max 时才接，否则放行输入框的原生光标行为', () => {
    const bare = makeField({ defaultValue: '3' })
    expect(bare.keydown('Home')).toBe(false)
    expect(bare.keydown('End')).toBe(false)
    expect(bare.api().value).toBe('3')
    bare.stop()

    const bounded = makeField({ defaultValue: '3', min: 1, max: 9 })
    expect(bounded.keydown('End')).toBe(true)
    expect(bounded.api().value).toBe('9')
    expect(bounded.keydown('Home')).toBe(true)
    expect(bounded.api().value).toBe('1')
    bounded.stop()
  })

  it('禁用或只读时步进一律不走', () => {
    const f = makeField({ defaultValue: '3', readOnly: true })
    f.api().increment()
    expect(f.keydown('ArrowUp')).toBe(false)
    expect(f.api().value).toBe('3')
    expect(f.changes).toEqual([])
    f.stop()
  })
})

describe('numberFieldMachine 输入与规范化', () => {
  it('输入途中的中间态原样保留，失焦才规范化；越界值夹回区间', () => {
    const f = makeField({ min: 0, max: 10 })
    f.api().setValue('1.')
    expect(f.api().value).toBe('1.')
    f.service.send({ type: 'INPUT.BLUR' })
    expect(f.api().value).toBe('1')
    f.api().setValue('42')
    f.service.send({ type: 'INPUT.BLUR' })
    expect(f.api().value).toBe('10')
    f.stop()
  })

  it('作者给的 parse / format 走一整条链：显示串与数值各按自己的口径', () => {
    const f = makeField({
      defaultValue: '1,000',
      parse: text => Number(text.replace(/,/g, '')),
      format: value => value.toLocaleString('en-US'),
    })
    expect(f.api().valueAsNumber).toBe(1000)
    f.api().increment()
    expect(f.api().value).toBe('1,001')
    expect(f.changes.at(-1)).toEqual({ value: '1,001', valueAsNumber: 1001 })
    f.stop()
  })
})

describe('numberFieldMachine 按住连发', () => {
  it('按下先走一步进 spinning，过 changeDelay 后按 changeInterval 连发，松手回 idle', () => {
    vi.useFakeTimers()
    const f = makeField({ defaultValue: '0' })
    f.service.send({ type: 'PRESS.START', direction: 1 })
    expect(f.state()).toBe('spinning')
    expect(f.api().value).toBe('1')

    vi.advanceTimersByTime(NUMBER_FIELD_CHANGE_DELAY - 1)
    expect(f.api().value).toBe('1')
    vi.advanceTimersByTime(1 + NUMBER_FIELD_CHANGE_INTERVAL * 3)
    expect(f.api().value).toBe('4')

    f.service.send({ type: 'PRESS.END' })
    expect(f.state()).toBe('idle')
    vi.advanceTimersByTime(NUMBER_FIELD_CHANGE_INTERVAL * 5)
    expect(f.api().value).toBe('4')
    f.stop()
  })

  it('按钮的 pointerdown 只认主键并拦默认行为，键盘触发的 click（detail=0）走一步', () => {
    const f = makeField({ defaultValue: '0' })
    const inc = f.api().getIncrementTriggerProps() as { onPointerDown: (e: unknown) => void, onClick: (e: unknown) => void, onPointerUp: () => void }
    inc.onPointerDown({ button: 2, preventDefault: () => {} })
    expect(f.state()).toBe('idle')
    let prevented = false
    inc.onPointerDown({
      button: 0,
      preventDefault: () => {
        prevented = true
      },
    })
    expect(prevented).toBe(true)
    expect(f.state()).toBe('spinning')
    expect(f.api().value).toBe('1')
    inc.onPointerUp()
    expect(f.state()).toBe('idle')

    inc.onClick({ detail: 0 })
    expect(f.api().value).toBe('2')
    // 指针那一路的 click 不再走一步：pointerdown 已经走过
    inc.onClick({ detail: 1 })
    expect(f.api().value).toBe('2')
    f.stop()
  })
})

describe('numberFieldMachine 受控与表单重置', () => {
  it('受控 value：步进只发意图不自改，宿主写回后才变', () => {
    const f = makeField({ value: '5' })
    f.api().increment()
    expect(f.api().value).toBe('5')
    expect(f.changes).toEqual([{ value: '6', valueAsNumber: 6 }])
    f.setProps({ value: '6' })
    expect(f.api().value).toBe('6')
    f.stop()
  })

  it('表单重置回到 defaultValue；受控且没给默认值时不动也不通知', () => {
    const f = makeField({ defaultValue: '2' })
    f.api().setValue('9')
    f.service.send({ type: 'FORM.RESET' })
    expect(f.api().value).toBe('2')
    f.stop()

    const c = makeField({ value: '5' })
    c.service.send({ type: 'FORM.RESET' })
    expect(c.api().value).toBe('5')
    expect(c.changes).toEqual([])
    c.stop()
  })
})

describe('加减钮的按压通道：Space / Enter 与触屏按住投影 data-pressed，与连发互不牵连', () => {
  type Dict = Record<string, unknown>
  const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
  const touch = (): PointerEvent => ({ pointerType: 'touch', button: 0, preventDefault: vi.fn() } as unknown as PointerEvent)
  const fire = (props: Dict, name: string, event?: unknown): void => {
    (props[name] as (e?: unknown) => void)(event)
  }
  const inc = (f: ReturnType<typeof makeField>): Dict => f.api().getIncrementTriggerProps() as Dict
  const dec = (f: ReturnType<typeof makeField>): Dict => f.api().getDecrementTriggerProps() as Dict

  it('keydown 在场、keyup 撤下；失焦撤下；键盘按住不走步进也不进 spinning；另一颗钮的 keyup 松不开这颗', () => {
    const f = makeField({ defaultValue: '0' })
    expect(inc(f)['data-pressed']).toBeUndefined()
    fire(inc(f), 'onKeyDown', key(' '))
    expect(inc(f)['data-pressed']).toBe('')
    expect(dec(f)['data-pressed']).toBeUndefined()
    expect(f.state()).toBe('idle')
    expect(f.api().value).toBe('0')
    fire(dec(f), 'onKeyUp', key(' '))
    expect(inc(f)['data-pressed']).toBe('')
    fire(inc(f), 'onKeyUp', key(' '))
    expect(inc(f)['data-pressed']).toBeUndefined()
    fire(dec(f), 'onKeyDown', key('Enter'))
    expect(dec(f)['data-pressed']).toBe('')
    fire(dec(f), 'onBlur')
    expect(dec(f)['data-pressed']).toBeUndefined()
    f.stop()
  })

  it('触屏按下同时进按压通道与连发：先走一步、投影 data-pressed；抬起 / 取消两路一起收；鼠标按下只连发不投影', () => {
    vi.useFakeTimers()
    const f = makeField({ defaultValue: '0' })
    const down = touch()
    fire(inc(f), 'onPointerDown', down)
    expect(down.preventDefault).toHaveBeenCalled()
    expect(inc(f)['data-pressed']).toBe('')
    expect(f.state()).toBe('spinning')
    expect(f.api().value).toBe('1')
    fire(inc(f), 'onPointerUp')
    expect(inc(f)['data-pressed']).toBeUndefined()
    expect(f.state()).toBe('idle')
    fire(dec(f), 'onPointerDown', touch())
    expect(dec(f)['data-pressed']).toBe('')
    expect(f.api().value).toBe('0')
    fire(dec(f), 'onPointerCancel')
    expect(dec(f)['data-pressed']).toBeUndefined()
    expect(f.state()).toBe('idle')
    fire(inc(f), 'onPointerDown', { pointerType: 'mouse', button: 0, preventDefault: vi.fn() })
    expect(inc(f)['data-pressed']).toBeUndefined()
    expect(f.state()).toBe('spinning')
    fire(inc(f), 'onPointerUp')
    f.stop()
  })

  it('不进：禁用、只读，或该侧已贴住端点时按住不投影；另一侧照常', () => {
    for (const props of [{ defaultValue: '5', disabled: true }, { defaultValue: '5', readOnly: true }] as Props[]) {
      const f = makeField(props)
      fire(inc(f), 'onKeyDown', key(' '))
      fire(dec(f), 'onPointerDown', touch())
      expect(inc(f)['data-pressed']).toBeUndefined()
      expect(dec(f)['data-pressed']).toBeUndefined()
      f.stop()
    }
    const atMax = makeField({ defaultValue: '10', min: 0, max: 10 })
    expect(inc(atMax).disabled).toBe(true)
    fire(inc(atMax), 'onKeyDown', key('Enter'))
    expect(inc(atMax)['data-pressed']).toBeUndefined()
    fire(dec(atMax), 'onKeyDown', key('Enter'))
    expect(dec(atMax)['data-pressed']).toBe('')
    atMax.stop()
    const atMin = makeField({ defaultValue: '0', min: 0, max: 10 })
    fire(dec(atMin), 'onKeyDown', key('Enter'))
    expect(dec(atMin)['data-pressed']).toBeUndefined()
    fire(inc(atMin), 'onKeyDown', key('Enter'))
    expect(inc(atMin)['data-pressed']).toBe('')
    atMin.stop()
    // 空值两个方向都还能走，也都能按
    const empty = makeField({ min: 0, max: 10 })
    fire(inc(empty), 'onKeyDown', key('Enter'))
    expect(inc(empty)['data-pressed']).toBe('')
    empty.stop()
  })

  it('按住途中值贴到端点、区间收紧或转入禁用 / 只读：按钮转 disabled 不会再来 keyup，按压面由机器自己收', () => {
    const reached = makeField({ defaultValue: '9', min: 0, max: 10 })
    fire(inc(reached), 'onKeyDown', key('Enter'))
    expect(inc(reached)['data-pressed']).toBe('')
    reached.service.send({ type: 'VALUE.STEP', direction: 1 })
    expect(reached.api().value).toBe('10')
    expect(inc(reached)['data-pressed']).toBeUndefined()
    reached.stop()

    const narrowed = makeField({ defaultValue: '5' })
    fire(inc(narrowed), 'onKeyDown', key('Enter'))
    narrowed.setProps({ max: 5 })
    expect(inc(narrowed)['data-pressed']).toBeUndefined()
    narrowed.stop()

    for (const inert of [{ disabled: true }, { readOnly: true }] as Props[]) {
      const f = makeField({ defaultValue: '5' })
      fire(dec(f), 'onKeyDown', key('Enter'))
      expect(dec(f)['data-pressed']).toBe('')
      f.setProps(inert)
      expect(dec(f)['data-pressed']).toBeUndefined()
      f.stop()
    }
  })
})
