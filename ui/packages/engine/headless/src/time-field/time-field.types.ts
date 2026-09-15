/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 time field 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 段的身份。dayPeriod 只在 12 小时制下存在，second 只在 granularity 为 second 时存在。 */
export type TimeSegmentType = 'hour' | 'minute' | 'second' | 'dayPeriod'

/** 值精确到哪一段。它同时决定值串的形状与参与显示的段。 */
export type TimeGranularity = 'hour' | 'minute' | 'second'

/** 小时制。12 表示时段显示 1-12 并额外多出一个上午 / 下午段。 */
export type TimeHourCycle = 12 | 24

export type TimeDayPeriod = 'am' | 'pm'

/**
 * 逐段的编辑缓冲：每段可以单独为空，因此不能用一个时间对象表示。
 * hour 一律以 24 小时制存储（0-23），12 小时制只是段上的显示形态。
 * dayPeriod 只在 hour 为空时有意义，用于记录用户在填写小时之前按下的 A/P。
 */
export interface TimeDraft {
  hour: number | null
  minute: number | null
  second: number | null
  dayPeriod: TimeDayPeriod | null
}

export interface TimeFieldValueChangeDetails {
  /** ISO 时间串：'13:45' 或 '13:45:30'（形状随 granularity）。任一必填段为空时是空串。 */
  value: string
}

/**
 * 段的声明：身份由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TimeFieldSegmentProps {
  segment: TimeSegmentType
}

export interface TimeFieldSchema extends MachineSchema {
  props: {
    /** 受控值，ISO 时间串。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 下界（含）。只用于标注越界，不改写用户填写的内容。 */
    min?: string
    /** 上界（含）。同上。 */
    max?: string
    /** BCP 47 语言标记。决定上午 / 下午的文字，以及未显式提供 hourCycle 时的小时制。 */
    locale?: string
    /** 小时制。未提供时按 locale 推断，locale 也没有时使用 24。 */
    hourCycle?: TimeHourCycle
    /** 值精确到哪一段，默认 minute。 */
    granularity?: TimeGranularity
    /** 禁用：段整体退出 Tab 序列、键盘一概不响应，隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：仍可聚焦、可用左右键在段间移动，但不可修改值。 */
    readOnly?: boolean
    /** 校验失败标注。 */
    invalid?: boolean
    /** 必填标注（写入每段的 aria-required）。 */
    required?: boolean
    /** 表单字段名；提供后隐藏输入才带 name，值随表单一并提交。 */
    name?: string
    /** 空段的占位字符（单字符），按段宽重复，默认 '-'。 */
    placeholder?: string
    /** 形态：outline / subtle / ghost，决定描边与底色的使用方式。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    /** 段位读屏名的覆盖；未提供时使用内置英文语义名。 */
    translations?: Partial<TimeFieldTranslations>
    onValueChange?: (details: TimeFieldValueChangeDetails) => void
  }
  context: {
    /** ISO 时间串；任一必填段为空时为空串。受控（value 提供）时 cell 直读 prop。 */
    value: string
    /** 逐段编辑缓冲。只在 value 不是可解析的时间时才用它显示。 */
    draft: TimeDraft
    /** 焦点所在段；焦点在整组之外时为 null。同时是 roving tabindex 的锚点。 */
    focusedSegment: TimeSegmentType | null
    /** 当前段已输入的数字串。换段、加减、清段都会清除它。 */
    typeBuffer: string
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：本组件没有任何随时间推移的过程，值与编辑缓冲都存放在 context cell 中。 */
  state: 'idle'
  event:
    /** 整份替换（外部 setValue）；无法解析的串等同于清空。 */
    | { type: 'VALUE.SET', value: string }
    /** 清空所有段。 */
    | { type: 'VALUE.CLEAR' }
    /** 上下键：把某一段加减一格，越界回绕。 */
    | { type: 'SEGMENT.STEP', segment: TimeSegmentType, delta: 1 | -1 }
    /** 数字直输：把一位数字并入当前段的输入缓冲。 */
    | { type: 'SEGMENT.DIGIT', segment: TimeSegmentType, digit: string }
    /** 清除某一段。 */
    | { type: 'SEGMENT.CLEAR', segment: TimeSegmentType }
    /** 直接指定上午 / 下午（按 a/p 键）。 */
    | { type: 'SEGMENT.PERIOD', period: TimeDayPeriod }
    | { type: 'SEGMENT.FOCUS', segment: TimeSegmentType }
    | { type: 'SEGMENT.BLUR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit'
  action:
    | 'setValue'
    | 'clearValue'
    | 'stepSegment'
    | 'typeDigit'
    | 'clearSegment'
    | 'setPeriod'
    | 'setFocusedSegment'
    | 'clearFocusedSegment'
    | 'syncDraft'
    | 'resetToDefault'
  effect: never
}

export interface TimeFieldApi<T extends PropTypes = PropTypes> {
  /** ISO 时间串；任一必填段为空时为空串。 */
  value: string
  /** 值为空串（尚未填全）。作者据此启用提交按钮或显示提示。 */
  empty: boolean
  /** 已填全但落在 min / max 之外。只是标注，不改写值。 */
  outOfRange: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 有值且可编辑（既不 disabled 也不 readOnly）；清空按钮据此显隐。 */
  canClear: boolean
  /** 实际生效的小时制（prop 未提供时由 locale 推断的值）。 */
  hourCycle: TimeHourCycle
  granularity: TimeGranularity
  /** 当前参与显示的段，文档序。未列入的段由 connect 写上 hidden 收起。 */
  segments: TimeSegmentType[]
  /** 焦点所在段；焦点在组外时为 null。 */
  focusedSegment: TimeSegmentType | null
  /** 某一段应显示的文字（空段是占位串）。各适配器都用它填充文本，保证同构。 */
  getSegmentText: (props: TimeFieldSegmentProps) => string
  setValue: (next: string) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  /** 段位与分隔符的外壳：占满盒内剩余宽度，把清空按钮推到框内末端。 */
  getSegmentGroupProps: () => T['element']
  getSegmentProps: (props: TimeFieldSegmentProps) => T['element']
  /** 清空按钮：有值才显示，不占 Tab 位，点击后焦点回到第一段。 */
  getClearTriggerProps: () => T['button']
  /** 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案。 */
export interface TimeFieldTranslations {
  /** 小时段的可及名。 */
  hour: string
  /** 分钟段的可及名。 */
  minute: string
  /** 秒段的可及名。 */
  second: string
  /** 上午下午段的可及名。 */
  dayPeriod: string
  /** 清空按钮的可及名。 */
  clearTrigger: string
}
