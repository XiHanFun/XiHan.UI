/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toast 相关实现。

import type { Scope } from '@xihan-ui/core'
import type { ToastPauseSource, ToastPlacement, ToastPressedPart, ToastSchema } from './toast.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'

const { createMachine } = setup<ToastSchema>()

/** 默认停留毫秒。 */
export const TOAST_DURATION = 4000
/** 那一摞默认落在哪儿。 */
export const TOAST_PLACEMENT: ToastPlacement = 'bottom'
/** 摞内默认间距（px）。 */
export const TOAST_GAP = 12
/** 同时最多显示的条数。 */
export const TOAST_MAX = 3

/**
 * 队列身份：没给 id 就用实例 scope id 兜底。
 * status-change 的 detail 里恒带 id，宿主靠它分辨是哪一条走完了。
 */
export function resolveToastId(id: string | undefined, scope: Scope): string {
  return id ?? scope.id
}

/** 倒计时按秒分段的段数：不足一秒也算一段。减弱动效下倒计时条按它一格一格走。 */
export function countdownSteps(duration: number): number {
  return Math.max(1, Math.ceil(duration / 1000))
}

/**
 * 停留时长归一。返回 Infinity 表示不起计时器：
 * loading 一律不自动消失；duration <= 0 或非有限数同样按不自动消失处理。
 */
export function resolveToastDuration(loading: boolean | undefined, duration: number | undefined): number {
  if (loading)
    return Number.POSITIVE_INFINITY
  const ms = duration ?? TOAST_DURATION
  return Number.isFinite(ms) && ms > 0 ? ms : Number.POSITIVE_INFINITY
}

export const toastMachine = createMachine({
  name: 'toast',
  context: ({ prop, cell }) => ({
    remaining: cell<number>(() => ({ defaultValue: resolveToastDuration(prop('loading'), prop('duration')) })),
    // 暂停来源做成集合而不是布尔：指针悬停与焦点停留会同时按住计时，最后一个松开才继续走
    pausedBy: cell<ToastPauseSource[]>(() => ({ defaultValue: prop('paused') ? ['service'] : [] })),
    // 按压通道：正被按住的那颗按钮，与计时无关
    pressed: cell<ToastPressedPart | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({ presence: null }),
  // 建出来就被宿主按住的那种直接落 paused 子态：watch 只在值变了才响，起手为真的这一条它看不见
  initialState: ({ prop }) => (prop('paused') ? 'visible.paused' : 'visible'),
  watch: ({ track, prop, action }) => {
    // 加载态或时长被改写要重算预算，否则 loading 收尾成 success 后仍带着永不消失的预算
    track(
      [() => prop('loading'), () => prop('duration')],
      () => action(['syncDuration']),
    )
    // 宿主整摞一起按住/放开
    track(
      [() => prop('paused') ?? false],
      () => action(['syncPaused']),
    )
    // 按住途中转成不可关闭：关闭按钮随即 disabled 并收起、不会再来 keyup，按压面由机器自己收
    track([() => prop('closable') ?? true], () => action(['releaseWhenInert']))
  },
  // 页面可见性要跨整条生命周期盯着，因此挂根级
  effects: ['trackPageIdle'],
  // 按压通道的松开挂根级：退场后才到的 keyup / blur 也认，不留残留
  on: {
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    visible: {
      initial: 'running',
      // 进入退场即松开：按住 Enter 关掉条子，按钮随条目一起离场，不会再来 keyup 或 blur
      exit: ['releasePress'],
      // 三条出口都通向退场，两个子态下都成立，故挂在父状态上；按压只在台上时进
      on: {
        'TOAST.DISMISS': { target: 'dismissing' },
        'TOAST.ACTION': { target: 'dismissing', actions: ['invokeAction'] },
        'after.duration': { target: 'dismissing' },
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
      },
      states: {
        running: {
          effects: ['trackDuration'],
          on: {
            'TOAST.PAUSE': { target: 'visible.paused', actions: ['addPauseSource'] },
            // 预算变了要重起计时器：reenter 把 trackDuration 拆掉再挂。
            // 拆的那一下按旧预算记的账随后被 resetDuration 覆盖，顺序由编排保证。
            'TOAST.RESET': { target: 'visible.running', reenter: true, actions: ['resetDuration'] },
          },
        },
        paused: {
          on: {
            // 已经暂停时再来一个来源只是登记，不必重入
            'TOAST.PAUSE': { actions: ['addPauseSource'] },
            'TOAST.RESUME': [
              { guard: 'isLastPauseSource', target: 'visible.running', actions: ['removePauseSource'] },
              { actions: ['removePauseSource'] },
            ],
            'TOAST.RESET': { actions: ['resetDuration'] },
          },
        },
      },
    },
    dismissing: {
      entry: ['invokeDismissing'],
      effects: ['waitForExit'],
      on: { 'EXIT.COMPLETE': { target: 'unmounted' } },
    },
    // 终态：节点仍在（带 hidden），由宿主决定何时把它从队列里删掉
    unmounted: {
      entry: ['invokeUnmounted'],
    },
  },
  implementations: {
    guards: {
      // 守卫在动作之前求值，问的是把这个来源摘掉之后还剩不剩人按着
      isLastPauseSource: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TOAST.RESUME')
          return false
        return context.get('pausedBy').every(src => src === e.src)
      },
      // 关闭按钮原生 disabled 且收起，程序化派发再守一次；动作按钮加载中照常可点（TOAST.ACTION 不看
      // loading），指针 :active 有面，键盘与触屏也得有，故不按 loading 拦
      canPress: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START')
          return false
        return e.part !== 'close' || (prop('closable') ?? true)
      },
    },
    actions: {
      addPauseSource: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TOAST.PAUSE')
          return
        const current = context.get('pausedBy')
        // focusin 会随内部每个可聚焦节点冒上来，同一个来源登记一次就够
        if (current.includes(e.src))
          return
        context.set('pausedBy', [...current, e.src])
      },
      removePauseSource: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TOAST.RESUME')
          return
        context.set('pausedBy', context.get('pausedBy').filter(src => src !== e.src))
      },
      resetDuration: ({ context, prop }) => {
        context.set('remaining', resolveToastDuration(prop('loading'), prop('duration')))
      },
      syncDuration: ({ send }) => send({ type: 'TOAST.RESET' }),
      syncPaused: ({ prop, send }) => send(prop('paused')
        ? { type: 'TOAST.PAUSE', src: 'service' }
        : { type: 'TOAST.RESUME', src: 'service' }),
      invokeAction: ({ prop, scope }) => prop('onAction')?.({ id: resolveToastId(prop('id'), scope) }),
      invokeDismissing: ({ prop, scope }) =>
        prop('onStatusChange')?.({ id: resolveToastId(prop('id'), scope), status: 'dismissing' }),
      invokeUnmounted: ({ prop, scope }) =>
        prop('onStatusChange')?.({ id: resolveToastId(prop('id'), scope), status: 'unmounted' }),
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressed', e.part)
      },
      // 只收自己那一下：另一颗钮的 keyup 不该把正按着的这颗松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressed') === e.part)
          context.set('pressed', null)
      },
      releasePress: ({ context }) => context.set('pressed', null),
      releaseWhenInert: ({ context, prop }) => {
        if (!(prop('closable') ?? true) && context.get('pressed') === 'close')
          context.set('pressed', null)
      },
    },
    effects: {
      /**
       * 计时器只在 running 子态存在。剩余预算记在 context 里，拆效应时把已跑掉的一段扣掉，
       * 下次进 running 接着走。
       */
      trackDuration: ({ context, send }) => {
        const remaining = context.get('remaining')
        // Infinity 与非正数都表示不自动消失，不起计时器也不记账
        if (!Number.isFinite(remaining) || remaining <= 0)
          return undefined

        const startedAt = Date.now()
        const stop = setTimeoutEffect(() => send({ type: 'after.duration' }), remaining)

        return () => {
          stop()
          // 夹到最少 1ms，扣成 0 会被当成不自动消失
          context.set('remaining', Math.max(1, remaining - (Date.now() - startedAt)))
        }
      },
      // 退场时长不由这里定：宿主的 Presence 等根节点上真实的退场动画播完才结清，
      // 减弱动效下那段动画只剩淡变，同样等它播完
      waitForExit: ({ refs, send }) => {
        const presence = refs.get('presence')
        if (!presence)
          return setTimeoutEffect(() => send({ type: 'EXIT.COMPLETE' }), 0)
        return presence.onExitComplete(() => send({ type: 'EXIT.COMPLETE' }))
      },
      /**
       * 页面被切到后台时把计时按住。
       * 关掉这个开关时连监听器都不挂，无 document 的环境下也就不会碰 DOM。
       */
      trackPageIdle: ({ prop, scope, send }) => {
        if (!prop('pauseOnPageIdle'))
          return undefined
        const doc = scope.getDoc()
        const onVisibilityChange = (): void => {
          send(doc.visibilityState === 'hidden'
            ? { type: 'TOAST.PAUSE', src: 'page-idle' }
            : { type: 'TOAST.RESUME', src: 'page-idle' })
        }
        doc.addEventListener('visibilitychange', onVisibilityChange)
        return () => doc.removeEventListener('visibilitychange', onVisibilityChange)
      },
    },
  },
})
