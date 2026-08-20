import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 笔迹上的一点。坐标以画布左上角为原点、单位是像素；压感 0..1。 */
export interface SignaturePadPoint {
  x: number
  y: number
  /** 0..1。设备报不出压感时由落笔速度模拟。 */
  pressure: number
}

/** 一笔：从落笔到抬笔之间累积下来的点。 */
export interface SignaturePadStroke {
  points: SignaturePadPoint[]
}

/**
 * 笔迹坐标系的尺寸：第一笔落下时量到画布并钉住，清空才重新量。
 * 画布的 viewBox 与导出 SVG 的视窗都写它，所以容器变宽变窄时已有笔迹跟着缩放而不是错位。
 */
export interface SignaturePadSurface {
  width: number
  height: number
}

/** 指针事件带进来的原始数据：屏幕坐标加设备压感，换算成画布坐标是机器的事。 */
export interface SignaturePadPointerPoint {
  clientX: number
  clientY: number
  /** 设备报的压感，0..1；报不出时是 0 或 undefined。 */
  pressure?: number
  /** 这一下是哪根指针。给了它，手掌与第二根手指的移动就不会被续进当前这一笔。 */
  pointerId?: number
}

/** 笔迹外形。 */
export interface SignaturePadDrawingOptions {
  /** 笔画最粗处的宽度，单位像素，默认 4。 */
  size?: number
  /** 忽略设备压感、改按落笔速度模拟，默认开。关掉即直接用 PointerEvent.pressure。 */
  simulatePressure?: boolean
  /** 压感对粗细的影响，0..1。默认 0，即压感不参与、笔画粗细恒定。 */
  thinning?: number
}

export interface SignaturePadDrawDetails {
  /** 逐笔的填充轮廓 d 串，按落笔先后排列。 */
  paths: string[]
  /** 正在写的那一笔的轮廓 d 串；清空时为空串。只要重画这一条就够，不必整块重绘。 */
  path: string
}

export interface SignaturePadDrawEndDetails {
  paths: string[]
  /** 这一版签名的独立 SVG 文档，与表单影子提交的是同一份；一笔都没有时为空串。 */
  svg: string
}

export interface SignaturePadSchema extends MachineSchema {
  props: {
    /** 整块不可交互：落笔不认，清空按钮也按不动。 */
    disabled?: boolean
    /** 只读：画好的签名照常显示，但改不动。 */
    readOnly?: boolean
    required?: boolean
    /** 校验未通过的标记，只改外观与表单影子上的 aria-invalid。 */
    invalid?: boolean
    /** 表单字段名；给了表单影子才带 name 并参与提交。 */
    name?: string
    /** 笔迹外形。缺省即 4px 恒定粗细。 */
    drawing?: SignaturePadDrawingOptions
    translations?: Partial<SignaturePadTranslations>
    /** 每收进一个点通知一次，清空与表单重置时也通知一次（路径为空）。 */
    onDraw?: (details: SignaturePadDrawDetails) => void
    /** 签名定稿时通知一次并带上可直接提交的 SVG：抬笔、清空、表单重置这三条路径都发。 */
    onDrawEnd?: (details: SignaturePadDrawEndDetails) => void
  }
  context: {
    /** 已经画下的每一笔，按落笔先后排列。 */
    strokes: SignaturePadStroke[]
    /** 笔迹坐标系的尺寸，第一笔落下时量到并钉住；画布 viewBox 与导出视窗都按它写。 */
    surface: SignaturePadSurface
  }
  computed: Record<string, never>
  refs: {
    /** 画布节点，机器在指针事件里拿它把屏幕坐标换算成画布坐标。 */
    getControlEl: () => Element | null
    /** 正在写的这一笔归哪根指针；不在落笔中为 null。别的指针的移动与抬起一概不认。 */
    strokePointerId: number | null
  }
  state: 'drawing' | 'idle'
  event:
    | { type: 'DRAW.START', point: SignaturePadPointerPoint }
    | { type: 'DRAW.MOVE', point: SignaturePadPointerPoint }
    | { type: 'DRAW.END' }
    | { type: 'STROKES.CLEAR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canDraw'
  action: 'beginStroke' | 'clearStrokes' | 'endStroke' | 'extendStroke'
  effect: 'trackPointer'
}

export interface SignaturePadApi<T extends PropTypes = PropTypes> {
  /** 逐笔的填充轮廓 d 串，按落笔先后排列。 */
  paths: readonly string[]
  /** 一笔都没画。 */
  empty: boolean
  /** 笔正落在画布上。 */
  drawing: boolean
  disabled: boolean
  readOnly: boolean
  /** 签没签的那句话，写进 status 部件；适配器在作者没自己写文字时把它填进节点。 */
  statusText: string
  /** 当前签名的独立 SVG 文档，与表单影子提交的是同一份；空签名为空串。 */
  toSvg: () => string
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  getGuideProps: () => T['element']
  getSegmentProps: () => T['element']
  getClearTriggerProps: () => T['button']
  /** 状态出口：一块 role=status 的活区域，签上与清空都会播报一次。 */
  getStatusProps: () => T['element']
  /** 表单出口：一份视觉隐藏的原生输入，随表单提交当前签名。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案，默认英文。 */
export interface SignaturePadTranslations {
  /** 画布的 aria-label：作者没渲染 label 部件时，读屏只会念出一张没有名字的图。 */
  label: string
  /** 清空按钮的 aria-label：按钮里通常只有一个叉，读屏念不出它清掉的是什么。 */
  clearTrigger: string
  /** 空画布时 status 部件里的那句话。画布是 role=img，光看名字判断不出签没签。 */
  statusEmpty: string
  /** 已有笔迹时 status 部件里的那句话。 */
  statusSigned: string
}
