import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface AccordionValueChangeDetails {
  value: string[]
}

/**
 * 条目自报的身份与可用性。
 * connect 的每个条目级 getter 都是 (机器上下文, 这份入参) 的纯函数：
 * 条目是第几个、谁是第一个都不需要，也就不必反查 DOM。
 */
export interface AccordionItemProps {
  /** 条目身份，落到 data-value；选中与方向键导航都以它为准。 */
  value: string
  disabled?: boolean
}

export interface AccordionSchema extends MachineSchema {
  props: {
    /** 展开集合。给定即受控：内部不再自改，只发 onValueChange。 */
    value?: string[]
    defaultValue?: string[]
    /** 允许多项同时展开；false 时展开一项即收起其余。 */
    multiple?: boolean
    /** 允许把最后一个展开项收起，默认 false。 */
    collapsible?: boolean
    /** 方向键轴向，默认 vertical。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的语义。 */
    dir?: Direction
    /** 展开集合变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: AccordionValueChangeDetails) => void
  }
  /** 展开集合住在 cell 里：cell 自带受控语义（value 给定就直读 prop、set 只发回调）。 */
  context: { value: string[] }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 选中值不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'VALUE.SET', value: string[] }
  tag: never
  guard: never
  action: 'toggleItem' | 'setValue'
  effect: never
}

export interface AccordionApi<T extends PropTypes = PropTypes> {
  /** 当前展开集合。单开模式下也是数组（长度 ≤ 1），不随 multiple 变类型。 */
  value: string[]
  setValue: (next: string[]) => void
  isOpen: (value: string) => boolean
  getRootProps: () => T['element']
  getItemProps: (props: AccordionItemProps) => T['element']
  getHeaderProps: (props: AccordionItemProps) => T['element']
  getTriggerProps: (props: AccordionItemProps) => T['button']
  getContentProps: (props: AccordionItemProps) => T['element']
  getIndicatorProps: (props: AccordionItemProps) => T['element']
}
