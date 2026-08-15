import type { ControlVariant, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 一段的身份。日期三段恒在，时间三段由 granularity 决定要不要。 */
export type DateSegmentType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

/** 精度：决定一共有几段，也决定产出的 ISO 串截到哪一位。 */
export type DateGranularity = 'day' | 'hour' | 'minute' | 'second'

/**
 * 各段的值，缺键即这一段还没填。
 * 只有当 granularity 要求的段全部填齐，才拼得出一个 ISO 串。
 */
export type DateSegments = { readonly [K in DateSegmentType]?: number }

/** 某一段的取值区间（含两端）。上下键在这个区间里回绕，读屏据此念出 aria-value*。 */
export interface DateSegmentRange {
  min: number
  max: number
}

/**
 * 正在敲的那一段的数字缓冲。
 *
 * 只有值是不够的：连着敲 "0"、"7" 与直接敲 "7" 都是 7，但前者已用掉两位该跳段。
 * 位数只能靠原始数字串记着。
 */
export interface DateTypingBuffer {
  segment: DateSegmentType
  /** 已敲进去的数字串，含前导零。 */
  digits: string
}

export interface DateFieldValueChangeDetails {
  /** ISO 串；任一必需段没填齐时是 null。granularity 决定截到哪一位。 */
  value: string | null
}

/** 段位自报家门：下标由作者在部件上声明，connect 据此算出这一格是哪一段。 */
export interface DateFieldSegmentProps {
  index: number
}

/** 单段的对外投影，作者据此渲染文字与皮肤。 */
export interface DateFieldSegmentState {
  /** 文档序下标，与作者声明的 index 一致。 */
  index: number
  type: DateSegmentType
  /** 已填的数值；未填时为 null。 */
  value: number | null
  /** 该显示的文字：正在敲就是原始数字串，填好了是补零后的数字，空着是占位串。 */
  text: string
  /** 未填时显示的占位串。 */
  placeholder: string
  /** 读屏念出的这一段叫什么。 */
  label: string
  empty: boolean
  min: number
  max: number
  focused: boolean
}

export interface DateFieldSchema extends MachineSchema {
  props: {
    /** 受控值，ISO 串（'2026-07-28' / '2026-07-28T13:45'）；null 表示空。给定即受控。 */
    value?: string | null
    /** 非受控初值，同样是 ISO 串。 */
    defaultValue?: string | null
    /** 下界，ISO 串。参与各段区间的收窄，并决定 outOfRange。 */
    min?: string
    /** 上界，ISO 串。 */
    max?: string
    /** BCP 47 语言标记，决定年月日三段的先后。不给按 en-US（月日年）排。 */
    locale?: string
    /** IANA 时区名，只用来取「今天」：空段上按上下键时从今天的对应位起步。 */
    timeZone?: string
    /** 精度，默认 day（只有年月日三段）。 */
    granularity?: DateGranularity
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    required?: boolean
    /** 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。 */
    name?: string
    /** 各段未填时显示的占位串，逐段覆盖内置默认（yyyy / mm / dd / hh / mm / ss）。 */
    placeholder?: { readonly [K in DateSegmentType]?: string }
    /** 各段的读屏名字，逐段覆盖内置默认。段是 spinbutton，没有名字读屏只念得出一串数字。 */
    translations?: { readonly [K in DateSegmentType]?: string }
    /** 形态：outline / subtle / ghost，决定描边与底色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    onValueChange?: (details: DateFieldValueChangeDetails) => void
  }
  context: {
    /**
     * ISO 串，空串表示没有值。受控（给了 value）时 cell 直读 prop。
     * 内部不用 null：cell 的初值取 `defaultValue ?? value`，null 会被这一步吃掉。
     */
    value: string
    /**
     * 逐段的编辑缓冲。它不是 value 的镜像：段位允许不完整，而 ISO 串不允许。
     * 值由段位算出来，段位则在 value 变化时反向对齐。
     */
    segments: DateSegments
    /** 正在敲的数字缓冲；换段、失焦、敲满都会收尾并清掉。 */
    typing: DateTypingBuffer | null
    /** 焦点落在哪一段；焦点在组外时为 null。 */
    focusedSegment: DateSegmentType | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：全部状态都在 context 里。 */
  state: 'idle'
  event:
    /** 整份替换（外部 setValue）：段位随之重排。 */
    | { type: 'VALUE.SET', value: string | null }
    /** 清空所有段。 */
    | { type: 'VALUE.CLEAR' }
    /** 上下键：某段加减一，到区间两端回绕；空段则落到今天的对应位。 */
    | { type: 'SEGMENT.STEP', segment: DateSegmentType, delta: 1 | -1 }
    /** 数字键：往某段里再敲一位。越界的那一位被当成新的一位重来。 */
    | { type: 'SEGMENT.TYPE', segment: DateSegmentType, digit: string }
    /** 清掉某一段（Backspace）。 */
    | { type: 'SEGMENT.CLEAR', segment: DateSegmentType }
    | { type: 'SEGMENT.FOCUS', segment: DateSegmentType }
    | { type: 'SEGMENT.BLUR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit'
  action:
    | 'syncSegmentsFromValue'
    | 'setValue'
    | 'clearValue'
    | 'stepSegment'
    | 'typeSegment'
    | 'clearSegment'
    | 'finalizeTyping'
    | 'setFocusedSegment'
    | 'clearFocusedSegment'
    | 'resetToDefault'
  effect: never
}

export interface DateFieldApi<T extends PropTypes = PropTypes> {
  /** ISO 串；段位没填齐时是 null。 */
  value: string | null
  /** 同一个值的原生 Date；空值或算不出来时为 null。按 timeZone 换算。 */
  valueAsDate: Date | null
  /** 逐段投影，文档序即 locale 决定的段序。 */
  segments: DateFieldSegmentState[]
  /** 段位填齐了（value 非 null）。 */
  complete: boolean
  /** 一段都没填。 */
  empty: boolean
  /** 填齐了但落在 min/max 之外。 */
  outOfRange: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 焦点落在哪一段；焦点在组外时为 null。 */
  focusedSegment: DateSegmentType | null
  locale: string
  granularity: DateGranularity
  /** 直接写整份值；传 null 等于清空。 */
  setValue: (next: string | null) => void
  clear: () => void
  getRootProps: () => T['element']
  /** 标题不是原生 label（段位是 div，不可被 label 标注），点它由连接层代为把焦点送进首段。 */
  getLabelProps: () => T['element']
  /** role=group 的分段容器。 */
  getControlProps: () => T['element']
  getSegmentProps: (props: DateFieldSegmentProps) => T['element']
  /** 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface DateFieldTranslations {}
