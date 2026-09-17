/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 signature pad 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 笔迹上的一点。坐标以画布左上角为原点、单位为像素；压感 0..1。 */
export interface SignaturePadPoint {
  x: number
  y: number
  /** 0..1。设备无法报告压感时由落笔速度模拟。 */
  pressure: number
}

/** 一笔：从落笔到抬笔之间累积的点。 */
export interface SignaturePadStroke {
  points: SignaturePadPoint[]
}

/**
 * 笔迹坐标系的尺寸：第一笔落下时测量画布并固定，清空后才重新测量。
 * 画布的 viewBox 与导出 SVG 的视窗都使用它，因此容器变宽变窄时已有笔迹随之缩放而不是错位。
 */
export interface SignaturePadSurface {
  width: number
  height: number
}

/** 指针事件带入的原始数据：屏幕坐标加设备压感，换算为画布坐标由状态机负责。 */
export interface SignaturePadPointerPoint {
  clientX: number
  clientY: number
  /** 设备报告的压感，0..1；无法报告时为 0 或 undefined。 */
  pressure?: number
  /** 本次事件的指针。提供后手掌与第二根手指的移动不会被续入当前一笔。 */
  pointerId?: number
}

/** 笔迹外形。 */
export interface SignaturePadDrawingOptions {
  /** 笔画最粗处的宽度，单位像素，默认 4。 */
  size?: number
  /** 忽略设备压感、改按落笔速度模拟，默认开启。关闭即直接使用 PointerEvent.pressure。 */
  simulatePressure?: boolean
  /** 压感对粗细的影响，0..1。默认 0，即压感不参与、笔画粗细恒定。 */
  thinning?: number
}

export interface SignaturePadDrawDetails {
  /** 逐笔的填充轮廓 d 串，按落笔先后排列。 */
  paths: string[]
  /** 正在书写的一笔的轮廓 d 串；清空时为空串。只需重绘这一条，不必整块重绘。 */
  path: string
}

export interface SignaturePadDrawEndDetails {
  paths: string[]
  /** 本版签名的独立 SVG 文档，与表单影子提交的是同一份；没有任何笔迹时为空串。 */
  svg: string
}

export interface SignaturePadSchema extends MachineSchema {
  props: {
    /** 整块不可交互：不响应落笔，清空按钮也不可按下。 */
    disabled?: boolean
    /** 只读：已绘制的签名照常显示，但不可修改。 */
    readOnly?: boolean
    required?: boolean
    /** 校验未通过的标记，只改变外观与表单影子上的 aria-invalid。 */
    invalid?: boolean
    /** 表单字段名；提供后表单影子才带 name 并参与提交。 */
    name?: string
    /** 笔迹外形。默认为 4px 恒定粗细。 */
    drawing?: SignaturePadDrawingOptions
    translations?: Partial<SignaturePadTranslations>
    /** 每收进一个点通知一次，清空与表单重置时也通知一次（路径为空）。 */
    onDraw?: (details: SignaturePadDrawDetails) => void
    /** 签名定稿时通知一次并附带可直接提交的 SVG：抬笔、清空、表单重置三条路径都发出。 */
    onDrawEnd?: (details: SignaturePadDrawEndDetails) => void
  }
  context: {
    /** 已绘制的每一笔，按落笔先后排列。 */
    strokes: SignaturePadStroke[]
    /** 笔迹坐标系的尺寸，第一笔落下时测量并固定；画布 viewBox 与导出视窗都按它写入。 */
    surface: SignaturePadSurface
    /** 清空按钮正被按住：Space / Enter 或触屏手指按下到松开之间，投影 data-pressed。指针按住由 :active 表出。 */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: {
    /** 画布节点，状态机在指针事件中使用它把屏幕坐标换算为画布坐标。 */
    getControlEl: () => Element | null
    /** 正在书写的一笔所属的指针；不在落笔中时为 null。其他指针的移动与抬起一概不响应。 */
    strokePointerId: number | null
  }
  state: 'drawing' | 'idle'
  event:
    | { type: 'DRAW.START', point: SignaturePadPointerPoint }
    | { type: 'DRAW.MOVE', point: SignaturePadPointerPoint }
    | { type: 'DRAW.END' }
    | { type: 'STROKES.CLEAR' }
    | { type: 'FORM.RESET' }
    // 按压通道（shared/press）：清空按钮的 Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard: 'canDraw' | 'canPress'
  action: 'beginStroke' | 'clearStrokes' | 'endStroke' | 'extendStroke' | 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: 'trackPointer'
}

export interface SignaturePadApi<T extends PropTypes = PropTypes> {
  /** 逐笔的填充轮廓 d 串，按落笔先后排列。 */
  paths: readonly string[]
  /** 没有任何笔迹。 */
  empty: boolean
  /** 笔正落在画布上。 */
  drawing: boolean
  disabled: boolean
  readOnly: boolean
  /** 是否已签名的文案，写入 status 部件；适配器在作者未自行编写文字时把它填入节点。 */
  statusText: string
  /** 当前签名的独立 SVG 文档，与表单影子提交的是同一份；空签名为空串。 */
  toSvg: () => string
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  getGuideProps: () => T['element']
  getPathProps: () => T['element']
  getClearTriggerProps: () => T['button']
  /** 状态出口：一块 role=status 的活区域，签名与清空都会播报一次。 */
  getStatusProps: () => T['element']
  /** 表单出口：一份视觉隐藏的原生输入，随表单提交当前签名。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案，默认英文。 */
export interface SignaturePadTranslations {
  /** 画布的 aria-label：作者未渲染 label 部件时，读屏只会朗读一张没有名字的图。 */
  label: string
  /** 清空按钮的 aria-label：按钮内通常只有一个叉，读屏无法朗读清空的对象。 */
  clearTrigger: string
  /** 空画布时 status 部件中的文案。画布是 role=img，仅凭名字无法判断是否已签名。 */
  statusEmpty: string
  /** 已有笔迹时 status 部件中的文案。 */
  statusSigned: string
}
