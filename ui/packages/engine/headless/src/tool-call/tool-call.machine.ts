/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tool call 相关实现。

import type { ToolCallSchema } from './tool-call.types'
import { setup } from '@xihan-ui/core'

const { createMachine, guards } = setup<ToolCallSchema>()

/**
 * 自动开合的「锁存」靠转移的放置位置，不靠一个布尔位。
 *
 * `PHASE.ACTIVE` / `PHASE.SETTLE` 只声明在 `auto` 这个复合态上，根级不声明。
 * 转移查找从叶子沿祖先链往外找第一个声明者，所以一旦进了 `held`，
 * 阶段变化在结构上就够不着任何转移——自动开合从此永久失效，不需要额外的守卫。
 *
 * `OPEN` / `CLOSE` 与 `CONTROLLED.*` 逐分支声明在两个复合态上、target 写相对路径：
 * 写在根级的话 source 是 undefined，相对路径解不出来，只能写死一支，
 * 转非受控之后自动开合会莫名其妙失效。
 */
export const toolCallMachine = createMachine({
  name: 'tool-call',
  context: ({ cell }) => ({
    // 按压通道：trigger 被 Space / Enter 或触屏按住，与开合、阶段互相独立（Enter 在 keydown 即翻面，按压面不能随之丢）
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: ({ prop }) => {
    const explicit = prop('open') ?? prop('defaultOpen')
    if (explicit !== undefined)
      return explicit ? 'auto.expanded' : 'auto.collapsed'
    // 电平而不是边沿：工具块被建出来时往往已经在跑了，等「翻真」等不到
    return prop('running') ? 'auto.expanded' : 'auto.collapsed'
  },
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([() => prop('running')], () => action(['syncRunning']))
    // 按住途中转禁用：trigger 随即原生 disabled、不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled')], () => action(['releaseWhenInert']))
  },
  // 按压通道挂根级：没有 target，不受「根级相对路径解不出」的限制；trigger 在四个叶态都在场。
  // 原生 disabled，程序化派发由 canPress 再守一次；运行中 trigger 照常可点、家族照给 :active 面，按压面同样照有
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    auto: {
      initial: 'collapsed',
      on: {
        // 只在 auto 分支上声明：进了 held 就够不着
        'PHASE.ACTIVE': [{ guard: 'isAutoEnabled', target: 'auto.expanded', actions: ['invokeOnAutoOpen'] }],
        'PHASE.SETTLE': [{ guard: 'isAutoEnabled', target: 'auto.collapsed', actions: ['invokeOnAutoClose'] }],
        // 程序化入口只在本分支内翻面，不锁存
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnApiOpen'] },
          { target: '.expanded', actions: ['invokeOnApiOpen'] },
        ],
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnApiClose'] },
          { target: '.collapsed', actions: ['invokeOnApiClose'] },
        ],
        'CONTROLLED.OPEN': { target: '.expanded' },
        'CONTROLLED.CLOSE': { target: '.collapsed' },
      },
      states: {
        collapsed: {
          on: {
            // 用户动手即锁存：这一次开合同时把自动开合永久停用
            TOGGLE: [
              { guard: 'isOpenControlled', actions: ['invokeOnUserOpen'] },
              { target: 'held.expanded', actions: ['invokeOnUserOpen'] },
            ],
          },
        },
        expanded: {
          on: {
            TOGGLE: [
              { guard: 'isOpenControlled', actions: ['invokeOnUserClose'] },
              { target: 'held.collapsed', actions: ['invokeOnUserClose'] },
            ],
          },
        },
      },
    },
    held: {
      initial: 'collapsed',
      on: {
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnApiOpen'] },
          { target: '.expanded', actions: ['invokeOnApiOpen'] },
        ],
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnApiClose'] },
          { target: '.collapsed', actions: ['invokeOnApiClose'] },
        ],
        'CONTROLLED.OPEN': { target: '.expanded' },
        'CONTROLLED.CLOSE': { target: '.collapsed' },
      },
      states: {
        collapsed: {
          on: {
            TOGGLE: [
              { guard: 'isOpenControlled', actions: ['invokeOnUserOpen'] },
              { target: 'held.expanded', actions: ['invokeOnUserOpen'] },
            ],
          },
        },
        expanded: {
          on: {
            TOGGLE: [
              { guard: 'isOpenControlled', actions: ['invokeOnUserClose'] },
              { target: 'held.collapsed', actions: ['invokeOnUserClose'] },
            ],
          },
        },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isAutoAllowed: ({ prop }) => prop('autoDisclosure') !== false,
      // 走组合子而不是裸内联函数：createMachine 的自检会把裸函数直接拦下
      isAutoEnabled: guards.and(guards.not('isOpenControlled'), 'isAutoAllowed'),
      canPress: ({ prop }) => !prop('disabled'),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressed', false)
      },
      invokeOnUserOpen: ({ prop }) => prop('onOpenChange')?.({ open: true, source: 'user' }),
      invokeOnUserClose: ({ prop }) => prop('onOpenChange')?.({ open: false, source: 'user' }),
      invokeOnAutoOpen: ({ prop }) => prop('onOpenChange')?.({ open: true, source: 'auto' }),
      invokeOnAutoClose: ({ prop }) => prop('onOpenChange')?.({ open: false, source: 'auto' }),
      invokeOnApiOpen: ({ prop }) => prop('onOpenChange')?.({ open: true, source: 'api' }),
      invokeOnApiClose: ({ prop }) => prop('onOpenChange')?.({ open: false, source: 'api' }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制收起
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      // 电平同步：每次 running 变化都按当前值发一条，不看方向
      syncRunning: ({ prop, send }) => {
        send(prop('running') ? { type: 'PHASE.ACTIVE' } : { type: 'PHASE.SETTLE' })
      },
    },
  },
})
