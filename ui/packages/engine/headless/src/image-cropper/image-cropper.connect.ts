import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ImageCropperApi, ImageCropperHandlePosition, ImageCropperRect, ImageCropperSchema, ImageCropperTranslations } from './image-cropper.types'
import { focusItem } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { imageCropperAnatomy } from './image-cropper.anatomy'
import { serializeCropRect } from './image-cropper.geometry'
import { IMAGE_CROPPER_ZOOM } from './image-cropper.machine'

const parts = imageCropperAnatomy.build()

/** 方向键一次走一个自然像素，按住 Shift 走十个。 */
const NUDGE_STEP = 1
const NUDGE_STEP_LARGE = 10

/** 四个方向键对应的位移方向，恒是物理方向：裁切矩形描述的是图片像素，与文字方向无关。 */
const ARROW_DELTA: Record<string, readonly [number, number] | undefined> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

/** 把手方位 → translations 的键与内建英文名。内建默认一律英文，覆盖走 translations。 */
const HANDLE_LABELS: Record<ImageCropperHandlePosition, { key: Exclude<keyof ImageCropperTranslations, 'valueText'>, en: string }> = {
  nw: { key: 'handleTopLeft', en: 'Top left handle' },
  n: { key: 'handleTop', en: 'Top edge handle' },
  ne: { key: 'handleTopRight', en: 'Top right handle' },
  e: { key: 'handleRight', en: 'Right edge handle' },
  se: { key: 'handleBottomRight', en: 'Bottom right handle' },
  s: { key: 'handleBottom', en: 'Bottom edge handle' },
  sw: { key: 'handleBottomLeft', en: 'Bottom left handle' },
  w: { key: 'handleLeft', en: 'Left edge handle' },
}

/** 每个把手主要推动的是哪条边长：上下两条边的把手改高度，其余六个改宽度。 */
const HANDLE_AXIS: Record<ImageCropperHandlePosition, 'height' | 'width'> = {
  nw: 'width',
  n: 'height',
  ne: 'width',
  e: 'width',
  se: 'width',
  s: 'height',
  sw: 'width',
  w: 'width',
}

/** 比例转 CSS 长度，留四位小数：裁切框常常只占图片的百分之几，两位会看得出台阶。 */
function pct(ratio: number): string {
  return `${Math.round(ratio * 1000000) / 10000}%`
}

export function connectImageCropper<T extends PropTypes>(
  service: Service<ImageCropperSchema>,
  normalize: NormalizeProps<T>,
): ImageCropperApi<T> {
  const { context, prop, send, state } = service

  const value = context.get('value')
  const natural = context.get('natural')
  const zoom = context.get('zoom')
  const rotation = prop('rotation') ?? 0
  const dragging = state.matches('dragging')
  const resizing = state.matches('resizing')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const editable = !disabled && !readOnly
  const shape = prop('shape') ?? 'rect'
  const minWidth = Math.max(0, prop('minWidth') ?? 0)
  const minHeight = Math.max(0, prop('minHeight') ?? 0)

  const translations = prop('translations')
  const label = {
    cropArea: translations?.cropArea ?? 'Crop area',
    handle: (position: ImageCropperHandlePosition): string => {
      const { key, en } = HANDLE_LABELS[position]
      return translations?.[key] ?? en
    },
    // 二维控件只报得出一个 aria-valuenow，另外三个数只能写进播报文本
    valueText: translations?.valueText
      ?? ((rect: ImageCropperRect) => `X ${rect.x}, Y ${rect.y}, width ${rect.width}, height ${rect.height}`),
  }

  // 图片没加载完就量不出比例，裁切框此时收成 0 尺寸、等 IMAGE.LOAD 铺初值
  const known = natural.width > 0 && natural.height > 0
  const leftRatio = known ? value.x / natural.width : 0
  const topRatio = known ? value.y / natural.height : 0
  const widthRatio = known ? value.width / natural.width : 0
  const heightRatio = known ? value.height / natural.height : 0

  // 缩放与旋转同时作用在图片与裁切框上，两者因此始终贴合；恒等变换写空串，让样式表接手
  const identity = rotation === 0 && zoom === IMAGE_CROPPER_ZOOM
  const transform = identity ? '' : `rotate(${rotation}deg) scale(${zoom})`
  /**
   * 裁切框要绕**视口中心**转，而 transform-origin 是按自己的盒子算的，
   * 所以把视口中心换算成裁切框自身宽高的百分比。宽高为 0 时退回自身中心。
   */
  const originX = widthRatio > 0 ? ((0.5 - leftRatio) / widthRatio) * 100 : 50
  const originY = heightRatio > 0 ? ((0.5 - topRatio) / heightRatio) * 100 : 50
  const cropTransformOrigin = identity ? '' : `${Math.round(originX * 10000) / 10000}% ${Math.round(originY * 10000) / 10000}%`

  // 五个角色节点共用同一份状态标记，样式层各处一致
  const stateAttrs = (): Record<string, string | undefined> => ({
    'data-disabled': dataAttr(disabled),
    'data-readonly': dataAttr(readOnly),
    'data-dragging': dataAttr(dragging),
    'data-resizing': dataAttr(resizing),
  })

  /** 按下即开拖：挡掉浏览器的图片拖拽与文本选中，再把焦点显式转投过去。 */
  const grab = (event: PointerEvent): boolean => {
    if (!editable || event.button !== 0)
      return false
    event.preventDefault()
    focusItem(event.currentTarget as HTMLElement)
    return true
  }

  return {
    value,
    zoom,
    rotation,
    natural,
    dragging,
    resizing,
    disabled,
    readOnly,
    getCropRect: () => ({ ...value }),
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setZoom: next => send({ type: 'ZOOM.SET', zoom: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...stateAttrs(),
      'data-shape': shape,
    }),

    // 量尺子的那个盒子：图片铺满它，裁切框的百分比坐标以它为准
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      ...stateAttrs(),
    }),

    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      // 原生图片拖拽会顶掉指针拖动，一按下就变成拖一张图出去
      draggable: 'false',
      src: prop('src'),
      style: { transform },
      // 自然尺寸只有这里问得到；换 src 后浏览器会再派一次，尺寸随之更新
      onLoad: (event: Event) => {
        const img = event.currentTarget as HTMLImageElement
        send({ type: 'IMAGE.LOAD', size: { width: img.naturalWidth, height: img.naturalHeight } })
      },
    }),

    getCropAreaProps: () => normalize.element({
      ...parts['crop-area'].attrs,
      ...stateAttrs(),
      // 报成 application：group 不是 widget，读屏在浏览模式下把方向键收给虚拟光标，
      // 平移压根到不了这里。slider 不能用——它的子节点按规范一律当装饰，
      // 那样八个把手会整批从无障碍树里消失。application 的代价只覆盖框内那一小块，见 doc.md
      'role': 'application',
      'aria-label': label.cropArea,
      'aria-disabled': disabled ? 'true' : 'false',
      'tabindex': disabled ? undefined : 0,
      'data-shape': shape,
      // 坐标用物理属性：矩形描述的是图片像素，逻辑属性会在 rtl 下把框翻到另一侧
      'style': {
        'touchAction': 'none',
        'left': pct(leftRatio),
        'top': pct(topRatio),
        'width': pct(widthRatio),
        'height': pct(heightRatio),
        transform,
        'transformOrigin': cropTransformOrigin,
        // 裁切框整体被放大，描边与把手要按倍率缩回去，样式层照这个数算
        '--xh-_image-cropper-zoom': String(zoom),
      },
      'onPointerDown': (event: PointerEvent) => {
        if (grab(event))
          send({ type: 'DRAG.START', point: { clientX: event.clientX, clientY: event.clientY } })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 改不动时不吞键；Shift 是快移的开关，只有另外三个修饰键要放行
        if (!editable || event.ctrlKey || event.metaKey || event.altKey)
          return
        const delta = ARROW_DELTA[event.key]
        if (!delta)
          return
        // 认下的键都得拦住，否则方向键会滚页面
        event.preventDefault()
        const step = event.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP
        send({ type: 'CROP.NUDGE', dx: delta[0] * step, dy: delta[1] * step })
      },
    }),

    getCropHandleProps: ({ position }) => normalize.button({
      ...parts['crop-handle'].attrs,
      // 少了 type，把手落在 form 里会变成 submit
      'type': 'button',
      // 把手推的是一条边长，同样报成 slider：聚焦到原生按钮不会自动切焦点模式，
      // 不报 slider 的话读屏浏览模式下方向键到不了这里
      'role': 'slider',
      'aria-label': label.handle(position),
      'aria-valuemin': String(HANDLE_AXIS[position] === 'width' ? minWidth : minHeight),
      'aria-valuemax': String(HANDLE_AXIS[position] === 'width' ? natural.width : natural.height),
      'aria-valuenow': String(HANDLE_AXIS[position] === 'width' ? value.width : value.height),
      'aria-valuetext': label.valueText({ ...value }),
      'aria-disabled': disabled ? 'true' : 'false',
      // 整组禁用时给 -1 而不是不写，原生 button 不写 tabindex 照样可聚焦
      'tabindex': disabled ? -1 : 0,
      'data-position': position,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      // 只有正被拉的那个把手算 resizing，八个全打上标记样式层就分不出手在哪一个上
      'data-resizing': dataAttr(resizing && context.get('activeHandle') === position),
      'style': { touchAction: 'none' },
      'onPointerDown': (event: PointerEvent) => {
        // 把手住在裁切框里，不掐断冒泡就会连整体拖动一起触发
        event.stopPropagation()
        if (grab(event))
          send({ type: 'RESIZE.START', position, point: { clientX: event.clientX, clientY: event.clientY } })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (!editable || event.ctrlKey || event.metaKey || event.altKey)
          return
        const delta = ARROW_DELTA[event.key]
        if (!delta)
          return
        event.preventDefault()
        // 把手住在裁切框里，不掐断冒泡的话同一次按键会既改尺寸又整体平移。
        // 只掐自己认下的那些键，其余照常冒上去
        event.stopPropagation()
        const step = event.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP
        send({ type: 'HANDLE.NUDGE', position, dx: delta[0] * step, dy: delta[1] * step })
      },
    }),

    // 构图参考线纯装饰，读屏不必念它
    getGridProps: () => normalize.element({
      ...parts.grid.attrs,
      'aria-hidden': 'true',
      'data-shape': shape,
    }),

    // 表单出口：裁切矩形靠这份原生输入随表单提交，序列化成 `x,y,width,height`
    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      value: serializeCropRect(value),
      // 禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}
