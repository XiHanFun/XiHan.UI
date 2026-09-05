import type { PanelConstraint } from './splitter.sizing'
import type { SplitterSchema } from './splitter.types'
import { setup } from '@xihan-ui/core'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { clampIndex } from '../shared/number'
import {
  collapsePanel,
  equalSizes,
  expandPanel,
  isCollapsed,
  normalizeSizes,
  panelConstraints,
  panelRange,
  resizePanels,
  setBoundarySize,
  SPLITTER_TOTAL,
} from './splitter.sizing'

const { createMachine } = setup<SplitterSchema>()

/** 方向键每下走多少个百分点。 */
export const SPLITTER_STEP = 1
/** Shift + 方向键每下走多少个百分点。 */
export const SPLITTER_LARGE_STEP = 10
/** 三处声明都没给时的面板块数。 */
export const SPLITTER_DEFAULT_PANELS = 2

type Props = SplitterSchema['props']
type PropReader = <K extends keyof Props>(key: K) => Props[K]

/** 面板块数的唯一判据：panels / size / defaultSizes 谁先给就听谁的，都没给就是两栏。 */
export function panelCount(prop: PropReader): number {
  const declared = prop('panels')?.length ?? prop('sizes')?.length ?? prop('defaultSizes')?.length
  return Math.max(1, declared ?? SPLITTER_DEFAULT_PANELS)
}

/** 逐块约束，connect 与机器读的是同一份。 */
export function splitterConstraints(prop: PropReader): PanelConstraint[] {
  return panelConstraints(prop('panels'), panelCount(prop))
}

/**
 * 展开时回到哪：优先用折叠前记下的尺寸；从没折叠过时回到 min，min 是 0 则退到等分。
 */
function restoreSizeOf(
  restore: Map<number, number>,
  index: number,
  c: PanelConstraint,
  count: number,
): number {
  const remembered = restore.get(index)
  if (remembered != null)
    return remembered
  return c.min > 0 ? c.min : SPLITTER_TOTAL / Math.max(1, count)
}

export const splitterMachine = createMachine({
  name: 'splitter',
  context: ({ prop, cell }) => ({
    // 布局是数组，走 cell 原生受控（sizes 给定即受控，写只发 onSizesChange 不落内部值）
    sizes: cell<number[]>(() => {
      const controlled = prop('sizes')
      const constraints = splitterConstraints(prop)
      return {
        // 受控值也要过一遍归位：总和必须为 100
        value: controlled == null ? undefined : normalizeSizes(controlled, constraints),
        defaultValue: normalizeSizes(prop('defaultSizes') ?? equalSizes(panelCount(prop)), constraints),
        // 数组每帧都是新引用，默认的 Object.is 会把"没变"也判成变了
        isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]),
        // 通知必须挂在 cell 上：受控时 set 不写内部值，只有这条回调能把用户意图送出去
        onChange: sizes => prop('onSizesChange')?.({ sizes }),
      }
    }),
    activeIndex: cell<number>(() => ({ defaultValue: 0 })),
  }),
  refs: () => ({
    getRootEl: () => null,
    drag: null,
    restore: new Map<number, number>(),
  }),
  initialState: () => 'idle',
  // 键盘与命令式出口从哪个状态发出都一样（拖动期间也可能有键盘事件），因此挂根级
  on: {
    'SIZES.SET': { guard: 'canResize', actions: ['setSizes'] },
    'BOUNDARY.STEP': { guard: 'canResize', actions: ['setActiveIndex', 'stepBoundary'] },
    'BOUNDARY.TO_MIN': { guard: 'canResize', actions: ['setActiveIndex', 'boundaryToMin'] },
    'BOUNDARY.TO_MAX': { guard: 'canResize', actions: ['setActiveIndex', 'boundaryToMax'] },
    'BOUNDARY.SET': { guard: 'canResize', actions: ['setActiveIndex', 'setBoundary'] },
    'BOUNDARY.FOCUS': { actions: ['setActiveIndex'] },
    'PANEL.COLLAPSE': { guard: 'canResize', actions: ['collapse'] },
    'PANEL.EXPAND': { guard: 'canResize', actions: ['expand'] },
  },
  states: {
    idle: {
      on: {
        // 按下不改布局：分隔条本来就在指针底下
        'DRAG.START': { guard: 'canResize', target: 'dragging', actions: ['setActiveIndex'] },
      },
    },
    dragging: {
      effects: ['trackPointer'],
      on: {
        'DRAG.MOVE': { actions: ['dragBoundary'] },
        // 收尾通知只在这里发一次，拖动途中 onSizesChange 已连发多次
        'DRAG.END': { target: 'idle', actions: ['invokeChangeEnd'] },
      },
    },
  },
  implementations: {
    guards: {
      canResize: ({ prop }) => !prop('disabled'),
    },
    actions: {
      setSizes: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'SIZES.SET')
          return
        context.set('sizes', normalizeSizes(e.sizes, splitterConstraints(prop)))
      },
      /**
       * 带下标的事件一律先过这里，后面几个动作直接读 activeIndex，不再碰事件上的原值。
       * 分界线比面板少一条，因此夹在 [0, 面板数 - 2]。
       */
      setActiveIndex: ({ context, event }) => {
        const e = event.current()
        if ('index' in e && typeof e.index === 'number')
          context.set('activeIndex', clampIndex(e.index, context.get('sizes').length - 1))
      },
      stepBoundary: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.STEP')
          return
        const size = e.large
          ? (prop('largeStep') ?? SPLITTER_LARGE_STEP)
          : (prop('step') ?? SPLITTER_STEP)
        context.set('sizes', resizePanels(context.get('sizes'), context.get('activeIndex'), e.direction * size, splitterConstraints(prop)))
      },
      // 端点取眼下真能走到的区间，不是纸面上的 min/max
      boundaryToMin: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.TO_MIN')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('sizes')
        const index = context.get('activeIndex')
        context.set('sizes', setBoundarySize(sizes, index, panelRange(sizes, index, constraints).min, constraints))
      },
      boundaryToMax: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.TO_MAX')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('sizes')
        const index = context.get('activeIndex')
        context.set('sizes', setBoundarySize(sizes, index, panelRange(sizes, index, constraints).max, constraints))
      },
      setBoundary: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.SET')
          return
        const constraints = splitterConstraints(prop)
        context.set('sizes', setBoundarySize(context.get('sizes'), context.get('activeIndex'), e.size, constraints))
      },
      collapse: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'PANEL.COLLAPSE')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('sizes')
        const c = constraints[e.index]
        const size = sizes[e.index]
        if (!c?.collapsible || size == null || isCollapsed(size, c))
          return
        // 折叠前记住当前尺寸，展开时照它还原
        refs.get('restore').set(e.index, size)
        context.set('sizes', collapsePanel(sizes, e.index, constraints))
      },
      expand: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'PANEL.EXPAND')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('sizes')
        const c = constraints[e.index]
        const size = sizes[e.index]
        if (!c?.collapsible || size == null || !isCollapsed(size, c))
          return
        const restore = restoreSizeOf(refs.get('restore'), e.index, c, sizes.length)
        context.set('sizes', expandPanel(sizes, e.index, constraints, restore))
      },
      dragBoundary: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.MOVE')
          return
        const session = refs.get('drag')
        // 容器还没布局（排布轴上量出来是 0）时不猜：除以 0 会得到 Infinity 并一路写进 aria-valuenow
        if (!session || session.extent <= 0)
          return
        const vertical = prop('orientation') === 'vertical'
        const moved = vertical
          ? e.point.clientY - session.origin.clientY
          : e.point.clientX - session.origin.clientX
        // 从右往左排版时屏幕右移是把前一块压小；竖直排布与 dir 无关（上下不随文字方向换向）
        const towards = !vertical && prop('dir') === 'rtl' ? -moved : moved
        const delta = towards / session.extent * SPLITTER_TOTAL
        // 基准是按下那一刻的布局，不是上一帧：增量累加在顶到 min 之后回不来
        context.set('sizes', resizePanels(session.sizes, session.index, delta, splitterConstraints(prop)))
      },
      invokeChangeEnd: ({ context, prop }) => {
        prop('onSizesChangeEnd')?.({
          sizes: [...context.get('sizes')],
          index: context.get('activeIndex'),
        })
      },
    },
    effects: {
      /**
       * 一场拖拽只量一次容器，拖拽途中容器尺寸不会变。
       * 量在效应里：connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得读 DOM；
       * 效应挂载发生在 DRAG.START 的转移里，节点已在文档上，不必推迟到下一帧。
       * 跟手交给指针会话：监听挂在文档上，指针拖出容器仍要跟手，系统收走指针也会收尾。
       */
      trackPointer: ({ context, prop, refs, event, send }) => {
        const start = event.current()
        const root = refs.get('getRootEl')()
        if (start.type === 'DRAG.START' && root) {
          const rect = root.getBoundingClientRect()
          refs.set('drag', {
            // 取夹过的那个：setActiveIndex 在本效应挂载之前就跑完了
            index: context.get('activeIndex'),
            origin: start.point,
            extent: prop('orientation') === 'vertical' ? rect.height : rect.width,
            sizes: [...context.get('sizes')],
          })
        }
        const session = createPointerSession({
          doc: resolveSessionDoc(root),
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', point }),
          onEnd: () => send({ type: 'DRAG.END' }),
        })
        return () => {
          refs.set('drag', null)
          session.dispose()
        }
      },
    },
  },
})
