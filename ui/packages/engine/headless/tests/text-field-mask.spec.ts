// @vitest-environment jsdom
// 文本框的掩码：排值的纯函数、光标落点，以及接到机器与连接层之后的值、回调、数字键盘与光标。
import type { TextFieldSchema, TextFieldValueChangeDetails } from '../src/text-field/index'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { applyTextFieldMask, connectTextField, textFieldMachine } from '../src/text-field/index'
import { fitToTextFieldMask, isNumericTextFieldMask, parseTextFieldMask } from '../src/text-field/text-field.mask'

type Props = TextFieldSchema['props']
type Dict = Record<string, unknown>

function make(initial: Props = {}) {
  const props: Props = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(textFieldMachine, { props: () => ({ ...props }), runtime })
  runtime.start()
  return {
    api: () => connectTextField(service, normalizeProps),
    value: () => service.context.get('value'),
  }
}

const PHONE = '999 9999 9999'

describe('applyTextFieldMask', () => {
  it('逐位填进占位符，分隔符等到后面真有字符才补上', () => {
    expect(applyTextFieldMask(PHONE, '138').value).toBe('138')
    expect(applyTextFieldMask(PHONE, '1381').value).toBe('138 1')
    expect(applyTextFieldMask(PHONE, '13812345678')).toEqual({ value: '138 1234 5678', unmasked: '13812345678', complete: true })
  })

  it('占位符不收的字符跳过，填满即止', () => {
    expect(applyTextFieldMask(PHONE, '1a3b8-1234 5678 999').value).toBe('138 1234 5678')
    expect(applyTextFieldMask('aa-99', '1x2y34').value).toBe('xy-34')
    expect(applyTextFieldMask('**-**', 'a1!b2').value).toBe('a1-b2')
  })

  it('对排好的值再排一遍结果不变；前导分隔符与输入里的同名字符就地收掉', () => {
    const once = applyTextFieldMask('(999) 999-9999', '4155550123').value
    expect(once).toBe('(415) 555-0123')
    expect(applyTextFieldMask('(999) 999-9999', once).value).toBe(once)
    expect(applyTextFieldMask('+86 999', '+86 138').value).toBe('+86 138')
  })

  it('反斜杠把占位符字符转成分隔符', () => {
    expect(parseTextFieldMask('\\9-9')).toEqual([{ kind: 'literal', char: '9' }, { kind: 'literal', char: '-' }, { kind: 'slot', token: '9' }])
    expect(applyTextFieldMask('\\9-9', '5').value).toBe('9-5')
  })

  it('没填满时 complete 为 false；没有占位符的掩码永远不算填满', () => {
    expect(applyTextFieldMask(PHONE, '138').complete).toBe(false)
    expect(applyTextFieldMask('---', 'abc').complete).toBe(false)
  })

  it('只有收数字的占位符才算数字掩码', () => {
    expect(isNumericTextFieldMask(PHONE)).toBe(true)
    expect(isNumericTextFieldMask('aa-99')).toBe(false)
    expect(isNumericTextFieldMask('\\a99')).toBe(true)
  })
})

describe('fitToTextFieldMask 光标', () => {
  it('在末尾打字跨过分隔符时光标跟到新字符之后', () => {
    expect(fitToTextFieldMask(PHONE, '1381', 4)).toEqual({ value: '138 1', caret: 5 })
  })

  it('在中间删一个字符：后面的字符前移，光标留在删除处', () => {
    expect(fitToTextFieldMask(PHONE, '13 1234 5678', 1)).toEqual({ value: '131 2345 678', caret: 1 })
  })

  it('删掉一个分隔符：值排回原样，光标退到它前面', () => {
    expect(fitToTextFieldMask(PHONE, '1381234', 3)).toEqual({ value: '138 1234', caret: 3 })
  })
})

describe('textField 的 mask', () => {
  it('非受控初值按掩码排一遍；setValue 同样排', () => {
    const t = make({ mask: PHONE, defaultValue: '13812345678' })
    expect(t.value()).toBe('138 1234 5678')
    t.api().setValue('1391')
    expect(t.value()).toBe('139 1')
  })

  it('onValueChange 带上去掉分隔符的值；没写 mask 时不带', () => {
    const onValueChange = vi.fn<(details: TextFieldValueChangeDetails) => void>()
    make({ mask: PHONE, onValueChange }).api().setValue('13812')
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '138 12', unmaskedValue: '13812' })
    const plain = vi.fn<(details: TextFieldValueChangeDetails) => void>()
    make({ onValueChange: plain }).api().setValue('abc')
    expect(plain).toHaveBeenLastCalledWith({ value: 'abc' })
  })

  it('api 给出去掉分隔符的值与是否填满', () => {
    const api = make({ mask: PHONE, defaultValue: '13812345678' }).api()
    expect(api.unmaskedValue).toBe('13812345678')
    expect(api.maskComplete).toBe(true)
    expect(make({ defaultValue: 'x' }).api()).toMatchObject({ unmaskedValue: 'x', maskComplete: false })
  })

  it('数字掩码请移动端弹数字键盘，其余不写', () => {
    expect((make({ mask: PHONE }).api().getInputProps() as Dict).inputMode).toBe('numeric')
    expect((make({ mask: 'aa-99' }).api().getInputProps() as Dict).inputMode).toBeUndefined()
    expect((make().api().getInputProps() as Dict).inputMode).toBeUndefined()
  })

  it('用户输入：直接把节点改成排好的值，光标落到新字符之后，再把值送进机器', () => {
    const t = make({ mask: PHONE, defaultValue: '138' })
    const input = document.createElement('input')
    document.body.append(input)
    input.value = '1381'
    input.setSelectionRange(4, 4)
    ;((t.api().getInputProps() as Dict).onInput as (event: unknown) => void)({ target: input })
    expect(input.value).toBe('138 1')
    expect(input.selectionStart).toBe(5)
    expect(t.value()).toBe('138 1')
    input.remove()
  })
})
