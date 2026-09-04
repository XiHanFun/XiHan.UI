import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ImageViewerApi, ImageViewerSchema } from './image-viewer.types'
import { dataAttr } from '@xihan-ui/kernel'
import { imageViewerAnatomy } from './image-viewer.anatomy'
import {
  clampImageViewerIndex,
  IMAGE_VIEWER_MAX_SCALE,
  IMAGE_VIEWER_MIN_SCALE,
  imageViewerCount,
} from './image-viewer.machine'

const parts = imageViewerAnatomy.build()

export function connectImageViewer<T extends PropTypes>(
  service: Service<ImageViewerSchema>,
  normalize: NormalizeProps<T>,
): ImageViewerApi<T> {
  const { state, context, prop, send, scope } = service
  const open = state.get() === 'open'
  const items = prop('items') ?? []
  const count = imageViewerCount(items)
  const index = clampImageViewerIndex(context.get('index'), count)
  const currentItem = items[index] ?? null
  const transform = context.get('transform')
  const panning = context.get('panning')
  const loop = prop('loop') ?? true
  const minScale = prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE
  const maxScale = prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE
  const canPrev = count > 1 && (loop || index > 0)
  const canNext = count > 1 && (loop || index < count - 1)
  const stateAttr = open ? 'open' : 'closed'
  const ids = scope.ids('image-viewer', 'trigger', 'content')

  const translations = prop('translations')
  const label = {
    content: translations?.content ?? 'Image preview',
    toolbar: translations?.toolbar ?? 'Image tools',
    close: translations?.close ?? 'Close',
    zoomIn: translations?.zoomIn ?? 'Zoom in',
    zoomOut: translations?.zoomOut ?? 'Zoom out',
    rotateLeft: translations?.rotateLeft ?? 'Rotate left',
    rotateRight: translations?.rotateRight ?? 'Rotate right',
    flipHorizontal: translations?.flipHorizontal ?? 'Flip horizontal',
    flipVertical: translations?.flipVertical ?? 'Flip vertical',
    reset: translations?.reset ?? 'Reset',
    prev: translations?.prev ?? 'Previous image',
    next: translations?.next ?? 'Next image',
    counter: translations?.counter ?? ((i: number, n: number) => `${i} / ${n}`),
  }

  /** 工具条按钮共用的骨架：type/禁用与关闭态一次给齐。 */
  const toolButton = (part: keyof typeof parts, aria: string, onClick: () => void, disabled = false): T['button'] =>
    normalize.button({
      ...parts[part].attrs,
      'type': 'button',
      'aria-label': aria,
      'data-state': stateAttr,
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      onClick,
    })

  return {
    open,
    index,
    count,
    currentItem,
    transform,
    panning,
    canPrev,
    canNext,
    setOpen: next => send({ type: next ? 'OPEN' : 'CLOSE' }),
    setIndex: next => send({ type: 'INDEX.SET', index: next }),
    next: () => send({ type: 'INDEX.NEXT' }),
    prev: () => send({ type: 'INDEX.PREV' }),
    zoomIn: () => send({ type: 'ZOOM.BY', delta: 1 }),
    zoomOut: () => send({ type: 'ZOOM.BY', delta: -1 }),
    setScale: scale => send({ type: 'ZOOM.SET', scale }),
    rotateLeft: () => send({ type: 'ROTATE.BY', delta: -90 }),
    rotateRight: () => send({ type: 'ROTATE.BY', delta: 90 }),
    flipHorizontal: () => send({ type: 'FLIP', axis: 'x' }),
    flipVertical: () => send({ type: 'FLIP', axis: 'y' }),
    reset: () => send({ type: 'TRANSFORM.RESET' }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'OPEN' }),
    }),

    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'aria-hidden': true,
      'data-state': stateAttr,
      // 形态轴落在 backdrop 上：三档换的都是这一层自己的底色与模糊
      'data-variant': prop('variant'),
      'hidden': !open || undefined,
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 由皮肤的 inset 直接摆，不问引擎要坐标，没有「还没量完」的窗口：恒已落位
      'data-positioned': '',
      'hidden': !open || undefined,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'aria-modal': 'true',
      // 当前图的 alt 就是最贴切的名字，没有再退到通用文案
      'aria-label': currentItem?.alt ?? label.content,
      'data-state': stateAttr,
      'hidden': !open || undefined,
      'tabindex': -1,
      // 翻页是看片模式的高频动作，方向键直达；输入焦点在按钮上时也生效
      'onKeydown': (event: KeyboardEvent) => {
        if (event.defaultPrevented)
          return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          send({ type: 'INDEX.PREV' })
        }
        else if (event.key === 'ArrowRight') {
          event.preventDefault()
          send({ type: 'INDEX.NEXT' })
        }
        // 两端直达，与同为序列翻页的 carousel 一致；不受 loop 影响
        else if (event.key === 'Home') {
          event.preventDefault()
          send({ type: 'INDEX.SET', index: 0 })
        }
        else if (event.key === 'End') {
          event.preventDefault()
          send({ type: 'INDEX.SET', index: count - 1 })
        }
      },
    }),

    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-state': stateAttr,
      'data-dragging': dataAttr(panning),
      // 滚轮就是缩放：向上放大、向下缩小。preventDefault 拦掉页面滚动，
      // 适配器须以 passive:false 绑定这个监听
      'onWheel': (event: WheelEvent) => {
        event.preventDefault()
        send({ type: 'ZOOM.BY', delta: event.deltaY < 0 ? 1 : -1 })
      },
      /**
       * 手指落在图上。这里只报落点，跟手与收尾都归多指会话——
       * 它挂在文档上，手划出图片、划出窗口都跟得住，也不必再逐个捕获指针。
       * 一根是平移，两根是缩放，点数怎么变由机器判。
       */
      'onPointerdown': (event: PointerEvent) => {
        // 只认主键，右键留给系统菜单
        if (event.button !== 0)
          return
        send({ type: 'POINTERS.DOWN', pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY })
      },
    }),

    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      'src': currentItem?.src,
      'alt': currentItem?.alt ?? '',
      // 原生拖图会跟平移打架
      'draggable': false,
      'data-state': stateAttr,
      'data-dragging': dataAttr(panning),
      'style': {
        transform: [
          `translate(${transform.x}px, ${transform.y}px)`,
          `rotate(${transform.rotate}deg)`,
          `scaleX(${transform.flipX ? -transform.scale : transform.scale})`,
          `scaleY(${transform.flipY ? -transform.scale : transform.scale})`,
        ].join(' '),
      },
    }),

    getToolbarProps: () => normalize.element({
      ...parts.toolbar.attrs,
      'role': 'toolbar',
      'aria-label': label.toolbar,
      'data-state': stateAttr,
    }),

    getZoomInTriggerProps: () => toolButton('zoom-in-trigger', label.zoomIn, () => send({ type: 'ZOOM.BY', delta: 1 }), transform.scale >= maxScale),
    getZoomOutTriggerProps: () => toolButton('zoom-out-trigger', label.zoomOut, () => send({ type: 'ZOOM.BY', delta: -1 }), transform.scale <= minScale),
    getRotateLeftTriggerProps: () => toolButton('rotate-left-trigger', label.rotateLeft, () => send({ type: 'ROTATE.BY', delta: -90 })),
    getRotateRightTriggerProps: () => toolButton('rotate-right-trigger', label.rotateRight, () => send({ type: 'ROTATE.BY', delta: 90 })),
    getFlipHorizontalTriggerProps: () => toolButton('flip-horizontal-trigger', label.flipHorizontal, () => send({ type: 'FLIP', axis: 'x' })),
    getFlipVerticalTriggerProps: () => toolButton('flip-vertical-trigger', label.flipVertical, () => send({ type: 'FLIP', axis: 'y' })),
    getResetTriggerProps: () => toolButton('reset-trigger', label.reset, () => send({ type: 'TRANSFORM.RESET' })),
    getPrevTriggerProps: () => toolButton('prev-trigger', label.prev, () => send({ type: 'INDEX.PREV' }), !canPrev),
    getNextTriggerProps: () => toolButton('next-trigger', label.next, () => send({ type: 'INDEX.NEXT' }), !canNext),

    getCounterProps: () => normalize.element({
      ...parts.counter.attrs,
      'data-state': stateAttr,
      // 翻页时读屏跟着报「第几张」
      'aria-live': 'polite',
      'data-index': String(index + 1),
      'data-count': String(count),
    }),

    getCloseTriggerProps: () => toolButton('close-trigger', label.close, () => send({ type: 'CLOSE', src: 'close-trigger' })),
  }
}

/** counter 部件的缺省文本；作者没写内容时由适配器填。 */
export function imageViewerCounterText(
  translations: ImageViewerSchema['props']['translations'],
  index: number,
  count: number,
): string {
  const fn = translations?.counter ?? ((i: number, n: number) => `${i} / ${n}`)
  return fn(index + 1, count)
}
