/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 clipboard 相关实现。

import type { ClipboardSchema } from './clipboard.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { resolveClipboardTimeout, writeToClipboard } from '../shared/clipboard-write'

const { createMachine } = setup<ClipboardSchema>()

/**
 * 剪贴板机器。
 *
 * 异步写入住在 copying 的状态副作用里，靠拆卸钩子挡掉已过期的 promise 回送。
 * 按压通道（context.pressed）与复制状态无关：三个状态都认 PRESS.*，禁用或写入在途按住的一律松开。
 */
export const clipboardMachine = createMachine({
  name: 'clipboard',
  context: ({ cell }) => ({
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('disabled')], () => action(['releaseWhenInert'])),
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    idle: {
      on: {
        // 禁用守卫在机器这一层：点击、键盘激活与 api.copy() 都从这里过，
        // 只在连接层挡的话，作者直接调 api 就能绕开禁用把值写进剪贴板
        'COPY.TRIGGER': [
          { guard: 'isDisabled' },
          { target: 'copying' },
        ],
      },
    },
    copying: {
      // 写入在途：按钮 aria-disabled，按住途中转入这一档时按压面由机器自己收（entry 跑在状态落定之前，直接松开）
      entry: ['invokeCopying', 'endPress'],
      effects: ['writeValue'],
      on: {
        'COPY.SUCCESS': { target: 'copied' },
        // 失败一律回 idle，不留下"已复制"的假象
        'COPY.ERROR': { target: 'idle', actions: ['invokeCopyError', 'invokeIdle'] },
        // 不接 COPY.TRIGGER：写入在途，连点不重复发写请求
      },
    },
    copied: {
      entry: ['invokeCopied'],
      effects: ['trackTimeout'],
      on: {
        'after.timeout': { target: 'idle', actions: ['invokeIdle'] },
        // 停留窗口里再点一次重新写
        'COPY.TRIGGER': [
          { guard: 'isDisabled' },
          { target: 'copying' },
        ],
      },
    },
  },
  implementations: {
    guards: {
      isDisabled: ({ prop }) => !!prop('disabled'),
      canPress: ({ prop, state }) => !prop('disabled') && !state.matches('copying'),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      // 按住途中被禁用：原生 disabled 的按钮不再派 keyup / blur，按压面得由机器自己收
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressed', false)
      },
      invokeCopying: ({ prop }) => prop('onStatusChange')?.({ status: 'copying' }),
      invokeCopied: ({ prop }) => prop('onStatusChange')?.({ status: 'copied' }),
      invokeIdle: ({ prop }) => prop('onStatusChange')?.({ status: 'idle' }),
      invokeCopyError: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'COPY.ERROR')
          return
        // 取事件带来的那份，不重读 prop：写入途中宿主改了 value，报出去的就不是实际写入的那一份
        prop('onCopyError')?.({ error: e.error, value: e.value })
      },
    },
    effects: {
      /** 异步写入。取值在发起那一刻定死，不在兑现时重读 prop。 */
      writeValue: ({ prop, scope, send }) => {
        let disposed = false
        const value = prop('value') ?? ''

        writeToClipboard(scope, value).then(
          () => {
            if (!disposed)
              send({ type: 'COPY.SUCCESS' })
          },
          (error: unknown) => {
            if (!disposed)
              send({ type: 'COPY.ERROR', error, value })
          },
        )

        return () => {
          disposed = true
        }
      },
      trackTimeout: ({ prop, send }) => {
        const ms = resolveClipboardTimeout(prop('timeout'))
        // Infinity 送进 setTimeoutEffect 会抛，不回落时不起计时器
        if (!Number.isFinite(ms))
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.timeout' }), ms)
      },
    },
  },
})
