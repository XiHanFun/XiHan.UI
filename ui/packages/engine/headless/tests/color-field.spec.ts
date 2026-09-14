// @vitest-environment jsdom

import type { Service } from '@xihan-ui/core'
import type { ColorFieldSchema } from '../src/color-field'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { colorFieldMachine, colorFieldNormalize, connectColorField } from '../src/color-field'

type Props = ColorFieldSchema['props']
type Dict = Record<string, unknown>

/** props 用可变对象承载：受控用例要在机器活着的时候从外面改写 value。 */
function makeService(props: Props = {}): Service<ColorFieldSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(colorFieldMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function api(service: Service<ColorFieldSchema>) {
  return connectColorField(service, normalizeProps)
}

function type(service: Service<ColorFieldSchema>, value: string): void {
  service.send({ type: 'INPUT.CHANGE', value })
}

describe('colorFieldNormalize', () => {
  it('空串是合法的「没有颜色」；合法写法按 format 重写；解析不出与格式写错都是 null', () => {
    expect(colorFieldNormalize('', 'hex', false)).toBe('')
    expect(colorFieldNormalize('  f00 ', 'hex', false)).toBe('#ff0000')
    expect(colorFieldNormalize('rgb(255, 0, 0)', 'hsla', false)).toBe('hsla(0, 100%, 50%, 1)')
    expect(colorFieldNormalize('#ff000080', 'hex', true)).toBe('#ff000080')
    expect(colorFieldNormalize('#ff000080', 'hex', false)).toBe('#ff0000')
    expect(colorFieldNormalize('red', 'hex', false)).toBeNull()
    expect(colorFieldNormalize('#f00', 'oklch', false)).toBeNull()
  })
})

describe('colorFieldMachine 草稿与收下', () => {
  it('打字只留草稿不动值；回车收下后按 format 重写并发 onValueChange', () => {
    const onValueChange = vi.fn()
    const s = makeService({ defaultValue: '#ff0000', onValueChange })
    // 首帧没在编辑：cell 的 null 默认值读出来是 undefined，也得算作没有草稿
    expect(api(s).editing).toBe(false)
    type(s, 'f0')
    expect(api(s).text).toBe('f0')
    expect(api(s).editing).toBe(true)
    expect(api(s).value).toBe('#ff0000')
    expect(onValueChange).not.toHaveBeenCalled()
    type(s, '0f0')
    s.send({ type: 'INPUT.COMMIT' })
    expect(api(s).value).toBe('#00ff00')
    expect(api(s).text).toBe('#00ff00')
    expect(api(s).editing).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith({ value: '#00ff00' })
  })

  it('收不下的草稿留在框里并标成无效；再改动摘掉标记；Escape 撤草稿回到规范文本', () => {
    const s = makeService({ defaultValue: '#ff0000' })
    type(s, 'tomato')
    s.send({ type: 'INPUT.COMMIT' })
    expect(api(s).value).toBe('#ff0000')
    expect(api(s).text).toBe('tomato')
    expect(api(s).draftInvalid).toBe(true)
    expect(api(s).invalid).toBe(true)
    expect((api(s).getInputProps() as Dict)['aria-invalid']).toBe('true')
    type(s, 'tomat')
    expect(api(s).draftInvalid).toBe(false)
    s.send({ type: 'INPUT.CANCEL' })
    expect(api(s).text).toBe('#ff0000')
    expect(api(s).editing).toBe(false)
  })

  it('空草稿收下即清空：空串是合法的没有颜色', () => {
    const s = makeService({ defaultValue: '#ff0000' })
    type(s, '  ')
    s.send({ type: 'INPUT.COMMIT' })
    expect(api(s).value).toBe('')
    expect(api(s).empty).toBe(true)
    expect(api(s).valid).toBe(false)
  })

  it('alpha 关掉时收下的颜色恒不透明，开了才保留第四对', () => {
    const off = makeService({ defaultValue: '' })
    type(off, '#ff000080')
    off.send({ type: 'INPUT.COMMIT' })
    expect(api(off).value).toBe('#ff0000')
    const on = makeService({ defaultValue: '', alpha: true, format: 'rgba' })
    type(on, '#ff000080')
    on.send({ type: 'INPUT.COMMIT' })
    expect(api(on).value).toBe('rgba(255, 0, 0, 0.502)')
  })

  it('setValue：解析不出的串原地不动，合法的串重写并丢掉草稿；清空受 clearable 守卫', () => {
    const s = makeService({ defaultValue: '#ff0000', clearable: true })
    type(s, 'abc')
    s.send({ type: 'VALUE.SET', value: 'red' })
    expect(api(s).value).toBe('#ff0000')
    expect(api(s).editing).toBe(true)
    s.send({ type: 'VALUE.SET', value: 'hsl(240, 100%, 50%)' })
    expect(api(s).value).toBe('#0000ff')
    expect(api(s).editing).toBe(false)
    expect(api(s).canClear).toBe(true)
    s.send({ type: 'VALUE.CLEAR' })
    expect(api(s).value).toBe('')
    const plain = makeService({ defaultValue: '#ff0000' })
    plain.send({ type: 'VALUE.CLEAR' })
    expect(api(plain).value).toBe('#ff0000')
  })

  it('受控：收下只发回调不落内部值；宿主写回后框里的字跟着走', () => {
    const onValueChange = vi.fn()
    const props: Props = { value: '#ff0000', onValueChange }
    const s = makeService(props)
    type(s, '#00ff00')
    s.send({ type: 'INPUT.COMMIT' })
    expect(onValueChange).toHaveBeenCalledWith({ value: '#00ff00' })
    expect(api(s).value).toBe('#ff0000')
    props.value = '#00ff00'
    expect(api(s).text).toBe('#00ff00')
  })

  it('禁用与只读：草稿收下时直接丢掉，不落值；表单重置回默认值并清草稿', () => {
    const ro = makeService({ defaultValue: '#ff0000', readOnly: true })
    type(ro, '#00ff00')
    ro.send({ type: 'INPUT.COMMIT' })
    expect(api(ro).value).toBe('#ff0000')
    expect(api(ro).editing).toBe(false)
    const s = makeService({ defaultValue: '#ff0000' })
    type(s, '#00ff00')
    s.send({ type: 'INPUT.COMMIT' })
    type(s, 'half')
    s.send({ type: 'FORM.RESET' })
    expect(api(s).value).toBe('#ff0000')
    expect(api(s).editing).toBe(false)
  })
})

describe('connectColorField 投影', () => {
  it('输入框显示草稿或值，不带 name；表单影子带 name 与收下的值', () => {
    const s = makeService({ defaultValue: '#ff0000', name: 'accent' })
    const input = api(s).getInputProps() as Dict
    expect(input).toMatchObject({ type: 'text', value: '#ff0000', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'none' })
    expect(input.name).toBeUndefined()
    type(s, '#0')
    expect((api(s).getInputProps() as Dict).value).toBe('#0')
    expect(api(s).getHiddenInputProps()).toMatchObject({ type: 'hidden', name: 'accent', value: '#ff0000' })
  })

  it('色块经家族属性投影，颜色写进私有槽；空值与无效值不画颜色层', () => {
    const s = makeService({ defaultValue: '#ff000080', alpha: true, size: 'lg' })
    const swatch = api(s).getSwatchProps() as Dict
    expect(swatch).toMatchObject({ 'aria-hidden': true, 'data-xh-swatch': '', 'data-xh-swatch-size': 'lg' })
    expect((swatch.style as Dict)['--xh-_swatch-color']).toBe('rgba(255, 0, 0, 0.502)')
    const empty = makeService({ defaultValue: '' })
    expect(((api(empty).getSwatchProps() as Dict).style as Dict)['--xh-_swatch-color']).toBe('')
    expect((api(empty).getSwatchProps() as Dict)['data-empty']).toBe('')
  })

  it('键盘：回车只在编辑时收下，Escape 先撤草稿、其次清空，都做不了时不吞键', () => {
    const s = makeService({ defaultValue: '#ff0000', clearable: true })
    const press = (key: string): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      ;((api(s).getInputProps() as Dict).onKeyDown as (e: KeyboardEvent) => void)(event)
      return event
    }
    // 没在编辑：回车不接管
    expect(press('Enter').defaultPrevented).toBe(false)
    type(s, '#00ff00')
    expect(press('Enter').defaultPrevented).toBe(true)
    expect(api(s).value).toBe('#00ff00')
    type(s, 'half')
    expect(press('Escape').defaultPrevented).toBe(true)
    expect(api(s).editing).toBe(false)
    expect(api(s).value).toBe('#00ff00')
    // 没草稿且可清空：Escape 清空
    expect(press('Escape').defaultPrevented).toBe(true)
    expect(api(s).value).toBe('')
    // 已经空了：不再接管
    expect(press('Escape').defaultPrevented).toBe(false)
  })

  it('清空按钮只在可清空时露面，点它清空；禁用抽掉表单出口', () => {
    const s = makeService({ defaultValue: '#ff0000', clearable: true })
    expect((api(s).getClearTriggerProps() as Dict).hidden).toBeUndefined()
    ;((api(s).getClearTriggerProps() as Dict).onClick as () => void)()
    expect(api(s).value).toBe('')
    expect((api(s).getClearTriggerProps() as Dict).hidden).toBe(true)
    const disabled = api(makeService({ defaultValue: '#ff0000', disabled: true, name: 'accent' }))
    expect((disabled.getInputProps() as Dict).disabled).toBe(true)
    expect((disabled.getHiddenInputProps() as Dict).disabled).toBe(true)
  })
})
