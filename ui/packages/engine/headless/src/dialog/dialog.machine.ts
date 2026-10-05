/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { DialogGesture, DialogOffset, DialogPressedPart, DialogSchema } from './dialog.types'
import { createDismissLayer, createFocusScope, getTabbables, removeLinks, setup, warn } from '@xihan-ui/core'
import { closeReasonOf } from '../shared/close-reason'
import { clearOpenedAtMount, openAtMount, openedAtMountCell } from '../shared/first-frame'
import { createModalLayerResources, setupLayerTransaction } from '../shared/overlay-shell'
import { clampDialogOffset, dialogDragBounds, startGesturePointer } from './dialog.gesture'

const { createMachine } = setup<DialogSchema>()

/** 居中落点：每次打开都从这里起。 */
const HOME: DialogOffset = { x: 0, y: 0 }

// 选择器写错时不让异常穿出 rAF 回调，回 null 走默认聚焦顺序
function queryInContent(content: HTMLElement | null, selector: string): HTMLElement | null {
  if (!content)
    return null
  try {
    return content.querySelector<HTMLElement>(selector)
  }
  catch {
    warn(false, `dialog: initialFocus 不是合法的选择器：${selector}`)
    return null
  }
}

export const dialogMachine = createMachine({
  name: 'dialog',
  context: ({ cell, prop }) => ({
    // 按压通道：正被按住的那颗按钮，与开合无关
    pressed: cell<DialogPressedPart | null>(() => ({ defaultValue: null })),
    offset: cell<DialogOffset>(() => ({ defaultValue: HOME })),
    gesture: cell<DialogGesture | null>(() => ({ defaultValue: null })),
    openedAtMount: openedAtMountCell(cell, openAtMount(prop)),
    // 首帧即打开也算打开过：内容照常首屏就在
    opened: cell<boolean>(() => ({ defaultValue: openAtMount(prop) })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    syncModalResources: null,
    getContentEl: () => null,
    getTriggerEl: () => null,
    branches: () => [],
    partScope: 'dialog',
    gesture: null,
    pointer: null,
  }),
  initialState: ({ prop }) => (openAtMount(prop) ? 'open' : 'closed'),
  // 资源由机器生命周期持有；逻辑关闭之后继续保留，等 Presence 真正退出再释放。
  // 指针手势（拖动、抽屉改尺）的会话跟着 context 里的手势种类挂与拆，同样归机器生命周期
  effects: ['trackOverlay', 'trackGesture'],
  // 受控时用户事件只发意图回调；宿主写回 open 后由这条 watch 派发 CONTROLLED.* 回写状态。
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([() => prop('modal')], () => action(['syncModalResources']))
  },
  // 按压通道：trigger 与 close-trigger 都不受开合状态影响，两个状态都认 PRESS.*
  on: {
    'PRESS.START': { actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
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
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 每次打开都是一块新面板：拖动位移从居中落点起
      entry: ['resetOffset', 'markOpened'],
      // 收起即松开：按住 Enter 关掉面板，里面那颗关闭钮随内容一起藏起，不会再来 keyup 或 blur；
      // 拖到一半收起，手势一并收尾
      exit: ['releasePress', 'endGesture'],
      on: {
        'DRAG.START': { guard: 'canDrag', actions: ['startDrag'] },
        'DRAG.NUDGE': { guard: 'canDrag', actions: ['nudgeDrag'] },
        'DRAG.RESET': { actions: ['resetOffset'] },
        'GESTURE.MOVE': { actions: ['moveGesture'] },
        'GESTURE.END': { actions: ['endGesture'] },
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      // 作者开了拖动、且此刻没有别的手势在跑：同一次按下冒泡到标题栏与 header 只算一次
      canDrag: ({ prop, context }) => !!prop('draggable') && context.get('gesture') == null,
    },
    actions: {
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
      /**
       * 冻住这一场拖动的依据：按下那一刻的位移与四个边界。边界量的是面板此刻的矩形与视口，
       * 拖动途中不再量：面板跟着指针走，每一帧都从按下时的位移加总位移重新算。
       */
      startDrag: ({ context, refs, scope, event, send }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        const content = refs.get('getContentEl')()
        if (!content)
          return
        refs.get('pointer')?.dispose()
        refs.set('pointer', startGesturePointer(
          content,
          e.pointerId,
          point => send({ type: 'GESTURE.MOVE', point }),
          () => send({ type: 'GESTURE.END' }),
        ))
        const win = scope.getWin()
        const offset = context.get('offset')
        refs.set('gesture', {
          origin: { clientX: e.point.clientX, clientY: e.point.clientY },
          start: { ...offset },
          bounds: dialogDragBounds(content.getBoundingClientRect(), offset, { width: win.innerWidth, height: win.innerHeight }),
          sign: 1,
          axis: 'x',
          pointerId: e.pointerId,
        })
        context.set('gesture', 'drag')
      },
      // 键盘一步：现量矩形求边界，夹进视口
      nudgeDrag: ({ context, refs, scope, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.NUDGE')
          return
        const content = refs.get('getContentEl')()
        const offset = context.get('offset')
        const next = { x: offset.x + e.dx, y: offset.y + e.dy }
        if (!content) {
          context.set('offset', next)
          return
        }
        const win = scope.getWin()
        context.set('offset', clampDialogOffset(next, dialogDragBounds(content.getBoundingClientRect(), offset, { width: win.innerWidth, height: win.innerHeight })))
      },
      resetOffset: ({ context }) => context.set('offset', HOME),
      // 基准是按下那一刻的位移，不是上一帧：增量累加在顶到视口边之后回不来
      moveGesture: ({ context, refs, event }) => {
        const e = event.current()
        const session = refs.get('gesture')
        if (e.type !== 'GESTURE.MOVE' || !session || context.get('gesture') !== 'drag')
          return
        context.set('offset', clampDialogOffset({
          x: session.start.x + e.point.clientX - session.origin.clientX,
          y: session.start.y + e.point.clientY - session.origin.clientY,
        }, session.bounds))
      },
      endGesture: ({ context, refs }) => {
        refs.get('pointer')?.dispose()
        refs.set('pointer', null)
        refs.set('gesture', null)
        if (context.get('gesture') != null)
          context.set('gesture', null)
      },
      clearOpenedAtMount,
      markOpened: ({ context }) => {
        if (!context.get('opened'))
          context.set('opened', true)
      },
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current()) }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      syncModalResources: ({ refs }) => refs.get('syncModalResources')?.(),
    },
    effects: {
      // 指针会话由按下那一刻的动作挂上、收尾动作拆掉；机器停止时这里兜底拆掉还没收尾的那一场
      trackGesture: ({ refs }) => () => {
        refs.get('pointer')?.dispose()
        refs.set('pointer', null)
        refs.set('gesture', null)
      },
      trackOverlay: ({ refs, prop, scope, send, flush, state, track }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        let reactivateFocus: (() => void) | undefined
        let returnFocusNow: (() => void) | undefined
        let revealBackgroundNow: ((then?: () => void) => void) | undefined
        let resourcePolicy: string | undefined
        const acquire = (): (() => void) => setupLayerTransaction(registerLayer, (layer, defer, run) => {
          const role = prop('role') ?? 'dialog'
          resourcePolicy = role
          const getContentEl = refs.get('getContentEl')

          const dismiss = createDismissLayer({
            config,
            layer,
            // 两个开关都现读 prop，展开中途改也立刻生效
            onEscapeKeyDown: (e) => {
              if (state.get() !== 'open' || !(prop('closeOnEscape') ?? true))
                e.preventDefault()
            },
            onInteractOutside: (e) => {
            // 缺省值依赖 role 与 modal，这两项也一并现读：
            // alertdialog 一律不许点外面关，其余回落 modal
              const allowed = (prop('role') ?? 'dialog') === 'alertdialog'
                ? false
                : prop('closeOnInteractOutside') ?? prop('modal') ?? true
              if (state.get() !== 'open' || !allowed)
                e.preventDefault()
            },
            onDismiss: reason =>
              send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
          })
          defer(() => dismiss.dispose())

          // 焦点域无条件建，modal 只决定陷不陷焦点；放进 if (modal) 会让非模态
          // 既不初始聚焦也不归还焦点，restoreFocus 失效
          const focus = createFocusScope({
            config,
            layer,
            flush,
            container: getContentEl,
            // 退出内容已经 inert，保留焦点域归还资格但不向失活内容反复拉焦点。
            trapped: () => (prop('modal') ?? true) && state.get() === 'open',
            loop: () => prop('modal') ?? true,
            initialFocus: () => {
              const selector = prop('initialFocus')
              // 给了选择器就只认它；还没匹配上回 null，把机会留给下一帧重试
              if (selector !== undefined)
                return queryInContent(getContentEl(), selector)
              // alertdialog 焦点落在 content 容器本身，不预选按钮；
              // 普通 dialog 交给 tabbable 探测选首个可聚焦元素
              if (role === 'alertdialog')
                return getContentEl()
              // 初始焦点落到第一个真正的控件上：拖动与改尺把手只是挪面板、拉边的落脚点，关闭钮是退路而不是要做的事，
              // 写在标题旁时它排在文档序最前，这几样都越过；除它们之外没有可聚焦的，再交回探测（落在关闭钮上）
              const content = getContentEl()
              if (!content)
                return null
              const skipped = `[data-scope="${refs.get('partScope')}"]:is([data-part="drag-trigger"], [data-part="resize-trigger"], [data-part="close-trigger"])`
              return removeLinks(getTabbables(content)).find(el => !el.matches(skipped)) ?? null
            },
            restoreFocus: () => prop('restoreFocus') ?? true,
            // 归还落点显式给 trigger：指针打开那一刻焦点未必真在它身上（Safari 点按不给按钮焦点），
            // 靠焦点域的创建前快照会把 Escape 之后的 Tab 起点丢到 body 上。
            // 按 connect 给 trigger 落的 id 现取，没有 trigger 的用法回 null，归还照旧走快照。
            // 组件名取自 refs：抽屉跑同一台机器，它的部件 id 挂在 drawer 名下
            restoreTarget: () => scope.getById<HTMLElement>(scope.partId(refs.get('partScope'), 'trigger')),
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

          const modalResources = createModalLayerResources({
            config,
            layer,
            enabled: () => prop('modal') ?? true,
            // 栈中位于本层之上的层一并算作目标：内层浮层 portal 到 body 之后也是 body 的
            // 直接子元素，不排除会被本层的 MutationObserver 打上 aria-hidden
            targets: () => [
              getContentEl(),
              ...refs.get('branches')(),
              ...config.layerRegistry.elementsAbove(layer),
            ].filter(Boolean) as Element[],
            flush,
            run,
          })
          defer(modalResources.dispose)
          revealBackgroundNow = modalResources.reveal
          defer(() => {
            if (revealBackgroundNow === modalResources.reveal)
              revealBackgroundNow = undefined
          })
          const syncModalResources = (): void => {
            // 退场期间保留关闭时的策略；重新展开或展开中改值才切换。
            if (state.get() === 'open')
              modalResources.sync()
          }
          refs.set('syncModalResources', syncModalResources)
          defer(() => {
            if (refs.get('syncModalResources') === syncModalResources)
              refs.set('syncModalResources', null)
          })
          syncModalResources()
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
          if (!disposed && state.get() !== 'open' && !release)
            prop('onExitComplete')?.()
        }
        const offExit = presence?.onExitComplete(finish)
        const sync = (): void => {
          if (disposed)
            return
          const open = state.get() === 'open'
          let reopening = open && !lastOpen && release !== undefined
          const closing = !open && lastOpen
          lastOpen = open
          if (open) {
            // 退场中角色改变后需重建初始焦点语义；modal 本身由共享资源控制器原位切换。
            if (reopening && resourcePolicy !== (prop('role') ?? 'dialog')) {
              const cleanup = release
              release = undefined
              cleanup?.()
              reopening = false
            }
            // 退场中重开沿用原资源，旧租约由 Presence 撤销，不重复登记或抢回焦点。
            release ??= acquire()
            refs.get('syncModalResources')?.()
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
            // 关闭时交接焦点：内容随即 inert，资源要留到退场播完，焦点不能跟着等。先撤下背景失活再归还，
            // 焦点不落进还对读屏藏着的背景（见 createModalLayerResources.reveal）
            if (closing) {
              if (revealBackgroundNow)
                revealBackgroundNow(returnFocusNow)
              else
                returnFocusNow?.()
            }
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
