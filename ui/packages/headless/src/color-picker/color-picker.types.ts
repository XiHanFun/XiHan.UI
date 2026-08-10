import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type {
  ColorPickerAnchor,
  ColorPickerChannel,
  ColorPickerFormat,
  ColorPickerHsva,
  ColorPickerInputChannel,
  ColorPickerRgba,
} from './color-picker.color'
import type { ColorPickerPoint } from './color-picker.geometry'

/** 正被指针拖着的是哪一处。 */
export type ColorPickerDragTarget = 'area' | ColorPickerChannel

/** 某个输入框里那串还没收下的字。同一时刻只会有一个框在编辑（就是聚焦的那个）。 */
export interface ColorPickerDraft {
  channel: ColorPickerInputChannel
  text: string
}

/** 读屏用的文案，默认英文。取色区与两条通道滑杆没有可见标题，名字只能从这里来。 */
export interface ColorPickerTranslations {
  /** 二维取色区的名字。 */
  area: string
  /** 取色区的播报文本。 */
  areaValueText: (saturation: number, brightness: number) => string
  /** 通道滑杆的名字。 */
  channel: (channel: ColorPickerChannel) => string
  /** 通道滑杆的播报文本（带单位的那一版）。 */
  channelValueText: (channel: ColorPickerChannel, value: number) => string
  /** 数值输入框的名字。 */
  input: (channel: ColorPickerInputChannel) => string
  /** 预设色板里一格的名字。 */
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
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点。 */
  getContentEl: () => HTMLElement | null
  /** 二维取色区本体：坐标换算以它的矩形为准，矩形在事件那一刻才量。 */
  getAreaEl: () => HTMLElement | null
  /** 某条通道的轨道本体，同样只在事件那一刻量。 */
  getChannelTrackEl: (channel: ColorPickerChannel) => HTMLElement | null
}

export interface ColorPickerValueChangeDetails {
  /** 按 format 序列化好的值串。 */
  value: string
}

export interface ColorPickerOpenChangeDetails {
  open: boolean
}

/** 通道滑杆三件套自报的身份：作者在部件上声明，connect 据此产出属性。 */
export interface ColorPickerChannelProps {
  channel: ColorPickerChannel
}

/** 数值输入框自报的身份。 */
export interface ColorPickerInputProps {
  channel: ColorPickerInputChannel
}

/** 预设色板一格自报的颜色。 */
export interface ColorPickerSwatchItemProps {
  value: string
}

export interface ColorPickerSchema extends MachineSchema {
  props: {
    /** 颜色值串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 值串的写法，默认 hex。改它只改对外的序列化，工作色恒是 HSVA。 */
    format?: ColorPickerFormat
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 整个控件禁用：trigger 与两个按钮走原生 disabled，取色区与滑杆退出 Tab 序列。 */
    disabled?: boolean
    /** 只读：浮层照开（看得见当前颜色），但任何改值的动作都不发生。 */
    readOnly?: boolean
    /** 预设色板。作者据此渲染 swatch-item，组件只负责标出哪一格正被选中。 */
    swatches?: string[]
    /** 带透明度，默认关。关掉时值串恒不透明，透明度那条滑杆与输入框整条禁用。 */
    alpha?: boolean
    /** 文字方向。只改写横轴（取色区的饱和度、通道滑杆）上左右两键与指针的语义。 */
    dir?: Direction
    placement?: Placement
    offset?: number
    translations?: Partial<ColorPickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: ColorPickerValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: ColorPickerOpenChangeDetails) => void
  }
  context: {
    /** 值串。受控（value 给定）时 cell 直读 prop。 */
    value: string
    /** 工作色的锚：上一次由内部操作产出的 HSVA 与它对应的串，灰度处的色相靠它保住。 */
    anchor: ColorPickerAnchor | null
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 某个输入框里还没收下的半截字；null = 没人在编辑，输入框显示规范文本。 */
    draft: ColorPickerDraft | null
    /** 指针正拖着哪一处；拖动结束即清空。 */
    dragTarget: ColorPickerDragTarget | null
    /** 宿主环境有没有 EyeDropper；取色按钮据此禁用。 */
    eyeDropperSupported: boolean
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
    /** 整体改写颜色（预设色板、屏幕取色、外部 setValue 都走它）；解析不出的串原地不动。 */
    | { type: 'VALUE.SET', value: string }
    /** 取色区按比例落点（0-1），由拖动路径发出。 */
    | { type: 'AREA.SET', x: number, y: number }
    /** 取色区上按方向键走一格。 */
    | { type: 'AREA.STEP', axis: 'x' | 'y', direction: 1 | -1, large?: boolean }
    /** 取色区某条轴取端点。 */
    | { type: 'AREA.TO_EDGE', axis: 'x' | 'y', edge: 'min' | 'max' }
    | { type: 'CHANNEL.SET', channel: ColorPickerChannel, value: number }
    | { type: 'CHANNEL.STEP', channel: ColorPickerChannel, direction: 1 | -1, large?: boolean }
    | { type: 'CHANNEL.TO_EDGE', channel: ColorPickerChannel, edge: 'min' | 'max' }
    /** 用户在数值框里打字：留下草稿，能收就顺手收下。 */
    | { type: 'INPUT.CHANGE', channel: ColorPickerInputChannel, value: string }
    /** 收下数值框（回车或失焦）：收得了就落值，收不了就复原成规范文本。 */
    | { type: 'INPUT.COMMIT', channel: ColorPickerInputChannel }
    | { type: 'DRAG.START', target: ColorPickerDragTarget, point: ColorPickerPoint }
    | { type: 'DRAG.MOVE', point: ColorPickerPoint }
    | { type: 'DRAG.END' }
    /** 唤起屏幕取色。 */
    | { type: 'EYE_DROPPER.OPEN' }
    | { type: 'EYE_DROPPER.RESULT', value: string }
    /** 用户按 Esc 放弃取色、或接口报错。 */
    | { type: 'EYE_DROPPER.CANCEL' }
  tag: never
  guard: 'isOpenControlled' | 'canInteract' | 'canPick'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'syncEyeDropperSupport'
    | 'setValue'
    | 'setArea'
    | 'stepArea'
    | 'areaToEdge'
    | 'setChannel'
    | 'stepChannel'
    | 'channelToEdge'
    | 'setDraft'
    | 'commitDraft'
    | 'clearDraft'
    | 'startDrag'
    | 'dragMove'
    | 'endDrag'
    | 'setValueFromEyeDropper'
  effect: 'trackPosition' | 'trackLayer' | 'trackPointer' | 'runEyeDropper'
}

/** 通道滑杆当下的取值与位置，作者拿它自己排版时用得上。 */
export interface ColorPickerChannelState {
  channel: ColorPickerChannel
  value: number
  min: number
  max: number
  /** 值在轨道上的位置，0-1。 */
  percent: number
}

export interface ColorPickerApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前值串（与 onValueChange 送出的是同一个）。 */
  value: string
  rgba: ColorPickerRgba
  /** 工作色。取色区与色相滑杆读的都是它。 */
  hsva: ColorPickerHsva
  format: ColorPickerFormat
  alpha: boolean
  disabled: boolean
  readOnly: boolean
  /** 指针正拖着某一处。 */
  dragging: boolean
  /** 屏幕取色正在进行。 */
  picking: boolean
  eyeDropperSupported: boolean
  /** 预设色板（原样透传 swatches prop，缺省是空数组）。 */
  swatches: string[]
  isSwatchSelected: (value: string) => boolean
  channelState: (channel: ColorPickerChannel) => ColorPickerChannelState
  /** 某个数值框此刻该显示的字（有草稿显示草稿，否则显示规范文本）。 */
  inputText: (channel: ColorPickerInputChannel) => string
  setOpen: (next: boolean) => void
  setValue: (next: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getTriggerProps: () => T['button']
  getValueTextProps: () => T['element']
  getSwatchProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getAreaProps: () => T['element']
  getAreaThumbProps: () => T['element']
  getChannelSliderProps: (props: ColorPickerChannelProps) => T['element']
  getChannelSliderTrackProps: (props: ColorPickerChannelProps) => T['element']
  getChannelSliderThumbProps: (props: ColorPickerChannelProps) => T['element']
  getChannelInputProps: (props: ColorPickerInputProps) => T['input']
  getEyeDropperTriggerProps: () => T['button']
  getSwatchGroupProps: () => T['element']
  getSwatchItemProps: (props: ColorPickerSwatchItemProps) => T['button']
}
