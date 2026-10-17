/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 format input 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size } from '@xihan-ui/core'
import type { FormatRounding, FormatSpec, NumeralStyle } from '@xihan-ui/expression'
import type { StructureInstanceProps } from '../shared/structure-instance'
import type { FormatInputDecimalsMode, FormatInputDraft, FormatInputIssueCode, FormatInputKind } from './format-input.model'

export interface FormatInputValueChangeDetails {
  /** 新的格式说明；不设格式时为 null。 */
  value: FormatSpec | null
}

/** 种类下拉里的一项：格式种类，或「不设格式」。 */
export type FormatInputKindOption = FormatInputKind | 'none'

/** 小数位输入框：固定位数、范围下限、范围上限。 */
export type FormatInputDecimalsField = 'decimals' | 'minDecimals' | 'maxDecimals'

/** 参数行，部件名与之相同；只铺当前种类用得到的那几行。 */
export type FormatInputOption = 'decimals-mode' | 'decimals' | 'min-decimals' | 'max-decimals' | 'grouping' | 'rounding' | 'pattern' | 'numeral-style'

export interface FormatInputSchema extends MachineSchema {
  props: {
    /** 受控的格式说明；null 表示不设格式，undefined 表示非受控。 */
    value?: FormatSpec | null
    defaultValue?: FormatSpec | null
    /** 可选的种类，缺省全部；与 checkFormatSpec 的同名选项一致。 */
    kinds?: readonly FormatInputKind[]
    /** 种类里多一项「不设格式」，选它派发 null；缺省 true。 */
    clearable?: boolean
    /** 日期模式的预设，缺省 FORMAT_INPUT_DATE_PATTERNS；也可以自由输入。 */
    datePatterns?: readonly string[]
    /** 样例的输入值；缺省按种类取。 */
    sample?: unknown
    /** 交给 formatValue，只影响样例。 */
    locale?: string
    timeZone?: string
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    /** 作者渲染了 label 部件：根以它为名。 */
    labelled?: boolean
    /** 视觉轴，传给里面的控件。 */
    variant?: ControlVariant
    size?: Size
    translations?: Partial<FormatInputTranslations>
    /** 合法的格式说明变了时通知；输入中途不完整时不派发。 */
    onValueChange?: (details: FormatInputValueChangeDetails) => void
  }
  context: {
    /** 当前的格式说明，受控时跟随 value。 */
    value: FormatSpec | null
    /** 编辑中的草稿，可以不完整。 */
    draft: FormatInputDraft
    /** 三个小数位输入框里的原始文字：输入中途的文字不被写回打断。 */
    inputs: Readonly<Record<FormatInputDecimalsField, string>>
    /** 读屏播报的样例文字，停止输入一会儿后才换。 */
    announced: string
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle' | 'settling'
  event:
    | { type: 'KIND.SET', kind: FormatInputKind | null }
    | { type: 'DECIMALS_MODE.SET', mode: FormatInputDecimalsMode }
    | { type: 'DECIMALS.SET', field: FormatInputDecimalsField, text: string }
    | { type: 'GROUPING.SET', value: boolean }
    | { type: 'ROUNDING.SET', value: FormatRounding }
    | { type: 'PATTERN.SET', value: string }
    | { type: 'STYLE.SET', value: NumeralStyle }
    | { type: 'VALUE.SYNC' }
    | { type: 'after.announce' }
  tag: never
  guard: 'isEditable'
  action: 'setKind' | 'setDecimalsMode' | 'setDecimals' | 'setGrouping' | 'setRounding' | 'setPattern' | 'setStyle' | 'syncValue' | 'requestSync' | 'announce'
  effect: 'trackAnnounce'
}

export interface FormatInputApi<T extends PropTypes = PropTypes> {
  /** 当前的格式说明；不设格式时为 null。 */
  value: FormatSpec | null
  /** 种类；不设格式时为 null。 */
  kind: FormatInputKind | null
  /** 编辑中的草稿。 */
  draft: FormatInputDraft
  /** 草稿不完整、或格式说明不被接受时的问题码。 */
  issue: FormatInputIssueCode | null
  /** 问题的说明文字；没有问题时为空串。 */
  issueText: string
  /** 样例文字（已带「示例：」前缀）；没有格式时为空串。 */
  previewText: string
  /** 当前种类用得到的参数行，次序即排布次序。 */
  options: readonly FormatInputOption[]
  /** 种类下拉的条目：按 kinds 次序，clearable 时最前面是「不设格式」。 */
  kindItems: readonly { value: FormatInputKindOption, label: string }[]
  /** 种类控件用分段切换（条目不超过三项）还是下拉。 */
  kindControl: 'toggle-group' | 'select'
  setKind: (kind: FormatInputKind | null) => void
  setDecimalsMode: (mode: FormatInputDecimalsMode) => void
  /** 改一个小数位输入框的文字；空串表示清空，非整数或越界时草稿不完整。 */
  setDecimals: (field: FormatInputDecimalsField, text: string) => void
  setGrouping: (value: boolean) => void
  setRounding: (value: FormatRounding) => void
  setPattern: (value: string) => void
  setNumeralStyle: (value: NumeralStyle) => void

  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getKindProps: () => T['element']
  getFieldGroupProps: () => T['element']
  getItemProps: (option: FormatInputOption) => T['element']
  /** 参数行（含种类）的名字。 */
  getItemLabelProps: (option: FormatInputOption | 'kind') => T['element']
  getPatternDescriptionProps: () => T['element']
  getPreviewProps: () => T['element']
  getErrorTextProps: () => T['element']

  /** 种类控件的 props，交给组合节点：kindControl 为 toggle-group 时用前者（外包是 fieldset，名字在 legend），否则用后者（标题由下拉自己铺）。 */
  getKindToggleGroupProps: () => Partial<StructureInstanceProps['toggle-group']>
  getKindSelectProps: () => Partial<StructureInstanceProps['select']>
  getDecimalsModeControlProps: () => Partial<StructureInstanceProps['toggle-group']>
  getDecimalsControlProps: (field: FormatInputDecimalsField) => Partial<StructureInstanceProps['number-field']>
  getGroupingControlProps: () => Partial<StructureInstanceProps['switch']>
  getRoundingControlProps: () => Partial<StructureInstanceProps['select']>
  getPatternControlProps: () => Partial<StructureInstanceProps['combobox']>
  getNumeralStyleControlProps: () => Partial<StructureInstanceProps['select']>
}

export interface FormatInputTranslations {
  /** 种类控件与各种类的名字。 */
  kind: string
  kindOption: (kind: FormatInputKindOption) => string
  decimalsMode: string
  decimalsModeOption: (mode: FormatInputDecimalsMode) => string
  decimals: string
  minDecimals: string
  maxDecimals: string
  grouping: string
  rounding: string
  roundingOption: (rounding: FormatRounding) => string
  pattern: string
  /** 日期模式的占位符说明。 */
  patternHint: string
  numeralStyle: string
  numeralStyleOption: (style: NumeralStyle) => string
  /** 样例行：「示例：{text}」。 */
  preview: (text: string) => string
  /** 样例值套不上这份格式时的说明。 */
  sampleUnavailable: string
  /** 问题码的说明。 */
  issue: (code: FormatInputIssueCode) => string
}
