// 组合节点：props 按组件名取那个组件的 headless props 加结构选项，组件自己推导的选项不经它传。
import { describe, expect, it } from 'vitest'
import { structureInstance } from '../src'

describe('structureInstance', () => {
  it('headless props 与结构选项一起写进组合节点', () => {
    expect(structureInstance('status', 'select', { label: '状态', clearable: true, multiple: true })).toEqual({
      key: 'status',
      instance: 'select',
      props: { label: '状态', clearable: true, multiple: true },
    })
    expect(structureInstance('city', 'combobox', { empty: '没有匹配', loading: true }).props).toEqual({ empty: '没有匹配', loading: true })
    expect(structureInstance('tags', 'tags-input', { editable: true }).props).toEqual({ editable: true })
    expect(structureInstance('note', 'text-field').props).toEqual({})
  })

  it('插槽与开关的表单影子由组件自己推导，组合节点写不进', () => {
    // @ts-expect-error 插槽看宿主给了什么内容
    structureInstance('status', 'select', { slotted: () => false })
    // @ts-expect-error 开关的表单影子随 name
    structureInstance('on', 'switch', { hiddenInput: true })
    // @ts-expect-error 属性名拼错
    structureInstance('status', 'select', { lable: '状态' })
  })
})
