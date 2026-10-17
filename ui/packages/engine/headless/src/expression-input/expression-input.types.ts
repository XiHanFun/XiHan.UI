/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 expression input 类型契约。

import type {
  Cleanup,
  ControlVariant,
  Direction,
  ExpressionCheck,
  ExpressionCompletionKind,
  ExpressionCompletionSource,
  ExpressionInputIssue,
  Layer,
  MachineSchema,
  Placement,
  PositionEnginePort,
  PositionResult,
  PropTypes,
  RuntimeConfig,
  Size,
  Tone,
} from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { FunctionTable } from '@xihan-ui/expression'

/** 输入宿主元素：单行 input 或多行 textarea。 */
export type ExpressionInputEl = HTMLInputElement | HTMLTextAreaElement

/** 输入框渲染的标签：单行 input（默认）或多行 textarea。 */
export type ExpressionInputHost = 'input' | 'textarea'

/** 输入部件声明宿主标签，connect 据此决定组合框角色与布局。 */
export interface ExpressionInputInputProps {
  /** 默认 input。 */
  as?: ExpressionInputHost
}

/** 自动高度的行数界限，与文本字段同义：只对多行宿主生效。 */
export interface ExpressionInputAutoSize {
  minRows?: number
  maxRows?: number
}

/** 光标前正在输入的那个名字。 */
export interface ExpressionInputWord {
  /** 名字本身，可以为空串（如 Ctrl+Space 主动打开、光标前没有名字时）。 */
  word: string
  /** 名字起点的 UTF-16 下标；名字止于光标。 */
  start: number
  /** 名字前紧挨着 `.` 时为点之前的那串名字（如 `$row`），否则为 null。 */
  member: string | null
}

/** 补全列表里的一条：宿主的变量或成员，或函数表里的函数。 */
export interface ExpressionInputItem {
  /** 条目身份，在一份列表里唯一：宿主条目是 `variable:<label>` 或 `function:<label>`，函数表条目是 `fn:<名字>`。 */
  key: string
  kind: ExpressionCompletionKind
  /** 列表里显示的名字。 */
  label: string
  /** 名字后面的提示：函数是用参数名拼出的签名，如 `IF(条件, 真值[, 假值])`；宿主条目取它自己的 detail。 */
  detail: string | null
  /** 下一行的一句话说明；没有时为 null。 */
  description: string | null
  /** 插入的文本。 */
  insert: string
  /** 插入后光标相对插入起点的位置：变量落在末尾，函数落在括号里。 */
  caretOffset: number
}

/** 一条问题，带上界面要显示的位置与说明。 */
export interface ExpressionInputIssueView {
  /** 在问题列表里的序号，也是它在高亮层里的标记身份。 */
  index: number
  issue: ExpressionInputIssue
  /** 行号，从 1 起；单行宿主为 null。 */
  line: number | null
  /** 列号，从 1 起。 */
  column: number
  /** 问题说明：给了 message 用它，否则按 code 到文案里取。 */
  message: string
  /** 问题列表里的一行，如「第 3 列：未知的名字 amont」。 */
  text: string
}

/** 高亮层里的一段：不带问题的原文，或一段问题区间。 */
export interface ExpressionInputSegment {
  /** 这一段的原文。 */
  text: string
  start: number
  end: number
  /** 落在哪条问题上（问题列表的序号）；不带问题为 null。 */
  issue: number | null
  /** 问题的严重程度；不带问题为 null。 */
  severity: 'error' | 'warning' | null
}

/** 补全条目的声明：条目由组件生成，身份即 key。 */
export interface ExpressionInputItemProps {
  item: ExpressionInputItem
}

/** 高亮标记的声明。 */
export interface ExpressionInputMarkProps {
  segment: ExpressionInputSegment
}

/** 问题行的声明。 */
export interface ExpressionInputIssueProps {
  issue: ExpressionInputIssueView
}

/** 组件的文案。缺省英文；问题说明、参数名与函数说明在中文语言包里写全，其余语言回落英文。 */
export interface ExpressionInputTranslations {
  /** 补全列表的可及名；role=listbox 必须有名字。 */
  content: string
  /** 没有匹配的补全时空态里的文字。 */
  noMatches: string
  /** 条目种类的小标：变量。 */
  kindVariable: string
  /** 条目种类的小标：函数。 */
  kindFunction: string
  /** 问题所在的位置；单行宿主 line 为 null，如「第 3 列」，多行如「第 2 行第 5 列」。 */
  position: (line: number | null, column: number) => string
  /** 问题列表里的一行：位置加说明，如「第 3 列：未知的名字 amont」。 */
  issueRow: (position: string, message: string) => string
  /** 问题码的说明，data 是问题附带的数据；不认识的码原样返回。 */
  issue: (code: string, data: Readonly<Record<string, string | number>>) => string
  /** 参数名的显示文字，如 condition → 条件；不认识的键原样返回。 */
  param: (key: string) => string
  /** 函数没给参数名时第 index 个参数的显示文字（从 1 起），如「参数 1」。 */
  paramOrdinal: (index: number) => string
  /** 内置函数的一句话说明；没有时为 undefined。 */
  functionDescription: (name: string) => string | undefined
}

export interface ExpressionInputValueChangeDetails {
  value: string
}

export interface ExpressionInputIssuesChangeDetails {
  /** 检查函数给出的全部问题。 */
  issues: readonly ExpressionInputIssue[]
}

export interface ExpressionInputCompletionSelectDetails {
  /** 被选中的那一条。 */
  completion: ExpressionInputItem
}

export interface ExpressionInputOpenChangeDetails {
  open: boolean
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface ExpressionInputRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 输入框本体：单行时是浮层的定位锚点，多行时按它的光标矩形定位。 */
  getInputEl: () => ExpressionInputEl | null
  /** 高亮镜像层：滚动与宽度跟着输入框走。 */
  getHighlightEl: () => HTMLElement | null
}

export interface ExpressionInputSchema extends MachineSchema {
  props: {
    /**
     * 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。
     * 为假时可聚焦部件不把 label 的 id 写进 aria-labelledby。
     */
    labelled?: boolean
    /**
     * 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上。
     * 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。
     */
    ariaLabel?: string
    /** 标题文字；给了即由标准结构生成 label 部件。 */
    label?: string
    /** 多行：输入框是 textarea，位置说明带行号，补全浮层锚在光标处。 */
    multiline?: boolean
    /** 作者渲染了 issues 部件时置真，由适配器统计；为假时输入框的描述链不引用它。 */
    issuesRendered?: boolean
    /** 受控值；提供后由宿主决定。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    /** 检查函数；不给时不报问题。 */
    check?: ExpressionCheck
    /** 宿主的变量与成员补全；不给时只补函数。 */
    completions?: ExpressionCompletionSource
    /** 函数补全的来源，缺省全部内置函数；传空表即不补函数。 */
    functions?: FunctionTable
    placeholder?: string
    name?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    /** 校验失败标注；与检查报出的 error 取或。 */
    invalid?: boolean
    /** 多行宿主的自动高度，与文本字段同义。 */
    autoSize?: boolean | ExpressionInputAutoSize
    /** 输入后多久检查，单位毫秒，缺省 150；失焦时立即检查。 */
    checkDelay?: number
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    placement?: Placement
    /** 文字方向；只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /** 形态：outline / subtle / ghost。默认 outline。 */
    variant?: ControlVariant
    tone?: Tone
    size?: Size
    translations?: Partial<ExpressionInputTranslations>
    onValueChange?: (details: ExpressionInputValueChangeDetails) => void
    /** 检查结果变了才通知。 */
    onIssuesChange?: (details: ExpressionInputIssuesChangeDetails) => void
    /** 接受了一条补全。 */
    onCompletionSelect?: (details: ExpressionInputCompletionSelectDetails) => void
    onOpenChange?: (details: ExpressionInputOpenChangeDetails) => void
  }
  context: {
    position: PositionResult | null
    value: string
    /** 光标位置；值改动与光标移动时由适配器上报。 */
    caret: number
    /** 光标处正在输入的名字；没有可补全的名字（光标在字符串、数字里，或前面不是名字）时为 null。 */
    word: ExpressionInputWord | null
    /** 高亮条目的 key，经 aria-activedescendant 上报；收起即清空。 */
    highlightedKey: string | null
    /** 检查函数最近一次给出的问题。 */
    issues: readonly ExpressionInputIssue[]
    /** 最近一次检查的源码；与当前值不同时检查结果已过时，去抖计时器在走。 */
    checkedSource: string | null
    /** 输入法组合中：不取词、不检查。 */
    composing: boolean
    /** 这一轮是 Ctrl+Space 主动打开的：没有匹配也开着，显示空态。 */
    forced: boolean
    /** 按压通道：触屏按住的条目 key。 */
    pressedKey: string | null
  }
  computed: Record<string, never>
  refs: ExpressionInputRefs
  state: 'open' | 'closed'
  event:
    /** 用户修改了值；caret 是修改完成时的光标位置。 */
    | { type: 'INPUT.CHANGE', value: string, caret: number }
    /** 值未变、光标移动；value 用于识别 DOM 是否已同步。 */
    | { type: 'CARET.SYNC', value: string, caret: number }
    | { type: 'COMPOSITION.START' }
    | { type: 'COMPOSITION.END', value: string, caret: number }
    /** Ctrl+Space：光标前没有名字也打开，列出全部可用的补全。 */
    | { type: 'OPEN.FORCE' }
    /** 取词后有匹配：打开（机器内部发出）。 */
    | { type: 'OPEN' }
    /** 打开着时名字变了（机器内部发出）：重新落高亮。 */
    | { type: 'WORD.CHANGED' }
    | { type: 'CLOSE' }
    /** 消解层收到 Escape。 */
    | { type: 'ESCAPE' }
    | { type: 'ITEM.HIGHLIGHT', key: string }
    | { type: 'ITEM.SELECT', key: string }
    /** 程序化改写整段值：落值并收起。 */
    | { type: 'VALUE.SET', value: string }
    /** 在光标处插入一段文本（替换选区），光标落在插入内容之后。 */
    | { type: 'TEXT.INSERT', text: string, selectionStart: number, selectionEnd: number }
    /** 去抖到点，或失焦：按当前值检查。 */
    | { type: 'CHECK.RUN' }
    | { type: 'FORM.RESET' }
    | { type: 'PRESS.START', key: string }
    | { type: 'PRESS.END', key: string }
  tag: never
  guard: 'canEdit' | 'canPress'
  action:
    | 'resetToDefault'
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'setValue'
    | 'replaceValue'
    | 'syncWord'
    | 'forceWord'
    | 'startComposition'
    | 'endComposition'
    | 'highlightFirst'
    | 'ensureHighlight'
    | 'setHighlightedKey'
    | 'clearHighlightedKey'
    | 'clearForced'
    | 'selectItem'
    | 'insertText'
    | 'runCheck'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackPosition' | 'trackLayer' | 'trackCheck' | 'trackMirror'
}

export interface ExpressionInputApi<T extends PropTypes = PropTypes> {
  value: string
  open: boolean
  disabled: boolean
  readOnly: boolean
  /** 作者给的 invalid 或检查报出了 error。 */
  invalid: boolean
  /** 当前的补全条目，按显示顺序。 */
  items: readonly ExpressionInputItem[]
  /** 高亮条目的 key；收起时为 null。 */
  highlightedKey: string | null
  /** 打开着但没有一条补全。 */
  empty: boolean
  /** 空态的缺省文字。 */
  emptyText: string
  /** 条目种类小标的文字。 */
  kindText: (kind: ExpressionCompletionKind) => string
  /** 检查函数最近一次给出的问题，带上位置与说明。 */
  issues: readonly ExpressionInputIssueView[]
  /** 高亮镜像层的分段：问题区间单独成段。 */
  segments: readonly ExpressionInputSegment[]
  /** 整段改写值，浮层随之收起。 */
  setValue: (next: string) => void
  /** 在光标处插入一段文本（替换选区）；输入框还没挂上时接在末尾。 */
  insert: (text: string) => void
  close: () => void
  getRootProps: () => T['element']
  /** 标题；`for` 恒指向 input，须是原生 `<label>`。 */
  getLabelProps: () => T['label']
  /** 字段视觉盒：描边与底色画在它上面，输入框与高亮层排在它里面。 */
  getControlProps: () => T['element']
  /** 输入框；不传参即单行 input，写 textarea 即多行宿主。 */
  getInputProps: (props?: ExpressionInputInputProps) => T['input']
  /** 叠在输入框下的镜像层，把问题区间画成波浪下划线；对读屏隐藏。 */
  getHighlightProps: () => T['element']
  getHighlightSegmentProps: (props: ExpressionInputMarkProps) => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: ExpressionInputItemProps) => T['element']
  getItemPrefixProps: (props: ExpressionInputItemProps) => T['element']
  getItemTextProps: (props: ExpressionInputItemProps) => T['element']
  getItemSuffixProps: (props: ExpressionInputItemProps) => T['element']
  getItemDescriptionProps: (props: ExpressionInputItemProps) => T['element']
  /** 没有匹配的补全时显示的空态；与 content 同级。 */
  getEmptyProps: () => T['element']
  /** 问题列表（role=status）；没有问题时带 hidden 收起。 */
  getIssuesProps: () => T['element']
  getIssueProps: (props: ExpressionInputIssueProps) => T['element']
}
