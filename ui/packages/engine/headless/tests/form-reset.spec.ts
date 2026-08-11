// @vitest-environment jsdom
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { checkboxGroupMachine } from '../src/checkbox-group'
import { colorPickerMachine } from '../src/color-picker'
import { dateFieldMachine } from '../src/date-field'
import { datePickerMachine } from '../src/date-picker'
import { editableMachine } from '../src/editable'
import { fileUploadMachine } from '../src/file-upload'
import { numberFieldMachine } from '../src/number-field'
import { pinInputMachine } from '../src/pin-input'
import { radioGroupMachine } from '../src/radio-group'
import { ratingMachine } from '../src/rating'
import { selectMachine } from '../src/select'
import { sliderMachine } from '../src/slider'
import { tagsInputMachine } from '../src/tags-input'
import { textFieldMachine } from '../src/text-field'
import { timeFieldMachine } from '../src/time-field'
import { timePickerMachine } from '../src/time-picker'
import { treeSelectMachine } from '../src/tree-select'

/**
 * FORM.RESET 的语义：把组件变回它此刻挂载会长成的样子。
 * 适配器那侧只负责把宿主表单的 reset 翻成这条事件，值怎么回落全在机器里，所以判据落在机器层。
 */

function start<T extends MachineSchema>(machine: MachineConfig<T>, props: object): Service<T> {
  const runtime = createVanillaRuntime()
  // 同一个对象原样返回：原地改字段即可模拟宿主写回
  const service = createService(machine, { props: () => props as never, runtime })
  runtime.start()
  return service
}

function reset<T extends MachineSchema>(s: Service<T>): void {
  s.send({ type: 'FORM.RESET' } as T['event'])
}

/** 17 个表单字段组件：改过值之后重置，回到各自声明的默认值。 */
const 值回落 = [
  { 名: 'checkbox-group', machine: checkboxGroupMachine, props: { defaultValue: ['a'] }, 改: { type: 'VALUE.SET', value: ['a', 'b'] }, 键: 'value', 期望: ['a'] },
  { 名: 'radio-group', machine: radioGroupMachine, props: { defaultValue: 'a' }, 改: { type: 'VALUE.SET', value: 'b' }, 键: 'value', 期望: 'a' },
  { 名: 'number-field', machine: numberFieldMachine, props: { defaultValue: '3' }, 改: { type: 'VALUE.SET', value: '9' }, 键: 'value', 期望: '3' },
  { 名: 'text-field', machine: textFieldMachine, props: { defaultValue: '甲' }, 改: { type: 'VALUE.SET', value: '乙' }, 键: 'value', 期望: '甲' },
  { 名: 'slider', machine: sliderMachine, props: { defaultValue: [20] }, 改: { type: 'VALUE.SET', value: [80] }, 键: 'value', 期望: [20] },
  { 名: 'pin-input', machine: pinInputMachine, props: { defaultValue: ['1', '2'] }, 改: { type: 'VALUE.SET', value: ['9', '9'] }, 键: 'value', 期望: ['1', '2'] },
  { 名: 'tree-select', machine: treeSelectMachine, props: { defaultValue: ['a'] }, 改: { type: 'VALUE.SET', value: ['b'] }, 键: 'value', 期望: ['a'] },
  { 名: 'rating', machine: ratingMachine, props: { defaultValue: 2 }, 改: { type: 'VALUE.SET', value: 5 }, 键: 'value', 期望: 2 },
  { 名: 'select', machine: selectMachine, props: { defaultValue: 'a' }, 改: { type: 'VALUE.SET', value: ['b'] }, 键: 'value', 期望: ['a'] },
  { 名: 'color-picker', machine: colorPickerMachine, props: { defaultValue: '#112233' }, 改: { type: 'VALUE.SET', value: '#445566' }, 键: 'value', 期望: '#112233' },
  { 名: 'date-picker', machine: datePickerMachine, props: { defaultValue: '2026-01-02' }, 改: { type: 'VALUE.SET', value: ['2026-03-04'] }, 键: 'value', 期望: ['2026-01-02'] },
  { 名: 'date-field', machine: dateFieldMachine, props: { defaultValue: '2026-01-02' }, 改: { type: 'VALUE.SET', value: '2026-03-04' }, 键: 'value', 期望: '2026-01-02' },
  { 名: 'time-field', machine: timeFieldMachine, props: { defaultValue: '08:30' }, 改: { type: 'VALUE.SET', value: '19:45' }, 键: 'value', 期望: '08:30' },
  { 名: 'time-picker', machine: timePickerMachine, props: { defaultValue: '08:30' }, 改: { type: 'VALUE.SET', value: '19:45' }, 键: 'value', 期望: '08:30' },
  { 名: 'editable', machine: editableMachine, props: { defaultValue: '甲' }, 改: { type: 'VALUE.SET', value: '乙' }, 键: 'value', 期望: '甲' },
  { 名: 'tags-input', machine: tagsInputMachine, props: { defaultValue: ['x'] }, 改: { type: 'VALUE.SET', value: ['x', 'y'] }, 键: 'value', 期望: ['x'] },
] as const

describe.each(值回落)('$名', ({ machine, props, 改, 键, 期望 }) => {
  it('改过之后重置，值回到 defaultValue', () => {
    const s = start(machine as never, { ...props })
    s.send(改 as never)
    expect(s.context.get(键 as never)).not.toEqual(期望)
    reset(s)
    expect(s.context.get(键 as never)).toEqual(期望)
  })

  it('受控且宿主没声明 defaultValue：一动不动，一条意图都不发', () => {
    const onValueChange = vi.fn()
    // 只给受控值、不给默认值
    const controlled = Array.isArray(期望) ? [...(期望 as unknown[])] : 期望
    const s = start(machine as never, { value: controlled, onValueChange })
    reset(s)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('几处照直做会错的地方', () => {
  it('file-upload：默认为空时重置真的清得掉（FILES.SET 走 intake，空数组是空操作）', () => {
    const f = new File(['x'], 'a.txt', { type: 'text/plain' })
    const s = start(fileUploadMachine, {})
    s.send({ type: 'FILES.ADD', files: [f] } as never)
    expect((s.context.get('acceptedFiles' as never) as File[]).length).toBe(1)
    reset(s)
    expect((s.context.get('acceptedFiles' as never) as File[]).length).toBe(0)
  })

  it('file-upload：宿主声明了 defaultFiles 就回到那一份', () => {
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    const s = start(fileUploadMachine, { defaultFiles: [a], maxFiles: 5 })
    s.send({ type: 'FILES.ADD', files: [b] } as never)
    expect((s.context.get('acceptedFiles' as never) as File[]).length).toBe(2)
    reset(s)
    const after = s.context.get('acceptedFiles' as never) as File[]
    expect(after.map(x => x.name)).toEqual(['a.txt'])
  })

  it('rating：重置把悬停缓冲一并清掉，否则指针悬着会盖住结果', () => {
    const s = start(ratingMachine, { defaultValue: 2 })
    s.send({ type: 'VALUE.SET', value: 5 } as never)
    s.send({ type: 'ITEM.HOVER', value: 4 } as never)
    expect(s.context.get('hoveredValue' as never)).toBe(4)
    reset(s)
    expect(s.context.get('hoveredValue' as never)).toBeNull()
  })

  it('color-picker：值受控时不丢锚，丢了会让灰度色的色相塌回 0', () => {
    // 灰度色的色相只存在于锚里，值串本身推不出来
    const s = start(colorPickerMachine, { value: '#808080', defaultValue: '#808080' })
    s.send({ type: 'CHANNEL.SET', channel: 'h', value: 210 } as never)
    const anchor = s.context.get('anchor' as never)
    reset(s)
    expect(s.context.get('anchor' as never)).toBe(anchor)
  })

  it('color-picker：非受控时锚跟着值一起回到挂载态', () => {
    const s = start(colorPickerMachine, { defaultValue: '#808080' })
    s.send({ type: 'CHANNEL.SET', channel: 'h', value: 210 } as never)
    reset(s)
    expect(s.context.get('anchor' as never)).toBeNull()
    expect(s.context.get('value' as never)).toBe('#808080')
  })

  it('editable：撤销落点跟着值一起回去，否则 Escape 会退到重置前那一份', () => {
    const s = start(editableMachine, { defaultValue: '甲' })
    s.send({ type: 'EDIT.START' } as never)
    s.send({ type: 'VALUE.SET', value: '乙' } as never)
    s.send({ type: 'EDIT.SUBMIT' } as never)
    expect(s.context.get('committedValue' as never)).toBe('乙')
    reset(s)
    expect(s.context.get('committedValue' as never)).toBe('甲')
  })

  it('tags-input：两条受控轴各判各的——值非受控回落，输入串受控且无默认值时不动', () => {
    const onInputValueChange = vi.fn()
    const s = start(tagsInputMachine, { defaultValue: ['x'], inputValue: '半截', onInputValueChange })
    s.send({ type: 'VALUE.SET', value: ['x', 'y'] } as never)
    reset(s)
    expect(s.context.get('value' as never)).toEqual(['x'])
    expect(onInputValueChange).not.toHaveBeenCalled()
  })

  it('date-picker：重置不收起浮层（带 src 的赋值会顺手关掉它）', () => {
    const s = start(datePickerMachine, { defaultValue: '2026-01-02', defaultOpen: true })
    expect(s.state.get()).toBe('open')
    s.send({ type: 'VALUE.SET', value: ['2026-03-04'] } as never)
    reset(s)
    expect(s.state.get()).toBe('open')
    expect(s.context.get('value' as never)).toEqual(['2026-01-02'])
  })

  it('pin-input：重置到满格的默认值不白发一次「填完了」', () => {
    const onValueComplete = vi.fn()
    const s = start(pinInputMachine, { defaultValue: ['1', '2'], onValueComplete })
    s.send({ type: 'VALUE.SET', value: ['9', '9'] } as never)
    onValueComplete.mockClear()
    reset(s)
    expect(onValueComplete).not.toHaveBeenCalled()
  })
})

describe('落点按当下 props 重算', () => {
  it('宿主中途换了 defaultValue，重置回到新的那一份', () => {
    const props: { defaultValue: string } = { defaultValue: '甲' }
    const s = start(textFieldMachine, props)
    s.send({ type: 'VALUE.SET', value: '乙' } as never)
    props.defaultValue = '丙'
    reset(s)
    expect(s.context.get('value' as never)).toBe('丙')
  })
})
