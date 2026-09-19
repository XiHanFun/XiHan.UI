/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 listbox 相关实现。

import type { ListboxSchema, ListboxSelectionMode } from './listbox.types'
import { createTypeahead, setup } from '@xihan-ui/core'
import { sameArray as sameValues, toArray as toValues } from '../shared/array'

const { createMachine } = setup<ListboxSchema>()

/** 选中集合归一：单选截到长度 ≤ 1，复选去重。 */
function normalizeSelection(next: readonly string[], mode: ListboxSelectionMode): string[] {
  return mode === 'single' ? next.slice(0, 1) : [...new Set(next)]
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
    // 按压通道：正被按住的那一个（条目按 value 记，取下一页只记 part）
    pressedPart: cell<'item' | 'load-more-trigger' | null>(() => ({ defaultValue: null })),
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    typeahead: createTypeahead(),
  }),
  initialState: () => 'idle',
  // 按住途中整列被禁用、转只读或进入加载：部件不再派 keyup，按压面由机器自己收
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('readOnly'), () => prop('loading')], () => action(['releaseWhenInert']))
  },
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
        'VALUE.SET': { actions: ['setValue'] },
        'VALUE.CLEAR': { actions: ['clearValue'] },
        'ITEM.SELECT': { actions: ['selectItem'] },
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'FOCUS.CLEAR': { actions: ['clearFocusedValue'] },
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整列禁用一票否决；条目改不了选中值的只读态不进，取下一页在途中不进；条目自身的禁用随事件带入
      canPress: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START' || prop('disabled') || e.disabled)
          return false
        return e.part === 'item' ? !prop('readOnly') : !prop('loading')
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START')
          return
        context.set('pressedPart', e.part)
        context.set('pressedValue', e.value ?? null)
      },
      // 只收自己那一下：另一个的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.END' || context.get('pressedPart') !== e.part || context.get('pressedValue') !== (e.value ?? null))
          return
        context.set('pressedPart', null)
        context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        const part = context.get('pressedPart')
        const inert = prop('disabled') || (part === 'item' ? prop('readOnly') : prop('loading'))
        if (!part || !inert)
          return
        context.set('pressedPart', null)
        context.set('pressedValue', null)
      },
      // 整体改写不动区间起点
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, prop('selectionMode') ?? 'single'))
      },
      clearValue: ({ context }) => context.set('value', []),
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
        if ((prop('selectionMode') ?? 'single') === 'single')
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
