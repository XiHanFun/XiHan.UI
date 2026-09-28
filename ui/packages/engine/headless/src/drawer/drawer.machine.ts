/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 drawer 相关实现。

import type { MachineConfig } from '@xihan-ui/core'
import type { DialogGestureSession } from '../dialog'
import type { DrawerSchema, DrawerSide } from './drawer.types'
import { setup } from '@xihan-ui/core'
import { dialogMachine } from '../dialog'
import { clampToBounds, startGesturePointer } from '../dialog/dialog.gesture'

const { createMachine } = setup<DrawerSchema>()

/** 没给 minPanelSize 时的厚度下限：再窄标题与关闭钮就排不下了。 */
export const DRAWER_MIN_PANEL_SIZE = 160

// 抽屉就是贴边渲染的模态对话框：开合转移、受控回写、消解层、焦点域、滚动锁与背景失活
// 逐条相同，跑的是对话框那一份配置。dialogMachine 的类型锚是 DialogSchema，抽屉的 props
// 多出 side、contained 与改尺那几项，context 与事件多出改尺那一段，这里按抽屉的 schema 重标一次。
const base = dialogMachine as unknown as MachineConfig<DrawerSchema>

/** 改尺这一场的几何：推哪根轴、往屏幕正向拖是变厚还是变薄、上下限多少、起点多厚。 */
interface ResizeGeometry {
  axis: 'x' | 'y'
  sign: number
  min: number
  max: number
  size: number
}

/**
 * 量出改尺的几何。left / right 是行内方向的起止两侧：从右往左排版时 right 落在屏幕左边，
 * 把手守的那条边与手上推的方向要跟着翻；top / bottom 是块方向，不随书写方向翻。
 * 上限取作者给的与视口（contained 时是所在容器）中较小的那个：面板不能比放它的地方还厚。
 */
function measure(content: HTMLElement, side: DrawerSide, win: Window, min: number | undefined, max: number | undefined): ResizeGeometry {
  const horizontal = side === 'left' || side === 'right'
  const rtl = horizontal && win.getComputedStyle(content).direction === 'rtl'
  // 贴在屏幕右边（或底边）的面板，往左（往上）拖是变厚
  const atEnd = side === 'bottom' || (side === 'right') !== rtl
  const rect = content.getBoundingClientRect()
  const box = content.offsetParent as HTMLElement | null
  const room = horizontal
    ? (box ? box.clientWidth : win.innerWidth)
    : (box ? box.clientHeight : win.innerHeight)
  const floor = min ?? DRAWER_MIN_PANEL_SIZE
  return {
    axis: horizontal ? 'x' : 'y',
    sign: atEnd ? -1 : 1,
    min: floor,
    max: Math.max(floor, Math.min(max ?? Number.POSITIVE_INFINITY, room)),
    size: Math.round(horizontal ? rect.width : rect.height),
  }
}

/** 抽屉的机器：取自对话框，只改机器名与部件 id 用的组件名，再接上改尺那一段。 */
export const drawerMachine = createMachine({
  ...base,
  name: 'drawer',
  // 归还焦点时按部件 id 现取 trigger，抽屉的部件名是 drawer
  refs: params => ({ ...base.refs!(params), partScope: 'drawer' }),
  context: params => ({
    ...base.context!(params),
    panelSize: params.cell<number | null>(() => ({
      value: params.prop('panelSize'),
      defaultValue: params.prop('defaultPanelSize') ?? null,
      // 通知挂在 cell 上：受控时 set 不写内部值，只有这条能把意图送出去
      onChange: (panelSize) => {
        if (panelSize != null)
          params.prop('onPanelSizeChange')?.({ panelSize })
      },
    })),
    measuredPanelSize: params.cell<number | null>(() => ({ defaultValue: null })),
  }),
  states: {
    ...base.states,
    open: {
      ...base.states!.open,
      on: {
        ...base.states!.open!.on,
        'RESIZE.START': { guard: 'canResize', actions: ['startResize'] },
        'RESIZE.NUDGE': { guard: 'canResize', actions: ['nudgeResize'] },
        'RESIZE.TO_BOUND': { guard: 'canResize', actions: ['resizeToBound'] },
        'RESIZE.MEASURE': { actions: ['measurePanel'] },
      },
    },
  },
  implementations: {
    ...base.implementations,
    guards: {
      ...base.implementations!.guards,
      // 作者开了改尺、且此刻没有别的手势在跑
      canResize: ({ prop, context }) => !!prop('resizable') && context.get('gesture') == null,
    },
    actions: {
      ...base.implementations!.actions,
      /**
       * 冻住这一场改尺的依据：按下那一刻的厚度、上下限与方向。按下即挂指针会话，
       * 监听赶在第一次移动之前就位。
       */
      startResize: ({ context, prop, refs, scope, event, send }) => {
        const e = event.current()
        if (e.type !== 'RESIZE.START')
          return
        const content = refs.get('getContentEl')()
        if (!content)
          return
        const geometry = measure(content, prop('side') ?? 'right', scope.getWin(), prop('minPanelSize'), prop('maxPanelSize'))
        // 起点取已经落定的厚度：没调过才用量到的那个
        const start = context.get('panelSize') ?? geometry.size
        const session: DialogGestureSession = {
          origin: { clientX: e.point.clientX, clientY: e.point.clientY },
          start: { x: start, y: start },
          bounds: { minX: geometry.min, maxX: geometry.max, minY: geometry.min, maxY: geometry.max },
          sign: geometry.sign,
          axis: geometry.axis,
          pointerId: e.pointerId,
        }
        refs.get('pointer')?.dispose()
        refs.set('pointer', startGesturePointer(
          content,
          e.pointerId,
          point => send({ type: 'GESTURE.MOVE', point }),
          () => send({ type: 'GESTURE.END' }),
        ))
        refs.set('gesture', session)
        context.set('measuredPanelSize', start)
        context.set('gesture', 'resize')
      },
      // 基准是按下那一刻的厚度，不是上一帧：增量累加在顶到上下限之后回不来
      moveGesture: ({ context, refs, event }) => {
        const e = event.current()
        const session = refs.get('gesture')
        if (e.type !== 'GESTURE.MOVE' || !session || context.get('gesture') !== 'resize')
          return
        const delta = session.axis === 'x' ? e.point.clientX - session.origin.clientX : e.point.clientY - session.origin.clientY
        const next = Math.round(clampToBounds(session.start.x + session.sign * delta, session.bounds.minX, session.bounds.maxX))
        context.set('panelSize', next)
        context.set('measuredPanelSize', next)
      },
      // 键盘一步：现量几何，按屏幕方向推，推向页面那一侧变厚
      nudgeResize: ({ context, prop, refs, scope, event }) => {
        const e = event.current()
        const content = refs.get('getContentEl')()
        if (e.type !== 'RESIZE.NUDGE' || !content)
          return
        const geometry = measure(content, prop('side') ?? 'right', scope.getWin(), prop('minPanelSize'), prop('maxPanelSize'))
        const delta = geometry.axis === 'x' ? e.dx : e.dy
        if (delta === 0)
          return
        const next = Math.round(clampToBounds((context.get('panelSize') ?? geometry.size) + geometry.sign * delta, geometry.min, geometry.max))
        context.set('panelSize', next)
        context.set('measuredPanelSize', next)
      },
      // Home / End：推到下限或上限；上限只受放它的地方限制时同样推得到头
      resizeToBound: ({ context, prop, refs, scope, event }) => {
        const e = event.current()
        const content = refs.get('getContentEl')()
        if (e.type !== 'RESIZE.TO_BOUND' || !content)
          return
        const geometry = measure(content, prop('side') ?? 'right', scope.getWin(), prop('minPanelSize'), prop('maxPanelSize'))
        const next = Math.round(e.bound === 'min' ? geometry.min : geometry.max)
        context.set('panelSize', next)
        context.set('measuredPanelSize', next)
      },
      measurePanel: ({ context, prop, refs, scope }) => {
        const content = refs.get('getContentEl')()
        if (content)
          context.set('measuredPanelSize', measure(content, prop('side') ?? 'right', scope.getWin(), prop('minPanelSize'), prop('maxPanelSize')).size)
      },
    },
  },
})
