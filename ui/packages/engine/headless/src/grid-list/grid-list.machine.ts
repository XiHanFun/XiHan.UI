/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { GridListSchema, GridListSelectionMode } from './grid-list.types'
import { createTypeahead, setup } from '@xihan-ui/core'
import { sameArray, toArray } from '../shared/array'

const { createMachine } = setup<GridListSchema>()

function normalizeValue(value: readonly string[], mode: GridListSelectionMode): string[] {
  if (mode === 'none')
    return []
  return mode === 'single' ? value.slice(0, 1) : [...new Set(value)]
}

export const gridListMachine = createMachine({
  name: 'grid-list',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: toArray(prop('value')),
      defaultValue: normalizeValue(toArray(prop('defaultValue')) ?? [], prop('selectionMode') ?? 'single'),
      isEqual: sameArray,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
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
        if (current.type === 'VALUE.SET')
          context.set('value', normalizeValue(current.value, prop('selectionMode') ?? 'single'))
      },
      selectRow: ({ context, prop, event }) => {
        const current = event.current()
        if (current.type !== 'ROW.SELECT')
          return
        context.set('value', normalizeValue([current.value], prop('selectionMode') ?? 'single'))
      },
      toggleRow: ({ context, prop, event }) => {
        const current = event.current()
        if (current.type !== 'ROW.TOGGLE')
          return
        const mode = prop('selectionMode') ?? 'single'
        if (mode === 'none')
          return
        const value = context.get('value')
        context.set('value', normalizeValue(value.includes(current.value)
          ? value.filter(item => item !== current.value)
          : [...value, current.value], mode))
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
