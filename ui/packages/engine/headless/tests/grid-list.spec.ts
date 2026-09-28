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

    // 单选下切换退化成选中这一条，不会把旧值留下
    single.machine.send({ type: 'ROW.TOGGLE', value: 'c' })
    expect(single.machine.context.get('value')).toEqual(['c'])
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

  it('输入法组合中的按键与落在行外输入框上的按键都不归 grid 处理', () => {
    const onAction = vi.fn()
    const { machine } = service({ collection: [{ value: 'a', label: 'Alpha' }], onAction })
    machine.send({ type: 'ROW.FOCUS', value: 'a' })
    const api = connectGridList(machine, normalizeProps)
    const onKeyDown = (api.getRootProps() as Record<string, unknown>).onKeyDown as (event: KeyboardEvent) => void
    const root = document.createElement('div')
    const row = document.createElement('div')
    const input = document.createElement('input')
    root.append(row, input)
    const press = (key: string, target: HTMLElement, isComposing = false): boolean => {
      let prevented = false
      onKeyDown({
        key,
        isComposing,
        keyCode: isComposing ? 229 : 0,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        repeat: false,
        currentTarget: root,
        target,
        preventDefault: () => { prevented = true },
      } as unknown as KeyboardEvent)
      return prevented
    }

    // 确认候选词的那一下 Enter 不触发焦点行的主操作
    expect(press('Enter', row, true)).toBe(false)
    expect(onAction).not.toHaveBeenCalled()
    // 空态里的输入框：空格与字母照常打进去，不被选中与连打检索吞掉
    expect(press(' ', input)).toBe(false)
    expect(press('a', input)).toBe(false)
    expect(machine.context.get('value')).toEqual([])
    // 同一行上不在组合中的 Enter 照常触发主操作
    expect(press('Enter', row)).toBe(true)
    expect(onAction).toHaveBeenCalledWith({ value: 'a' })
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

describe('gridList Shift 范围选', () => {
  const ITEMS = ['a', 'b', 'c', 'd', 'e']

  function extend(machine: ReturnType<typeof service>['machine'], value: string, disabled: string[] = []): void {
    machine.send({ type: 'ROW.EXTEND', value, items: ITEMS, disabled })
  }

  it('锚点到这一行那一段并进扩选开始前的选中，锚点不动', () => {
    const { machine } = service({ selectionMode: 'multiple' })
    machine.send({ type: 'ROW.TOGGLE', value: 'e' })
    machine.send({ type: 'ROW.TOGGLE', value: 'b' })
    extend(machine, 'd')
    expect([...machine.context.get('value')].sort()).toEqual(['b', 'c', 'd', 'e'])
    expect(machine.context.get('anchorValue')).toBe('b')
  })

  it('往回扩收得回来：每一下都从基线重算，不在上一次的结果上继续并', () => {
    const { machine } = service({ selectionMode: 'multiple' })
    machine.send({ type: 'ROW.TOGGLE', value: 'a' })
    extend(machine, 'd')
    expect(machine.context.get('value')).toEqual(['a', 'b', 'c', 'd'])
    extend(machine, 'b')
    expect(machine.context.get('value')).toEqual(['a', 'b'])
  })

  it('禁用行占着位置但不被收进去', () => {
    const { machine } = service({ selectionMode: 'multiple' })
    machine.send({ type: 'ROW.TOGGLE', value: 'a' })
    extend(machine, 'd', ['c'])
    expect(machine.context.get('value')).toEqual(['a', 'b', 'd'])
  })

  it('没有锚点时扩选退化成切换这一行，并把它记为锚点', () => {
    const { machine } = service({ selectionMode: 'multiple' })
    extend(machine, 'c')
    expect(machine.context.get('value')).toEqual(['c'])
    expect(machine.context.get('anchorValue')).toBe('c')
  })

  it('非 Shift 的选中操作作废基线：下一次扩选从新的选中集起算', () => {
    const { machine } = service({ selectionMode: 'multiple' })
    machine.send({ type: 'ROW.TOGGLE', value: 'a' })
    extend(machine, 'c')
    machine.send({ type: 'ROW.TOGGLE', value: 'e' })
    extend(machine, 'd')
    expect([...machine.context.get('value')].sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('单选与不可选时扩选不生效', () => {
    const single = service()
    single.machine.send({ type: 'ROW.SELECT', value: 'a' })
    extend(single.machine, 'c')
    expect(single.machine.context.get('value')).toEqual(['a'])
  })

  it('connect：Shift + 方向键移动焦点并扩选，Shift + 点击扩选到点中的行', () => {
    const { machine } = service({ selectionMode: 'multiple', collection: ITEMS.map(value => ({ value, label: value.toUpperCase() })) })
    const root = document.createElement('div')
    const rowEls = ITEMS.map(() => {
      const el = document.createElement('div')
      root.append(el)
      return el
    })
    document.body.append(root)
    const wire = (): void => {
      const api = connectGridList(machine, normalizeProps)
      const spread = (el: HTMLElement, props: Record<string, unknown>): void => {
        for (const [key, value] of Object.entries(props)) {
          if (key.startsWith('on') || value == null)
            continue
          el.setAttribute(key, String(value))
        }
      }
      spread(root, api.getRootProps() as Record<string, unknown>)
      rowEls.forEach((el, i) => spread(el, api.getRowProps({ value: ITEMS[i]! }) as Record<string, unknown>))
    }
    wire()
    const api = (): ReturnType<typeof connectGridList> => connectGridList(machine, normalizeProps)

    // 先点第二行立起锚点
    const clickRow = (i: number, shiftKey = false): void => {
      wire()
      const onClick = (api().getRowProps({ value: ITEMS[i]! }) as Record<string, unknown>).onClick as (event: MouseEvent) => void
      onClick({ currentTarget: rowEls[i], target: rowEls[i], shiftKey } as unknown as MouseEvent)
    }
    clickRow(1)
    expect(machine.context.get('value')).toEqual(['b'])

    clickRow(3, true)
    expect(machine.context.get('value')).toEqual(['b', 'c', 'd'])

    // Shift + ArrowUp 从焦点行往上一行：锚点到 c 那一段
    machine.send({ type: 'ROW.FOCUS', value: 'd' })
    wire()
    const onKeyDown = (api().getRootProps() as Record<string, unknown>).onKeyDown as (event: KeyboardEvent) => void
    onKeyDown({
      key: 'ArrowUp',
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      repeat: false,
      currentTarget: root,
      target: rowEls[3],
      preventDefault: () => {},
    } as unknown as KeyboardEvent)
    expect(machine.context.get('value')).toEqual(['b', 'c'])
    root.remove()
  })
})
