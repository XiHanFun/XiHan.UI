import type { Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface AccordionValueChangeDetails {
  value: string[]
}

/** 条目数据。给了 collection，标题文本、正文与禁用就以它为准。 */
export interface AccordionNode {
  value: string
  /** 标题文本；缺省退回 value。 */
  label?: string
  /** 正文；要放纯文本以外的内容改用 content 插槽。 */
  content?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含展开态。 */
export interface AccordionNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  /** 正文原样透传，没写即为 undefined。 */
  content?: string
  disabled: boolean
}

/** 条目自报的身份与可用性。 */
export interface AccordionItemProps {
  /** 条目身份，落到 data-value。 */
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface AccordionSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，标题文本、正文与禁用的事实源。给了它，条目部件只需报 value。
     * 缺省即回到「文本写在部件里、禁用写在条目上」的老路。
     */
    collection?: AccordionNode[]
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
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
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
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly AccordionNodeMeta[]
  setValue: (next: string[]) => void
  isOpen: (value: string) => boolean
  getRootProps: () => T['element']
  getItemProps: (props: AccordionItemProps) => T['element']
  getHeaderProps: (props: AccordionItemProps) => T['element']
  getTriggerProps: (props: AccordionItemProps) => T['button']
  getContentProps: (props: AccordionItemProps) => T['element']
  getIndicatorProps: (props: AccordionItemProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface AccordionTranslations {}
