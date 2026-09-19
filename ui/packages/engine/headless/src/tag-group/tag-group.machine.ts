/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tag group 相关实现。

import type { TagPressedPart } from '../tag/tag.types'
import type { TagGroupSchema, TagGroupSelectionMode } from './tag-group.types'
import { createTypeahead, setup } from '@xihan-ui/core'
import { sameArray as sameValues, toArray as toValues } from '../shared/array'

const { createMachine } = setup<TagGroupSchema>()

/** 选中集合归一：不选中模式清空，单选截到长度 ≤ 1，复选去重。 */
export function normalizeTagSelection(next: readonly string[], mode: TagGroupSelectionMode): string[] {
  if (mode === 'none')
    return []
  return mode === 'single' ? next.slice(0, 1) : [...new Set(next)]
}

// 选中集合存放在 context cell，受控/非受控由 cell 收口；机器只有 idle 一个状态。
export const tagGroupMachine = createMachine({
  name: 'tag-group',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点不受控、不对外通知
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 按压通道：正被按住的那一枚的哪个部件；与选中、锚点都无关
    pressedPart: cell<TagPressedPart | null>(() => ({ defaultValue: null })),
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    typeahead: createTypeahead(),
  }),
  initialState: () => 'idle',
  // 按住途中整组转入禁用或只读：不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('readOnly')], () => action(['releaseWhenInert']))
  },
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'ITEM.SELECT': { actions: ['selectItem'] },
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'ITEM.DELETE': { actions: ['deleteItem'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
        // 按压通道：按 part + value 记按住的那一枚；整组禁用 / 只读不进，条目自身按不动的事实随事件带入
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      // 移除钮嵌在本体里，按在钮上那一下会冒泡到本体：先到的（事件目标）算数，按住期间另一个部件不进
      canPress: ({ context, prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && context.get('pressedPart') == null && !prop('disabled') && !prop('readOnly') && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START')
          return
        context.set('pressedPart', e.part)
        context.set('pressedValue', e.value)
      },
      // 只收自己那一下：另一枚（或同一枚另一个部件）的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.END' || context.get('pressedPart') !== e.part || context.get('pressedValue') !== e.value)
          return
        context.set('pressedPart', null)
        context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (context.get('pressedPart') == null || !(prop('disabled') || prop('readOnly')))
          return
        context.set('pressedPart', null)
        context.set('pressedValue', null)
      },
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeTagSelection(e.value, prop('selectionMode') ?? 'none'))
      },
      selectItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        if ((prop('selectionMode') ?? 'none') === 'none')
          return
        context.set('value', [e.value])
        context.set('focusedValue', e.value)
      },
      toggleItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE')
          return
        const mode = prop('selectionMode') ?? 'none'
        if (mode === 'none')
          return
        const current = context.get('value')
        // 单选下切换退化成选中，不做取消
        if (mode === 'single')
          context.set('value', [e.value])
        else
          context.set('value', current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value])
        context.set('focusedValue', e.value)
      },
      /**
       * 摘掉一枚。条目的去留由宿主的数据说了算，机器只做三件自己管得着的事：
       * 从选中集合里去掉、把指着它的焦点锚点收回、通知宿主。
       * 焦点搬到哪一枚由 connect 在送这个事件之前就办完，那时被摘的节点还在文档里。
       */
      deleteItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.DELETE')
          return
        const current = context.get('value')
        if (current.includes(e.value))
          context.set('value', current.filter(v => v !== e.value))
        if (context.get('focusedValue') === e.value)
          context.set('focusedValue', null)
        // 被摘的那一枚正被按着（按住 Enter 摘除、触屏按移除钮）：节点随宿主数据一起离场，不会再来 keyup，一并松开
        if (context.get('pressedValue') === e.value) {
          context.set('pressedPart', null)
          context.set('pressedValue', null)
        }
        prop('onItemDelete')?.({ value: e.value })
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场只清焦点锚点与连打缓冲，选中值留着
      clearFocusedValue: ({ context, refs }) => {
        context.set('focusedValue', null)
        refs.get('typeahead').clear()
      },
    },
  },
})
