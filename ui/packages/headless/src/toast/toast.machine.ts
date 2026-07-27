import type { Scope } from '@xihan-ui/core'
import type { ToastPauseSource, ToastSchema, ToastType } from './toast.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'

const { createMachine } = setup<ToastSchema>()

/** 默认停留毫秒。 */
export const TOAST_DURATION = 5000
/** 默认退场窗口毫秒：进入 dismissing 后停留这么久再转 unmounted。 */
export const TOAST_REMOVE_DELAY = 200

/**
 * 队列身份：没给 id 就用实例 scope id 兜底。
 * 兜底不是可有可无——status-change 的 detail 里恒带 id，缺了它宿主就分不清是哪条通知走完了。
 */
export function resolveToastId(id: string | undefined, scope: Scope): string {
  return id ?? scope.id
}

/**
 * 停留时长归一。返回 Infinity 表示"不起计时器"：
 * - loading 一律不自动消失：它说的是事情还没完，到点自己走掉等于把用户还在等的进度悄悄抹掉；
 * - duration <= 0 或非有限数同样按不自动消失处理，这是关掉自动消失的写法。
 */
export function resolveToastDuration(type: ToastType | undefined, duration: number | undefined): number {
  if ((type ?? 'info') === 'loading')
    return Number.POSITIVE_INFINITY
  const ms = duration ?? TOAST_DURATION
  return Number.isFinite(ms) && ms > 0 ? ms : Number.POSITIVE_INFINITY
}

export const toastMachine = createMachine({
  name: 'toast',
  context: ({ prop, cell }) => ({
    remaining: cell<number>(() => ({ defaultValue: resolveToastDuration(prop('type'), prop('duration')) })),
    // 暂停来源做成集合而不是一个布尔：指针悬停与焦点停留会同时按住计时，
    // 只记布尔的话鼠标一移开就把仍在用键盘读这条通知的人的计时放开了
    pausedBy: cell<ToastPauseSource[]>(() => ({ defaultValue: [] })),
  }),
  initialState: () => 'visible',
  // 语气或时长被改写要重算预算。最常见的一次是 loading 转 success：
  // 不重算的话那条通知会带着 loading 的"永不消失"预算永远挂在屏幕上。
  watch: ({ track, prop, action }) => track(
    [() => prop('type'), () => prop('duration')],
    () => action(['syncDuration']),
  ),
  // 页面可见性要跨整条生命周期盯着，因此挂根级：进入初始状态时挂一次，停机才撤
  effects: ['trackPageIdle'],
  states: {
    visible: {
      initial: 'running',
      // 三条出口都通向退场，且两个子态下都成立，所以挂在父状态上
      on: {
        'TOAST.DISMISS': { target: 'dismissing' },
        'TOAST.ACTION': { target: 'dismissing', actions: ['invokeAction'] },
        'after.duration': { target: 'dismissing' },
      },
      states: {
        running: {
          effects: ['trackDuration'],
          on: {
            'TOAST.PAUSE': { target: 'visible.paused', actions: ['addPauseSource'] },
            // 预算变了要重起计时器：reenter 把 trackDuration 拆掉再挂。
            // 拆的那一下会按旧预算记一次账，随后 resetDuration 覆盖掉——
            // 顺序由编排保证（退出效应 → 退出动作 → 转移动作 → 进入效应）。
            'TOAST.RESET': { target: 'visible.running', reenter: true, actions: ['resetDuration'] },
          },
        },
        paused: {
          on: {
            // 已经暂停时再来一个来源只是登记，不必重入（重入会白白拆装一遍效应）
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
      effects: ['waitForRemoveDelay'],
      on: { 'after.removeDelay': { target: 'unmounted' } },
    },
    // 终态：节点仍在（带 hidden），由宿主决定什么时候把它从队列里删掉
    unmounted: {
      entry: ['invokeUnmounted'],
    },
  },
  implementations: {
    guards: {
      // 守卫在动作之前求值，所以问的是"把这个来源摘掉之后还剩人按着吗"，
      // 而不是"现在还剩几个"
      isLastPauseSource: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TOAST.RESUME')
          return false
        return context.get('pausedBy').every(src => src === e.src)
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
        context.set('remaining', resolveToastDuration(prop('type'), prop('duration')))
      },
      syncDuration: ({ send }) => send({ type: 'TOAST.RESET' }),
      invokeAction: ({ prop, scope }) => prop('onAction')?.({ id: resolveToastId(prop('id'), scope) }),
      invokeDismissing: ({ prop, scope }) =>
        prop('onStatusChange')?.({ id: resolveToastId(prop('id'), scope), status: 'dismissing' }),
      invokeUnmounted: ({ prop, scope }) =>
        prop('onStatusChange')?.({ id: resolveToastId(prop('id'), scope), status: 'unmounted' }),
    },
    effects: {
      /**
       * 计时器只在 running 子态存在。剩余预算记在 context 里，拆效应时把已经跑掉的一段扣掉，
       * 下次进 running 接着走——从头重来会让"指针扫过一下"变成给这条通知续命一整轮。
       */
      trackDuration: ({ context, send }) => {
        const remaining = context.get('remaining')
        // Infinity / 非正数都表示不自动消失：不起计时器，也就没有账要记
        if (!Number.isFinite(remaining) || remaining <= 0)
          return undefined

        const startedAt = Date.now()
        const stop = setTimeoutEffect(() => send({ type: 'after.duration' }), remaining)

        return () => {
          stop()
          // 夹到最少 1ms：让一条本来有限时长的通知因为扣成了 0 而变成"永不消失"，
          // 比让它立刻走掉糟得多
          context.set('remaining', Math.max(1, remaining - (Date.now() - startedAt)))
        }
      },
      waitForRemoveDelay: ({ prop, send }) => {
        const delay = prop('removeDelay') ?? TOAST_REMOVE_DELAY
        // 非有限值 = 停在 dismissing 等宿主自己收尾；不把 Infinity 送进 setTimeoutEffect（它会抛）
        if (!Number.isFinite(delay))
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.removeDelay' }), Math.max(0, delay))
      },
      /**
       * 页面被切到后台时把计时按住：标签页在背景里跑完的五秒，用户一眼都没看到。
       * 关掉这个开关时连监听器都不挂——纯逻辑环境（无 document）下也就不会碰 DOM。
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
