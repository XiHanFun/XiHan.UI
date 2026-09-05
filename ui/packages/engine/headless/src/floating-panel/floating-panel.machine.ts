import type { FloatingPanelSchema } from './floating-panel.types'
import { setup } from '@xihan-ui/machine'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import {
  clampFloatingPanelSize,
  FLOATING_PANEL_DEFAULT_POSITION,
  FLOATING_PANEL_DEFAULT_SIZE,
  moveFloatingPanel,
  resizeFloatingPanel,
  sameFloatingPanelPosition,
  sameFloatingPanelSize,
} from './floating-panel.geometry'

const { createMachine } = setup<FloatingPanelSchema>()

// 位置、尺寸、形态三样都住在 context 的 cell 里，受控与非受控在 cell 收口；
// 只有开合编进 FSM 状态，走守卫对 + CONTROLLED.* 影子事件 + watch。
// 展开态下再分闲置、指针搬动、指针改尺三段，后两段各挂一份跟手副作用。
export const floatingPanelMachine = createMachine({
  name: 'floating-panel',
  context: ({ prop, cell }) => ({
    position: cell(() => ({
      value: prop('position'),
      defaultValue: prop('defaultPosition') ?? FLOATING_PANEL_DEFAULT_POSITION,
      // 坐标每帧都是新对象，默认的 Object.is 会把"没动"也判成动了
      isEqual: sameFloatingPanelPosition,
      // 通知必须挂在 cell 上：受控时 set 不写内部值，只有这条回调能把用户意图送出去
      onChange: position => prop('onPositionChange')?.({ position }),
    })),
    dimensions: cell(() => {
      const min = prop('minSize')
      const max = prop('maxSize')
      const controlled = prop('dimensions')
      return {
        // 受控值也要过一遍上下限：作者写进来的尺寸同样不该小于 minSize。
        // undefined 原样留着，那是"非受控"的唯一表达
        value: controlled === undefined ? undefined : clampFloatingPanelSize(controlled, min, max),
        defaultValue: clampFloatingPanelSize(prop('defaultDimensions') ?? FLOATING_PANEL_DEFAULT_SIZE, min, max),
        isEqual: sameFloatingPanelSize,
        onChange: dimensions => prop('onDimensionsChange')?.({ dimensions }),
      }
    }),
    windowState: cell(() => ({
      value: prop('windowState'),
      defaultValue: prop('defaultWindowState') ?? 'default',
      onChange: windowState => prop('onWindowStateChange')?.({ windowState }),
    })),
  }),
  refs: () => ({
    getContentEl: () => null,
    session: null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 受控时用户事件只发意图、不自改状态；宿主写回 open 后由这条 watch 派发影子事件回写
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  // 摆位置、改尺寸、切形态与开合无关：面板收起着也能被作者摆好，展开时就在那儿
  on: {
    'POSITION.SET': { guard: 'canInteract', actions: ['setPosition'] },
    'POSITION.NUDGE': { guard: 'canDrag', actions: ['nudgePosition'] },
    'DIMENSIONS.SET': { guard: 'canInteract', actions: ['setDimensions'] },
    'DIMENSIONS.NUDGE': { guard: 'canResize', actions: ['nudgeDimensions'] },
    'WINDOW_STATE.SET': { guard: 'canInteract', actions: ['setWindowState'] },
  },
  states: {
    closed: {
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
      initial: 'idle',
      on: {
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
      states: {
        idle: {
          on: {
            // 按下不改矩形：面板本来就在指针底下，位移从下一次 DRAG.MOVE 才开始算
            'DRAG.START': { guard: 'canDrag', target: 'open.dragging', actions: ['startSession'] },
            'RESIZE.START': { guard: 'canResize', target: 'open.resizing', actions: ['startSession'] },
          },
        },
        dragging: {
          effects: ['trackPointer'],
          on: {
            'DRAG.MOVE': { actions: ['dragMove'] },
            'DRAG.END': { target: 'open.idle' },
          },
        },
        resizing: {
          effects: ['trackPointer'],
          on: {
            'DRAG.MOVE': { actions: ['dragMove'] },
            'DRAG.END': { target: 'open.idle' },
          },
        },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      canInteract: ({ prop }) => !prop('disabled'),
      // 铺满的面板没有"位置"可言，搬它等于把它从视口里推出去
      canDrag: ({ prop, context }) =>
        !prop('disabled') && (prop('draggable') ?? true) && context.get('windowState') !== 'maximized',
      // 收拢与铺满两种形态的尺寸都不由 dimensions 决定，此时改尺寸是改一个看不见的值
      canResize: ({ prop, context }) =>
        !prop('disabled') && (prop('resizable') ?? true) && context.get('windowState') === 'default',
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      setPosition: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'POSITION.SET')
          return
        context.set('position', { x: e.position.x, y: e.position.y })
      },
      nudgePosition: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'POSITION.NUDGE')
          return
        context.set('position', moveFloatingPanel(context.get('position'), e.dx, e.dy))
      },
      setDimensions: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'DIMENSIONS.SET')
          return
        // 公开出口不得造出界面造不出的值：小于下限的尺寸拖也拖不出来
        context.set('dimensions', clampFloatingPanelSize(e.dimensions, prop('minSize'), prop('maxSize')))
      },
      nudgeDimensions: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'DIMENSIONS.NUDGE')
          return
        const next = resizeFloatingPanel(
          context.get('position'),
          context.get('dimensions'),
          e.edge,
          e.dx,
          e.dy,
          prop('minSize'),
          prop('maxSize'),
        )
        context.set('position', next.position)
        context.set('dimensions', next.size)
      },
      setWindowState: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'WINDOW_STATE.SET')
          return
        context.set('windowState', e.windowState)
      },

      /**
       * 冻住这一场拖动的依据。写在转移的 actions 里而不是效应里：
       * 依据全部取自 context 与事件，不需要量任何 DOM。
       */
      startSession: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START' && e.type !== 'RESIZE.START')
          return
        refs.set('session', {
          kind: e.type === 'DRAG.START' ? 'move' : 'resize',
          edge: e.type === 'RESIZE.START' ? e.edge : null,
          origin: { clientX: e.point.clientX, clientY: e.point.clientY },
          position: { ...context.get('position') },
          size: { ...context.get('dimensions') },
        })
      },
      dragMove: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.MOVE')
          return
        const session = refs.get('session')
        if (!session)
          return
        // 基准是按下那一刻的矩形，不是上一帧：增量累加在顶到尺寸下限之后回不来
        const dx = e.point.clientX - session.origin.clientX
        const dy = e.point.clientY - session.origin.clientY
        if (session.kind === 'move') {
          context.set('position', moveFloatingPanel(session.position, dx, dy))
          return
        }
        if (!session.edge)
          return
        const next = resizeFloatingPanel(
          session.position,
          session.size,
          session.edge,
          dx,
          dy,
          prop('minSize'),
          prop('maxSize'),
        )
        context.set('position', next.position)
        context.set('dimensions', next.size)
      },
    },
    effects: {
      /**
       * 跟手期间的指针会话。监听挂在文档上而不是把手上：指针拖出把手甚至拖出面板仍要跟手；
       * 系统收走指针也会收尾，不收会让状态永远停在拖动中，面板从此粘在指针上。
       */
      trackPointer: ({ refs, send }) => {
        const pointer = createPointerSession({
          doc: resolveSessionDoc(refs.get('getContentEl')()),
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', point }),
          onEnd: () => send({ type: 'DRAG.END' }),
        })
        return () => {
          refs.set('session', null)
          pointer.dispose()
        }
      },
    },
  },
})
