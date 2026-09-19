/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tag 相关实现。

import type { TagPressedPart, TagSchema } from './tag.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<TagSchema>()

// 受控（open 给定）时用户事件只发意图、不自改状态，由 watch 派发 CONTROLLED.* 回写。
export const tagMachine = createMachine({
  name: 'tag',
  context: ({ cell }) => ({
    // 按压通道：正被按住的部件（root 或关闭钮），与显隐无关
    pressed: cell<TagPressedPart | null>(() => ({ defaultValue: null })),
  }),
  // 标签是内容流里常驻的一块，没给任何显隐声明就是显示
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen') ?? true) ? 'open' : 'closed'),
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    // 按住途中转入禁用 / 只读、或关闭钮被收回：不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled'), () => prop('readOnly'), () => prop('closable')], () => action(['releaseWhenInert']))
  },
  // 两个状态都要认的按压事件：按 part 记按住的那个；禁用 / 只读不进，关闭钮还要 closable
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 收起时钮随标签一起 hidden，按着 Enter 关掉的那一下不会再来 keyup：离开 open 即松开
      exit: ['releasePress'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'CONTROLLED.CLOSED': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      // 关闭钮嵌在本体里，按在钮上那一下会冒泡到本体：先到的（事件目标）算数，按住期间另一个部件不进
      canPress: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START' || context.get('pressed') != null || prop('disabled') || prop('readOnly'))
          return false
        return e.part !== 'close-trigger' || !!prop('closable')
      },
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制收起
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressed', e.part)
      },
      // 只收自己那一下：另一个部件的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressed') === e.part)
          context.set('pressed', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressed')
        if (pressed != null && (prop('disabled') || prop('readOnly') || (pressed === 'close-trigger' && !prop('closable'))))
          context.set('pressed', null)
      },
      releasePress: ({ context }) => context.set('pressed', null),
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSED' })
      },
    },
  },
})
