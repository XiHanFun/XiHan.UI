/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 date field 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 一段的身份。日期三段恒存在，时间三段由 granularity 决定是否存在。 */
/**
 * 段位是可自由组合的单元：作者按组件需要选择书写。
 * 季度与周不另立值形态，各自派生出月与日（季度取该季的首月、周取该周的周首日）。
 * 上下午自身不带独立的量，只改写小时。
 */
export type DateSegmentType
  = | 'year'
    | 'quarter'
    | 'month'
    | 'week'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second'
    | 'dayPeriod'

/**
 * 一份段集：作者需要哪几段就书写哪几段。
 * 归一后是有序的（年 季度 月 周 日 时 分 秒 上下午），乱序书写也会排回。
 *
 * 季度与周不另立值形态，各自派生出月与日（季度取该季的首月、周取该周的周首日），
 * 缺失的粗段按该段的起点补齐：只有年即为 1 月 1 日。季度与月、周与日两两互斥，都书写时保留细的一段。
 */
export type DateSegmentSet = readonly DateSegmentType[]

/** 精度：决定共有几段，也决定产出的 ISO 串截止到哪一位。 */
export type DateGranularity = 'day' | 'hour' | 'minute' | 'second'

/** 半天：上午或下午。上下午段接收的即这两个值。 */
export type DateDayPeriod = 'am' | 'pm'

/**
 * 各段的值，缺键即该段尚未填写。
 * 只有当前使用的各段全部填齐，才能拼出 ISO 串。
 *
 * 段集中带上下午时，hour 存的是 12 时制的值（1-12），24 时制的小时由它与上下午合成。
 */
export type DateSegments = { readonly [K in DateSegmentType]?: number }

/** 某一段的取值区间（含两端）。上下键在该区间内回绕，读屏据此朗读 aria-value*。 */
export interface DateSegmentRange {
  min: number
  max: number
}

/**
 * 正在输入的段的数字缓冲。
 *
 * 只有值不够：连续输入 "0"、"7" 与直接输入 "7" 都是 7，但前者已用掉两位应跳段。
 * 位数只能依靠原始数字串记录。
 */
export interface DateTypingBuffer {
  segment: DateSegmentType
  /** 已输入的数字串，含前导零。 */
  digits: string
}

export interface DateFieldValueChangeDetails {
  /** ISO 串；任一必需段未填齐时为 null。granularity 决定截止到哪一位。 */
  value: string | null
}

/**
 * 段位声明。两种写法任选其一：
 *
 * - 按下标：`index`，具体是哪一段由 locale 与段集计算：同一份标记更换 locale 即更换形态；
 * - 按段名：`segment`，固定该格为季度 / 周 / 上下午。段集中没有该段时该节点收起。
 *
 * 两者都提供时按段名计算：它更具体。都不提供等同于下标越界，该格收起。
 */
export interface DateFieldSegmentProps {
  index?: number
  segment?: DateSegmentType
}

/** 单段的对外投影，作者据此渲染文字与皮肤。 */
export interface DateFieldSegmentState {
  /** 文档序下标，与作者声明的 index 一致。 */
  index: number
  type: DateSegmentType
  /** 已填的数值；未填时为 null。 */
  value: number | null
  /** 应显示的文字：正在输入时是原始数字串，已填时是补零后的数字，未填时是占位串。 */
  text: string
  /** 未填时显示的占位串。 */
  placeholder: string
  /** 读屏朗读该段的名字。 */
  label: string
  empty: boolean
  min: number
  max: number
  focused: boolean
}

export interface DateFieldSchema extends MachineSchema {
  props: {
    /** 受控值，ISO 串（'2026-07-28' / '2026-07-28T13:45'）；null 表示空。提供即受控。 */
    value?: string | null
    /** 非受控初值，同样是 ISO 串。 */
    defaultValue?: string | null
    /** 下界，ISO 串。参与各段区间的收窄，并决定 outOfRange。 */
    min?: string
    /** 上界，ISO 串。 */
    max?: string
    /** BCP 47 语言标记，决定年月日三段的先后。未提供时按宿主语言，宿主也没有时按 en-US（月日年）排列。 */
    locale?: string
    /** IANA 时区名，只用于取今天：空段上按上下键时从今天的对应位起步。 */
    timeZone?: string
    /** 精度，默认 day（只有年月日三段）。提供 segments 时它不再生效。 */
    granularity?: DateGranularity
    /**
     * 段集：该控件由哪几段组成，提供后以它为准，granularity 让位。写 `['year', 'quarter']`
     * 得到「2026 Q2」、`['year', 'week']` 得到「2026 33」。归一后为空（如 `[]`）视同未提供。
     * 值仍是 ISO 日期（时间）串，因此段集中必须有 year，否则段位可编辑但无法拼出值。
     */
    segments?: DateSegmentSet
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    required?: boolean
    /** 表单字段名；提供后隐藏输入才带 name，ISO 串随表单一并提交。 */
    name?: string
    /** 各段未填时显示的占位串，逐段覆盖内置默认（yyyy / mm / dd / hh / mm / ss）。 */
    placeholder?: { readonly [K in DateSegmentType]?: string }
    /** 各段的读屏名字，逐段覆盖内置默认。段是 spinbutton，没有名字时读屏只能朗读一串数字。 */
    translations?: DateFieldTranslations
    /** 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    onValueChange?: (details: DateFieldValueChangeDetails) => void
  }
  context: {
    /**
     * ISO 串，空串表示没有值。受控（提供 value）时 cell 直读 prop。
     * 内部不使用 null：cell 的初值取 `defaultValue ?? value`，null 会在这一步被吞掉。
     */
    value: string
    /**
     * 逐段的编辑缓冲。它不是 value 的镜像：段位允许不完整，而 ISO 串不允许。
     * 值由段位计算得出，段位则在 value 变化时反向对齐。
     */
    segments: DateSegments
    /** 正在输入的数字缓冲；换段、失焦、输满都会收尾并清除。 */
    typing: DateTypingBuffer | null
    /** 焦点所在的段；焦点在组外时为 null。 */
    focusedSegment: DateSegmentType | null
    /** 按压通道：清空按钮被 Space / Enter 或触屏按住期间为 true；抬起、失焦、指针取消或清不了时即撤下。 */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：全部状态都在 context 中。 */
  state: 'idle'
  event:
    /** 整份替换（外部 setValue）：段位随之重排。 */
    | { type: 'VALUE.SET', value: string | null }
    /** 清空所有段。 */
    | { type: 'VALUE.CLEAR' }
    /** 上下键：某段加减一，到区间两端回绕；空段则落到今天的对应位。 */
    | { type: 'SEGMENT.STEP', segment: DateSegmentType, delta: 1 | -1 }
    /** 数字键：向某段再输入一位。越界的那一位被视为新的一位重新开始。 */
    | { type: 'SEGMENT.TYPE', segment: DateSegmentType, digit: string }
    /** 清除某一段（Backspace）。上下午段没有独立的量，清除它是空操作。 */
    | { type: 'SEGMENT.CLEAR', segment: DateSegmentType }
    /** 直接指定上午 / 下午（a / p 键）：改写的是小时，不落独立的量。 */
    | { type: 'SEGMENT.PERIOD', period: DateDayPeriod }
    | { type: 'SEGMENT.FOCUS', segment: DateSegmentType }
    | { type: 'SEGMENT.BLUR' }
    | { type: 'FORM.RESET' }
    /** 清空按钮被 Space / Enter 或触屏按住；清不了（禁用、只读或一段都没填）时被守卫拦截。 */
    | { type: 'PRESS.START' }
    /** 按住的清空按钮抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
  tag: never
  guard: 'canEdit' | 'canPress'
  action:
    | 'syncSegmentsFromValue'
    | 'syncSegmentsFromSet'
    | 'setValue'
    | 'clearValue'
    | 'stepSegment'
    | 'typeSegment'
    | 'clearSegment'
    | 'setDayPeriod'
    | 'finalizeTyping'
    | 'setFocusedSegment'
    | 'clearFocusedSegment'
    | 'resetToDefault'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

export interface DateFieldApi<T extends PropTypes = PropTypes> {
  /** ISO 串；段位未填齐时为 null。 */
  value: string | null
  /** 同一个值的原生 Date；空值或无法计算时为 null。按 timeZone 换算。 */
  valueAsDate: Date | null
  /** 逐段投影，文档序即当前的段序（提供 segments 时是其归一后的顺序，否则由 locale 排列）。 */
  segments: DateFieldSegmentState[]
  /** 段位已填齐（value 非 null）。 */
  complete: boolean
  /** 没有任何段已填。 */
  empty: boolean
  /** 已填齐但落在 min / max 之外。 */
  outOfRange: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 焦点所在的段；焦点在组外时为 null。 */
  focusedSegment: DateSegmentType | null
  locale: string
  granularity: DateGranularity
  /** 直接写整份值；传 null 等于清空。 */
  setValue: (next: string | null) => void
  /** 清空全部段位；disabled / readOnly 下不生效。 */
  clear: () => void
  /** 清空按钮当前是否可用：有段已填值、且可编辑。 */
  canClear: boolean
  getRootProps: () => T['element']
  /** 标题不是原生 label（段位是 div，不可被 label 标注），点击它由连接层代为把焦点送进首段。 */
  getLabelProps: () => T['element']
  /** role=group 的分段容器。 */
  getControlProps: () => T['element']
  /** 段位与分隔符的外壳：占满盒内剩余宽度，把清空按钮推到框内末端。 */
  getSegmentGroupProps: () => T['element']
  /** 作者的声明落在哪一段上；段集中没有该段（或下标越界）时缺席。文字由适配器按它渲染。 */
  segmentOf: (props: DateFieldSegmentProps) => DateFieldSegmentState | undefined
  getSegmentProps: (props: DateFieldSegmentProps) => T['element']
  /** 清空按钮：不占 Tab 位，无值或不可编辑时收起；点击后焦点回到首段。 */
  getClearTriggerProps: () => T['button']
  /** 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案：逐段的名字（段是 spinbutton，没有名字时读屏只能朗读一串数字），以及清空按钮的名字。 */
export type DateFieldTranslations = { readonly [K in DateSegmentType]?: string } & {
  /** 清空按钮的 aria-label，默认 'Clear'。 */
  readonly clearTrigger?: string
}
