// @vitest-environment jsdom
import type { ComboboxApi, ComboboxSchema } from '../src/combobox'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { comboboxMachine, connectCombobox } from '../src/combobox'

/**
 * 输入宿主标签只影响 getInputProps 的产出，不触动机器，所以这里不铺 DOM：
 * 建一台空跑的 service，直接比对两种宿主下的属性表。
 */
function api(props: Partial<ComboboxSchema['props']> = {}): ComboboxApi {
  const runtime = createVanillaRuntime()
  const service = createService(comboboxMachine, {
    props: () => props,
    runtime,
    scope: createScope(null, createCounterIdGenerator()),
  })
  runtime.start()
  return connectCombobox(service, normalizeProps)
}

/** 只留在场的键：缺席的属性一律是 undefined，留着比对时噪音太大。 */
function present(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))
}

describe('combobox 输入宿主可换成 textarea', () => {
  it('不传参与显式 as="input" 产出逐字相同', () => {
    const a = api()
    const implicit = a.getInputProps() as Record<string, unknown>
    const explicit = a.getInputProps({ as: 'input' }) as Record<string, unknown>
    expect(Object.keys(explicit)).toEqual(Object.keys(implicit))
    for (const key of Object.keys(implicit)) {
      // 事件处理器每次调用都是新函数，只比非函数值
      if (typeof implicit[key] === 'function')
        continue
      expect(explicit[key]).toEqual(implicit[key])
    }
  })

  it('单行宿主：type、role 与 aria-expanded 三条都在', () => {
    const props = api().getInputProps() as Record<string, unknown>
    expect(props.type).toBe('text')
    expect(props.role).toBe('combobox')
    expect(props['aria-expanded']).toBe('false')
  })

  it('多行宿主：type、role 与 aria-expanded 三条一并缺席', () => {
    const props = api().getInputProps({ as: 'textarea' }) as Record<string, unknown>
    // textarea 没有 type 属性；它的允许角色只有自带的 textbox，改角色是文档一致性违规；
    // aria-expanded 不在 textbox 的支持属性里
    expect(props.type).toBeUndefined()
    expect(props.role).toBeUndefined()
    expect(props['aria-expanded']).toBeUndefined()
  })

  it('多行宿主：textbox 支持的那几条组合框属性照样产出', () => {
    const props = api({ placeholder: '写点什么' }).getInputProps({ as: 'textarea' }) as Record<string, unknown>
    expect(props['aria-haspopup']).toBe('listbox')
    expect(props['aria-autocomplete']).toBe('list')
    expect(props['aria-controls']).toEqual(expect.stringContaining('content'))
    expect(props['aria-labelledby']).toEqual(expect.stringContaining('label'))
    expect(props['aria-invalid']).toBe('false')
    expect(props.placeholder).toBe('写点什么')
  })

  it('两种宿主只差那三条与一个排版标记，其余键一模一样', () => {
    const a = api()
    const single = present(a.getInputProps() as Record<string, unknown>)
    const multi = present(a.getInputProps({ as: 'textarea' }) as Record<string, unknown>)
    const dropped = Object.keys(single).filter(k => !(k in multi))
    expect(dropped.sort()).toEqual(['aria-expanded', 'role', 'type'])
    // 皮肤只认 data-*、不认标签名，多行排版靠这一条认出来
    expect(Object.keys(multi).filter(k => !(k in single))).toEqual(['data-multiline'])
    expect(multi['data-multiline']).toBe('')
    expect(single['data-multiline']).toBeUndefined()
  })

  it('展开态下 aria-activedescendant 与 data-state 两端一致，只有 aria-expanded 单行独有', () => {
    const a = api({ defaultOpen: true })
    const single = a.getInputProps() as Record<string, unknown>
    const multi = a.getInputProps({ as: 'textarea' }) as Record<string, unknown>
    expect(single['aria-expanded']).toBe('true')
    expect(multi['aria-expanded']).toBeUndefined()
    expect(multi['data-state']).toBe('open')
    expect(multi['data-state']).toBe(single['data-state'])
  })
})
