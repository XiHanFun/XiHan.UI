import type { ResizeConstraints, ResizeEdge } from '@xihan-ui/pointer'
import type { ResizableSchema, ResizableSize } from './resizable.types'
import { setup } from '@xihan-ui/machine'
import { clampSize, createPointerSession, resizeRect, resolveSessionDoc } from '@xihan-ui/pointer'

const { createMachine } = setup<ResizableSchema>()

/** 没给初值时的尺寸。 */
export const RESIZABLE_DEFAULT_SIZE: ResizableSize = { width: 240, height: 160 }

/** 方向键一次推多远（px）。 */
export const RESIZABLE_STEP = 8

/** 按住 Shift 时的步长（px）。 */
export const RESIZABLE_LARGE_STEP = 40

/** 八个方向。edges 不给时全开。 */
export const RESIZABLE_EDGES: readonly ResizeEdge[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']

const ZERO = { x: 0, y: 0 }

/** props 翻成 resize 层的约束形状。 */
export function resizableConstraints(
  prop: <K extends keyof ResizableSchema['props']>(k: K) => ResizableSchema['props'][K],
): ResizeConstraints {
  return {
    minWidth: prop('minWidth'),
    minHeight: prop('minHeight'),
    maxWidth: prop('maxWidth'),
    maxHeight: prop('maxHeight'),
    aspectRatio: prop('aspectRatio'),
    step: prop('step'),
  }
}

export const resizableMachine = createMachine({
  name: 'resizable',
  context: ({ cell, prop }) => ({
    size: cell<ResizableSize>(() => ({
      value: prop('size'),
      defaultValue: clampSize(prop('defaultSize') ?? RESIZABLE_DEFAULT_SIZE, resizableConstraints(prop)),
      // 每帧都是新对象，默认的 Object.is 会把「没变」也判成变了
      isEqual: (a, b) => !!b && a.width === b.width && a.height === b.height,
      // 通知挂在 cell 上：受控时 set 不写内部值，只有这条能把意图送出去
      onChange: size => prop('onSizeChange')?.({ size }),
    })),
    offset: cell<ResizableSchema['context']['offset']>(() => ({
      defaultValue: ZERO,
      isEqual: (a, b) => !!b && a.x === b.x && a.y === b.y,
    })),
    activeEdge: cell<ResizeEdge | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getRootEl: () => null,
    session: null,
  }),
  initialState: () => 'idle',
  // 键盘与命令式出口从哪个状态发出都一样，因此挂根级
  on: {
    // 键盘按一下就是一次完整的调整，因此顺手把收尾通知也发了
    'RESIZE.NUDGE': { guard: 'canResize', actions: ['nudge', 'invokeChangeEnd'] },
    'RESIZE.TO_BOUND': { guard: 'canResize', actions: ['toBound', 'invokeChangeEnd'] },
    'SIZE.SET': { actions: ['setSize'] },
  },
  states: {
    idle: {
      on: {
        'RESIZE.START': { guard: 'canResize', target: 'resizing', actions: ['startResize'] },
      },
    },
    resizing: {
      effects: ['trackPointer'],
      on: {
        'RESIZE.MOVE': { actions: ['trackResize'] },
        // 收尾通知只在这里发一次，拖动途中 onSizeChange 已连发多次
        'RESIZE.END': { target: 'idle', actions: ['invokeChangeEnd', 'endResize'] },
        // 系统收走指针按取消算：尺寸退回按下那一刻
        'RESIZE.CANCEL': { target: 'idle', actions: ['cancelResize'] },
      },
    },
  },
  implementations: {
    guards: {
      canResize: ({ prop }) => !prop('disabled'),
    },
    actions: {
      startResize: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'RESIZE.START')
          return
        const el = refs.get('getRootEl')()
        const box = el?.getBoundingClientRect()
        const size = context.get('size')
        refs.set('session', {
          edge: e.edge,
          // 量真实矩形；无 DOM 时退回内部尺寸，纯逻辑测试照样能推
          rect: { x: box?.x ?? 0, y: box?.y ?? 0, width: box?.width ?? size.width, height: box?.height ?? size.height },
          originX: e.point.clientX,
          originY: e.point.clientY,
          offset: context.get('offset'),
        })
        context.set('activeEdge', e.edge)
      },

      trackResize: ({ context, prop, refs, event }) => {
        const e = event.current()
        const session = refs.get('session')
        if (e.type !== 'RESIZE.MOVE' || !session)
          return
        applyRect(context, prop, session, {
          x: e.point.clientX - session.originX,
          y: e.point.clientY - session.originY,
        }, prop('dir') === 'rtl')
      },

      nudge: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'RESIZE.NUDGE')
          return
        // 键盘与拖动走同一条路：一次按键就是一小段位移
        const size = context.get('size')
        const session = refs.get('session') ?? {
          edge: e.edge,
          rect: { x: 0, y: 0, width: size.width, height: size.height },
          originX: 0,
          originY: 0,
          offset: context.get('offset'),
        }
        applyRect(context, prop, { ...session, edge: e.edge }, { x: e.dx, y: e.dy }, prop('dir') === 'rtl')
      },

      toBound: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'RESIZE.TO_BOUND')
          return
        const horizontal = e.edge !== 'n' && e.edge !== 's'
        const current = context.get('size')
        const c = resizableConstraints(prop)
        // 端点取这条边真走得到的位置：没给上限时 max 那一端不动
        const target: ResizableSize = e.bound === 'min'
          ? { width: horizontal ? (c.minWidth ?? 0) : current.width, height: horizontal ? current.height : (c.minHeight ?? 0) }
          : { width: horizontal ? (c.maxWidth ?? current.width) : current.width, height: horizontal ? current.height : (c.maxHeight ?? current.height) }
        context.set('size', clampSize(target, c))
      },

      setSize: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'SIZE.SET')
          return
        context.set('size', clampSize(e.size, resizableConstraints(prop)))
      },

      invokeChangeEnd: ({ context, prop, event }) => {
        const e = event.current()
        // 拖动收尾时边还在 activeEdge 上（endResize 排在本动作之后）；
        // 键盘那两条没有拖动态，边由事件自己带
        const edge = context.get('activeEdge')
          ?? ((e.type === 'RESIZE.NUDGE' || e.type === 'RESIZE.TO_BOUND') ? e.edge : null)
        if (!edge)
          return
        prop('onSizeChangeEnd')?.({ size: { ...context.get('size') }, edge })
      },

      endResize: ({ context, refs }) => {
        refs.set('session', null)
        context.set('activeEdge', null)
      },

      cancelResize: ({ context, prop, refs }) => {
        const session = refs.get('session')
        if (session) {
          context.set('size', clampSize({ width: session.rect.width, height: session.rect.height }, resizableConstraints(prop)))
          context.set('offset', session.offset)
        }
        refs.set('session', null)
        context.set('activeEdge', null)
      },
    },
    effects: {
      /** 跟手交给指针会话：拖出把手甚至拖出窗口仍要跟，系统收走指针也会收尾。 */
      trackPointer: ({ refs, send }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getRootEl')()),
          onMove: ({ point }) => send({ type: 'RESIZE.MOVE', point }),
          onEnd: ({ reason }) => send({ type: reason === 'pointercancel' ? 'RESIZE.CANCEL' : 'RESIZE.END' }),
        })
        return () => session.dispose()
      },
    },
  },
})

/**
 * 逻辑边翻成物理边。
 *
 * `e` 说的是**行尾侧**，从右往左排版时它落在屏幕左边，几何层认的却是屏幕方向。
 * 翻的是边而不是位移的正负：只翻位移会变成「手拖左边、右边在长」——
 * 宽度算对了，动的却是另一头。竖直那两条不随文字方向换向，原样透过去。
 */
function physicalEdge(edge: ResizeEdge, rtl: boolean): ResizeEdge {
  if (!rtl)
    return edge
  const flipped: Partial<Record<ResizeEdge, ResizeEdge>> = { e: 'w', w: 'e', ne: 'nw', nw: 'ne', se: 'sw', sw: 'se' }
  return flipped[edge] ?? edge
}

/** 推一条边：几何交给 resize 层，这里只把结果拆成尺寸与位移。 */
function applyRect(
  context: {
    get: <K extends keyof ResizableSchema['context']>(k: K) => ResizableSchema['context'][K]
    set: <K extends keyof ResizableSchema['context']>(k: K, v: ResizableSchema['context'][K]) => void
  },
  prop: <K extends keyof ResizableSchema['props']>(k: K) => ResizableSchema['props'][K],
  session: NonNullable<ResizableSchema['refs']['session']>,
  delta: { x: number, y: number },
  rtl: boolean,
): void {
  const next = resizeRect({
    rect: session.rect,
    edge: physicalEdge(session.edge, rtl),
    delta,
    constraints: resizableConstraints(prop),
  })
  context.set('size', { width: next.width, height: next.height })
  // 推西边与北边时矩形的起点在动，把这段差额写进位移，对边才钉得住
  context.set('offset', {
    x: session.offset.x + (next.x - session.rect.x),
    y: session.offset.y + (next.y - session.rect.y),
  })
}
