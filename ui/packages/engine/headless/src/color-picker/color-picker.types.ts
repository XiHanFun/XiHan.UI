/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color picker 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { ColorSliderApi, ColorSliderServices } from '../color-slider'
import type { ColorSwatchPickerApi, ColorSwatchPickerSchema } from '../color-swatch-picker'
import type { ColorAnchor, ColorFormat, ColorHsva, ColorRgba } from '../shared/color'
import type { ColorPickerChannel, ColorPickerInputChannel } from './color-picker.color'
import type { ColorPickerPoint } from './color-picker.geometry'

/**
 * 正被指针拖动的部位。
 * 只有二维取色区归取色器自身管理；两条通道滑杆的拖动位于各自内嵌的滑杆中。
 */
export type ColorPickerDragTarget = 'area'

/** 某个输入框中尚未接受的草稿。同一时刻只有一个框在编辑（即聚焦的框）。 */
export interface ColorPickerDraft {
  channel: ColorPickerInputChannel
  text: string
}

/** 读屏文案，默认英文。取色区与两条通道滑杆没有可见标题，名字只能来自这里。 */
export interface ColorPickerTranslations {
  /** 二维取色区的名字。 */
  area: string
  /** 取色区的播报文本。 */
  areaValueText: (saturation: number, brightness: number) => string
  /** 通道滑杆的名字。 */
  channel: (channel: ColorPickerChannel) => string
  /** 通道滑杆的播报文本（带单位的版本）。 */
  channelValueText: (channel: ColorPickerChannel, value: number) => string
  /** 数值输入框的名字。 */
  input: (channel: ColorPickerInputChannel) => string
  /** 预设色板中一格的名字。 */
  swatch: (value: string) => string
  /** 预设色板整组的名字。 */
  swatchGroup: string
  /** 屏幕取色按钮的名字。 */
  eyeDropperTrigger: string
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface ColorPickerRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点。 */
  getContentEl: () => HTMLElement | null
  /** 二维取色区本体：坐标换算以它的矩形为准，矩形在事件发生时测量。 */
  getAreaEl: () => HTMLElement | null
}

/**
 * 取色器运行所需的状态机：自身一台，色相与透明度各一条颜色滑块（各自再内嵌一台滑杆），预设色板一台色块选择器。
 *
 * 三个内嵌组件的值、工作色与状态都受控于取色器，推动经各自的 onValueChange 送回
 * （滑块送回 HSVA.SET，色板送回 VALUE.SET）；轨道矩形由适配器接到各条滑块的内嵌滑杆上。
 * 它们的 DOM 位于取色器的浮层中，各自保留自己的 scope（color-slider / color-swatch-picker），
 * 取色器只提供三个挂载点，挂载点同时充当各自的根节点。
 */
export interface ColorPickerServices {
  root: Service<ColorPickerSchema>
  /** 色相通道的颜色滑块（通道 hue，区间 0-360）。 */
  hueSlider: ColorSliderServices
  /** 透明度通道的颜色滑块（通道 alpha，区间 0-100）；alpha 关闭时整条禁用。 */
  alphaSlider: ColorSliderServices
  /** 预设色板：从一组固定颜色中选择一个。 */
  swatchPicker: Service<ColorSwatchPickerSchema>
}

export interface ColorPickerValueChangeDetails {
  /** 按 format 序列化的值串。 */
  value: string
}

export interface ColorPickerOpenChangeDetails {
  open: boolean
}

export interface ColorPickerFormatErrorDetails {
  type: 'format'
  format: string
}

export interface ColorPickerInputErrorDetails {
  type: 'input'
  channel: ColorPickerInputChannel
  value: string
}

export interface ColorPickerParseErrorDetails {
  type: 'parse'
  source: 'external' | 'api' | 'swatch' | 'eye-dropper'
  value: string
}

export interface ColorPickerEyeDropperErrorDetails {
  type: 'eye-dropper'
  cause: unknown
}

export type ColorPickerErrorDetails
  = | ColorPickerFormatErrorDetails
    | ColorPickerInputErrorDetails
    | ColorPickerParseErrorDetails
    | ColorPickerEyeDropperErrorDetails

/** 四路错误相互独立；修正一路不会清除另一路的诊断。 */
export interface ColorPickerErrors {
  format: ColorPickerFormatErrorDetails | null
  input: ColorPickerInputErrorDetails | null
  parse: ColorPickerParseErrorDetails | null
  eyeDropper: ColorPickerEyeDropperErrorDetails | null
}

/** 数值输入框声明的身份。 */
export interface ColorPickerInputProps {
  channel: ColorPickerInputChannel
}

export interface ColorPickerSchema extends MachineSchema {
  props: {
    /** 颜色值串。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 值串的写法，默认 hex。修改它只改变对外的序列化，工作色恒为 HSVA。 */
    format?: ColorFormat
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 整个控件禁用：trigger 与两个按钮使用原生 disabled，取色区与滑杆退出 Tab 序列。 */
    disabled?: boolean
    /** 只读：浮层照常展开（可查看当前颜色），但任何改值的动作都不发生。 */
    readOnly?: boolean
    /** 预设色板：交给内嵌的色块选择器铺格，选中的格按颜色比较。 */
    swatches?: string[]
    /** 表单字段名；提供后表单影子才带 name 并参与提交。 */
    name?: string
    /** 带透明度，默认关闭。关闭时值串恒为不透明，透明度滑杆与输入框整条禁用。 */
    alpha?: boolean
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 文字方向。只改写横轴（取色区的饱和度、通道滑杆）上左右两键与指针的语义。 */
    dir?: Direction
    placement?: Placement
    offset?: number
    translations?: Partial<ColorPickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: ColorPickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ColorPickerOpenChangeDetails) => void
    /** 格式、文本、颜色解析或屏幕取色失败；与 value / open 事件独立。 */
    onColorError?: (details: ColorPickerErrorDetails) => void
  }
  context: {
    /** 值串。受控（value 提供）时 cell 直读 prop。 */
    value: string
    /** 工作色的锚：上一次由内部操作产出的 HSVA 与对应的串，灰度处的色相依靠它保留。 */
    anchor: ColorAnchor | null
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 某个输入框中尚未接受的草稿；null = 无人编辑，输入框显示规范文本。 */
    draft: ColorPickerDraft | null
    /** 指针正在拖动的部位；拖动结束即清空。 */
    dragTarget: ColorPickerDragTarget | null
    /** 宿主环境是否有 EyeDropper；取色按钮据此禁用。 */
    eyeDropperSupported: boolean
    /** 格式、文本、颜色解析与屏幕取色四路错误。 */
    errors: ColorPickerErrors
  }
  computed: Record<string, never>
  refs: ColorPickerRefs
  state: 'closed' | 'open' | 'open.idle' | 'open.dragging' | 'open.picking'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 整体改写颜色（预设色板、屏幕取色、外部 setValue 都经过它）；解析失败时原值不变并报告来源。 */
    | { type: 'VALUE.SET', value: string, source?: 'api' | 'swatch' }
    /** 取色区按比例落点（0-1），由拖动路径发出。 */
    | { type: 'AREA.SET', x: number, y: number }
    /** 取色区上按方向键移动一格。 */
    | { type: 'AREA.STEP', axis: 'x' | 'y', direction: 1 | -1, large?: boolean }
    /** 取色区某条轴取端点。 */
    | { type: 'AREA.TO_EDGE', axis: 'x' | 'y', edge: 'min' | 'max' }
    /** 某条内嵌颜色滑块推出了新的工作色；串是有损的，灰度处的色相只能从这里获取。 */
    | { type: 'HSVA.SET', hsva: ColorHsva }
    /** 用户在数值框中输入：保留草稿，可接受时立即接受。 */
    | { type: 'INPUT.CHANGE', channel: ColorPickerInputChannel, value: string }
    /** 接受数值框（回车或失焦）：可接受时落值，不可接受时保留草稿与错误。 */
    | { type: 'INPUT.COMMIT', channel: ColorPickerInputChannel }
    | { type: 'DRAG.START', target: ColorPickerDragTarget, point: ColorPickerPoint }
    | { type: 'DRAG.MOVE', point: ColorPickerPoint }
    | { type: 'DRAG.END' }
    /** 唤起屏幕取色。 */
    | { type: 'EYE_DROPPER.OPEN' }
    | { type: 'EYE_DROPPER.RESULT', value: string }
    /** 用户按 Esc 放弃取色。 */
    | { type: 'EYE_DROPPER.CANCEL' }
    | { type: 'EYE_DROPPER.ERROR', cause: unknown }
    | { type: 'ERROR.CLEAR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isOpenControlled' | 'canInteract' | 'canPick'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'syncValueError'
    | 'syncFormatError'
    | 'syncEyeDropperSupport'
    | 'setValue'
    | 'setArea'
    | 'stepArea'
    | 'areaToEdge'
    | 'setHsva'
    | 'setDraft'
    | 'commitDraft'
    | 'clearDraft'
    | 'startDrag'
    | 'dragMove'
    | 'endDrag'
    | 'setValueFromEyeDropper'
    | 'setEyeDropperError'
    | 'clearEyeDropperError'
    | 'clearErrors'
    | 'resetToDefault'
  effect: 'trackPosition' | 'trackLayer' | 'trackPointer' | 'runEyeDropper'
}

export interface ColorPickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前值串（与 onValueChange 发出的是同一个）。 */
  value: string
  rgba: ColorRgba
  /** 工作色。取色区与色相滑杆读取的都是它。 */
  hsva: ColorHsva
  format: ColorFormat
  alpha: boolean
  disabled: boolean
  readOnly: boolean
  /** 指针正在拖动某一部位。 */
  dragging: boolean
  /** 屏幕取色正在进行。 */
  picking: boolean
  eyeDropperSupported: boolean
  /** 格式、文本、颜色解析与屏幕取色四路互不覆盖的错误。 */
  errors: ColorPickerErrors
  /** 预设色板（原样透传 swatches prop，默认为空数组）。 */
  swatches: string[]
  /** 色相颜色滑块的 api：部件属性与取值都从这里获取，DOM 带 data-scope="color-slider"。 */
  hueSlider: ColorSliderApi<T>
  /** 透明度颜色滑块的 api。 */
  alphaSlider: ColorSliderApi<T>
  /** 预设色板的 api，DOM 带 data-scope="color-swatch-picker"。 */
  swatchPicker: ColorSwatchPickerApi<T>
  /** 某个数值框当前应显示的文字（有草稿显示草稿，否则显示规范文本）。 */
  inputText: (channel: ColorPickerInputChannel) => string
  setOpen: (next: boolean) => void
  setValue: (next: string) => void
  /** 清除四路显式错误；屏幕取色重试也会先清除自己那一路。 */
  clearError: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getTriggerProps: () => T['button']
  getValueTextProps: () => T['element']
  getSwatchProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getSaturationAreaProps: () => T['element']
  getAreaThumbProps: () => T['element']
  /** 色相滑块的挂载点，同时充当该滑块的根节点：滑块 root 的状态标记同步写在它身上。 */
  getHueSliderProps: () => T['element']
  /** 透明度滑块的挂载点，同上。 */
  getAlphaSliderProps: () => T['element']
  getChannelInputProps: (props: ColorPickerInputProps) => T['input']
  getEyeDropperTriggerProps: () => T['button']
  /** 预设色板的挂载点，同时充当色板的根节点（role=radiogroup 与键盘处理都在它身上）。 */
  getSwatchPickerProps: () => T['element']
  /** 表单影子：值随表单提交。提供 name 后才带 name，未提供时不参与提交。 */
  getHiddenInputProps: () => T['input']
}
