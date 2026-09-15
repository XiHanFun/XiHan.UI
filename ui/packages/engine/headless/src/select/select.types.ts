/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 select 类型契约。

import type { Cleanup, ControlVariant, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/**
 * 展开时高亮的落点：
 * - selected 停在当前选中项（该项禁用时回退为首个可停留条目；无选中则不落锚点，
 *   焦点停在 content 上：指针打开走这条，打开时不能有条目看似被选中）
 * - first / last 从集合两端进入（键盘确认键在无选中时走 first）
 * - next / prev 从当前选中项起步移动一步（收起态的上下键即走这条）
 */
export type SelectFocusIntent = 'selected' | 'first' | 'last' | 'next' | 'prev'

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface SelectRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，通常是 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 连打检索缓冲。随服务存活，收起时清空，收起态与展开态共用同一份。 */
  typeahead: Typeahead
}

export interface SelectOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface SelectValueChangeDetails {
  value: string[]
}

/** 条目数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface SelectNode {
  value: string
  /** 展示文本，也是连打检索的取字来源；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态与高亮态。 */
/** 读屏文案，默认英文。 */
export interface SelectTranslations {
  /** 清空按钮的可及名。 */
  clearTrigger: string
  /** 标签删除按钮的可及名，接收标签文本；经 tag 的 translations.close 写到该按钮上。 */
  deleteItem: (label: string) => string
  /** 被折叠的标签（overflow-tag）显示的文字，接收折叠的个数；默认 +N。 */
  overflowTag: (count: number) => string
  /** 列表框容器的兜底名字，作者两个名字部件（label / value-text）都未渲染时才使用。 */
  content: string
}

/** 标签声明的身份：代表哪个选中值。 */
export interface SelectTagProps {
  value: string
}

/** 可见标签的数据：值与显示文本。 */
export interface SelectTagMeta {
  value: string
  label: string
}

export interface SelectNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface SelectItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 分组声明的身份：分组标题的 id 由它派生，group 与 group-label 依靠该值互相关联。 */
export interface SelectGroupProps {
  value: string
}

export interface SelectSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value，
     * 显示文本也不再从 DOM 查询。未提供时回到文本写在条目中、从 DOM 查询的方式。
     */
    collection?: SelectNode[]
    /**
     * 选中值。裸串是单选的简写，null 是受控且无选中，未提供（undefined）才是非受控；内部一律按数组处理。
     * 受控时 cell 直读 prop，写入只发 onValueChange 不落内部值。
     */
    value?: string | string[] | null
    /** 非受控初始选中值。与 value 同样接受裸串与 null。 */
    defaultValue?: string | string[] | null
    /** 允许选中多项。单选时选完即收起，多选时保持展开继续选。 */
    multiple?: boolean
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 整个控件禁用：trigger 使用原生 disabled，隐藏 select 不参与提交。 */
    disabled?: boolean
    /** 只读：浮层照常展开与浏览，但选中值不可修改、也不可清空。 */
    readOnly?: boolean
    /** 校验错误态：trigger 标红并输出 aria-invalid。 */
    invalid?: boolean
    /** 条目加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位。 */
    loading?: boolean
    /** 读屏文案，默认英文。 */
    translations?: Partial<SelectTranslations>
    /** 多选标签最多显示的数量，其余折叠进 overflowCount、合成 +N 标签；默认 3（SELECT_DEFAULT_MAX_TAG_COUNT）。 */
    maxTagCount?: number
    /** 原生表单校验：无选中值时提交被拦截。 */
    required?: boolean
    /** 表单字段名。提供后隐藏 select 才带 name，选中值随表单一并提交。 */
    name?: string
    /** 无选中时 value-text 显示的占位文字。 */
    placeholder?: string
    placement?: Placement
    offset?: number
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 形态：outline / subtle / ghost，决定触发器的描边与底色使用方式。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 */
    size?: Size
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: SelectValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: SelectOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 选中值。受控（value 提供）时 cell 直读 prop。单选恒为长度 ≤ 1。 */
    value: string[]
    /** 选中项的显示文本，与 value 逐项对应。由动作从 DOM 查询后回填，connect 只读取。 */
    valueText: string[]
    /** roving tabindex 的锚点，同时是方向键与确认键的起点；收起即清空。 */
    highlightedValue: string | null
    /** 本次展开的落点意图；受控回写经 CONTROLLED.OPEN 时也可读取。 */
    focusIntent: SelectFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: SelectRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: SelectFocusIntent }
    | { type: 'TOGGLE', focus?: SelectFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.HIGHLIGHT', value: string }
    | { type: 'HIGHLIGHT.CLEAR' }
    /** 持有焦点的条目离开了 DOM：浏览器不派发 focusout，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    /** 选中条目。单选选完即收起，多选保持展开并在集合中增删该项。 */
    | { type: 'ITEM.SELECT', value: string }
    /** 整体改写选中集合（收起态连打检索、外部 setValue 都经过它）。裸串与 props 一样按单选简写处理。 */
    | { type: 'VALUE.SET', value: string | string[] }
    /** 清空全部选中（清空按钮、键盘 Delete 与 api.clear 都经过它）。 */
    | { type: 'VALUE.CLEAR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple' | 'isReadOnly'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'syncValueText'
    | 'setValue'
    | 'clearValue'
    | 'normalizeValue'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setHighlightedValue'
    | 'setInitialHighlightedValue'
    | 'clearHighlightedValue'
    | 'clearTypeahead'
    | 'resetToDefault'
  effect: 'trackPosition' | 'trackLayer'
}

export interface SelectApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly SelectNodeMeta[]
  /** 选中集合，按选中先后排列而非文档顺序。单选恒为长度 ≤ 1。 */
  value: string[]
  /** 选中项的文本，与 value 逐项等长对应；某项在 DOM 中查询不到条目时该项回退为值本身。 */
  valueText: string[]
  /** value-text 实际显示的文字：有选中时取其文本（多选按半角逗号加空格连接），否则取 placeholder。 */
  displayText: string
  /** 是否允许多选。 */
  multiple: boolean
  /** 校验错误态。 */
  invalid: boolean
  /** 只读态。 */
  readOnly: boolean
  /** 当前能否清空：有选中且既不禁用也不只读。 */
  canClear: boolean
  /** 可见标签（受 maxTagCount 截断），与 value / valueText 同序。 */
  tags: SelectTagMeta[]
  /** 被 maxTagCount 折叠的标签数。 */
  overflowCount: number
  /** +N 标签显示的文字（由 translations.overflowTag 计算）；没有折叠的标签时为空串。 */
  overflowText: string
  /** 高亮锚点；收起时为 null。 */
  highlightedValue: string | null
  setOpen: (next: boolean) => void
  setValue: (next: string | string[]) => void
  /** 清空全部选中。 */
  clear: () => void
  /** 移除一个选中值。 */
  deselect: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  /** 触发器与清空按钮的收纳容器：两者在其中并排，有值时清空按钮替代展开指示符。 */
  getControlProps: () => T['element']
  getTriggerProps: () => T['button']
  getValueTextProps: () => T['element']
  getIndicatorProps: () => T['element']
  /** 清空按钮：不占 Tab 位；无法清空时整体隐藏；点击清空全部选中、不展开浮层，焦点送回 trigger。 */
  getClearTriggerProps: () => T['button']
  /** 标签行：收纳可见标签与 +N 标签，放在触发器中；无选中时整体 hidden。 */
  getTagListProps: () => T['element']
  /** 标签：一个选中值一个，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从本控件传下，形态按控件的面派生（outline / ghost / 默认使用淡底标签，subtle 使用描边标签），另带 data-value 记录代表的值。放在触发器中即纯展示（不渲染关闭按钮），放在外部配删除按钮可删除。 */
  getTagProps: (props: SelectTagProps) => T['element']
  /** 标签文字所在的块（tag 的 label）：截断落在这一层；标签与 +N 共用。 */
  getTagLabelProps: () => T['element']
  /** 被折叠的标签合成的一个：同样是 tag 的 root，显示 overflowText、带 data-count；没有折叠的标签时 hidden。 */
  getOverflowTagProps: () => T['element']
  /** 标签删除按钮：即所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名使用 translations.deleteItem，禁用时保留位置、原生 disabled；点击移除所在标签的选中值；须放在标签中。 */
  getItemDeleteTriggerProps: (props: SelectTagProps) => T['button']
  getPositionerProps: () => T['element']
  /** 浮层外壳：描边、底色、阴影与键盘收口都在它身上。 */
  getContentProps: () => T['element']
  /** 列表框本体，滚动在这一层；role=listbox 与条目的拥有关系都归它。 */
  getListProps: () => T['element']
  /** 浮层底部的操作区，是 list 的兄弟；不在列表框的拥有关系中，也不参与方向键与连打检索。 */
  getFooterProps: () => T['element']
  /**
   * 空态占位：放在 content 中、list 的兄弟。
   * 提供 collection 时由连接层按条数收放；条目手写时不写 hidden，是否显示由作者决定。
   */
  getEmptyProps: () => T['element']
  /**
   * 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。
   * 提供 collection 时由连接层按条数收放；条目手写时只按 loading 收放。
   */
  getLoadingProps: () => T['element']
  /** 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 */
  getGroupProps: (props: SelectGroupProps) => T['element']
  /** 分组标题：不是选项、不进入导航，只作为本组的可及名。 */
  getGroupLabelProps: (props: SelectGroupProps) => T['element']
  getItemProps: (props: SelectItemProps) => T['element']
  getItemTextProps: (props: SelectItemProps) => T['element']
  getItemIndicatorProps: (props: SelectItemProps) => T['element']
  /**
   * 表单出口：一份视觉隐藏的原生 select，由根部件自行渲染（作者不必手写）。
   * 选项由适配器按当前值补齐，原生提交与 required 校验据此获取值。
   */
  getHiddenSelectProps: () => T['select']
}
