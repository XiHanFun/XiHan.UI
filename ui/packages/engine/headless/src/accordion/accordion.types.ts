/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 accordion 类型契约。

import type { ControlVariant, Direction, MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface AccordionValueChangeDetails {
  value: string[]
}

/** 条目数据。提供 collection 时，标题文本、正文与禁用以它为准。 */
export interface AccordionNode {
  value: string
  /** 标题文本；默认回退为 value。 */
  label?: string
  /** 正文；需要放置纯文本以外的内容时改用 content 插槽。 */
  content?: string
  /** 条目禁用：方向键跳过该条目，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含展开态。 */
export interface AccordionNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  /** 正文原样透传，未提供时为 undefined。 */
  content?: string
  disabled: boolean
}

/** 条目声明的身份与可用性。 */
export interface AccordionItemProps {
  /** 条目身份，写入 data-value。 */
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

export interface AccordionSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，标题文本、正文与禁用的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本写在部件中、禁用写在条目上的方式。
     */
    collection?: AccordionNode[]
    /** 展开集合，提供即受控。 */
    value?: string[]
    defaultValue?: string[]
    /** 允许多项同时展开；false 时展开一项即收起其余。 */
    multiple?: boolean
    /** 允许收起最后一个展开项，默认 false。 */
    collapsible?: boolean
    /** 方向键到达末尾是否回绕，默认 false。 */
    loop?: boolean
    /** 整组禁用：所有条目都不可切换，条目上的 disabled 只能收紧不能放宽。 */
    disabled?: boolean
    /** 形态：ghost 条目直接相邻不画容器（默认），outline 为单一连续表面，subtle 为淡底。默认 ghost。 */
    variant?: ControlVariant
    /** 方向键轴向，默认 vertical。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；影响水平轴上 ArrowLeft / ArrowRight 的语义。 */
    dir?: Direction
    /** 颜色：brand / neutral / success / warning / danger / info，决定使用哪组状态色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 展开集合变化回调。 */
    onValueChange?: (details: AccordionValueChangeDetails) => void
  }
  context: {
    value: string[]
    /**
     * 按压通道：正被 Space / Enter 或触屏手指按住的 trigger 的 value，该 trigger 投影 data-pressed；没有按住时为 null。
     * 抬起、失焦、指针取消，或按住途中整组转为禁用时撤下。
     */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'VALUE.SET', value: string[] }
    /** 按压通道：某个 trigger 被 Space / Enter 或触屏按住；条目自身的禁用只有 connect 知道，随事件带给守卫。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 该 trigger 抬起、失焦或指针取消。 */
    | { type: 'PRESS.END', value: string }
  tag: never
  guard: 'canPress'
  action: 'toggleItem' | 'setValue' | 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: never
}

export interface AccordionApi<T extends PropTypes = PropTypes> {
  /** 当前展开集合，单开模式下长度 ≤ 1。 */
  value: string[]
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly AccordionNodeMeta[]
  setValue: (next: string[]) => void
  isOpen: (value: string) => boolean
  getRootProps: () => T['element']
  getItemProps: (props: AccordionItemProps) => T['element']
  getItemSeparatorProps: () => T['element']
  getHeaderProps: (props: AccordionItemProps) => T['element']
  getTriggerProps: (props: AccordionItemProps) => T['button']
  getContentProps: (props: AccordionItemProps) => T['element']
  getIndicatorProps: (props: AccordionItemProps) => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface AccordionTranslations {}
