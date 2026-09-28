/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { ToolbarOverflowItem, ToolbarSchema } from './toolbar.types'
import { focusSafely, itemValue, queryItems, setup, trackOverflowLayout } from '@xihan-ui/core'
import { toolbarItemQuery } from './toolbar.anatomy'
import { measureToolbarOverflow, sameOverflowItems, toolbarOverflowTrigger } from './toolbar.overflow'

const { createMachine } = setup<ToolbarSchema>()

// 工具条没有自己的值，条目的按下态、选中值、展开态都归条目自己。
// 机器记两件事：焦点当下停在哪个条目上（roving tabindex 的锚点与方向键的起点），
// 以及放不下、收进「更多」菜单的是哪几个条目。两者都不受控、不对外通知，只有一个状态，
// transition 省略 target 即只跑 actions。
export const toolbarMachine = createMachine({
  name: 'toolbar',
  context: ({ cell }) => ({
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    overflowTriggerFocused: cell<boolean>(() => ({ defaultValue: false })),
    // 按压通道：正被按住的条目，与焦点锚点互相独立（锚点跨条目移动，按压面只跟按住的那一个走）
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
    overflowItems: cell<ToolbarOverflowItem[]>(() => ({ defaultValue: [], isEqual: sameOverflowItems })),
  }),
  refs: () => ({
    getRootEl: () => null,
  }),
  initialState: () => 'idle',
  effects: ['trackOverflow'],
  watch: ({ track, prop, action }) => {
    // 按住途中整条转禁用：条目只是 aria-disabled、仍有焦点，但按压面不该留在禁用面上
    track([() => prop('disabled')], () => action(['releaseWhenInert']))
    // 换了主轴或尺寸档，条目与可用长度一起变：等这一轮渲染落定再重量
    track([() => prop('orientation'), () => prop('size')], () => action(['measureOverflowAfterRender']))
  },
  states: {
    idle: {
      on: {
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'OVERFLOW_TRIGGER.FOCUS': { actions: ['setOverflowTriggerFocused'] },
        'TOOLBAR.BLUR': { actions: ['clearFocusedValue'] },
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
        'OVERFLOW.SELECT': { actions: ['activateOverflowItem'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整条禁用一票否决；条目自己的禁用只有 connect 知道，随 PRESS.START 带进来
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
      // 只收自己那一下：别的条目的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressedValue', null)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.FOCUS')
          return
        context.set('focusedValue', e.value)
        context.set('overflowTriggerFocused', false)
      },
      // 「更多」钮拿到焦点：它接过锚点，条目让出 Tab 停靠位
      setOverflowTriggerFocused: ({ context }) => {
        context.set('focusedValue', null)
        context.set('overflowTriggerFocused', true)
      },
      // 焦点离场即清锚点，root 据此重新认领 Tab 位
      clearFocusedValue: ({ context }) => {
        context.set('focusedValue', null)
        context.set('overflowTriggerFocused', false)
      },

      /**
       * 量一次收纳并写回。焦点所在的条目这一轮被收进菜单时，它马上要藏起来，焦点会掉到文档上：
       * 等这一轮渲染落定，把焦点交给「更多」钮——被收起的条目就在它弹出的菜单里。
       */
      measureOverflow: ({ refs, context, prop, flush }) => {
        const root = refs.get('getRootEl')()
        if (!root)
          return
        const next = measureToolbarOverflow(root, context.get('overflowItems'), prop('orientation') ?? 'horizontal')
        if (next == null)
          return
        const active = root.ownerDocument.activeElement as HTMLElement | null
        const collapsed = new Set(next.map(item => item.value))
        const displaced = active != null
          && queryItems(root, toolbarItemQuery).includes(active)
          && !active.hidden
          && collapsed.has(itemValue(active) ?? '')
        context.set('overflowItems', next)
        if (!displaced)
          return
        flush(() => {
          const trigger = toolbarOverflowTrigger(root)
          if (trigger && !trigger.hidden)
            focusSafely(trigger)
        })
      },
      measureOverflowAfterRender: ({ flush, action }) => flush(() => action(['measureOverflow'])),

      // 替收起的条目触发它自己的点击：条目的行为（按钮的处理器、开关的切换、链接的跳转）一概归它，
      // 菜单只是换了个入口。条目虽然藏着，click() 照样派出点击事件
      activateOverflowItem: ({ refs, event }) => {
        const e = event.current()
        if (e.type !== 'OVERFLOW.SELECT')
          return
        const root = refs.get('getRootEl')()
        if (!root)
          return
        queryItems(root, toolbarItemQuery).find(el => itemValue(el) === e.value)?.click()
      },
    },
    effects: {
      /**
       * 盯住收纳：root 由适配器在首轮渲染后交进 refs，挂载那一刻先量一次（首帧就收好，
       * 不先画一排溢出的条目），再等下一轮渲染落定补量一次——Web Components 的角色节点
       * 要等首轮接线后才带上身份标记。之后由观察器接管，容器与条目的尺寸、条目增减与改写、
       * 字体加载都会触发重量。
       */
      trackOverflow: ({ refs, action, flush }) => {
        let disposed = false
        let observed: HTMLElement | null = null
        let stop: (() => void) | null = null
        const attach = (): void => {
          if (disposed)
            return
          const root = refs.get('getRootEl')()
          if (root !== observed) {
            stop?.()
            stop = null
            observed = root
            const win = root?.ownerDocument.defaultView as (Window & typeof globalThis) | null | undefined
            if (root && win) {
              stop = trackOverflowLayout(win, {
                container: root,
                nodes: () => {
                  const trigger = toolbarOverflowTrigger(root)
                  const items: Element[] = queryItems(root, toolbarItemQuery)
                  return trigger ? [...items, trigger] : items
                },
                onChange: () => action(['measureOverflow']),
              })
            }
          }
          action(['measureOverflow'])
        }
        attach()
        flush(attach)
        return () => {
          disposed = true
          stop?.()
        }
      },
    },
  },
})
