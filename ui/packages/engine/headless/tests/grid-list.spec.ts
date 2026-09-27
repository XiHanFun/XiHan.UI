/** @vitest-environment jsdom */

import type { GridListSchema } from '../src/grid-list'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectGridList, gridListMachine } from '../src/grid-list'

type Props = GridListSchema['props']

function service(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const machine = createService(gridListMachine, { props: () => props.get(), runtime })
  runtime.start()
  return { machine, props }
}

describe('gridList 选择与动作', () => {
  it('single 只保留一个值，multiple 切换多个值，none 不保存选择', () => {
    const single = service()
    single.machine.send({ type: 'ROW.SELECT', value: 'a' })
    single.machine.send({ type: 'ROW.SELECT', value: 'b' })
    expect(single.machine.context.get('value')).toEqual(['b'])

    const multiple = service({ selectionMode: 'multiple', defaultValue: ['a'] })
    multiple.machine.send({ type: 'ROW.TOGGLE', value: 'b' })
    expect(multiple.machine.context.get('value')).toEqual(['a', 'b'])
    multiple.machine.send({ type: 'ROW.TOGGLE', value: 'a' })
    expect(multiple.machine.context.get('value')).toEqual(['b'])

    const none = service({ selectionMode: 'none', defaultValue: ['a'] })
    expect(none.machine.context.get('value')).toEqual([])
  })

  it('受控 value 只发意图，宿主写回后才改变', async () => {
    const onValueChange = vi.fn()
    const { machine, props } = service({ value: ['a'], onValueChange })
    machine.send({ type: 'ROW.SELECT', value: 'b' })
    expect(machine.context.get('value')).toEqual(['a'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['b'] })
    props.set({ value: ['b'], onValueChange })
    await Promise.resolve()
    expect(machine.context.get('value')).toEqual(['b'])
  })

  it('行主操作与选择分开通知', () => {
    const onAction = vi.fn()
    const { machine } = service({ onAction })
    machine.send({ type: 'ROW.ACTION', value: 'a' })
    expect(onAction).toHaveBeenCalledWith({ value: 'a' })
    expect(machine.context.get('value')).toEqual([])
  })

  it('connect 输出 grid/row/gridcell；点击行内按钮不会选择行', () => {
    const { machine } = service({ collection: [{ value: 'a', label: 'Alpha' }] })
    const api = connectGridList(machine, normalizeProps)
    expect((api.getRootProps() as Record<string, unknown>).role).toBe('grid')
    expect((api.getRowProps({ value: 'a' }) as Record<string, unknown>).role).toBe('row')
    expect((api.getRowContentProps({ value: 'a' }) as Record<string, unknown>).role).toBe('gridcell')

    const row = document.createElement('div')
    const button = document.createElement('button')
    row.append(button)
    const onClick = (api.getRowProps({ value: 'a' }) as Record<string, unknown>).onClick as (event: MouseEvent) => void
    onClick({ currentTarget: row, target: button } as unknown as MouseEvent)
    expect(machine.context.get('value')).toEqual([])
  })
})
