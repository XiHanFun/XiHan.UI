import type { PanelConstraint } from './splitter.sizing'
import type { SplitterSchema } from './splitter.types'
import { setup } from '@xihan-ui/machine'
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
/** 三处声明都没给时的面板块数：两栏是这个组件最常见的形态。 */
export const SPLITTER_DEFAULT_PANELS = 2

type Props = SplitterSchema['props']
type PropReader = <K extends keyof Props>(key: K) => Props[K]

/**
 * 面板块数的唯一判据：panels / size / defaultSize 谁先给就听谁的，都没给就是两栏。
 * 收在一处而不是各处 ?? 一遍——三者对不上时至少全机器看到的是同一个数。
 */
export function panelCount(prop: PropReader): number {
  const declared = prop('panels')?.length ?? prop('size')?.length ?? prop('defaultSize')?.length
  return Math.max(1, declared ?? SPLITTER_DEFAULT_PANELS)
}

/** 逐块约束。connect 与机器读的是同一份，免得两边对"这块能收到多小"各有一套说法。 */
export function splitterConstraints(prop: PropReader): PanelConstraint[] {
  return panelConstraints(prop('panels'), panelCount(prop))
}

/**
 * 展开时回到哪：优先用折叠前记下的尺寸；从没折叠过（一上来就是折叠态）时回到 min，
 * min 是 0 就退到等分——总得给出一个看得见的宽度，展开却什么都没发生是最糟的结果。
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
    // 布局是数组，走 cell 原生受控（size 给定即受控，写只发 onSizeChange 不落内部值）
    size: cell<number[]>(() => {
      const controlled = prop('size')
      const constraints = splitterConstraints(prop)
      return {
        // 受控值也要过一遍归位：布局的前提是总和为 100，
        // 宿主写回一份凑不齐的数组时界面不该跟着塌
        value: controlled == null ? undefined : normalizeSizes(controlled, constraints),
        defaultValue: normalizeSizes(prop('defaultSize') ?? equalSizes(panelCount(prop)), constraints),
        // 数组每帧都是新引用，默认的 Object.is 会把"没变"也判成变了
        isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]),
        // 通知必须挂在 cell 上：受控时 set 不写内部值，只有这条回调能把用户意图送出去
        onChange: size => prop('onSizeChange')?.({ size }),
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
    'SIZE.SET': { guard: 'canResize', actions: ['setSize'] },
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
        // 按下不改布局：分隔条本来就在指针底下，跳一下反而是错的（这一点与滑块相反）
        'DRAG.START': { guard: 'canResize', target: 'dragging', actions: ['setActiveIndex'] },
      },
    },
    dragging: {
      effects: ['trackPointer'],
      on: {
        'DRAG.MOVE': { actions: ['dragBoundary'] },
        // 收尾通知只在这里发一次：拖动途中 onSizeChange 已经连着发了很多次，
        // 存布局那类活儿要的是"手松了"这一下
        'DRAG.END': { target: 'idle', actions: ['invokeChangeEnd'] },
      },
    },
  },
  implementations: {
    guards: {
      canResize: ({ prop }) => !prop('disabled'),
    },
    actions: {
      setSize: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'SIZE.SET')
          return
        context.set('size', normalizeSizes(e.size, splitterConstraints(prop)))
      },
      setActiveIndex: ({ context, event }) => {
        const e = event.current()
        if ('index' in e && typeof e.index === 'number')
          context.set('activeIndex', e.index)
      },
      stepBoundary: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.STEP')
          return
        const size = e.large
          ? (prop('largeStep') ?? SPLITTER_LARGE_STEP)
          : (prop('step') ?? SPLITTER_STEP)
        context.set('size', resizePanels(context.get('size'), e.index, e.direction * size, splitterConstraints(prop)))
      },
      // 端点取的是"眼下真能走到"的区间，不是这块面板纸面上的 min/max：
      // 后面的面板已经顶满时，Home 该停在走得到的地方，而不是把总和推歪
      boundaryToMin: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.TO_MIN')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('size')
        context.set('size', setBoundarySize(sizes, e.index, panelRange(sizes, e.index, constraints).min, constraints))
      },
      boundaryToMax: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.TO_MAX')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('size')
        context.set('size', setBoundarySize(sizes, e.index, panelRange(sizes, e.index, constraints).max, constraints))
      },
      setBoundary: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'BOUNDARY.SET')
          return
        const constraints = splitterConstraints(prop)
        context.set('size', setBoundarySize(context.get('size'), e.index, e.size, constraints))
      },
      collapse: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'PANEL.COLLAPSE')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('size')
        const c = constraints[e.index]
        const size = sizes[e.index]
        if (!c?.collapsible || size == null || isCollapsed(size, c))
          return
        // 折叠前记住当前尺寸：展开时要回到用户自己调过的那个位置，而不是一个凭空的默认值
        refs.get('restore').set(e.index, size)
        context.set('size', collapsePanel(sizes, e.index, constraints))
      },
      expand: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'PANEL.EXPAND')
          return
        const constraints = splitterConstraints(prop)
        const sizes = context.get('size')
        const c = constraints[e.index]
        const size = sizes[e.index]
        if (!c?.collapsible || size == null || !isCollapsed(size, c))
          return
        const restore = restoreSizeOf(refs.get('restore'), e.index, c, sizes.length)
        context.set('size', expandPanel(sizes, e.index, constraints, restore))
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
        context.set('size', resizePanels(session.size, session.index, delta, splitterConstraints(prop)))
      },
      invokeChangeEnd: ({ context, prop }) => {
        prop('onSizeChangeEnd')?.({
          size: [...context.get('size')],
          index: context.get('activeIndex'),
        })
      },
    },
    effects: {
      /**
       * 一场拖拽只量一次容器：换算只要"排布轴上有多长"，而拖拽途中容器尺寸不会变，
       * 每次移动都去 getBoundingClientRect 只是白白逼浏览器重排。
       *
       * 量在效应里而不是 connect 里：connect 是纯函数，且 Vue 侧它在渲染期求值，那时 DOM 还不存在。
       * 效应挂载发生在 DRAG.START 这一下的转移里，此刻节点已在文档上（用户刚按在它上面），
       * 因此不必推迟到下一帧——推迟反而会把手按下去之后最前面几像素的位移丢掉。
       *
       * 监听器挂在文档上而不是分隔条上：指针拖出容器甚至拖出窗口时仍要跟手。
       * pointercancel 也要收：系统手势抢走指针时不收会让状态永远停在 dragging。
       */
      trackPointer: ({ context, prop, refs, event, send }) => {
        const start = event.current()
        const root = refs.get('getRootEl')()
        if (start.type === 'DRAG.START' && root) {
          const rect = root.getBoundingClientRect()
          refs.set('drag', {
            index: start.index,
            origin: start.point,
            extent: prop('orientation') === 'vertical' ? rect.height : rect.width,
            size: [...context.get('size')],
          })
        }
        const doc = root?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
        if (!doc) {
          return () => {
            refs.set('drag', null)
          }
        }
        const onMove = (ev: PointerEvent): void => {
          send({ type: 'DRAG.MOVE', point: { clientX: ev.clientX, clientY: ev.clientY } })
        }
        const onUp = (): void => send({ type: 'DRAG.END' })
        doc.addEventListener('pointermove', onMove)
        doc.addEventListener('pointerup', onUp)
        doc.addEventListener('pointercancel', onUp)
        return () => {
          refs.set('drag', null)
          doc.removeEventListener('pointermove', onMove)
          doc.removeEventListener('pointerup', onUp)
          doc.removeEventListener('pointercancel', onUp)
        }
      },
    },
  },
})
