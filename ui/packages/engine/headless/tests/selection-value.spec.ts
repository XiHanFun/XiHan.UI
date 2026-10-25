// @vitest-environment jsdom
// 选择类组件的值边界：数字、对象值进来编成键，机器与 DOM 只认键；onValueChange 与 api 交出去时解回原值。
import type { PropTypes } from '@xihan-ui/core'
import type { SelectSchema } from '../src/select'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectSelect, selectMachine } from '../src/select'

function mount<V>(initial: Partial<SelectSchema<V>['props']>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal(initial)
  // 根组件按值类型推断 V，交给机器时擦回键：这里与适配器同一个做法
  const service = createService(selectMachine, { props: () => props.get() as SelectSchema['props'], runtime })
  runtime.start()
  return {
    api: () => connectSelect<PropTypes, V>(service, normalizeProps),
    setProps: (next: Partial<SelectSchema<V>['props']>) => props.set({ ...props.get(), ...next }),
  }
}

interface User {
  id: string
  name: string
}

describe('选择类的值边界', () => {
  it('数字值：条目 data-value 是它的键，选中值、条目元信息与 onValueChange 交出数字', () => {
    const onValueChange = vi.fn()
    const { api } = mount<number>({ collection: [{ value: 1, label: '一' }, { value: 2, label: '二' }], defaultValue: 2, onValueChange })
    expect(api().value).toEqual([2])
    expect(api().valueKeys).toEqual(['2'])
    expect(api().valueText).toEqual(['二'])
    expect(api().collection.map(meta => meta.value)).toEqual([1, 2])
    const item = api().getItemProps({ value: 1 }) as Record<string, unknown>
    expect(item['data-value']).toBe('1')
    expect((api().getItemProps({ value: 2 }) as Record<string, unknown>)['data-state']).toBe('checked')
    api().setValue(1)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [1] })
    expect(api().value).toEqual([1])
    api().deselect(1)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [] })
  })

  it('对象值给了 valueKey：按字段认，受控值换成内容相同的新对象也认得出来', () => {
    const alice: User = { id: 'u1', name: '赵一' }
    const bob: User = { id: 'u2', name: '钱二' }
    const onValueChange = vi.fn()
    const { api, setProps } = mount<User>({
      collection: [{ value: alice, label: alice.name }, { value: bob, label: bob.name }],
      valueKey: 'id',
      multiple: true,
      value: [{ id: 'u2', name: '钱二' }],
      onValueChange,
    })
    expect(api().valueKeys).toEqual(['u2'])
    expect((api().getItemProps({ value: bob }) as Record<string, unknown>)['data-state']).toBe('checked')
    expect((api().getItemProps({ value: alice }) as Record<string, unknown>)['data-value']).toBe('u1')
    api().setValue([alice, bob])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [alice, bob] })
    setProps({ value: [alice] })
    expect(api().value).toEqual([alice])
    expect(api().tags.map(tag => tag.value)).toEqual([alice])
  })

  it('对象值没给 valueKey 时按身份认：同一个对象才是同一个值', () => {
    const a = { n: 1 }
    const b = { n: 2 }
    const { api } = mount<{ n: number }>({ collection: [{ value: a, label: 'a' }, { value: b, label: 'b' }], defaultValue: b })
    expect(api().value).toEqual([b])
    expect(api().value[0]).toBe(b)
    const keyA = (api().getItemProps({ value: a }) as Record<string, unknown>)['data-value']
    expect(keyA).not.toBe((api().getItemProps({ value: b }) as Record<string, unknown>)['data-value'])
    expect((api().getItemProps({ value: { n: 2 } }) as Record<string, unknown>)['data-state']).toBe('unchecked')
  })

  it('手写的条目在 connect 里才编码：没有 collection 时选中数字值，onValueChange 照样交出数字', () => {
    const onValueChange = vi.fn()
    const { api } = mount<number>({ onValueChange })
    // 条目部件渲染时把自己的值交给 getter，键就此记下
    api().getItemProps({ value: 7 })
    api().setValue([7])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [7] })
  })

  it('字符串值原样过：collection 与选中值不复制', () => {
    const collection = [{ value: 'a' }, { value: 'b' }]
    const { api } = mount<string>({ collection, defaultValue: 'b' })
    expect(api().value).toEqual(['b'])
    expect(api().valueKeys).toEqual(['b'])
    expect(api().collection.map(meta => meta.value)).toEqual(['a', 'b'])
  })
})
