/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { GridListSchema } from './grid-list.types'
import { applySelection, createTypeahead, setup } from '@xihan-ui/core'
import { sameArray, toArray } from '../shared/array'
import { normalizeGridSelection, toggleGridSelection } from '../shared/grid-collection'

const { createMachine } = setup<GridListSchema>()

export const gridListMachine = createMachine({
  name: 'grid-list',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: toArray(prop('value')),
      defaultValue: normalizeGridSelection(toArray(prop('defaultValue')) ?? [], prop('selectionMode') ?? 'single'),
      isEqual: sameArray,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
    anchorValue: cell<string | null>(() => ({ defaultValue: null })),
    selectionBaseline: cell<string[] | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({ typeahead: createTypeahead() }),
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('readOnly'), () => prop('loading')], () => action(['releaseWhenInert']))
  },
  states: {
    idle: {
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'ROW.SELECT': { actions: ['selectRow'] },
        'ROW.TOGGLE': { actions: ['toggleRow'] },
        'ROW.EXTEND': { actions: ['extendRow'] },
        'ROW.ACTION': { actions: ['invokeAction'] },
        'ROW.FOCUS': { actions: ['setFocusedValue'] },
        'GRID.BLUR': { actions: ['clearFocus'] },
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      canPress: ({ prop, event }) => {
        const current = event.current()
        return current.type === 'PRESS.START' && !prop('disabled') && !prop('readOnly') && !current.disabled
      },
    },
    actions: {
      setValue: ({ context, prop, event }) => {
        const current = event.current()
        if (current.type !== 'VALUE.SET')
          return
        context.set('value', normalizeGridSelection(current.value, prop('selectionMode') ?? 'single'))
        context.set('selectionBaseline', null)
      },
      selectRow: ({ context, prop, event }) => {
        const current = event.current()
        if (current.type !== 'ROW.SELECT')
          return
        context.set('value', normalizeGridSelection([current.value], prop('selectionMode') ?? 'single'))
        context.set('anchorValue', current.value)
        context.set('selectionBaseline', null)
      },
      toggleRow: ({ context, prop, event }) => {
        const current = event.current()
        if (current.type !== 'ROW.TOGGLE')
          return
        const mode = prop('selectionMode') ?? 'single'
        if (mode === 'none')
          return
        context.set('value', toggleGridSelection(context.get('value'), current.value, mode))
        context.set('anchorValue', current.value)
        context.set('selectionBaseline', null)
      },
      extendRow: ({ context, prop, event }) => {
        const current = event.current()
        if (current.type !== 'ROW.EXTEND' || (prop('selectionMode') ?? 'single') !== 'multiple')
          return
        const anchor = context.get('anchorValue')
        const disabled = new Set(current.disabled)
        // 还没有起点时，扩选退化成切换这一行，并把它记为起点
        if (anchor == null) {
          if (disabled.has(current.value))
            return
          const value = context.get('value')
          context.set('value', value.includes(current.value) ? value.filter(item => item !== current.value) : [...value, current.value])
          context.set('anchorValue', current.value)
          context.set('selectionBaseline', null)
          return
        }
        // 基线在第一次扩选时拍下，之后每一下都从它重算：往回扩收得回来
        const baseline = context.get('selectionBaseline') ?? context.get('value')
        const next = applySelection({
          state: { selected: baseline, anchor },
          mode: 'multiple',
          value: current.value,
          extend: true,
          additive: true,
          items: current.items,
          isDisabled: item => disabled.has(item),
        })
        context.set('value', [...next.selected])
        context.set('selectionBaseline', baseline)
      },
      invokeAction: ({ prop, event }) => {
        const current = event.current()
        if (current.type === 'ROW.ACTION')
          prop('onAction')?.({ value: current.value })
      },
      setFocusedValue: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'ROW.FOCUS')
          context.set('focusedValue', current.value)
      },
      clearFocus: ({ context, refs }) => {
        context.set('focusedValue', null)
        refs.get('typeahead').clear()
      },
      startPress: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'PRESS.START')
          context.set('pressedValue', current.value)
      },
      endPress: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'PRESS.END' && context.get('pressedValue') === current.value)
          context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('readOnly') || prop('loading'))
          context.set('pressedValue', null)
      },
    },
  },
})
