import type { PinchSnapshot, TrackedPoint } from '@xihan-ui/pointer'
import type { ImageViewerItem, ImageViewerRefs, ImageViewerSchema, ImageViewerTransform } from './image-viewer.types'
import { acquireScrollLock, createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { hideOutside } from '@xihan-ui/kernel'
import { setup } from '@xihan-ui/machine'
import { createMultiPointerSession, pinchChange, pinchSnapshot, resolveSessionDoc } from '@xihan-ui/pointer'
import { closeReasonOf } from '../shared/close-reason'

const { createMachine } = setup<ImageViewerSchema>()

export const IMAGE_VIEWER_ZOOM_STEP = 0.5
export const IMAGE_VIEWER_MIN_SCALE = 0.25
export const IMAGE_VIEWER_MAX_SCALE = 8

/** 没有任何变换的基准态。 */
export const IMAGE_VIEWER_IDENTITY: ImageViewerTransform = {
  scale: 1,
  rotate: 0,
  flipX: false,
  flipY: false,
  x: 0,
  y: 0,
}

export function imageViewerCount(items: readonly ImageViewerItem[] | undefined): number {
  return Array.isArray(items) ? items.length : 0
}

/** 把任意来路的下标夹进 [0, count - 1]；空清单一律 0。 */
export function clampImageViewerIndex(index: number | undefined, count: number): number {
  if (count <= 0)
    return 0
  if (index == null || !Number.isFinite(index))
    return 0
  return Math.min(Math.max(Math.trunc(index), 0), count - 1)
}

/** 前后翻页的落点；loop 时回绕，否则停在两端。 */
export function stepImageViewerIndex(index: number, delta: number, count: number, loop: boolean): number {
  if (count <= 0)
    return 0
  const next = index + delta
  if (loop)
    return ((next % count) + count) % count
  return Math.min(Math.max(next, 0), count - 1)
}

function clampScale(scale: number, min: number, max: number): number {
  if (!Number.isFinite(scale))
    return 1
  return Math.min(Math.max(scale, min), max)
}

function sameTransform(a: ImageViewerTransform, b: ImageViewerTransform | undefined): boolean {
  return !!b && a.scale === b.scale && a.rotate === b.rotate && a.flipX === b.flipX && a.flipY === b.flipY && a.x === b.x && a.y === b.y
}

// 开合编进 FSM 状态；下标住在 cell 里收口受控与非受控。变换是纯展示态，
// 不受控也不发回调，换图与重开都归零。
export const imageViewerMachine = createMachine({
  name: 'image-viewer',
  context: ({ prop, cell }) => ({
    index: cell<number>(() => ({
      value: prop('index'),
      defaultValue: prop('defaultIndex') ?? 0,
      onChange: index => prop('onIndexChange')?.({ index }),
    })),
    transform: cell<ImageViewerTransform>(() => ({ defaultValue: IMAGE_VIEWER_IDENTITY, isEqual: sameTransform })),
    panning: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    getContentEl: () => null,
    panSession: null,
    pinchSession: null,
    gesture: null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  watch: ({ track, prop, context, action }) => {
    // 受控时用户事件只发意图回调；宿主写回 open 后由这里派发 CONTROLLED.* 无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 换图即弃掉上一张的缩放与平移，受控写回的下标也走这一条
    track([context.dep('index')], () => action(['resetTransform']))
  },
  states: {
    closed: {
      on: {
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 每次展开都从基准态看起
      entry: ['resetTransform'],
      effects: ['trackOverlay', 'trackPointers'],
      exit: ['pointersEnd'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'INDEX.SET': { actions: ['setIndex'] },
        'INDEX.NEXT': { actions: ['goNext'] },
        'INDEX.PREV': { actions: ['goPrev'] },
        'ZOOM.BY': { actions: ['zoomBy'] },
        'ZOOM.SET': { actions: ['zoomTo'] },
        'ROTATE.BY': { actions: ['rotateBy'] },
        'FLIP': { actions: ['flip'] },
        'TRANSFORM.RESET': { actions: ['resetTransform'] },
        'POINTERS.DOWN': { actions: ['pointersDown'] },
        'POINTERS.CHANGE': { actions: ['pointersChange'] },
        'POINTERS.END': { actions: ['pointersEnd'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current()) }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      // 越界下标在写入口就夹掉，受控宿主拿到的回调值永远可用
      setIndex: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'INDEX.SET')
          context.set('index', clampImageViewerIndex(e.index, imageViewerCount(prop('items'))))
      },
      goNext: ({ context, prop }) => {
        const count = imageViewerCount(prop('items'))
        const current = clampImageViewerIndex(context.get('index'), count)
        context.set('index', stepImageViewerIndex(current, 1, count, prop('loop') ?? true))
      },
      goPrev: ({ context, prop }) => {
        const count = imageViewerCount(prop('items'))
        const current = clampImageViewerIndex(context.get('index'), count)
        context.set('index', stepImageViewerIndex(current, -1, count, prop('loop') ?? true))
      },
      zoomBy: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ZOOM.BY')
          return
        const step = prop('zoomStep') ?? IMAGE_VIEWER_ZOOM_STEP
        const t = context.get('transform')
        const scale = clampScale(
          t.scale + e.delta * step,
          prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE,
          prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE,
        )
        // 缩回 1 以内平移就没意义了，一并归位，免得图飘在视口外找不回来
        context.set('transform', { ...t, scale, x: scale <= 1 ? 0 : t.x, y: scale <= 1 ? 0 : t.y })
      },
      zoomTo: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ZOOM.SET')
          return
        const t = context.get('transform')
        const scale = clampScale(
          e.scale,
          prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE,
          prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE,
        )
        context.set('transform', { ...t, scale, x: scale <= 1 ? 0 : t.x, y: scale <= 1 ? 0 : t.y })
      },
      rotateBy: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ROTATE.BY')
          return
        const t = context.get('transform')
        context.set('transform', { ...t, rotate: t.rotate + e.delta })
      },
      flip: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'FLIP')
          return
        const t = context.get('transform')
        context.set('transform', e.axis === 'x' ? { ...t, flipX: !t.flipX } : { ...t, flipY: !t.flipY })
      },
      resetTransform: ({ context }) => context.set('transform', IMAGE_VIEWER_IDENTITY),
      /** 一根手指落在图上：交给会话跟着，并按当前点数拍基准。 */
      pointersDown: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'POINTERS.DOWN')
          return
        const session = refs.get('gesture')
        if (!session)
          return
        session.add({ pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY })
        rebase(context, refs, session.points())
        context.set('panning', true)
      },

      /**
       * 触点动了。一根手指是平移，两根是缩放；点数一变就重拍基准——
       * 从双指退回单指时不重拍的话，剩下那根会带着上一段的基准继续走，图会跳一下。
       */
      pointersChange: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'POINTERS.CHANGE')
          return
        const points = e.points
        const pinch = refs.get('pinchSession')
        const pan = refs.get('panSession')

        if (points.length >= 2) {
          if (!pinch) {
            rebase(context, refs, points)
            return
          }
          applyPinch(context, prop, pinch, pinchSnapshot(points[0]!, points[1]!))
          return
        }

        if (points.length === 1) {
          // 上一拍还是双指：这一拍先重拍成单指基准，位移从这里重新起量
          if (pinch || !pan) {
            rebase(context, refs, points)
            return
          }
          const t = context.get('transform')
          context.set('transform', {
            ...t,
            x: pan.originX + (points[0]!.clientX - pan.startX),
            y: pan.originY + (points[0]!.clientY - pan.startY),
          })
        }
      },

      pointersEnd: ({ context, refs }) => {
        refs.set('panSession', null)
        refs.set('pinchSession', null)
        context.set('panning', false)
      },
      panMove: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'PAN.MOVE')
          return
        const t = context.get('transform')
        context.set('transform', { ...t, x: e.x, y: e.y })
      },
      panEnd: ({ context, refs }) => {
        refs.set('panSession', null)
        context.set('panning', false)
      },
    },
    effects: {
      // 装配顺序照 dialog：dismiss → focus → scroll 锁 → 背景失活。看片恒为模态。
      /**
       * 跟住落在图上的那几根手指。会话的生死跟着 open：离开时摘干净，
       * 拖到一半把浮层关掉也不会把监听留在文档上。
       */
      trackPointers: ({ refs, scope, send }) => {
        const session = createMultiPointerSession({
          doc: resolveSessionDoc(refs.get('getContentEl')() ?? scope.getDoc().documentElement),
          onChange: points => send({ type: 'POINTERS.CHANGE', points }),
          onEnd: () => send({ type: 'POINTERS.END' }),
        })
        refs.set('gesture', session)
        return () => {
          session.dispose()
          refs.set('gesture', null)
        }
      },

      trackOverlay: ({ refs, prop, scope, send, flush }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()
        const getContentEl = refs.get('getContentEl')
        const disposers: Array<() => void> = []

        const dismiss = createDismissLayer({
          config,
          layer,
          // 两个开关都现读 prop，展开中途改也立刻生效
          onEscapeKeyDown: (e) => {
            if (!(prop('closeOnEscape') ?? true))
              e.preventDefault()
          },
          onInteractOutside: (e) => {
            if (!(prop('closeOnInteractOutside') ?? true))
              e.preventDefault()
          },
          onDismiss: reason =>
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })
        disposers.push(() => dismiss.dispose())

        const focus = createFocusScope({
          config,
          layer,
          container: getContentEl,
          trapped: () => true,
          loop: true,
          restoreFocus: () => prop('restoreFocus') ?? true,
          // 归还落点显式给 trigger：指针打开那一刻焦点未必真在它身上（Safari 点按不给按钮焦点），
          // 靠焦点域的创建前快照会把 Escape 之后的 Tab 起点丢到 body 上。
          // 按 connect 给 trigger 落的 id 现取，程序化展开（没有 trigger）时回 null，归还照旧走快照
          restoreTarget: () => scope.getById<HTMLElement>(scope.partId('image-viewer', 'trigger')),
        })
        disposers.push(() => focus.dispose())

        const lock = acquireScrollLock({ config })
        disposers.push(() => lock.dispose())

        const getTargets = (): Element[] => [
          getContentEl(),
          ...config.layerRegistry.elementsAbove(layer),
        ].filter(Boolean) as Element[]

        // 背景失活推迟到宿主提交那一帧之后：进入 open 时 content 尚未渲染，
        // 此刻 targets 为空会导致背景永不 inert
        let hidden: (() => void) | undefined
        let alive = true
        flush(() => {
          if (!alive)
            return
          if (getTargets().length)
            hidden = hideOutside(getTargets, config.scope)
        })
        disposers.push(() => {
          alive = false
          hidden?.()
        })

        // 逆序拆：先撤依赖层的订阅，最后才把层本身移出栈
        return () => {
          for (let i = disposers.length - 1; i >= 0; i--) disposers[i]!()
          disposeLayer()
        }
      },
    },
  },
})

/**
 * 按当前点数重拍基准。
 *
 * 一根手指记平移的起点，两根记双指的几何；两者互斥——点数一变就把另一份清掉，
 * 留着的话下一拍会拿过期的基准去算，图会跳。
 */
function rebase(
  context: { get: (k: 'transform') => ImageViewerTransform },
  refs: { set: <K extends 'panSession' | 'pinchSession'>(k: K, v: ImageViewerRefs[K]) => void },
  points: readonly TrackedPoint[],
): void {
  const t = context.get('transform')
  if (points.length >= 2) {
    refs.set('panSession', null)
    refs.set('pinchSession', { start: pinchSnapshot(points[0]!, points[1]!), scale: t.scale, x: t.x, y: t.y })
    return
  }
  refs.set('pinchSession', null)
  const first = points[0]
  refs.set('panSession', first ? { startX: first.clientX, startY: first.clientY, originX: t.x, originY: t.y } : null)
}

/**
 * 双指跟手。缩放与位移都相对起始那一刻算，不相对上一帧——相对上一帧会把浮点误差一路累起来。
 *
 * 位移里除了两指中点自己的移动，还要补上「缩放绕原点发生」这一段：
 * 不补的话图会绕自己的原点缩，手指底下的那一处会跑掉。
 * 倍率取**夹过上下限之后**的那个，否则顶到边界后图还会继续漂。
 */
function applyPinch(
  context: {
    get: (k: 'transform') => ImageViewerTransform
    set: (k: 'transform', v: ImageViewerTransform) => void
  },
  prop: <K extends keyof ImageViewerSchema['props']>(k: K) => ImageViewerSchema['props'][K],
  session: NonNullable<ImageViewerRefs['pinchSession']>,
  current: PinchSnapshot,
): void {
  const change = pinchChange(session.start, current)
  const scale = clampScale(
    session.scale * change.scale,
    prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE,
    prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE,
  )
  const applied = session.scale === 0 ? 1 : scale / session.scale
  const t = context.get('transform')
  context.set('transform', {
    ...t,
    scale,
    x: session.x * applied + change.translate.x,
    y: session.y * applied + change.translate.y,
  })
}
