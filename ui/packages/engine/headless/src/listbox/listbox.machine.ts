import type { ListboxSchema, ListboxSelectionMode } from './listbox.types'
import { createTypeahead } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ListboxSchema>()

/** 生效的选择模式；selectionMode 优先于 multiple 简写。 */
export function listboxSelectionMode(
  mode: ListboxSelectionMode | undefined,
  multiple: boolean | undefined,
): ListboxSelectionMode {
  return mode ?? (multiple ? 'multiple' : 'single')
}

/** 裸串归一为单元素数组；undefined 原样透传。 */
function toValues(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  return typeof input === 'string' ? [input] : [...input]
}

/** 选中集合归一：单选截到长度 ≤ 1，复选去重。 */
function normalizeSelection(next: readonly string[], mode: ListboxSelectionMode): string[] {
  return mode === 'single' ? next.slice(0, 1) : [...new Set(next)]
}

/** 数组按元素逐项比较：受控时 cell 每次读都把 prop 归一成新数组，引用比会误判成变更。 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

// 选中集合存放在 context cell，受控/非受控由 cell 收口；机器只有 idle 一个状态。
export const listboxMachine = createMachine({
  name: 'listbox',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点与区间起点都不受控、不对外通知
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    anchorValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    typeahead: createTypeahead(),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'ITEM.SELECT': { actions: ['selectItem'] },
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    actions: {
      // 整体改写不动区间起点
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, listboxSelectionMode(prop('selectionMode'), prop('multiple'))))
      },
      selectItem: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        context.set('value', [e.value])
        context.set('anchorValue', e.value)
        context.set('focusedValue', e.value)
      },
      toggleItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE')
          return
        const current = context.get('value')
        // 单选下切换退化成选中，不做取消
        if (listboxSelectionMode(prop('selectionMode'), prop('multiple')) === 'single')
          context.set('value', [e.value])
        else
          context.set('value', current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value])
        context.set('anchorValue', e.value)
        context.set('focusedValue', e.value)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场只清焦点锚点与连打缓冲，选中值与区间起点留着
      clearFocusedValue: ({ context, refs }) => {
        context.set('focusedValue', null)
        refs.get('typeahead').clear()
      },
    },
  },
})
