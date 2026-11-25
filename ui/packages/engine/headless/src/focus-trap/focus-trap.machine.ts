/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 focus trap 相关实现。

import type { OverlayRelease } from '../shared/overlay-shell'
import type { FocusTrapSchema } from './focus-trap.types'
import { requireOverlayKit, setup } from '@xihan-ui/core'
import { createOverlayKitGate, setupLayerTransaction } from '../shared/overlay-shell'

const { createMachine } = setup<FocusTrapSchema>()

/**
 * 激活期间占一层、建一个陷住的焦点域；停用即逆序释放，焦点域按 restoreFocus 归还焦点。
 * 层登记了 passesEscape：它不收 Escape，放进对话框里时 Escape 仍然关掉对话框。
 * 开在里面的浮层、压在上面的对话框成为栈顶时焦点域自动暂停，它们退栈后接着陷住。
 */
export const focusTrapMachine = createMachine({
  name: 'focus-trap',
  refs: () => ({
    config: null,
    registerLayer: null,
    getRootEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('active') ?? true) ? 'active' : 'inactive'),
  watch: ({ track, prop, action }) => track([() => prop('active')], () => action(['syncActive'])),
  states: {
    inactive: {
      on: { ACTIVATE: { target: 'active' } },
    },
    active: {
      effects: ['trapFocus'],
      on: { DEACTIVATE: { target: 'inactive' } },
    },
  },
  implementations: {
    actions: {
      syncActive: ({ prop, send }) => send((prop('active') ?? true) ? { type: 'ACTIVATE' } : { type: 'DEACTIVATE' }),
    },
    effects: {
      trapFocus: ({ refs, prop, flush }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试、服务端）：状态照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        let disposed = false
        let release: OverlayRelease | undefined
        // 焦点域在浮层按需块里：激活时还没到就等它，到了再建
        const gate = createOverlayKitGate()
        const acquire = (): void => {
          if (disposed || release || !gate.ready(acquire))
            return
          release = setupLayerTransaction(registerLayer, (layer, defer) => {
            const focus = requireOverlayKit().createFocusScope({
              config,
              layer,
              flush,
              container: () => refs.get('getRootEl')(),
              trapped: () => true,
              loop: () => prop('loop') ?? true,
              onMountAutoFocus: (event) => {
                if (!(prop('autoFocus') ?? true))
                  event.preventDefault()
              },
              restoreFocus: () => prop('restoreFocus') ?? true,
            })
            defer(() => focus.dispose())
          })
        }
        acquire()
        return () => {
          disposed = true
          gate.dispose()
          const cleanup = release
          release = undefined
          cleanup?.()
        }
      },
    },
  },
})
