/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image cropper 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type {
  ImageCropperApi,
  ImageCropperFlipAxis,
  ImageCropperHandlePosition,
  ImageCropperSchema,
  ImageCropperTranslations,
} from './image-cropper.types'
import { createPressTracker, dataAttr, focusItem } from '@xihan-ui/core'
import { IMAGE_CROPPER_EN_US } from '../locale/en-US'
import { resolveTranslations } from '../shared/translations'
import { imageCropperAnatomy } from './image-cropper.anatomy'
import { cropToCanvas } from './image-cropper.canvas'
import { screenStepToImage, serializeCropRect } from './image-cropper.geometry'
import {
  IMAGE_CROPPER_MAX_ROTATION,
  IMAGE_CROPPER_MAX_ZOOM,
  IMAGE_CROPPER_MIN_ROTATION,
  IMAGE_CROPPER_MIN_ZOOM,
  IMAGE_CROPPER_ROTATION_STEP,
  IMAGE_CROPPER_ZOOM,
  IMAGE_CROPPER_ZOOM_STEP,
} from './image-cropper.machine'

const parts = imageCropperAnatomy.build()

/** 方向键一次走一个自然像素，按住 Shift 走十个。 */
const NUDGE_STEP = 1
const NUDGE_STEP_LARGE = 10

/**
 * 四个方向键在屏幕上的位移方向，恒是物理方向：裁切矩形描述的是图片像素，与文字方向无关。
 * 落到图片上之前还要按旋转与翻转换算，框在屏幕上往哪边挪，按的就是哪个键。
 */
const ARROW_DELTA: Record<string, readonly [number, number] | undefined> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

/** 把手方位 → translations 的键。缺省说法取 en-US 语言包，覆盖走 translations。 */
const HANDLE_LABELS: Record<ImageCropperHandlePosition, Exclude<keyof ImageCropperTranslations, 'valueText'>> = {
  nw: 'handleTopLeft',
  n: 'handleTop',
  ne: 'handleTopRight',
  e: 'handleRight',
  se: 'handleBottomRight',
  s: 'handleBottom',
  sw: 'handleBottomLeft',
  w: 'handleLeft',
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
  const { context, prop, refs, send, state } = service

  const value = context.get('value')
  const natural = context.get('natural')
  const zoom = context.get('zoom')
  const rotation = context.get('rotation')
  const flip = context.get('flip')
  const dragging = state.matches('dragging')
  const resizing = state.matches('resizing')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const editable = !disabled && !readOnly
  const shape = prop('shape') ?? 'rect'
  const minWidth = Math.max(0, prop('minWidth') ?? 0)
  const minHeight = Math.max(0, prop('minHeight') ?? 0)
  const minZoom = prop('minZoom') ?? IMAGE_CROPPER_MIN_ZOOM
  const maxZoom = prop('maxZoom') ?? IMAGE_CROPPER_MAX_ZOOM
  const zoomStep = prop('zoomStep') ?? IMAGE_CROPPER_ZOOM_STEP
  const minRotation = prop('minRotation') ?? IMAGE_CROPPER_MIN_ROTATION
  const maxRotation = prop('maxRotation') ?? IMAGE_CROPPER_MAX_ROTATION
  const rotationStep = prop('rotationStep') ?? IMAGE_CROPPER_ROTATION_STEP

  const translations = resolveTranslations(IMAGE_CROPPER_EN_US, prop('translations'))
  const label = {
    cropArea: translations.cropArea,
    handle: (position: ImageCropperHandlePosition): string => translations[HANDLE_LABELS[position]],
    zoomSlider: translations.zoomSlider,
    rotateSlider: translations.rotateSlider,
    flip: (axis: ImageCropperFlipAxis): string => axis === 'horizontal'
      ? translations.flipHorizontal
      : translations.flipVertical,
    // 二维控件只报得出一个 aria-valuenow，另外三个数只能写进播报文本
    valueText: translations.valueText,
  }

  // 图片没加载完就量不出比例，裁切框此时收成 0 尺寸、等 IMAGE.LOAD 铺初值
  const known = natural.width > 0 && natural.height > 0
  const leftRatio = known ? value.x / natural.width : 0
  const topRatio = known ? value.y / natural.height : 0
  const widthRatio = known ? value.width / natural.width : 0
  const heightRatio = known ? value.height / natural.height : 0

  // 缩放、旋转与翻转同时作用在图片与裁切框上，两者因此始终贴合；恒等变换写空串，让样式表接手。
  // 翻转先作用（最右一项），再缩放、再旋转：镜像是图片自己的，不随旋转后的屏幕轴走
  const flipped = flip.horizontal || flip.vertical
  const identity = rotation === 0 && zoom === IMAGE_CROPPER_ZOOM && !flipped
  const scale = flipped
    ? `scale(${flip.horizontal ? -zoom : zoom}, ${flip.vertical ? -zoom : zoom})`
    : `scale(${zoom})`
  const transform = identity ? '' : `rotate(${rotation}deg) ${scale}`
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

  /** 方向键的一步按屏幕方向换算成图片像素的一步。 */
  const keyStep = (delta: readonly [number, number], step: number): { dx: number, dy: number } =>
    screenStepToImage(delta[0] * step, delta[1] * step, rotation, flip)

  // 翻转按钮的按压通道：真源是机器 context 里「正被按住的那一颗」，各按钮按自己的轴合成一份跟踪器
  const pressed = context.get('pressed')
  const press = (axis: ImageCropperFlipAxis): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressed') === axis,
    onChange: down => send(down ? { type: 'PRESS.START', axis } : { type: 'PRESS.END', axis }),
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
    flip,
    natural,
    dragging,
    resizing,
    disabled,
    readOnly,
    getCropRect: () => ({ ...value }),
    // 出图是作者点名调的命令，此刻才去取源图节点；连接期不碰 DOM
    toCanvas: (options = {}) => {
      const image = refs.get('getImageEl')()
      if (!image || !known)
        return null
      return cropToCanvas(image, value, { ...options, rotation, flip, shape })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setZoom: next => send({ type: 'ZOOM.SET', zoom: next }),
    setRotation: next => send({ type: 'ROTATE.SET', rotation: next }),
    setFlip: next => send({ type: 'FLIP.SET', flip: next }),
    toggleFlip: axis => send({ type: 'FLIP.TOGGLE', axis }),

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
      // 没给替代文本就落空串：不写这个属性的话读屏会改念图片地址
      alt: prop('alt') ?? '',
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
        const { dx, dy } = keyStep(delta, event.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP)
        send({ type: 'CROP.NUDGE', dx, dy })
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
        const { dx, dy } = keyStep(delta, event.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP)
        send({ type: 'HANDLE.NUDGE', position, dx, dy })
      },
    }),

    // 构图参考线纯装饰，读屏不必念它
    getGridProps: () => normalize.element({
      ...parts.grid.attrs,
      'aria-hidden': true,
      'data-shape': shape,
    }),

    // 两条常用轴收进解剖：行为归原生 range，值仍旧只改呈现，不动裁切矩形
    getZoomSliderProps: () => normalize.input({
      ...parts['zoom-slider'].attrs,
      'type': 'range',
      'aria-label': label.zoomSlider,
      'min': String(minZoom),
      'max': String(maxZoom),
      'step': String(zoomStep),
      'value': String(zoom),
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      'onInput': (event: Event) => {
        const el = event.currentTarget as HTMLInputElement
        send({ type: 'ZOOM.SET', zoom: Number(el.value) })
      },
    }),

    getRotateSliderProps: () => normalize.input({
      ...parts['rotate-slider'].attrs,
      'type': 'range',
      'aria-label': label.rotateSlider,
      'min': String(minRotation),
      'max': String(maxRotation),
      'step': String(rotationStep),
      'value': String(rotation),
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      'onInput': (event: Event) => {
        const el = event.currentTarget as HTMLInputElement
        send({ type: 'ROTATE.SET', rotation: Number(el.value) })
      },
    }),

    // 两颗翻转按钮：每颗管一条轴，aria-pressed 报这条轴此刻翻没翻。翻转只改呈现，只读也照常可按，禁用才按不动
    getFlipTriggerProps: ({ axis }) => {
      const on = flip[axis]
      const handlers = press(axis)
      return normalize.button({
        ...parts['flip-trigger'].attrs,
        // 少了 type，按钮落在 form 里会变成 submit
        'type': 'button',
        // 按钮里通常只有一个镜像图标，读屏念不出它翻的是哪条轴
        'aria-label': label.flip(axis),
        'aria-pressed': on ? 'true' : 'false',
        'disabled': disabled || undefined,
        'data-disabled': dataAttr(disabled),
        'data-axis': axis,
        'data-state': on ? 'on' : 'off',
        // 裁切器旁的独立开关钮：盒型、四态面、0.97 按压与粗指针命中区由家族配方按 text 档给出；
        // 缺省 outline 描边，翻着时的选中面（品牌淡底）由皮肤在 data-state='on' 上桥接
        'data-xh-action-control': '',
        'data-xh-action-profile': 'text',
        'data-xh-action-display': 'always',
        'data-xh-action-size': 'sm',
        'data-xh-action-variant': 'outline',
        'data-pressed': dataAttr(pressed === axis),
        'onClick': () => {
          if (!disabled)
            send({ type: 'FLIP.TOGGLE', axis })
        },
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

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
