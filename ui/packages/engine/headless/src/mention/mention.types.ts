import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'

/** 输入框渲染成哪个标签：多行 textarea（缺省）或单行 input。 */
export type MentionInputHost = 'textarea' | 'input'

/** 输入宿主元素。机器只用到 value 与 setSelectionRange，两种标签都提供。 */
export type MentionInputEl = HTMLTextAreaElement | HTMLInputElement

/** 输入部件自报宿主标签，connect 据此决定写不写 type 与组合框角色。 */
export interface MentionInputProps {
  /** 缺省 textarea。 */
  as?: MentionInputHost
}

/**
 * 光标处的一次触发。
 * index 是前缀首字符在正文里的下标，query 是前缀之后到光标之间那一段（不含空白）。
 */
export interface MentionTrigger {
  /** 命中的前缀串。 */
  prefix: string
  /** 前缀在正文里的起始下标。 */
  index: number
  /** 前缀到光标之间那段查询串，宿主据它过滤候选。 */
  query: string
}

/** 候选数据。给了 collection，显示文本与禁用就以它为准。 */
export interface MentionNode {
  value: string
  /** 展示文本，也是插回正文的那段字；缺省退回 value。 */
  label?: string
  /** 候选禁用：方向键跳过它，点击与回车都不选中它。 */
  disabled?: boolean
}

/** 单个候选的元信息，由 collection 推出。 */
export interface MentionNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/** 条目自报家门：值必报，禁用可由 collection 代为声明。 */
export interface MentionItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

/** 组件自带的那几句固定文案，作者按自己的语言给。 */
export interface MentionTranslations {
  /** 候选浮层的可及名字，缺省 'Mentions'。role=listbox 必须有名字。 */
  content?: string
  /**
   * 输入框的可及名字。不给就整条不输出——作者自己写 `<label for>` 或直接在 input 部件上
   * 标 aria-label 时，输出一条空的 aria-label 会把作者那份盖掉。
   */
  input?: string
}

export interface MentionValueChangeDetails {
  /** 整段正文。提及不是独立的值，它就写在正文里。 */
  value: string
}

export interface MentionQueryChangeDetails {
  /** 当前查询串；没有触发时为 null。 */
  query: string | null
  /** 触发本次查询的前缀；没有触发时为 null。 */
  prefix: string | null
}

export interface MentionSelectDetails {
  /** 被选中候选的值。 */
  value: string
  /** 真正插进正文里的那段文本。 */
  label: string
  /** 这条提及用的前缀。 */
  prefix: string
}

export interface MentionOpenChangeDetails {
  open: boolean
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface MentionRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 消解层节点，同时是候选集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 输入框本体，同时是浮层的定位锚点：插入后的光标落位也写在它身上。 */
  getInputEl: () => MentionInputEl | null
}

export interface MentionSchema extends MachineSchema {
  props: {
    /**
     * 开候选的前缀字符，缺省 '@'。给数组即多种前缀并存，宿主按 onQueryChange 报回的 prefix 分流。
     * 前缀必须紧跟在行首或空白之后，邮箱地址里的 @ 因此不会误触发。
     */
    triggerPrefix?: string | string[]
    /**
     * 候选数据，显示文本与禁用的事实源。过滤仍归调用方：交进来的就是此刻该显示的那几条。
     * 组件不管怎么筛，它只负责把查询串交出去。
     */
    collection?: MentionNode[]
    /** 整段正文。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string
    defaultValue?: string
    /** 整个控件禁用：输入框用原生 disabled，候选一概不开。 */
    disabled?: boolean
    /** 只读：正文仍可聚焦与复制，改不动，候选也不开。 */
    readOnly?: boolean
    /** 校验失败标注：描边与聚焦环换成失败色，同时经 aria-invalid 上报。 */
    invalid?: boolean
    /** 输入框占位文字。不给就整条不输出，作者写在 input 部件上的那份因此留得住。 */
    placeholder?: string
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    placement?: Placement
    /** 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    translations?: MentionTranslations
    /** 形态：outline / subtle / ghost，决定输入框的描边与底色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与高亮用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入框内边距与字号档位。 */
    size?: Size
    /** 正文变化回调；受控时是唯一出口。 */
    onValueChange?: (details: MentionValueChangeDetails) => void
    /** 查询串变化回调：调用方据此重新过滤候选。收起时报 null。 */
    onQueryChange?: (details: MentionQueryChangeDetails) => void
    /** 候选被插进正文时回调，带上是哪一条。 */
    onSelect?: (details: MentionSelectDetails) => void
    /** 浮层开合回调。 */
    onOpenChange?: (details: MentionOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 整段正文。受控（value 给定）时 cell 直读 prop。 */
    value: string
    /** 光标处的触发；null 即此刻没有触发。 */
    trigger: MentionTrigger | null
    /** 被 Escape 关掉过的触发点下标：光标不离开这一处就不再自动展开。 */
    dismissedIndex: number | null
    /** 高亮候选，经 aria-activedescendant 上报给读屏；收起即清空。焦点始终不在它身上。 */
    highlightedValue: string | null
    /** 当前候选条数；null 表示尚未结算过。 */
    itemCount: number | null
  }
  computed: Record<string, never>
  refs: MentionRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    /** 消解层收到 Escape：收起并记下这一处，光标不挪走就不再自动展开。 */
    | { type: 'ESCAPE' }
    /** 用户改了正文。caret 是改完那一刻的光标位置。 */
    | { type: 'INPUT.CHANGE', value: string, caret: number }
    /** 正文没变、光标挪了（点击、左右方向键、Home/End）。value 用于识别 DOM 是否已跟上。 */
    | { type: 'CARET.SYNC', value: string, caret: number }
    /** 程序化改写整段正文：落值并收起浮层。 */
    | { type: 'VALUE.SET', value: string }
    | { type: 'ITEM.HIGHLIGHT', value: string }
    /** 把候选插进正文。label 是条目当下的显示文本，由调用方在事件那一刻从 DOM 取。 */
    | { type: 'ITEM.SELECT', value: string, label?: string }
    /**
     * 候选集合可能变了，重新结算条数并检查高亮有没有悬空。
     * 适配器每次提交完 DOM 都要发一次——过滤是调用方做的，机器无从预知何时变。
     */
    | { type: 'ITEMS.SYNC' }
  tag: never
  guard: never
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'setValue'
    | 'replaceValue'
    | 'syncTrigger'
    | 'refreshCandidates'
    | 'syncItems'
    | 'highlightFirst'
    | 'ensureHighlight'
    | 'setHighlightedValue'
    | 'clearHighlightedValue'
    | 'dismissHere'
    | 'selectItem'
  effect: 'trackPosition' | 'trackLayer'
}

export interface MentionApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** collection 推出的候选元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly MentionNodeMeta[]
  /** 整段正文。 */
  value: string
  /** 当前查询串；没有触发时为 null。 */
  query: string | null
  /** 触发本次查询的前缀；没有触发时为 null。 */
  activePrefix: string | null
  /** 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 */
  highlightedValue: string | null
  disabled: boolean
  isHighlighted: (value: string) => boolean
  /** 整段改写正文，浮层随之收起。 */
  setValue: (next: string) => void
  close: () => void
  getRootProps: () => T['element']
  /** 不传参即多行 textarea。 */
  getInputProps: (props?: MentionInputProps) => T['textarea']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: MentionItemProps) => T['element']
  getItemTextProps: (props: MentionItemProps) => T['element']
}
