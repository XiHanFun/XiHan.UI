/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image viewer 相关实现。

import type { ContextFacade, PropFn, RefsFacade } from '@xihan-ui/core'
import type { SpringValue } from '@xihan-ui/motion'
import type { PinchSnapshot, TrackedPoint } from '@xihan-ui/pointer'
import type { ImageViewerImageStatus, ImageViewerItem, ImageViewerPressedPart, ImageViewerRefs, ImageViewerSchema, ImageViewerTransform } from './image-viewer.types'
import { createDismissLayer, createFocusScope, setup } from '@xihan-ui/core'
import { createSpringValue, glideSpring, projectRelease, rubberClamp } from '@xihan-ui/motion'
import { createMultiPointerSession, pinchChange, pinchSnapshot, resolveSessionDoc } from '@xihan-ui/pointer'
import { closeReasonOf } from '../shared/close-reason'
import { trackLiquidPart } from '../shared/liquid'
import { createModalLayerResources, setupLayerTransaction } from '../shared/overlay-shell'

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

/** 松手惯性的投影时间（秒）：滑行按 e^(−t / 这么久) 减速，停在「位置 + 速度 × 这么久」。 */
const INERTIA_SECONDS = 0.3

/** 平移越出范围时的橡皮筋尺寸（像素）：越拉越沉，趋近这么远。 */
const PAN_STRETCH = 80

/** 图片与视口节点：平移范围按两者的尺寸算。量不到时（纯逻辑驱动）返回 null，平移不设限。 */
function partEl(refs: RefsFacade<ImageViewerSchema>, part: 'image' | 'viewport'): HTMLElement | null {
  return refs.get('getContentEl')()?.querySelector<HTMLElement>(`[data-scope="image-viewer"][data-part="${part}"]`) ?? null
}

/**
 * 平移范围（两轴各自的半宽）：放大、旋转后的外接框超出视口的那一半；图比视口小时为 0，只能居中。
 * 量不到节点或尺寸为 0 时返回 null。
 */
function panLimits(refs: RefsFacade<ImageViewerSchema>, t: ImageViewerTransform): { x: number, y: number } | null {
  const image = partEl(refs, 'image')
  const viewport = partEl(refs, 'viewport')
  if (!image || !viewport)
    return null
  const w = image.offsetWidth * Math.abs(t.scale)
  const h = image.offsetHeight * Math.abs(t.scale)
  if (!w || !h || !viewport.clientWidth || !viewport.clientHeight)
    return null
  const rad = (t.rotate * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const round = (value: number): number => Math.round(value * 100) / 100
  return {
    x: round(Math.max(0, (w * cos + h * sin - viewport.clientWidth) / 2)),
    y: round(Math.max(0, (w * sin + h * cos - viewport.clientHeight) / 2)),
  }
}

/** 把平移收进范围；量不到范围时原样返回。 */
function clampPan(refs: RefsFacade<ImageViewerSchema>, t: ImageViewerTransform): ImageViewerTransform {
  const limits = panLimits(refs, t)
  if (!limits)
    return t
  const x = Math.min(Math.max(t.x, -limits.x), limits.x)
  const y = Math.min(Math.max(t.y, -limits.y), limits.y)
  return x === t.x && y === t.y ? t : { ...t, x, y }
}

/** 跟手时越出范围的那段按橡皮筋衰减。 */
function resistPan(refs: RefsFacade<ImageViewerSchema>, t: ImageViewerTransform): ImageViewerTransform {
  const limits = panLimits(refs, t)
  if (!limits)
    return t
  return { ...t, x: rubberClamp(t.x, -limits.x, limits.x, PAN_STRETCH), y: rubberClamp(t.y, -limits.y, limits.y, PAN_STRETCH) }
}

/** 撤下松手后的平移弹簧，平移停在它此刻的位置。 */
function stopInertia(refs: RefsFacade<ImageViewerSchema>, context: ContextFacade<ImageViewerSchema>): void {
  const inertia = refs.get('inertia')
  inertia?.x?.stop()
  inertia?.y?.stop()
  refs.set('inertia', null)
  context.set('settling', false)
}

/**
 * 松手落定：两轴各自判断。已越出范围的一轴用硬弹簧收回边界；在范围内的一轴顺着松手速度惯性滑行，
 * 落点夹在范围内（滑到边界会轻碰一下再停）。量不到范围时不动。
 */
function settlePan(refs: RefsFacade<ImageViewerSchema>, context: ContextFacade<ImageViewerSchema>, velocity: { x: number, y: number }): void {
  stopInertia(refs, context)
  const image = partEl(refs, 'image')
  const t = context.get('transform')
  const limits = panLimits(refs, t)
  if (!image || !limits)
    return
  const axis = (key: 'x' | 'y'): { spring: SpringValue, done: Promise<unknown> } | null => {
    const at = t[key]
    const limit = limits[key]
    const outside = Math.abs(at) > limit + 0.5
    const target = Math.min(Math.max(outside ? at : projectRelease(at, velocity[key], INERTIA_SECONDS), -limit), limit)
    if (Math.abs(target - at) < 0.5 && Math.abs(velocity[key]) < 5) {
      if (target !== at)
        context.set('transform', { ...context.get('transform'), [key]: target })
      return null
    }
    const spring = createSpringValue({
      spring: outside ? 'stiff' : glideSpring(INERTIA_SECONDS),
      value: at,
      target: image,
      onUpdate: value => context.set('transform', { ...context.get('transform'), [key]: value }),
    })
    return { spring, done: spring.to(target, { velocity: outside ? 0 : velocity[key] }) }
  }
  const x = axis('x')
  const y = axis('y')
  if (!x && !y)
    return
  const inertia = { x: x?.spring ?? null, y: y?.spring ?? null }
  refs.set('inertia', inertia)
  context.set('settling', true)
  // 两轴都落定（或被新的按下、缩放打断）才撤下；打断时 stopInertia 已经收过尾
  void Promise.all([x?.done, y?.done]).then(() => {
    if (refs.get('inertia') === inertia) {
      refs.set('inertia', null)
      context.set('settling', false)
    }
  })
}

function clampScale(scale: number, min: number, max: number): number {
  if (!Number.isFinite(scale))
    return 1
  return Math.min(Math.max(scale, min), max)
}

function sameTransform(a: ImageViewerTransform, b: ImageViewerTransform | undefined): boolean {
  return !!b && a.scale === b.scale && a.rotate === b.rotate && a.flipX === b.flipX && a.flipY === b.flipY && a.x === b.x && a.y === b.y
}

/**
 * 按住的那颗按钮此刻是不是已经转成原生 disabled：贴住缩放端点的缩放钮、到边界（不回绕）的翻页钮。
 * 按住 Enter 一路放大到 maxScale、翻到末张，或宿主改写 loop / 端点，按钮转禁用后不会再来 keyup，按压面得由机器收。
 * 其余按钮没有禁用态。
 */
function pressedPartInert(
  prop: PropFn<ImageViewerSchema>,
  transform: ImageViewerTransform,
  index: number,
  part: ImageViewerPressedPart,
): boolean {
  if (part === 'zoom-in-trigger')
    return transform.scale >= (prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE)
  if (part === 'zoom-out-trigger')
    return transform.scale <= (prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE)
  if (part !== 'prev-trigger' && part !== 'next-trigger')
    return false
  const count = imageViewerCount(prop('collection'))
  const current = clampImageViewerIndex(index, count)
  const loop = prop('loop') ?? true
  return part === 'prev-trigger'
    ? !(count > 1 && (loop || current > 0))
    : !(count > 1 && (loop || current < count - 1))
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
    settling: cell<boolean>(() => ({ defaultValue: false })),
    imageStatus: cell<ImageViewerImageStatus>(() => ({ defaultValue: 'loading' })),
    // 按压通道：正被按住的那颗按钮，与开合无关
    pressed: cell<ImageViewerPressedPart | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    getContentEl: () => null,
    panSession: null,
    pinchSession: null,
    gesture: null,
    inertia: null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 退出期间模态资源不能跟着逻辑状态立即拆：Presence 的所有视觉租约清空后才释放。
  effects: ['trackOverlay'],
  watch: ({ track, prop, context, action }) => {
    // 受控时用户事件只发意图回调；宿主写回 open 后由这里派发 CONTROLLED.* 无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 换图即弃掉上一张的缩放与平移，受控写回的下标也走这一条
    track([context.dep('index')], () => action(['resetTransform', 'resetImageStatus']))
    // 按住途中按钮转禁用：按住 Enter 放大到端点 / 翻到末张、宿主改写 loop 或端点，按钮原生 disabled 后不会再来 keyup
    track([
      context.dep('transform'),
      context.dep('index'),
      () => prop('collection'),
      () => prop('loop'),
      () => prop('minScale'),
      () => prop('maxScale'),
    ], () => action(['releaseWhenInert']))
  },
  // 按压通道挂根级：收起途中 Presence 还留着按钮，PRESS.END 照收；开合两态之外的 PRESS.START 由守卫拦
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
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
      entry: ['resetTransform', 'resetImageStatus'],
      effects: ['trackPointers', 'trackLiquid'],
      // 收起即松开：按住 Enter 关掉浮层，关闭钮随内容一起藏起，不会再来 keyup 或 blur
      exit: ['pointersEnd', 'releasePress'],
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
        'IMAGE.LOAD': { actions: ['setImageLoaded'] },
        'IMAGE.ERROR': { actions: ['setImageError'] },
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
      // 只在展开态接；贴住端点的缩放钮与到边界的翻页钮是原生 disabled，那份事实由 connect 判定后随事件带入
      canPress: ({ state, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && state.matches('open') && !e.disabled
      },
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
      releaseWhenInert: ({ context, prop }) => {
        const part = context.get('pressed')
        if (part != null && pressedPartInert(prop, context.get('transform'), context.get('index'), part))
          context.set('pressed', null)
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
      // 越界下标在写入口就夹掉，受控宿主拿到的回调值永远可用
      setIndex: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'INDEX.SET')
          context.set('index', clampImageViewerIndex(e.index, imageViewerCount(prop('collection'))))
      },
      goNext: ({ context, prop }) => {
        const count = imageViewerCount(prop('collection'))
        const current = clampImageViewerIndex(context.get('index'), count)
        context.set('index', stepImageViewerIndex(current, 1, count, prop('loop') ?? true))
      },
      goPrev: ({ context, prop }) => {
        const count = imageViewerCount(prop('collection'))
        const current = clampImageViewerIndex(context.get('index'), count)
        context.set('index', stepImageViewerIndex(current, -1, count, prop('loop') ?? true))
      },
      zoomBy: ({ context, prop, event, refs }) => {
        const e = event.current()
        if (e.type !== 'ZOOM.BY')
          return
        stopInertia(refs, context)
        const step = prop('zoomStep') ?? IMAGE_VIEWER_ZOOM_STEP
        const t = context.get('transform')
        const scale = clampScale(
          t.scale + e.delta * step,
          prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE,
          prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE,
        )
        // 缩回 1 以内平移就没意义了，一并归位，免得图飘在视口外找不回来；放大缩小后平移收进新的范围
        context.set('transform', clampPan(refs, { ...t, scale, x: scale <= 1 ? 0 : t.x, y: scale <= 1 ? 0 : t.y }))
      },
      zoomTo: ({ context, prop, event, refs }) => {
        const e = event.current()
        if (e.type !== 'ZOOM.SET')
          return
        stopInertia(refs, context)
        const t = context.get('transform')
        const scale = clampScale(
          e.scale,
          prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE,
          prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE,
        )
        context.set('transform', clampPan(refs, { ...t, scale, x: scale <= 1 ? 0 : t.x, y: scale <= 1 ? 0 : t.y }))
      },
      // 转过 90° 后外接框的宽高对调，平移收进新的范围
      rotateBy: ({ context, event, refs }) => {
        const e = event.current()
        if (e.type !== 'ROTATE.BY')
          return
        stopInertia(refs, context)
        const t = context.get('transform')
        context.set('transform', clampPan(refs, { ...t, rotate: t.rotate + e.delta }))
      },
      flip: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'FLIP')
          return
        const t = context.get('transform')
        context.set('transform', e.axis === 'x' ? { ...t, flipX: !t.flipX } : { ...t, flipY: !t.flipY })
      },
      resetTransform: ({ context, refs }) => {
        stopInertia(refs, context)
        context.set('transform', IMAGE_VIEWER_IDENTITY)
      },
      resetImageStatus: ({ context }) => context.set('imageStatus', 'loading'),
      setImageLoaded: ({ context }) => context.set('imageStatus', 'loaded'),
      setImageError: ({ context }) => context.set('imageStatus', 'error'),
      /** 一根手指落在图上：交给会话跟着，并按当前点数拍基准。 */
      pointersDown: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'POINTERS.DOWN')
          return
        const session = refs.get('gesture')
        if (!session)
          return
        // 滑行或回弹途中按下：停在此刻的位置，从这里接着拖
        stopInertia(refs, context)
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
          context.set('transform', resistPan(refs, context.get('transform')))
          return
        }

        if (points.length === 1) {
          // 上一拍还是双指：这一拍先重拍成单指基准，位移从这里重新起量
          if (pinch || !pan) {
            rebase(context, refs, points)
            return
          }
          const t = context.get('transform')
          // 越出范围的那段按橡皮筋衰减：图比视口小时只能拖出一小截，松手弹回居中
          context.set('transform', resistPan(refs, {
            ...t,
            x: pan.originX + (points[0]!.clientX - pan.startX),
            y: pan.originY + (points[0]!.clientY - pan.startY),
          }))
        }
      },

      /**
       * 最后一根手指离开。最后一段是单指平移时顺着松手速度惯性滑行；双指缩放后抬手、被系统收走时不滑行。
       * 越出范围的平移都收回来。
       */
      pointersEnd: ({ context, refs, event }) => {
        const e = event.current()
        const panned = refs.get('panSession') != null
        refs.set('panSession', null)
        refs.set('pinchSession', null)
        context.set('panning', false)
        const glide = e.type === 'POINTERS.END' && panned && !e.canceled && e.velocity ? e.velocity : { x: 0, y: 0 }
        settlePan(refs, context, glide)
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
      /** 打开期间，工具条、计数与三颗钮浮在图上：材质轴为 liquid 时按下层换色调、亮边随指针 */
      trackLiquid: ({ scope, flush }) => {
        const stops = ['toolbar', 'counter', 'prev-trigger', 'next-trigger', 'close-trigger']
          .map(part => trackLiquidPart(scope, flush, 'image-viewer', part))
        return () => stops.forEach(stop => stop())
      },

      // 装配顺序照 dialog：dismiss → focus → scroll 锁 → 背景失活。看片恒为模态。
      /**
       * 跟住落在图上的那几根手指。会话的生死跟着 open：离开时摘干净，
       * 拖到一半把浮层关掉也不会把监听留在文档上。
       */
      trackPointers: ({ refs, scope, send }) => {
        const session = createMultiPointerSession({
          doc: resolveSessionDoc(refs.get('getContentEl')() ?? scope.getDoc().documentElement),
          onChange: points => send({ type: 'POINTERS.CHANGE', points }),
          onEnd: ({ reason, velocity }) => send({ type: 'POINTERS.END', velocity, canceled: reason === 'pointercancel' }),
        })
        refs.set('gesture', session)
        return () => {
          session.dispose()
          refs.set('gesture', null)
          const inertia = refs.get('inertia')
          inertia?.x?.stop()
          inertia?.y?.stop()
          refs.set('inertia', null)
        }
      },

      trackOverlay: ({ refs, prop, scope, send, flush, state, track }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        let reactivateFocus: (() => void) | undefined
        const acquire = (): (() => void) => setupLayerTransaction(registerLayer, (layer, defer, run) => {
          const getContentEl = refs.get('getContentEl')
          const dismiss = createDismissLayer({
            config,
            layer,
            // 逻辑关闭后的退场帧仍在层栈里，不能再次消解或重复发 close 意图。
            onEscapeKeyDown: (e) => {
              if (state.get() !== 'open' || !(prop('closeOnEscape') ?? true))
                e.preventDefault()
            },
            onInteractOutside: (e) => {
              if (state.get() !== 'open' || !(prop('closeOnInteractOutside') ?? true))
                e.preventDefault()
            },
            onDismiss: reason =>
              send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
          })
          defer(() => dismiss.dispose())

          const focus = createFocusScope({
            config,
            layer,
            flush,
            container: getContentEl,
            trapped: () => state.get() === 'open',
            loop: true,
            restoreFocus: () => prop('restoreFocus') ?? true,
            // 指针打开时浏览器未必会把焦点留在 trigger；优先归还给语义触发器。
            restoreTarget: () => scope.getById<HTMLElement>(scope.partId('image-viewer', 'trigger')),
          })
          reactivateFocus = focus.reactivate
          defer(() => {
            if (reactivateFocus === focus.reactivate)
              reactivateFocus = undefined
            focus.dispose()
          })

          const modalResources = createModalLayerResources({
            config,
            layer,
            enabled: () => true,
            targets: () => [
              getContentEl(),
              ...config.layerRegistry.elementsAbove(layer),
            ].filter(Boolean) as Element[],
            flush,
            run,
          })
          defer(modalResources.dispose)
          modalResources.sync()
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
          lastOpen = open
          if (open) {
            // 重开沿用原 layer/focus scope；Presence 会撤销旧视觉租约。
            release ??= acquire()
            if (reopening) {
              const activate = reactivateFocus
              flush(() => scope.getWin().requestAnimationFrame(() => {
                if (!disposed && state.get() === 'open' && release && reactivateFocus === activate)
                  activate?.()
              }))
            }
          }
          else if (!presence || !presence.rendered) {
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
