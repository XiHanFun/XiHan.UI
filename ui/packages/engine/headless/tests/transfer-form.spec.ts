// @vitest-environment jsdom
import type { TransferSchema } from '../src/transfer'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectTransfer, transferMachine } from '../src/transfer'

function create(props: Partial<TransferSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(transferMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectTransfer(service, normalizeProps), stop: () => runtime.stop() }
}

describe('穿梭框原生表单合同', () => {
  it('每个目标值提供一个同名原生字段，逗号和空字符串都是独立原值', () => {
    const { api, stop } = create({ name: 'members', form: 'assignment', defaultValue: ['a,b', 'a', 'b', ''] })
    try {
      const fields = api().value.map(value => api().getHiddenInputProps({ value }))
      expect(fields.map(field => field.value)).toEqual(['a,b', 'a', 'b', ''])
      for (const field of fields) {
        expect(field).toMatchObject({ type: 'hidden', name: 'members', form: 'assignment' })
        expect(field.disabled).toBeUndefined()
      }
      api().setValue([])
      expect(api().value.map(value => api().getHiddenInputProps({ value }))).toEqual([])
    }
    finally { stop() }
  })

  it('组件禁用禁止提交，条目禁用和只读不抹掉目标值', () => {
    const props = { name: 'members', defaultValue: ['locked'], disabled: true, readOnly: true }
    const { api, stop } = create(props)
    try {
      expect(api().getHiddenInputProps({ value: 'locked' }).disabled).toBe(true)
      props.disabled = false
      expect(api().getHiddenInputProps({ value: 'locked' }).disabled).toBeUndefined()
    }
    finally { stop() }
  })

  it('重置恢复声明默认值与勾选，清理两侧查询和焦点', () => {
    const { api, service, stop } = create({ defaultValue: ['a,b'], defaultSelection: ['x'], searchable: true })
    try {
      api().setValue(['new'])
      api().setSelection(['other'])
      api().setQuery('source', '旧查询')
      api().setQuery('target', '目标查询')
      service.send({ type: 'ITEM.FOCUS', side: 'source', value: 'other' })
      service.send({ type: 'FORM.RESET' })
      expect(api().value).toEqual(['a,b'])
      expect(api().selection).toEqual(['x'])
      expect(api().query('source')).toBe('')
      expect(api().query('target')).toBe('')
      expect(service.context.get('sourceFocusedValue')).toBeNull()
      expect(service.context.get('selectionAnchor')).toBeNull()
    }
    finally { stop() }
  })

  it('受控且未声明默认值时保持业务值，声明默认值时只通知重置意图', () => {
    const onValueChange = vi.fn()
    const onSelectionChange = vi.fn()
    const props: Partial<TransferSchema['props']> = {
      value: ['current'],
      selection: ['checked'],
      onValueChange,
      onSelectionChange,
    }
    const { api, service, stop } = create(props)
    try {
      service.send({ type: 'FORM.RESET' })
      expect(onValueChange).not.toHaveBeenCalled()
      expect(onSelectionChange).not.toHaveBeenCalled()
      props.defaultValue = ['default']
      props.defaultSelection = []
      service.send({ type: 'FORM.RESET' })
      expect(onValueChange).toHaveBeenLastCalledWith({ value: ['default'] })
      expect(onSelectionChange).toHaveBeenLastCalledWith({ value: [] })
      expect(api().value).toEqual(['current'])
      expect(api().selection).toEqual(['checked'])
    }
    finally { stop() }
  })
})
