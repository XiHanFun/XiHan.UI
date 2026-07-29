import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface AccordionValueChangeDetails {
  value: string[]
}

/** 条目自报的身份与可用性。 */
export interface AccordionItemProps {
  /** 条目身份，落到 data-value。 */
  value: string
  disabled?: boolean
}

export interface AccordionSchema extends MachineSchema {
  props: {
    /** 展开集合，给定即受控。 */
    value?: string[]
    defaultValue?: string[]
    /** 允许多项同时展开；false 时展开一项即收起其余。 */
    multiple?: boolean
    /** 允许把最后一个展开项收起，默认 false。 */
    collapsible?: boolean
    /** 方向键轴向，默认 vertical。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；影响水平轴上 ArrowLeft/ArrowRight 的语义。 */
    dir?: Direction
    /** 展开集合变化回调。 */
    onValueChange?: (details: AccordionValueChangeDetails) => void
  }
  context: { value: string[] }
  computed: Record<string, never>
  refs: Record<string, never>
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
  /** 当前展开集合，单开模式下长度 ≤ 1。 */
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
