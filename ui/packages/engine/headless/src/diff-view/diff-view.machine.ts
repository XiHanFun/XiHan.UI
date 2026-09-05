import type { DiffViewSchema } from './diff-view.types'
import { setup } from '@xihan-ui/machine'
import { toggleItemValue } from '../checkbox-group'

const { createMachine } = setup<DiffViewSchema>()

// 一个状态，唯一的状态是「哪几处折叠格被展开了」。
// 展开是组件内部的呈现态，不做成对外的意图回调——否则每个使用者都要自己维护一个集合。
export const diffViewMachine = createMachine({
  name: 'diff-view',
  context: ({ prop, cell }) => ({
    expandedValue: cell<string[]>(() => ({
      value: prop('expandedValue') as string[] | undefined,
      defaultValue: (prop('defaultExpandedValue') as string[] | undefined) ?? [],
      // 数组要逐项比：不给的话受控父组件写回一份等价数组就会多派一次回调
      isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]),
      onChange: value => prop('onExpandedValueChange')?.({ value }),
    })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('expandedValue')], () => action(['syncExpanded'])),
  states: {
    idle: {
      on: {
        // 受控命中 → 只发意图；非受控 → 自己写回并一并通知
        'GAP.EXPAND': [
          { guard: 'isExpandedControlled', actions: ['invokeExpandedChange'] },
          { actions: ['toggleGap'] },
        ],
        'GAP.COLLAPSE': [
          { guard: 'isExpandedControlled', actions: ['invokeExpandedChange'] },
          { actions: ['toggleGap'] },
        ],
        'CONTROLLED.EXPANDED.SET': { actions: ['syncExpanded'] },
      },
    },
  },
  implementations: {
    guards: {
      isExpandedControlled: ({ prop }) => prop('expandedValue') !== undefined,
    },
    actions: {
      toggleGap: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'GAP.EXPAND' || e.type === 'GAP.COLLAPSE')
          context.set('expandedValue', toggleItemValue(context.get('expandedValue'), e.id))
      },
      // 受控时不自改状态，只把翻转后的集合报给宿主
      invokeExpandedChange: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'GAP.EXPAND' && e.type !== 'GAP.COLLAPSE')
          return
        prop('onExpandedValueChange')?.({ value: toggleItemValue(context.get('expandedValue'), e.id) })
      },
      // 只在受控（expandedValue 有值）时回写
      syncExpanded: ({ prop, context }) => {
        const next = prop('expandedValue')
        if (next === undefined)
          return
        context.set('expandedValue', [...next])
      },
    },
  },
})
