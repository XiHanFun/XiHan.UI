import type { Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface SliderValueChangeDetails {
  value: number[]
}

export interface SliderValueChangeEndDetails {
  value: number[]
  /** 刚被推动的那个滑块的下标。 */
  index: number
}

export interface SliderPoint {
  clientX: number
  clientY: number
}

export interface SliderValueTextDetails {
  value: number
  /** 第几个滑块；多滑块时用来区分"起点"与"终点"。 */
  index: number
}

export interface SliderSchema extends MachineSchema {
  props: {
    value?: number[]
    defaultValue?: number[]
    min?: number
    max?: number
    step?: number
    /** PageUp / PageDown 的步长，默认 10 倍 step。 */
    largeStep?: number
    orientation?: Orientation
    dir?: Direction
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定拇指直径与轨道厚度 */
    size?: Size
    /** 表单字段名；多滑块时逐个 append。 */
    name?: string
    /** 相邻滑块至少隔几格，默认 0（可以贴在一起但不能交换顺序）。 */
    minStepsBetweenThumbs?: number
    /**
     * 把值翻成人话，产出写进拇指的 aria-valuetext。
     * 不给就不写这个属性，读屏退回念 aria-valuenow。
     */
    getValueText?: (details: SliderValueTextDetails) => string
    /** 每次推动都发；拖动过程中会连续发很多次。 */
    onValueChange?: (details: SliderValueChangeDetails) => void
    /** 只在一次操作结束时发一次，适合拿来发请求。 */
    onValueChangeEnd?: (details: SliderValueChangeEndDetails) => void
  }
  context: {
    value: number[]
    /** 正在被推动的滑块下标：拖动期间是被抓住的那个，键盘操作时是聚焦的那个。 */
    activeIndex: number
  }
  computed: Record<string, never>
  refs: {
    getTrackEl: () => HTMLElement | null
  }
  state: 'idle' | 'dragging'
  event:
    /** 整组赋值（作者的命令式出口）；写入前会逐个吸到 step 网格并按邻居顺序归位。 */
    | { type: 'VALUE.SET', value: number[] }
    | { type: 'THUMB.STEP', index: number, direction: 1 | -1, large?: boolean }
    | { type: 'THUMB.TO_MIN', index: number }
    | { type: 'THUMB.TO_MAX', index: number }
    | { type: 'THUMB.SET', index: number, value: number }
    | { type: 'THUMB.FOCUS', index: number }
    | { type: 'DRAG.START', point: SliderPoint }
    | { type: 'DRAG.MOVE', point: SliderPoint }
    | { type: 'DRAG.END' }
  tag: never
  guard: 'canDrag'
  action:
    | 'setValue'
    | 'stepThumb'
    | 'thumbToMin'
    | 'thumbToMax'
    | 'setThumb'
    | 'setActiveIndex'
    | 'grabNearestThumb'
    | 'dragThumb'
    | 'invokeChangeEnd'
  effect: 'trackPointer'
}

export interface SliderThumbState {
  index: number
  value: number
  /** 这个滑块在轨道上的位置，0-1。作者拿它定位。 */
  percent: number
  /** 它自己能走到的范围（被邻居挡住的那部分不算）。 */
  min: number
  max: number
}

export interface SliderApi<T extends PropTypes = PropTypes> {
  value: number[]
  /** 已选区间在轨道上的起止，0-1。 */
  range: { start: number, end: number }
  thumbs: SliderThumbState[]
  dragging: boolean
  disabled: boolean
  readOnly: boolean
  setValue: (next: number[]) => void
  setThumbValue: (index: number, next: number) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
  getThumbProps: (index: number) => T['element']
  getHiddenInputProps: (index: number) => T['input']
}
