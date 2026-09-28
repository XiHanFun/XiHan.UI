/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 accordion 相关实现。

import type { AccordionSchema } from './accordion.types'
import { isSSR, setup } from '@xihan-ui/core'
import { retainDisclosureHandoff } from '../shared/disclosure-handoff'

const { createMachine } = setup<AccordionSchema>()

export const accordionMachine = createMachine({
  name: 'accordion',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 按压通道：正被按住的 trigger，与展开集合互相独立（按住途中 Enter 在 keydown 即翻面，按压面不能随之丢）
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
    moved: cell<string[]>(() => ({ defaultValue: [] })),
    // 首帧即展开的条目也算展开过：lazyMount 下它们的内容照常首屏就在
    opened: cell<string[]>(() => ({ defaultValue: [...(prop('value') ?? prop('defaultValue') ?? [])] })),
  }),
  refs: ({ prop }) => ({ lastValue: prop('value') ?? prop('defaultValue') ?? [] }),
  effects: ['trackDisclosureHandoff'],
  initialState: () => 'idle',
  watch: ({ track, prop, context, action }) => {
    // 按住途中整组转禁用：trigger 只是 aria-disabled、仍有焦点，但按压面不该留在禁用面上
    track([() => prop('disabled')], () => action(['releaseWhenInert']))
    // 开合变了（用户操作或受控值）：变动的条目从此按动效走，新展开的条目记为展开过
    track([() => context.get('value')], () => action(['markMoved']))
  },
  states: {
    idle: {
      on: {
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'VALUE.SET': { actions: ['setValue'] },
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    effects: {
      /** 展开到一半点收起（或反过来）时，新一段关键帧从此刻的开合程度接着走。没有 DOM 的宿主不接。 */
      trackDisclosureHandoff: ({ scope, flush }) => {
        if (isSSR())
          return undefined
        let release: (() => void) | undefined
        let disposed = false
        flush(() => {
          if (!disposed)
            release = retainDisclosureHandoff(scope.getDoc())
        })
        return () => {
          disposed = true
          release?.()
        }
      },
    },
    guards: {
      // 整组禁用一票否决；条目自己的禁用只有 connect 知道，随 PRESS.START 带进来
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !prop('disabled') && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：别的 trigger 的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      markMoved: ({ context, refs }) => {
        const last = refs.get('lastValue')
        const next = context.get('value')
        const flipped = [...last.filter(v => !next.includes(v)), ...next.filter(v => !last.includes(v))]
        refs.set('lastValue', next)
        const moved = context.get('moved')
        const fresh = flipped.filter(v => !moved.includes(v))
        if (fresh.length)
          context.set('moved', [...moved, ...fresh])
        const opened = context.get('opened')
        const firstOpened = next.filter(v => !opened.includes(v))
        if (firstOpened.length)
          context.set('opened', [...opened, ...firstOpened])
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressedValue', null)
      },
      toggleItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE')
          return
        const current = context.get('value')
        if (current.includes(e.value)) {
          // collapsible=false 时最后一个展开项不许收起
          if (!prop('collapsible') && current.length <= 1)
            return
          context.set('value', current.filter(v => v !== e.value))
          return
        }
        // multiple=false 时展开一项即收起其余
        context.set('value', prop('multiple') ? [...current, e.value] : [e.value])
      },
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        // 与 toggleItem 相同的 multiple / collapsible 约束
        const next = prop('multiple') ? [...e.value] : e.value.slice(0, 1)
        if (!next.length && !prop('collapsible'))
          return
        context.set('value', next)
      },
    },
  },
})
