import type { FieldsetProps } from '../src/fieldset/index'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
import { connectFieldset } from '../src/fieldset/index'

function api(props: FieldsetProps = {}) {
  const scope = createScope(null, createCounterIdGenerator())
  return connectFieldset(props, scope, normalizeProps)
}

const rootProps = (props?: FieldsetProps) => api(props).getRootProps() as Record<string, unknown>
const helperProps = (props?: FieldsetProps) => api(props).getHelperTextProps() as Record<string, unknown>
const errorProps = (props?: FieldsetProps) => api(props).getErrorTextProps() as Record<string, unknown>

describe('connectFieldset 整组禁用', () => {
  it('禁用落成原生 disabled：连坐组内控件靠的是这一条，缺了只剩一层灰样式', () => {
    expect(rootProps({ disabled: true }).disabled).toBe(true)
    expect(rootProps({ disabled: true })['data-disabled']).toBe('')
  })

  it('未禁用时不产出 disabled 与 data-disabled，皮肤的 [data-disabled] 才不会误命中', () => {
    expect(rootProps().disabled).toBeUndefined()
    expect(rootProps()['data-disabled']).toBeUndefined()
  })

  it('禁用不再另发 aria-disabled：原生 disabled 已经进了无障碍树', () => {
    expect(rootProps({ disabled: true })['aria-disabled']).toBeUndefined()
  })

  it('组标题与说明文案同步 data-disabled，整段可以一起变淡', () => {
    expect(api({ disabled: true }).getLegendProps()['data-disabled']).toBe('')
    expect(helperProps({ disabled: true })['data-disabled']).toBe('')
  })
})

describe('connectFieldset 描述链', () => {
  it('默认只挂说明文案，错误文案不在链上', () => {
    const one = api()
    expect(one.getRootProps()['aria-describedby']).toBe(one.getHelperTextProps().id)
  })

  it('invalid 时错误文案追加到链尾，顺序是说明在前、错误在后', () => {
    const one = api({ invalid: true })
    const helperId = one.getHelperTextProps().id
    const errorId = one.getErrorTextProps().id
    expect(one.getRootProps()['aria-describedby']).toBe(`${helperId} ${errorId}`)
  })

  it('两份文案的 id 由同一个 scope 派生，互不相同', () => {
    const scope = createScope(null, createCounterIdGenerator())
    const one = connectFieldset({}, scope, normalizeProps)
    expect(one.getHelperTextProps().id).not.toBe(one.getErrorTextProps().id)
  })

  it('两个实例各出各的 id，同页多个字段集的 IDREF 不相撞', () => {
    expect(helperProps().id).not.toBe(helperProps().id)
  })
})

describe('connectFieldset 无效与必填', () => {
  it('错误文案带 role=alert 且非 invalid 时 hidden，翻转那一刻读屏才播报得出来', () => {
    expect(errorProps().role).toBe('alert')
    expect(errorProps().hidden).toBe(true)
    expect(errorProps({ invalid: true }).hidden).toBeUndefined()
  })

  it('无效与必填只走 data-*：aria-invalid / aria-required 在 group 角色上不被支持', () => {
    const props = rootProps({ invalid: true, required: true })
    expect(props['data-invalid']).toBe('')
    expect(props['data-required']).toBe('')
    expect(props['aria-invalid']).toBeUndefined()
    expect(props['aria-required']).toBeUndefined()
  })

  it('api 上的三个布尔恒是布尔，作者传 undefined 也读得到 false', () => {
    const one = api()
    expect([one.disabled, one.invalid, one.required]).toEqual([false, false, false])
  })
})
