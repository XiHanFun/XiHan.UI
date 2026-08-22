import type { ControlVariant, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 一段的身份。日期三段恒在，时间三段由 granularity 决定要不要。 */
/**
 * 段位是可自由拼装的小块：作者按组件需要挑几块写几块。
 * 季度与周不另立值形态,各自派生出月与日(季度取那一季的头一个月、周取那一周的周首日)。
 * 上下午自己不带独立的量,只改写小时。
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
 * 一份段集：作者要哪几块就写哪几块。
 * 归一后是有序的（年 季度 月 周 日 时 分 秒 上下午），乱序写也排得回来。
 *
 * 季度与周不另立值形态，各自派生出月与日（季度取那一季的头一个月、周取那一周的周首日），
 * 缺的粗段按「那一段的头」补：只有年就是 1 月 1 日。季度与月、周与日两两互斥，都写时留细的那个。
 */
export type DateSegmentSet = readonly DateSegmentType[]

/** 精度：决定一共有几段，也决定产出的 ISO 串截到哪一位。 */
export type DateGranularity = 'day' | 'hour' | 'minute' | 'second'

/** 半天：上午或下午。上下午段收的就是这两个。 */
export type DateDayPeriod = 'am' | 'pm'

/**
 * 各段的值，缺键即这一段还没填。
 * 只有当此刻在用的那几段全部填齐，才拼得出一个 ISO 串。
 *
 * 段集里带上下午时，hour 存的是 12 时制的那个数（1-12），24 时制的小时由它与上下午合出来。
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

/**
 * 段位自报家门。两种写法任选其一：
 *
 * - 按下标：`index`，是哪一段由 locale 与段集算出来——同一份标记换个 locale 就换一副面孔；
 * - 按段名：`segment`，写死这一格就是季度/周/上下午。段集里没有这一块时该节点收起。
 *
 * 两个都给时按段名算：它更具体。都不给等同于下标越界，那一格收起。
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
    /** BCP 47 语言标记，决定年月日三段的先后。不给按宿主语言，宿主也没有时按 en-US（月日年）排。 */
    locale?: string
    /** IANA 时区名，只用来取「今天」：空段上按上下键时从今天的对应位起步。 */
    timeZone?: string
    /** 精度，默认 day（只有年月日三段）。给了 segments 时它不再作数。 */
    granularity?: DateGranularity
    /**
     * 段集：这份控件由哪几块组成，给了就以它为准，granularity 让路。写 `['year', 'quarter']`
     * 得到「2026 Q2」、`['year', 'week']` 得到「2026 33」。归一后为空（如 `[]`）视同没给。
     * 值仍是 ISO 日期（时间）串，故段集里必须有 year，否则段位编辑得动但拼不出值。
     */
    segments?: DateSegmentSet
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    required?: boolean
    /** 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。 */
    name?: string
    /** 各段未填时显示的占位串，逐段覆盖内置默认（yyyy / mm / dd / hh / mm / ss）。 */
    placeholder?: { readonly [K in DateSegmentType]?: string }
    /** 各段的读屏名字，逐段覆盖内置默认。段是 spinbutton，没有名字读屏只念得出一串数字。 */
    translations?: DateFieldTranslations
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
    /** 清掉某一段（Backspace）。上下午段没有独立的量，清它是空操作。 */
    | { type: 'SEGMENT.CLEAR', segment: DateSegmentType }
    /** 直接指定上午/下午（a / p 键）：改写的是小时，不落独立的量。 */
    | { type: 'SEGMENT.PERIOD', period: DateDayPeriod }
    | { type: 'SEGMENT.FOCUS', segment: DateSegmentType }
    | { type: 'SEGMENT.BLUR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit'
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
  effect: never
}

export interface DateFieldApi<T extends PropTypes = PropTypes> {
  /** ISO 串；段位没填齐时是 null。 */
  value: string | null
  /** 同一个值的原生 Date；空值或算不出来时为 null。按 timeZone 换算。 */
  valueAsDate: Date | null
  /** 逐段投影，文档序即此刻的段序（给了 segments 就是它归一后的顺序，否则由 locale 排）。 */
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
  /** 清空全部段位；disabled / readOnly 下不动。 */
  clear: () => void
  /** 清空钮此刻是否可用：有段填了值、且可编辑。 */
  canClear: boolean
  getRootProps: () => T['element']
  /** 标题不是原生 label（段位是 div，不可被 label 标注），点它由连接层代为把焦点送进首段。 */
  getLabelProps: () => T['element']
  /** role=group 的分段容器。 */
  getControlProps: () => T['element']
  /** 段位与分隔符的外壳：占满盒里剩下的宽度，把清空钮顶到框内末端。 */
  getSegmentGroupProps: () => T['element']
  /** 作者的那一句声明落在哪一段上；段集里没有这一块（或下标越界）时缺席。文字由适配器照它渲染。 */
  segmentOf: (props: DateFieldSegmentProps) => DateFieldSegmentState | undefined
  getSegmentProps: (props: DateFieldSegmentProps) => T['element']
  /** 清空钮：不占 Tab 位，没值或不可编辑时收起；点完焦点回到首段。 */
  getClearTriggerProps: () => T['button']
  /** 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案：逐段的名字（段是 spinbutton，没有名字读屏只念得出一串数字），以及清空钮的名字。 */
export type DateFieldTranslations = { readonly [K in DateSegmentType]?: string } & {
  /** 清空钮的 aria-label，缺省 'Clear'。 */
  readonly clearTrigger?: string
}
