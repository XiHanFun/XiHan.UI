/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 diff view 相关实现。

import type { DiffViewSchema } from './diff-view.types'
import { setup } from '@xihan-ui/core'
import { toggleItemValue } from '../checkbox-group'

const { createMachine } = setup<DiffViewSchema>()

// 一个状态，唯一的状态是「哪几处折叠格被展开了」。
// 展开是组件内部的呈现态，不做成对外的意图回调——否则每个使用者都要自己维护一个集合。
// 另承载按压通道：Space / Enter 与触屏按住期间的 context.pressedValue（按折叠格 id 记，gap-trigger 投影
// data-pressed），让键盘与触屏看见和指针 :active 同一副按压面。折叠格没有禁用态，不设守卫。
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
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, context, action }) => {
    track([() => prop('expandedValue')], () => action(['syncExpanded']))
    // 按住途中那一格被展开（Enter 在 keydown 即 click）：折叠格离开行序、按钮节点被卸下，不会再来 keyup / blur，
    // 按压面由机器自己收；受控与非受控两条路都经 expandedValue 落地，盯 context 一处即够
    track([context.dep('expandedValue')], () => action(['releaseWhenExpanded']))
  },
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
        'PRESS.START': { actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
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
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：另一格的 keyup 不该把正按着的这一格松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      releaseWhenExpanded: ({ context }) => {
        const pressed = context.get('pressedValue')
        if (pressed !== null && context.get('expandedValue').includes(pressed))
          context.set('pressedValue', null)
      },
    },
  },
})
