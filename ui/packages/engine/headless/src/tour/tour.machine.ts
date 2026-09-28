/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tour 相关实现。

import type { PositionResult, PropFn, Scope } from '@xihan-ui/core'
import type { TourPressedPart, TourSchema, TourSpotlightRect, TourStep } from './tour.types'
import { canTakeFocus, createDismissLayer, createFocusScope, setTimeoutEffect, setup } from '@xihan-ui/core'
import { clearOpenedAtMount, openAtMount, openedAtMountCell } from '../shared/first-frame'
import { OVERLAY_ARROW_PADDING, OVERLAY_ARROW_SIZE, OVERLAY_PLACEMENT_ANCHORED } from '../shared/overlay'
import { setupLayerTransaction } from '../shared/overlay-shell'
import { sameTourSpotlight, tourSpotlightBox } from './tour.spotlight'

const { createMachine } = setup<TourSchema>()

/** 未指定 placement 时的落位：气泡挂在目标下方。 */
export const TOUR_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_ANCHORED

/** 与共享的 OVERLAY_OFFSET 不同：气泡要给聚光灯的描边与留白让出位置，间距更大。 */
export const TOUR_DEFAULT_OFFSET = 12

/** 目标缺席时等它出现的缺省时长（ms）。 */
export const TOUR_TARGET_TIMEOUT = 3000

/** 总步数。作者给什么都得先落成非负整数。 */
export function tourStepCount(steps: readonly TourStep[] | undefined): number {
  return Array.isArray(steps) ? steps.length : 0
}

/**
 * 把任意来路的步序夹进 [0, count - 1]。
 * 上界取 count - 1：末步再往前一步就是完成，而完成即关闭，没有多出来的那一格。
 */
export function clampTourStep(step: number | undefined, count: number): number {
  if (count <= 0)
    return 0
  if (step == null || !Number.isFinite(step))
    return 0
  return Math.min(Math.max(Math.trunc(step), 0), count - 1)
}

/** 停在末步了吗。空清单也算末步：一步都没声明时下一步直接完成。 */
export function isTourLastStep(step: number, count: number): boolean {
  return count <= 0 || step >= count - 1
}

/** 取当前步的声明；越界与空清单一律 null。 */
export function currentTourStep(steps: readonly TourStep[] | undefined, step: number): TourStep | null {
  if (!Array.isArray(steps))
    return null
  return steps[step] ?? null
}

function stepOf(prop: PropFn<TourSchema>, raw: number): number {
  return clampTourStep(raw, tourStepCount(prop('steps')))
}

/**
 * 取当前步的目标节点：选择器经 scope 的根节点查（组件可能活在 shadow root 里），元素原样用，函数现调。
 * 已脱离文档的节点量不出几何，按取不到处理。
 */
export function resolveTourTarget(scope: Scope, step: TourStep | null): HTMLElement | null {
  const target = step?.target
  if (!target)
    return null
  let el: HTMLElement | null
  if (typeof target === 'string') {
    try {
      el = scope.getRootNode().querySelector<HTMLElement>(target)
    }
    catch {
      // 作者手写的选择器可能非法；查不到就是不锚定，不让它抛出去
      return null
    }
  }
  else {
    el = typeof target === 'function' ? target() : target
  }
  return el?.isConnected ? el : null
}

// 步序住在 context 的 cell 里，受控/非受控在 cell 收口，这一路不需要影子事件。
// 开合编进 FSM 状态，走守卫对加 CONTROLLED.* 影子事件加 watch 那一套。
export const tourMachine = createMachine({
  name: 'tour',
  context: ({ prop, cell }) => ({
    // 首帧标记：挂载时开着、还没收起过
    openedAtMount: openedAtMountCell(cell, openAtMount(prop)),
    value: cell<number>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? 0,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 高亮框由 measureSpotlight 量出来写进来；带 isEqual，量到同一个结果不多推一轮重渲
    spotlight: cell<TourSpotlightRect | null>(() => ({ defaultValue: null, isEqual: sameTourSpotlight })),
    // 按压通道：正被按住的那颗按钮，四颗都住在气泡里，只在展开态收事件
    pressed: cell<TourPressedPart | null>(() => ({ defaultValue: null })),
    // 声明的目标等满时长仍没出现：该步按居中呈现
    missingTarget: cell<boolean>(() => ({ defaultValue: false })),
    // 换步进行中：气泡与聚光框一起滑，过渡播完即撤
    stepping: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    position: null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    reanchor: null,
    stepRound: 0,
  }),
  initialState: ({ prop }) => (openAtMount(prop) ? 'open' : 'closed'),
  // 逻辑收起之后，层、消解与焦点域必须等所有视觉退场租约结清才归还。
  effects: ['trackOverlay'],
  watch: ({ track, prop, context, action }) => {
    // 受控时用户事件只发意图回调、不自改状态；宿主写回 open 后由这里派发 CONTROLLED.* 无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 步序变了要先把目标滚进视口，再换锚点、重量高亮框；挂在 watch 上，
    // 受控时步序是宿主写进来的，不经过走步动作
    track([context.dep('value')], () => action(['startStepping', 'scrollTargetIntoView', 'reanchorPosition', 'measureSpotlight']))
    // 换步途中几何更新了：等这一轮起播的位置与尺寸过渡播完再撤换步标记
    track([context.dep('position'), context.dep('spotlight')], () => action(['awaitStepSettle']))
  },
  states: {
    closed: {
      // 第一次收起即撤首帧标记：之后的每一次打开都是用户操作带来的
      entry: ['clearOpenedAtMount'],
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
      // 进入 open：定位 → 高亮 → 消解与焦点。退出 open 时按同序清理。
      effects: ['trackPosition', 'trackSpotlight', 'trackTarget'],
      // 几何在展开那一刻清掉再量：留着上一轮坐标会让这次展开先按旧位置闪一帧。
      // 收起时不清——退场要在原处播完，清成 0 气泡与高亮框会一路滑向视口左上角
      entry: ['clearGeometry', 'endStepping'],
      // 收起即松开：按住 Enter 走完末步或跳过，那颗按钮随内容藏起，不会再来 keyup 或 blur
      exit: ['releasePress'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'VALUE.SET': { actions: ['setValue'] },
        'STEP.PREV': { actions: ['goPrev'] },
        // 末步再走一步即完成：先发 onComplete 再按受控与否关闭
        'STEP.NEXT': [
          { guard: 'isLastStepOpenControlled', actions: ['invokeOnComplete', 'invokeOnClose'] },
          { guard: 'isLastStep', target: 'closed', actions: ['invokeOnComplete', 'invokeOnClose'] },
          { actions: ['goNext'] },
        ],
        'SKIP': [
          { guard: 'isOpenControlled', actions: ['invokeOnSkip', 'invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnSkip', 'invokeOnClose'] },
        ],
        'GEOMETRY.SYNC': { actions: ['recheckTarget', 'reanchorPosition', 'measureSpotlight'] },
        'STEP.SETTLED': { actions: ['endStepping'] },
        // 等到了目标：先滚进视口，再挂锚点、量高亮框
        'TARGET.FOUND': { actions: ['scrollTargetIntoView', 'reanchorPosition', 'measureSpotlight'] },
        // 等不到：该步按居中呈现，锚点与高亮框随之撤掉
        'TARGET.MISSING': { actions: ['markTargetMissing', 'reanchorPosition', 'measureSpotlight'] },
        // 按压通道：首步的上一步是原生禁用，按住它不进按压面；其余三颗照收
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isLastStep: ({ prop, context }) => {
        const count = tourStepCount(prop('steps'))
        return isTourLastStep(clampTourStep(context.get('value'), count), count)
      },
      // 末步与受控要一起判：守卫是且的关系，而转移数组按顺序取第一条命中的
      isLastStepOpenControlled: ({ prop, context }) => {
        if (prop('open') === undefined)
          return false
        const count = tourStepCount(prop('steps'))
        return isTourLastStep(clampTourStep(context.get('value'), count), count)
      },
      // 上一步在首步是原生 disabled：真实浏览器不会给它派键盘与指针事件，这里再守一道，纯逻辑测试与合成事件也不会把它按下
      canPress: ({ prop, context, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START' || e.part !== 'prev-trigger')
          return true
        return stepOf(prop, context.get('value')) > 0
      },
    },
    actions: {
      clearOpenedAtMount,
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      invokeOnComplete: ({ prop, context }) =>
        prop('onComplete')?.({ step: stepOf(prop, context.get('value')) }),
      invokeOnSkip: ({ prop, context }) =>
        prop('onSkip')?.({ step: stepOf(prop, context.get('value')) }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      // 越界步序在写入口就夹掉，受控宿主拿到的回调值永远可用
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', stepOf(prop, e.value))
      },
      // 先把当前值夹回合法区间再加减：清单变短后内部值可能停在已不存在的步上，
      // 而界面显示的是夹过的那一步
      goPrev: ({ context, prop }) => context.set('value', stepOf(prop, stepOf(prop, context.get('value')) - 1)),
      goNext: ({ context, prop }) => context.set('value', stepOf(prop, stepOf(prop, context.get('value')) + 1)),
      clearGeometry: ({ context }) => {
        context.set('position', null)
        context.set('spotlight', null)
      },
      /**
       * 展开着换步：气泡定位层与聚光框投影 data-animating，皮肤只在这一档挂位置与尺寸的过渡，
       * 两者同一段时长、同一条曲线一起滑过去。还没量到过几何（刚展开、居中步）时不挂：没有起点可滑。
       */
      startStepping: ({ context, state }) => {
        if (state.get() === 'open' && (context.get('position') != null || context.get('spotlight') != null))
          context.set('stepping', true)
      },
      /**
       * 换步途中几何更新了一回：宿主把这一帧提交出去之后，等两者身上起播的过渡都播完再报落定。
       * 每回更新各起一轮，只有最新那一轮报——同步量与推迟量、定位引擎的回报先后到，前一轮的过渡还在跑。
       */
      awaitStepSettle: ({ context, refs, scope, send, flush }) => {
        if (!context.get('stepping'))
          return
        const round = refs.get('stepRound') + 1
        refs.set('stepRound', round)
        flush(() => {
          const nodes = [refs.get('getFloatingEl')(), scope.getById(scope.partId('tour', 'spotlight'))]
          const moves = nodes.flatMap(node => node && typeof node.getAnimations === 'function'
            ? node.getAnimations().filter(animation => 'transitionProperty' in animation)
            : [])
          void Promise.allSettled(moves.map(animation => animation.finished)).then(() => {
            if (refs.get('stepRound') === round && context.get('stepping'))
              send({ type: 'STEP.SETTLED' })
          })
        })
      },
      endStepping: ({ context }) => context.set('stepping', false),
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
      markTargetMissing: ({ context }) => context.set('missingTarget', true),
      // 超时后目标才挂上来：remeasure 时再取一次，取到了就回到锚定
      recheckTarget: ({ prop, context, scope }) => {
        if (!context.get('missingTarget'))
          return
        const step = currentTourStep(prop('steps'), stepOf(prop, context.get('value')))
        if (resolveTourTarget(scope, step))
          context.set('missingTarget', false)
      },
      reanchorPosition: ({ refs }) => refs.get('reanchor')?.(),
      // 目标不在视口内先滚进来（nearest：已可见时不动）；量测与定位随后按滚完的布局取
      scrollTargetIntoView: ({ prop, context, scope }) => {
        if (prop('autoScroll') === false)
          return
        const step = currentTourStep(prop('steps'), stepOf(prop, context.get('value')))
        const target = resolveTourTarget(scope, step)
        target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
      },
      /**
       * 量高亮框，量两遍：同步那遍照顾展开态里换步，推迟那遍照顾首帧、目标节点刚挂上来、
       * 以及从收起转到展开的那一拍（效应在状态位落定之前挂载，同步那遍读到的还是旧状态）。
       * cell 带 isEqual，两遍量到同一个结果不多推一轮重渲。
       */
      measureSpotlight: ({ prop, context, scope, state, flush }) => {
        const run = (): void => {
          // 收起后不再量：退场在最后一次量到的位置播完，下次展开由 entry 清掉重量
          if (state.get() !== 'open')
            return
          const step = currentTourStep(prop('steps'), stepOf(prop, context.get('value')))
          const target = resolveTourTarget(scope, step)
          if (!target) {
            context.set('spotlight', null)
            return
          }
          const view = target.ownerDocument.defaultView
          if (!view) {
            context.set('spotlight', null)
            return
          }
          context.set('spotlight', tourSpotlightBox(
            target.getBoundingClientRect(),
            prop('spotlightPadding'),
            view.getComputedStyle(target).borderRadius,
          ))
        }
        run()
        flush(run)
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
      trackPosition: ({ refs, prop, context, scope, flush }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let queued = false
        let disposed = false

        const attach = (): void => {
          queued = false
          if (disposed)
            return
          // 换锚点先撤旧订阅：引擎的 autoUpdate 会一直跟着旧目标算
          stop?.()
          stop = undefined
          const floating = refs.get('getFloatingEl')()
          const step = currentTourStep(prop('steps'), stepOf(prop, context.get('value')))
          const target = resolveTourTarget(scope, step)
          // 居中步没有锚点，位置结果一并清掉，否则会留着上一步的坐标
          if (!floating || !target) {
            context.set('position', null)
            return
          }
          stop = engine.attach(
            target,
            floating,
            {
              placement: step?.placement ?? prop('placement') ?? TOUR_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? TOUR_DEFAULT_OFFSET,
              // positioner 渲染成 fixed（见 connect），坐标系必须跟着走视口系，
              // 否则页面一滚气泡就整体偏掉一个 scrollY
              strategy: 'fixed',
              dir: prop('dir'),
              // 引擎量不到箭头，尺寸与让开圆角的余量由这里交进去
              arrow: { size: OVERLAY_ARROW_SIZE, padding: OVERLAY_ARROW_PADDING },
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            result => context.set('position', result),
          )
        }

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带 hidden、高度为 0，算出的坐标会错位。
        // 同一拍里的多次请求合并成一次。
        const schedule = (): void => {
          if (queued || disposed)
            return
          queued = true
          flush(attach)
        }

        refs.set('reanchor', schedule)
        schedule()

        return () => {
          disposed = true
          refs.set('reanchor', null)
          stop?.()
        }
      },
      /**
       * 高亮框跟随窗口尺寸与滚动。滚动走捕获段，嵌套滚动容器的滚动也收得到；
       * 高频事件按帧合并，一帧至多量一次。读 DOM 由 measureSpotlight 自己推迟，
       * 这里不必再包一层 flush；disposed 标记仍要留，监听器与 cleanup 之间总有一帧可能被触发。
       */
      trackSpotlight: ({ scope, action }) => {
        let disposed = false
        let frame = 0
        const win = scope.getWin()
        // 页面滚动与视口缩放是跟手的重量：先撤换步标记，两者直接到位、不拖尾
        const onResize = (): void => {
          if (!disposed)
            action(['endStepping', 'measureSpotlight'])
        }
        const onScroll = (): void => {
          if (disposed || frame)
            return
          frame = win.requestAnimationFrame(() => {
            frame = 0
            if (!disposed)
              action(['endStepping', 'measureSpotlight'])
          })
        }
        action(['scrollTargetIntoView', 'measureSpotlight'])
        win.addEventListener('resize', onResize)
        win.addEventListener('scroll', onScroll, { capture: true, passive: true })
        return () => {
          disposed = true
          if (frame)
            win.cancelAnimationFrame(frame)
          win.removeEventListener('resize', onResize)
          win.removeEventListener('scroll', onScroll, { capture: true })
        }
      },
      /**
       * 当前步声明了目标而取不到时等它出现：盯住组件所在的根节点，任何节点增删与属性变化后再取一次，
       * 取到即发 TARGET.FOUND；等满 targetTimeout 仍没有就发 TARGET.MISSING。展开与每次换步重新开始等，
       * 收起即撤掉观察与计时。
       */
      trackTarget: ({ prop, context, scope, send, track }) => {
        let stop: (() => void) | undefined
        const sync = (): void => {
          stop?.()
          stop = undefined
          context.set('missingTarget', false)
          const step = currentTourStep(prop('steps'), stepOf(prop, context.get('value')))
          if (!step?.target || resolveTourTarget(scope, step))
            return
          const timeout = prop('targetTimeout') ?? TOUR_TARGET_TIMEOUT
          // 0 即不等：当场按居中呈现，不起零时长的计时器——那会让各端在挂载那一帧各自停在不同的中间态
          if (timeout === 0) {
            send({ type: 'TARGET.MISSING' })
            return
          }
          const root = scope.getRootNode()
          const Observer = scope.getWin().MutationObserver
          const observer = Observer
            ? new Observer(() => {
                if (!resolveTourTarget(scope, step))
                  return
                stop?.()
                stop = undefined
                send({ type: 'TARGET.FOUND' })
              })
            : null
          observer?.observe(root, { childList: true, subtree: true, attributes: true })
          const cancelTimer = setTimeoutEffect(() => {
            stop?.()
            stop = undefined
            send({ type: 'TARGET.MISSING' })
          }, timeout)
          stop = () => {
            observer?.disconnect()
            cancelTimer()
          }
        }
        // 只盯步序：清单常以字面量传入，每轮渲染都是新数组，盯它会让等待与超时反复重来
        track([context.dep('value')], sync)
        sync()
        return () => stop?.()
      },
      // 层、消解层与焦点域共享 Presence 生命周期：逻辑关闭先让内容失活，
      // 真正的视觉退场结束后才逆序归还。Tour 本身没有滚动锁或背景失活资源，不能在这里虚构它们。
      trackOverlay: ({ refs, prop, scope, send, flush, state, track }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        let reactivateFocus: (() => void) | undefined
        let returnFocusNow: (() => void) | undefined
        const acquire = (): (() => void) => setupLayerTransaction(registerLayer, (layer, defer) => {
          const getContentEl = refs.get('getContentEl')
          const dismiss = createDismissLayer({
            config,
            layer,
            // 退场帧仍持有 Layer，但不能再接受第二次关闭意图。
            onEscapeKeyDown: (event) => {
              if (state.get() !== 'open' || !(prop('closeOnEscape') ?? true))
                event.preventDefault()
            },
            onInteractOutside: (event) => {
              if (state.get() !== 'open' || !(prop('closeOnInteractOutside') ?? false))
                event.preventDefault()
            },
            // 两个开关都现读 prop，引导中途改也立刻生效
            onDismiss: (reason) => {
              if (reason === 'escape-key') {
                if (prop('closeOnEscape') ?? true)
                  // Escape 走放弃这条路而不是单纯关闭，onSkip 要发出去
                  send({ type: 'SKIP' })
                return
              }
              // 指针落在层外、焦点跑到层外都归这一条；closeOnInteractOutside 缺省 false
              if (prop('closeOnInteractOutside') ?? false)
                send({ type: 'CLOSE', src: 'interact-outside' })
            },
          })
          defer(() => dismiss.dispose())

          const focus = createFocusScope({
            config,
            layer,
            flush,
            // 每次读最新 ref，容器晚一拍就位也能命中
            container: () => getContentEl(),
            // 退场内容已经 inert，保留焦点域的归还资格但不再把焦点拉回去。
            trapped: () => state.get() === 'open',
            loop: true,
            // 焦点落在 content 容器本身而不是第一个按钮：读屏念完整段文案，Enter/Space 归下一步管。
            // 容器还没显形时回 null，回非空会被当成焦点已安排好
            initialFocus: () => {
              const el = getContentEl()
              return canTakeFocus(el, scope) ? el : null
            },
            restoreFocus: () => true,
          })
          reactivateFocus = focus.reactivate
          returnFocusNow = focus.returnFocus
          defer(() => {
            if (reactivateFocus === focus.reactivate)
              reactivateFocus = undefined
            if (returnFocusNow === focus.returnFocus)
              returnFocusNow = undefined
            focus.dispose()
          })
        }, { registry: config.layerRegistry, flush })

        const presence = refs.get('presence')
        let disposed = false
        let release: (() => void) | undefined
        let lastOpen = false

        const finish = (): void => {
          if (disposed || state.get() === 'open' || !release)
            return
          const cleanup = release
          release = undefined
          cleanup()
        }
        const offExit = presence?.onExitComplete(finish)
        const sync = (): void => {
          if (disposed)
            return
          const open = state.get() === 'open'
          const reopening = open && !lastOpen && release !== undefined
          const closing = !open && lastOpen
          lastOpen = open
          if (open) {
            // 退场中重开沿用原 Layer；Presence 会结清旧视觉租约。
            release ??= acquire()
            presence?.update(true)
            if (reopening) {
              const activate = reactivateFocus
              flush(() => scope.getWin().requestAnimationFrame(() => {
                if (!disposed && state.get() === 'open' && release && reactivateFocus === activate)
                  activate?.()
              }))
            }
          }
          else {
            // 关闭那一刻归还焦点：内容随即 inert，资源要留到退场播完，焦点不能跟着等
            if (closing)
              returnFocusNow?.()
            if (!presence || !presence.rendered)
              finish()
          }
        }
        try {
          track([() => state.get()], sync)
          sync()
        }
        catch (error) {
          disposed = true
          offExit?.()
          release?.()
          throw error
        }
        return () => {
          disposed = true
          offExit?.()
          const cleanup = release
          release = undefined
          cleanup?.()
        }
      },
    },
  },
})
