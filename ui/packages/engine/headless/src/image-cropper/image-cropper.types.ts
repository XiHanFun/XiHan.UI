import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 裁切框的外形：方框，或圆形（圆形只改遮罩与描边，矩形数据不变）。 */
export type ImageCropperShape = 'rect' | 'round'

/**
 * 八个把手的方位。字母是罗盘缩写：n 上、s 下、w 左、e 右，两两组合即四角。
 * 方位恒是物理方向——裁切矩形描述的是图片像素，不随文字方向翻转。
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

/** 把手自报家门：它拉的是哪个方位。 */
export interface ImageCropperHandleProps {
  position: ImageCropperHandlePosition
}

export interface ImageCropperSchema extends MachineSchema {
  props: {
    /** 图片地址，原样写到 image 部件的 src 上。 */
    src?: string
    /**
     * 被裁切那张图的替代文本，原样写到 image 部件的 alt 上。
     * 不给时 image 部件落 `alt=""`：读屏就此跳过这张图，不去念地址。
     */
    alt?: string
    /**
     * 宽高比（宽 ÷ 高）。给了它，改尺寸时另一条边跟着算；null 与不给都表示不锁比例。
     * 非有限数与非正数按不锁处理。
     */
    aspectRatio?: number | null
    /** 裁切矩形。给定即受控：内部不再自改，只发 onValueChange。 */
    value?: ImageCropperRect
    defaultValue?: ImageCropperRect
    /** 裁切框的最小宽度，自然像素，默认 0。 */
    minWidth?: number
    /** 裁切框的最小高度，自然像素，默认 0。 */
    minHeight?: number
    /** 显示缩放倍率，默认 1。给定即受控：setZoom 只发 onZoomChange。 */
    zoom?: number
    defaultZoom?: number
    /**
     * 显示旋转角度，单位度，默认 0。
     * 缩放与旋转只改图片与裁切框的呈现，裁切矩形与源图像素的对应关系不变。
     */
    rotation?: number
    /** 裁切框外形，默认 rect。 */
    shape?: ImageCropperShape
    /** 禁用：裁切框与把手退出 Tab 序列，指针与键盘都改不动，也不参与表单提交。 */
    disabled?: boolean
    /** 只读：仍可聚焦与被读屏念出，改不动。 */
    readOnly?: boolean
    /** 表单字段名；给了才参与提交，值序列化成 `x,y,width,height`。 */
    name?: string
    translations?: Partial<ImageCropperTranslations>
    /** 每次裁切矩形变化都发；拖动过程中会连续发很多次。 */
    onValueChange?: (details: ImageCropperValueChangeDetails) => void
    /** 只在一次拖动结束时发一次，适合拿来做裁切导出。 */
    onValueChangeEnd?: (details: ImageCropperValueChangeEndDetails) => void
    /** 缩放变化意图；受控时是唯一出口。 */
    onZoomChange?: (details: ImageCropperZoomChangeDetails) => void
  }
  context: {
    /** 当前裁切矩形，自然像素。 */
    value: ImageCropperRect
    /** 当前缩放倍率。 */
    zoom: number
    /** 图片自然尺寸，由 image 部件的 load 事件报进来；未加载时是 0×0。 */
    natural: ImageCropperSize
    /**
     * 一次拖动的起点快照：按下那一刻的指针坐标与裁切矩形。
     * 位移按「当前指针 − 起点」整体算，不逐帧累加，避免夹取与取整的误差滚雪球。
     */
    origin: ImageCropperDragOrigin | null
    /** 正在被拉的把手方位；整体拖动时为 null。 */
    activeHandle: ImageCropperHandlePosition | null
  }
  computed: Record<string, never>
  refs: {
    getViewportEl: () => HTMLElement | null
  }
  state: 'dragging' | 'idle' | 'resizing'
  event:
    /** 整份赋值（作者的命令式出口）；写入前照样夹进图片、吃最小尺寸与比例。 */
    | { type: 'VALUE.SET', value: ImageCropperRect }
    | { type: 'ZOOM.SET', zoom: number }
    /** 图片加载完成，报出自然尺寸；此时裁切矩形还是空的就铺一个居中的初值。 */
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
  /** 图片自然尺寸；未加载完成时是 0×0，此时裁切框还量不出位置。 */
  natural: ImageCropperSize
  /** 正在整体拖动裁切框。 */
  dragging: boolean
  /** 正在拉某个把手。 */
  resizing: boolean
  disabled: boolean
  readOnly: boolean
  /** 取一份当前裁切矩形的副本，交给 cropToCanvas 出图。 */
  getCropRect: () => ImageCropperRect
  setValue: (next: ImageCropperRect) => void
  setZoom: (next: number) => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getImageProps: () => T['img']
  getCropAreaProps: () => T['element']
  getCropHandleProps: (props: ImageCropperHandleProps) => T['button']
  /** 裁切框里的构图参考线，纯装饰。 */
  getGridProps: () => T['element']
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案，默认英文。 */
export interface ImageCropperTranslations {
  /** 裁切框的 aria-label：框里只有一片图像，不给名字读屏念不出这块可移动的区域是什么。 */
  cropArea: string
  /** 裁切框与把手的播报文本：一个 aria-valuenow 只装得下一个数，四个数靠这一句念全。 */
  valueText: (rect: ImageCropperRect) => string
  /** 八个把手都是没有文字的小方块，读屏念不出各自拉的是哪条边或哪个角。 */
  handleTopLeft: string
  handleTop: string
  handleTopRight: string
  handleRight: string
  handleBottomRight: string
  handleBottom: string
  handleBottomLeft: string
  handleLeft: string
}
