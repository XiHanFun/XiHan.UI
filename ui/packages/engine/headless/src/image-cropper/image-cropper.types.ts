/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 image cropper 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 裁切框的外形：方框，或圆形（圆形只改遮罩与描边，矩形数据不变）。 */
export type ImageCropperShape = 'rect' | 'round'

/**
 * 八个把手的方位。字母是罗盘缩写：n 上、s 下、w 左、e 右，两两组合即四角。
 * 方位恒为物理方向：裁切矩形描述的是图片像素，不随文字方向翻转。
 */
export type ImageCropperHandlePosition = 'e' | 'n' | 'ne' | 'nw' | 's' | 'se' | 'sw' | 'w'

/** 裁切矩形，单位是源图的自然像素，原点在图片左上角。 */
export interface ImageCropperRect {
  x: number
  y: number
  width: number
  height: number
}

/** 图片的自然尺寸；未加载完成时两项都是 0。 */
export interface ImageCropperSize {
  width: number
  height: number
}

export interface ImageCropperPoint {
  clientX: number
  clientY: number
}

export interface ImageCropperValueChangeDetails {
  value: ImageCropperRect
}

export interface ImageCropperValueChangeEndDetails {
  value: ImageCropperRect
}

export interface ImageCropperZoomChangeDetails {
  zoom: number
}

export interface ImageCropperRotationChangeDetails {
  rotation: number
}

/** 把手的声明：拉动的方位。 */
export interface ImageCropperHandleProps {
  position: ImageCropperHandlePosition
}

export interface ImageCropperSchema extends MachineSchema {
  props: {
    /** 图片地址，原样写到 image 部件的 src 上。 */
    src?: string
    /**
     * 被裁切图片的替代文本，原样写到 image 部件的 alt 上。
     * 未提供时 image 部件写 `alt=""`：读屏跳过该图片，不朗读地址。
     */
    alt?: string
    /**
     * 宽高比（宽 ÷ 高）。提供后改尺寸时另一条边随之计算；null 与未提供都表示不锁定比例。
     * 非有限数与非正数按不锁定处理。
     */
    aspectRatio?: number | null
    /** 裁切矩形。提供即受控：内部不再自行修改，只发 onValueChange。 */
    value?: ImageCropperRect
    defaultValue?: ImageCropperRect
    /** 裁切框的最小宽度，自然像素，默认 0。 */
    minWidth?: number
    /** 裁切框的最小高度，自然像素，默认 0。 */
    minHeight?: number
    /** 显示缩放倍率，默认 1。提供即受控：setZoom 只发 onZoomChange。 */
    zoom?: number
    defaultZoom?: number
    /** 缩放滑杆的下限，默认 1。只约束滑杆，不夹取 setZoom。 */
    minZoom?: number
    /** 缩放滑杆的上限，默认 3。只约束滑杆，不夹取 setZoom。 */
    maxZoom?: number
    /** 缩放滑杆的步长，默认 0.01。 */
    zoomStep?: number
    /**
     * 显示旋转角度，单位度，默认 0。提供即受控：setRotation 只发 onRotationChange。
     * 缩放与旋转只改变图片与裁切框的呈现，裁切矩形与源图像素的对应关系不变。
     */
    rotation?: number
    defaultRotation?: number
    /** 旋转滑杆的下限，默认 -180。 */
    minRotation?: number
    /** 旋转滑杆的上限，默认 180。 */
    maxRotation?: number
    /** 旋转滑杆的步长，默认 1。 */
    rotationStep?: number
    /** 裁切框外形，默认 rect。 */
    shape?: ImageCropperShape
    /** 禁用：裁切框与把手退出 Tab 序列，指针与键盘都不可修改，也不参与表单提交。 */
    disabled?: boolean
    /** 只读：仍可聚焦与被读屏朗读，不可修改。 */
    readOnly?: boolean
    /** 表单字段名；提供后才参与提交，值序列化为 `x,y,width,height`。 */
    name?: string
    translations?: Partial<ImageCropperTranslations>
    /** 每次裁切矩形变化都发出；拖动过程中连续发出。 */
    onValueChange?: (details: ImageCropperValueChangeDetails) => void
    /** 只在一次拖动结束时发出一次，适合用于裁切导出。 */
    onValueChangeEnd?: (details: ImageCropperValueChangeEndDetails) => void
    /** 缩放变化意图；受控时是唯一出口。 */
    onZoomChange?: (details: ImageCropperZoomChangeDetails) => void
    /** 旋转变化意图；受控时是唯一出口。 */
    onRotationChange?: (details: ImageCropperRotationChangeDetails) => void
  }
  context: {
    /** 当前裁切矩形，自然像素。 */
    value: ImageCropperRect
    /** 当前缩放倍率。 */
    zoom: number
    /** 当前旋转角度，单位度。 */
    rotation: number
    /** 图片自然尺寸，由 image 部件的 load 事件报告；未加载时为 0×0。 */
    natural: ImageCropperSize
    /**
     * 一次拖动的起点快照：按下时的指针坐标与裁切矩形。
     * 位移按当前指针 − 起点整体计算，不逐帧累加，避免夹取与取整的误差累积。
     */
    origin: ImageCropperDragOrigin | null
    /** 正在拉动的把手方位；整体拖动时为 null。 */
    activeHandle: ImageCropperHandlePosition | null
  }
  computed: Record<string, never>
  refs: {
    getViewportEl: () => HTMLElement | null
  }
  state: 'dragging' | 'idle' | 'resizing'
  event:
    /** 整份赋值（作者的命令式出口）；写入前同样夹进图片、应用最小尺寸与比例。 */
    | { type: 'VALUE.SET', value: ImageCropperRect }
    | { type: 'ZOOM.SET', zoom: number }
    | { type: 'ROTATE.SET', rotation: number }
    /** 图片加载完成，报告自然尺寸；此时裁切矩形仍为空则铺设一个居中的初值。 */
    | { type: 'IMAGE.LOAD', size: ImageCropperSize }
    | { type: 'CROP.NUDGE', dx: number, dy: number }
    | { type: 'HANDLE.NUDGE', position: ImageCropperHandlePosition, dx: number, dy: number }
    | { type: 'DRAG.START', point: ImageCropperPoint }
    | { type: 'RESIZE.START', position: ImageCropperHandlePosition, point: ImageCropperPoint }
    | { type: 'DRAG.MOVE', point: ImageCropperPoint }
    | { type: 'DRAG.END' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit'
  action:
    | 'beginMove'
    | 'beginResize'
    | 'clearOrigin'
    | 'invokeChangeEnd'
    | 'nudgeCrop'
    | 'nudgeHandle'
    | 'resetToDefault'
    | 'setNatural'
    | 'setRotation'
    | 'setValue'
    | 'setZoom'
    | 'trackDrag'
  effect: 'trackPointer'
}

/** 一次拖动的起点快照。 */
export interface ImageCropperDragOrigin {
  point: ImageCropperPoint
  rect: ImageCropperRect
}

export interface ImageCropperApi<T extends PropTypes = PropTypes> {
  /** 当前裁切矩形，自然像素。 */
  value: ImageCropperRect
  zoom: number
  rotation: number
  /** 图片自然尺寸；未加载完成时为 0×0，此时裁切框无法测量位置。 */
  natural: ImageCropperSize
  /** 正在整体拖动裁切框。 */
  dragging: boolean
  /** 正在拉动某个把手。 */
  resizing: boolean
  disabled: boolean
  readOnly: boolean
  /** 获取一份当前裁切矩形的副本，交给 cropToCanvas 出图。 */
  getCropRect: () => ImageCropperRect
  setValue: (next: ImageCropperRect) => void
  setZoom: (next: number) => void
  setRotation: (next: number) => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getImageProps: () => T['img']
  getCropAreaProps: () => T['element']
  getCropHandleProps: (props: ImageCropperHandleProps) => T['button']
  /** 裁切框中的构图参考线，纯装饰。 */
  getGridProps: () => T['element']
  /** 缩放滑杆，原生 range 输入。 */
  getZoomSliderProps: () => T['input']
  /** 旋转滑杆，原生 range 输入。 */
  getRotateSliderProps: () => T['input']
  getHiddenInputProps: () => T['input']
}

/** 读屏文案，默认英文。 */
export interface ImageCropperTranslations {
  /** 裁切框的 aria-label：框内只有图像，不提供名字时读屏无法朗读该可移动区域的含义。 */
  cropArea: string
  /** 裁切框与把手的播报文本：一个 aria-valuenow 只能承载一个数，四个数依靠这一句朗读完整。 */
  valueText: (rect: ImageCropperRect) => string
  /** 八个把手都是没有文字的小方块，读屏无法朗读各自拉动的是哪条边或哪个角。 */
  handleTopLeft: string
  handleTop: string
  handleTopRight: string
  handleRight: string
  handleBottomRight: string
  handleBottom: string
  handleBottomLeft: string
  handleLeft: string
  /** 缩放滑杆的可及名。 */
  zoomSlider: string
  /** 旋转滑杆的可及名。 */
  rotateSlider: string
}
