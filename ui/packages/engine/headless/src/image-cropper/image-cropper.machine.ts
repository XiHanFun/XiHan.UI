import type { Params } from '@xihan-ui/core'
import type { CropConstraints } from './image-cropper.geometry'
import type { ImageCropperRect, ImageCropperSchema, ImageCropperSize } from './image-cropper.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import {
  initialCropRect,
  moveCropRect,
  normalizeCropRect,
  resizeCropRect,
  sameCropRect,
  sameCropSize,
  unprojectDelta,
} from './image-cropper.geometry'

const { createMachine } = setup<ImageCropperSchema>()

/** 图片还没加载、作者也没给初值时的裁切矩形：空框，加载完成那一刻再铺初值。 */
export const EMPTY_CROP_RECT: ImageCropperRect = { x: 0, y: 0, width: 0, height: 0 }

/** 图片自然尺寸的未知态。 */
export const UNKNOWN_IMAGE_SIZE: ImageCropperSize = { width: 0, height: 0 }

export const IMAGE_CROPPER_ZOOM = 1

type Props = ImageCropperSchema['props']
type PropReader = <K extends keyof Props>(key: K) => Props[K]

/** 三条约束的缺省收在一处：图片尺寸来自 context，最小尺寸与比例来自 props。 */
function constraints(prop: PropReader, bounds: ImageCropperSize): CropConstraints {
  return {
    bounds,
    minWidth: prop('minWidth') ?? 0,
    minHeight: prop('minHeight') ?? 0,
    aspectRatio: prop('aspectRatio') ?? null,
  }
}

/**
 * 键盘微调的落值与收尾：一次按键就是一次改完的操作，写回的同时发一次收尾通知，
 * 键盘路径因此也拿得到 onValueChangeEnd。值没真变（顶到边界了）就一声不吭。
 */
function commitNudge(
  context: Params<ImageCropperSchema>['context'],
  prop: Params<ImageCropperSchema>['prop'],
  next: ImageCropperRect,
): void {
  if (sameCropRect(next, context.get('value')))
    return
  context.set('value', next)
  prop('onValueChangeEnd')?.({ value: { ...next } })
}

export const imageCropperMachine = createMachine({
  name: 'image-cropper',
  context: ({ prop, cell }) => ({
    // 裁切矩形走 cell 原生受控。这一处拿不到图片尺寸（它住在另一个 cell 里），
    // 所以初值只吃最小尺寸、比例与取整，出界夹取留给 IMAGE.LOAD 那一刻补。
    value: cell<ImageCropperRect>(() => ({
      value: prop('value') ? normalizeCropRect(prop('value')!, constraints(prop, UNKNOWN_IMAGE_SIZE)) : undefined,
      defaultValue: normalizeCropRect(prop('defaultValue') ?? EMPTY_CROP_RECT, constraints(prop, UNKNOWN_IMAGE_SIZE)),
      // 每次归一化都产出新对象，默认的 Object.is 会把"没变"也判成变了
      isEqual: sameCropRect,
      // 受控时 set 不写内部值，只有这条回调能把用户意图送出去
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    zoom: cell<number>(() => ({
      value: prop('zoom'),
      defaultValue: prop('defaultZoom') ?? IMAGE_CROPPER_ZOOM,
      onChange: zoom => prop('onZoomChange')?.({ zoom }),
    })),
    // 自然尺寸由 image 部件的 load 事件报进来，不受控、不对外通知
    natural: cell<ImageCropperSize>(() => ({ defaultValue: UNKNOWN_IMAGE_SIZE, isEqual: sameCropSize })),
    origin: cell<ImageCropperSchema['context']['origin']>(() => ({ defaultValue: null })),
    activeHandle: cell<ImageCropperSchema['context']['activeHandle']>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getViewportEl: () => null,
  }),
  initialState: () => 'idle',
  // 命令式赋值、键盘微调与图片加载在哪个状态发出都一样，因此挂根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { guard: 'canEdit', actions: ['setValue'] },
    // 缩放只改呈现、不改数据，禁用与只读都不拦它
    'ZOOM.SET': { actions: ['setZoom'] },
    'IMAGE.LOAD': { actions: ['setNatural'] },
    'CROP.NUDGE': { guard: 'canEdit', actions: ['nudgeCrop'] },
    'HANDLE.NUDGE': { guard: 'canEdit', actions: ['nudgeHandle'] },
  },
  states: {
    idle: {
      on: {
        'DRAG.START': { guard: 'canEdit', target: 'dragging', actions: ['beginMove'] },
        'RESIZE.START': { guard: 'canEdit', target: 'resizing', actions: ['beginResize'] },
      },
    },
    dragging: {
      effects: ['trackPointer'],
      on: {
        'DRAG.MOVE': { actions: ['trackDrag'] },
        // 收尾通知只在这里发一次，拖动途中 onValueChange 已连发多次
        'DRAG.END': { target: 'idle', actions: ['invokeChangeEnd', 'clearOrigin'] },
      },
    },
    resizing: {
      effects: ['trackPointer'],
      on: {
        'DRAG.MOVE': { actions: ['trackDrag'] },
        'DRAG.END': { target: 'idle', actions: ['invokeChangeEnd', 'clearOrigin'] },
      },
    },
  },
  implementations: {
    guards: {
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      // 落回的初值是在图片尺寸还未知时归一化的，只吃了最小尺寸与比例，
      // 这里补上出界夹取那一刀，否则重置之后裁切框可以停在图外
      resetToDefault: (params) => {
        if (!resetDeclaredValue(params, 'value', 'value', 'defaultValue'))
          return
        const { context, prop } = params
        const natural = context.get('natural')
        if (natural.width <= 0 || natural.height <= 0)
          return
        const clamped = normalizeCropRect(context.get('value'), constraints(prop, natural))
        if (!sameCropRect(clamped, context.get('value')))
          context.set('value', clamped)
      },

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeCropRect(e.value, constraints(prop, context.get('natural'))))
      },

      setZoom: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ZOOM.SET')
          return
        // 倍率必须是有限正数：0 与负数会让位移换算除零、把裁切框钉死
        if (!(e.zoom > 0) || !Number.isFinite(e.zoom))
          return
        context.set('zoom', e.zoom)
      },

      setNatural: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'IMAGE.LOAD')
          return
        const size = { width: Math.max(0, e.size.width), height: Math.max(0, e.size.height) }
        context.set('natural', size)
        if (size.width <= 0 || size.height <= 0)
          return
        const c = constraints(prop, size)
        const current = context.get('value')
        // 还没有框（作者没给初值）就铺一块尽可能大的居中区域，否则把旧框夹进这张图
        context.set('value', current.width > 0 && current.height > 0 ? normalizeCropRect(current, c) : initialCropRect(c))
      },

      nudgeCrop: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'CROP.NUDGE')
          return
        const c = constraints(prop, context.get('natural'))
        commitNudge(context, prop, moveCropRect(context.get('value'), e.dx, e.dy, c))
      },

      nudgeHandle: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'HANDLE.NUDGE')
          return
        const c = constraints(prop, context.get('natural'))
        commitNudge(context, prop, resizeCropRect(context.get('value'), e.position, e.dx, e.dy, c))
      },

      beginMove: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        context.set('activeHandle', null)
        context.set('origin', { point: e.point, rect: context.get('value') })
      },

      beginResize: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'RESIZE.START')
          return
        context.set('activeHandle', e.position)
        context.set('origin', { point: e.point, rect: context.get('value') })
      },

      // 视口矩形在事件发生的那一刻现量：连接层不许读 DOM，量尺子这件事只能落在这里
      trackDrag: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.MOVE')
          return
        const origin = context.get('origin')
        const natural = context.get('natural')
        const viewport = refs.get('getViewportEl')()
        if (!origin || !viewport || natural.width <= 0)
          return
        const scale = viewport.getBoundingClientRect().width / natural.width
        const delta = unprojectDelta(
          e.point.clientX - origin.point.clientX,
          e.point.clientY - origin.point.clientY,
          { scale, zoom: context.get('zoom'), rotation: prop('rotation') ?? 0 },
        )
        const c = constraints(prop, natural)
        const handle = context.get('activeHandle')
        // 位移一律从按下那一刻的矩形算起，不逐帧累加：累加会把每帧的取整误差滚成明显的漂移
        context.set('value', handle
          ? resizeCropRect(origin.rect, handle, delta.dx, delta.dy, c)
          : moveCropRect(origin.rect, delta.dx, delta.dy, c))
      },

      clearOrigin: ({ context }) => {
        context.set('origin', null)
        context.set('activeHandle', null)
      },

      // 一次拖动没有真的改动矩形（例如在框上单击一下，按下与松手之间零位移）就不发收尾通知
      invokeChangeEnd: ({ context, prop }) => {
        const origin = context.get('origin')
        const value = context.get('value')
        if (origin && sameCropRect(value, origin.rect))
          return
        prop('onValueChangeEnd')?.({ value: { ...value } })
      },
    },
    effects: {
      // 跟手交给指针会话：监听挂在文档上，指针拖出视口仍要跟手，系统收走指针也会收尾。
      trackPointer: ({ send, refs }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getViewportEl')()),
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', point }),
          onEnd: () => send({ type: 'DRAG.END' }),
        })
        return () => session.dispose()
      },
    },
  },
})
