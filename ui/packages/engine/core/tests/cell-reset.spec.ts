import { describe, expect, it, vi } from 'vitest'
import { resetDeclaredValue } from '../src/machine/form-reset'
import { createVanillaRuntime } from '../src/machine/reactive/vanilla'

function makeCell<V>(params: () => { value?: V, defaultValue?: V, onChange?: (v: V, p: V | undefined) => void }) {
  return createVanillaRuntime().cell(params)
}

describe('cell.reset：非受控', () => {
  it('落回当下的 defaultValue，并通知一次', () => {
    const onChange = vi.fn()
    let def = 'b'
    const c = makeCell<string>(() => ({ defaultValue: def, onChange }))
    c.set('a')
    expect(c.get()).toBe('a')

    expect(c.reset()).toBe('b')
    expect(c.get()).toBe('b')
    expect(onChange).toHaveBeenLastCalledWith('b', 'a')

    // 宿主中途换了默认值：落点跟着走，不是挂载时冻结的那份
    def = 'c'
    expect(c.reset()).toBe('c')
    expect(c.get()).toBe('c')
  })

  it('值本就等于默认值时不白发通知', () => {
    const onChange = vi.fn()
    const c = makeCell<string>(() => ({ defaultValue: 'b', onChange }))
    c.reset()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('没有默认值就不写，返回 undefined', () => {
    const onChange = vi.fn()
    const c = makeCell<string>(() => ({ onChange }))
    c.set('a')
    expect(c.reset()).toBeUndefined()
    expect(c.get()).toBe('a')
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

describe('cell.reset：受控', () => {
  it('不落内部值，只把落点当意图发出去', () => {
    const onChange = vi.fn()
    const c = makeCell<string>(() => ({ value: 'host', defaultValue: 'b', onChange }))
    expect(c.reset()).toBe('b')
    // 宿主没写回，读到的仍是宿主那份
    expect(c.get()).toBe('host')
    expect(onChange).toHaveBeenLastCalledWith('b', 'host')
  })
})

describe('resetDeclaredValue：宿主没声明默认值时不替它编一个', () => {
  /** 仿 radio-group：兜底空值与宿主声明的默认值烘在同一个表达式里。 */
  function harness(props: { value?: string | null, defaultValue?: string | null }) {
    const onChange = vi.fn()
    const c = makeCell<string | null>(() => ({
      value: props.value,
      defaultValue: props.defaultValue ?? null,
      onChange,
    }))
    const params = {
      prop: ((k: string) => (props as Record<string, unknown>)[k]) as never,
      context: { reset: () => c.reset() } as never,
    }
    return { c, onChange, params }
  }

  it('受控且没写 defaultValue：一动不动，一条通知都不发', () => {
    const { c, onChange, params } = harness({ value: 'pro' })
    expect(resetDeclaredValue(params, 'value' as never, 'value', 'defaultValue')).toBe(false)
    expect(c.get()).toBe('pro')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('受控且写了 defaultValue：照常发意图', () => {
    const { onChange, params } = harness({ value: 'pro', defaultValue: 'standard' })
    expect(resetDeclaredValue(params, 'value' as never, 'value', 'defaultValue')).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith('standard', 'pro')
  })

  it('非受控且没写 defaultValue：落回组件兜底，这是它自己的值，没有宿主可抹', () => {
    const { c, params } = harness({})
    c.set('pro')
    expect(resetDeclaredValue(params, 'value' as never, 'value', 'defaultValue')).toBe(true)
    expect(c.get()).toBeNull()
  })
})
