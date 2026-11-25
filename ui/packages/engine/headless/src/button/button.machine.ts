/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 button 相关实现。

import type { ButtonSchema } from './button.types'
import { DIAGNOSTIC_CODES, isDev, reportDiagnostic, setup } from '@xihan-ui/core'

const { createMachine } = setup<ButtonSchema>()

// 按钮没有业务状态：激活（click）交给平台，禁用 / 加载由 props 与原生伪类表达。
// 机器只承载按压通道——Space / Enter 与触屏按住期间的 context.pressed（投影 data-pressed），
// 让键盘与触屏看见和指针 :active 同一副按压面。禁用或进入加载途中按住的一律松开。
// 唯一的副作用是开发期的缺名提醒：仅图标的按钮挂载后读一次根节点，生产构建里直接跳过。
export const buttonMachine = createMachine({
  name: 'button',
  context: ({ cell }) => ({
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    getRootEl: () => null,
  }),
  initialState: () => 'idle',
  effects: ['checkAccessibleName'],
  watch: ({ track, prop, action }) => track([() => prop('disabled'), () => prop('loading')], () => action(['releaseWhenInert'])),
  states: {
    idle: {
      on: {
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      canPress: ({ prop }) => !prop('disabled') && !prop('loading'),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      // 按住途中被禁用或转入加载：原生 disabled 的按钮不再派 keyup / blur，按压面得由机器自己收
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('loading'))
          context.set('pressed', false)
      },
    },
    effects: {
      // 名字只看挂载后的真实节点：作者写在根上的属性、按钮里的文字（视觉隐藏的也算）三端都在这里，
      // 只看 props 认不出放在插槽里的那段文字
      checkAccessibleName: ({ refs, prop, flush }) => {
        if (!isDev())
          return undefined
        let disposed = false
        flush(() => {
          if (disposed || !prop('iconOnly'))
            return
          const root = refs.get('getRootEl')()
          if (!root || hasAccessibleName(root))
            return
          reportDiagnostic({
            code: DIAGNOSTIC_CODES.buttonMissingName,
            level: 'warn',
            scope: 'button',
            node: root,
            message: 'iconOnly 按钮没有可及名：根上写 aria-label / aria-labelledby，或在按钮里放一段视觉隐藏的文字',
          })
        })
        return () => {
          disposed = true
        }
      },
    },
  },
})

/** 根上有名字属性，或按钮里除去 aria-hidden 的部分有文字、有带名字的元素（img 的 alt、子元素的 aria-label）。 */
function hasAccessibleName(root: HTMLElement): boolean {
  for (const name of ['aria-label', 'aria-labelledby', 'title']) {
    if (root.getAttribute(name)?.trim())
      return true
  }
  return hasNamedContent(root)
}

function hasNamedContent(node: Node): boolean {
  for (const child of node.childNodes) {
    if (child.nodeType === 3 && child.textContent?.trim())
      return true
    if (child.nodeType !== 1)
      continue
    const el = child as Element
    if (el.getAttribute('aria-hidden') === 'true')
      continue
    if (el.getAttribute('aria-label')?.trim() || (el.localName === 'img' && el.getAttribute('alt')?.trim()))
      return true
    if (hasNamedContent(el))
      return true
  }
  return false
}
