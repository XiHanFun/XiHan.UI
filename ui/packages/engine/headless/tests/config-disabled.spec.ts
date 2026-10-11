// 作用域禁用：字段集禁用时把 disabled 压进子树的配置，子树里的组件一律禁用——
// 与原生 fieldset[disabled] 同一条语义：外面禁了，里面写 false 也拦不住；外面没禁，里面自己禁的照旧禁。
// 只落在声明了 disabled 的组件上，别的组件不平白多出一个键。
import { describe, expect, it } from 'vitest'
import { fillXhConfigDefaults, mergeXhConfig } from '../src/config/config-merge'

describe('配置里的 disabled', () => {
  it('作用域禁用压过组件自己的 false 与 undefined', () => {
    expect(fillXhConfigDefaults('checkbox', { disabled: undefined }, { disabled: true })).toEqual({ disabled: true })
    expect(fillXhConfigDefaults('checkbox', { disabled: false }, { disabled: true })).toEqual({ disabled: true })
  })

  it('作用域没禁时组件自己的值照旧', () => {
    const own = { disabled: true }
    expect(fillXhConfigDefaults('checkbox', own, { disabled: false })).toBe(own)
    const open = { disabled: false }
    expect(fillXhConfigDefaults('checkbox', open, {})).toBe(open)
  })

  it('没声明 disabled 的组件不多出这个键', () => {
    const props = { value: 'a' }
    expect(fillXhConfigDefaults('tooltip', props, { disabled: true })).toBe(props)
  })

  it('内层显式写 false 能把外层的禁用撤掉（字段集的 legend 就这么恢复外层）', () => {
    expect(mergeXhConfig({ disabled: true }, { disabled: false }).disabled).toBe(false)
    expect(mergeXhConfig({ disabled: true }, {}).disabled).toBe(true)
  })
})
