/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 menu 类型契约。

import type { Cleanup, Direction, IconRecord, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { MenuCheckboxValueChangeDetails, MenuChoiceGroupProps, MenuChoiceKind, MenuRadioValue, MenuRadioValueChangeDetails, MenuCheckboxItemProps as SharedMenuCheckboxItemProps, MenuRadioItemProps as SharedMenuRadioItemProps } from '../shared/menu-choice'
import type { StructureSlotted } from '../shared/structure'

export type { MenuCheckboxValueChangeDetails, MenuChoiceKind, MenuRadioValue, MenuRadioValueChangeDetails } from '../shared/menu-choice'

/** 展开时的落焦端：'first'/'last' 从集合两端进入，'none' 不预先选择锚点。 */
export type MenuFocusIntent = 'first' | 'last' | 'none'

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter，缺省时相关副作用短路。
export interface MenuRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈（常驻会永久占据栈顶，阻断下方每层的 Escape）。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 本菜单视觉退场与行为资源共享的 Presence。每个子菜单实例各有自己的句柄。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** trigger 部件；没给 anchor 时它就是定位锚点与焦点归还处。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 逻辑后代菜单经 Portal 搬离本层 content 后的悬停区域；仅供悬停树判定。 */
  getHoverBranches: () => readonly HTMLElement[]
  /** 连打检索的缓冲区，收起时清空。 */
  typeahead: Typeahead
  /** 重挂定位的句柄，由定位效应填写；anchor 变了由 watch 调它。 */
  reanchor: (() => void) | null
}

export interface MenuOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface MenuItemSelectDetails {
  value: string
}

/** 条目数据。提供 collection 时，显示文本、禁用与语气以它为准。 */
export interface MenuNode {
  value: string
  /** 条目语义；普通命令缺省为 item。radio 条目必须同时声明 group。 */
  kind?: MenuChoiceKind
  /** 展示文本；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /**
   * 该条命令自身动作的性质：删除写 danger、停用写 warning。不写即与其余条目同档。
   * 只换字色与悬停 / 按下的面，不改字重与缩进，也不表达选中或校验；禁用压过它。
   * 红字不是唯一通道，破坏性命令仍要配图标。整张菜单的 tone 不下发给条目。
   */
  tone?: Tone
  /** 标记位文字（勾选符号等装饰）；未提供时本条不铺 item-indicator。 */
  indicator?: string
  /**
   * 图标，写入 item-icon 部件，排在条目文字之前；未提供时本条不铺该部件。
   * 纯装饰：读屏从条目文字取意，不念它。勾选与单选条目的勾仍在 item-indicator，两者各占一格。
   */
  icon?: IconRecord
  /** 副文本，写入 item-description 部件；未提供时本条不铺该部件。 */
  description?: string
  /**
   * 快捷键提示，写入 item-shortcut 部件；未提供时本条不铺该部件。
   * 纯装饰：读屏从条目文字取意，不念它；只为真正注册了的组合写提示。
   */
  shortcut?: string
  /**
   * 条目的 aria-keyshortcuts：读屏念的快捷键，写法照 ARIA（修饰键在前，如 `Control+S`、`Meta+Shift+Z`，几组用空格隔开），
   * 未提供时不写。与 shortcut 各管各：shortcut 是看得见的提示、读屏不念，这一项只给读屏，两处说的应是同一组键。
   */
  keyshortcuts?: string
  /** 归属分组的身份值；相邻同值的条目收进同一个 group 部件。未提供时本条直接落在 content 上。 */
  group?: string
  /** 分组标题文字，取本组首个提供它的条目；本组无人提供时不铺 group-label。 */
  groupLabel?: string
  /** 本条之前绘制一条分隔线；写在首条上不产出分隔线。本条领头一个分组时，分隔线绘制在分组外。 */
  separatorBefore?: boolean
  /** 激活后是否关闭菜单；普通命令默认 true，checkbox / radio 默认 false。 */
  closeOnSelect?: boolean
  /**
   * 子菜单的条目：给了 children 这一条就是子菜单的入口，Vue / React 的默认树按 children 递归铺出下一层，
   * 深度不限；本条只能是普通条目（kind 为 item）。子层的选中经菜单树汇到根上，勾选与单选由各层自持。
   * 手写部件时改用 Sub 部件；Web Components 由作者写 Light DOM，不读这一项。
   */
  children?: MenuNode[]
  /**
   * 子菜单那一层的勾选值：只在带 children 的条目上读取，交给按数据铺出的那一层，与子菜单自己的 checkboxValue 同义，
   * 写了即受控。按数据铺时子层的勾选改动不另外上报，勾选条目写 closeOnSelect，由根上的 item-select 得知。
   */
  checkboxValue?: string[]
  /** 子菜单那一层的单选值（组 → 选中的值）：只在带 children 的条目上读取，其余同 checkboxValue。 */
  radioValue?: MenuRadioValue
}

/** 单个条目的元信息，由 collection 推导，不含焦点态。 */
export interface MenuNodeMeta {
  value: string
  kind: MenuChoiceKind
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 该条命令自身的语气；未提供时为 null。 */
  tone: Tone | null
  /** 标记位文字；未提供时为 null。 */
  indicator: string | null
  /** 图标；未提供时为 null。 */
  icon: IconRecord | null
  /** 副文本；未提供时为 null。 */
  description: string | null
  /** 快捷键提示；未提供时为 null。 */
  shortcut: string | null
  /** 条目的 aria-keyshortcuts；未提供时为 null。 */
  keyshortcuts: string | null
  /** 分组身份；未提供时为 null。 */
  group: string | null
  /** 分组标题；未提供时为 null。 */
  groupLabel: string | null
  separatorBefore: boolean
  closeOnSelect: boolean
  /** 子菜单的条目；没有下一层时为 null。 */
  children: readonly MenuNode[] | null
  /** 子菜单那一层的勾选值；没写或没有下一层时为 null。 */
  checkboxValue: readonly string[] | null
  /** 子菜单那一层的单选值；没写或没有下一层时为 null。 */
  radioValue: Readonly<MenuRadioValue> | null
}

/**
 * 条目属性：值必须声明，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface MenuItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

export type MenuCheckboxItemProps = SharedMenuCheckboxItemProps

export type MenuRadioItemProps = SharedMenuRadioItemProps

/** 适配器写入条目上下文的已判别声明；kind 不作为各部件自己的公开 prop。 */
export type MenuAnyItemProps
  = | (MenuItemProps & { kind?: 'item' })
    | (MenuCheckboxItemProps & { kind: 'checkbox' })
    | (MenuRadioItemProps & { kind: 'radio' })

/** 分组声明的身份：分组标题的 id 由它派生，group 与 group-label 依靠该值互相关联。 */
export interface MenuGroupProps extends MenuChoiceGroupProps {}

export interface MenuSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本、禁用、逐条语气与分组的事实源。提供后条目部件只需声明 value。
     * 未提供时回到这些事实都写在条目部件上的方式（语气写成条目的 `data-tone`）。
     */
    collection?: MenuNode[]
    /** checkbox 条目的选中集合；提供即受控。 */
    checkboxValue?: string[]
    defaultCheckboxValue?: string[]
    /** RadioGroup 身份到当前条目值的映射；提供即受控。 */
    radioValue?: MenuRadioValue
    defaultRadioValue?: MenuRadioValue
    /** 展开态，提供即受控；受控下内部不自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /**
     * 外部锚点：给了就锚在它上面、收起时焦点归还到它，不再取 trigger；用于由别处的按钮受控打开菜单，按数据铺设时不再铺触发按钮。
     * 展开期间它带 aria-haspopup、aria-expanded、aria-controls，收起或换锚点时还原；点它算层内交互，不会先被判为层外交互关掉。
     * content 不再由触发器命名，名字写在 translations.content 上。只用于根菜单。
     */
    anchor?: HTMLElement | null
    placement?: Placement
    offset?: number
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /**
     * 整张菜单的语气：brand / neutral / success / warning / danger / info。
     * 只为浮层与作者放进来的内容备好该族颜色，不下发给条目——条目保持中性档，
     * 逐条的语气写在 collection 的 `tone` 上（见 MenuNode）。
     */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 */
    size?: Size
    /**
     * 内容只按落定那一侧的可用高度封顶，不叠菜单的固定上限（20rem 一档）；作者写的 `--xh-menu-max-h` 照样生效。
     * 菜单栏的子菜单由菜单栏传入，再往下一层跟着上一层；单独用的菜单一般不写。
     */
    fitAvailableHeight?: boolean
    /** 首字符连打检索，默认开启。 */
    typeahead?: boolean
    /** 整张菜单禁用：触发器不再展开，条目全部为 aria-disabled。 */
    disabled?: boolean
    translations?: Partial<MenuTranslations>
    /**
     * 本菜单是另一张菜单的子菜单：触发器渲染为父菜单的条目形态
     * （经 getSubmenuTriggerProps），默认落位改为侧向，悬停触发默认开启。
     */
    submenu?: boolean
    /** 悬停触发：进入触发器延时展开、经安全三角离开才收起。子菜单默认开启，普通菜单默认关闭。 */
    openOnHover?: boolean
    /** 悬停到展开的延时（ms），默认 100。 */
    hoverOpenDelay?: number
    /** 离开到收起的延时（ms），也是安全三角中的停滞上限，默认 300。 */
    hoverCloseDelay?: number
    /** open 变化回调。 */
    onOpenChange?: (details: MenuOpenChangeDetails) => void
    /** 条目被选中；菜单随之关闭。 */
    onItemSelect?: (details: MenuItemSelectDetails) => void
    onCheckboxValueChange?: (details: MenuCheckboxValueChangeDetails) => void
    onRadioValueChange?: (details: MenuRadioValueChangeDetails) => void
  }
  context: {
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 定位引擎回填的最新结果。 */
    position: PositionResult | null
    /** roving tabindex 的锚点，同时是方向键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落焦端，'none' 即不落焦。 */
    focusIntent: MenuFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 关闭时为 false。 */
    returnFocus: boolean
    /** 按压通道：Space / Enter 或触屏按住的条目 value；抬起、失焦或菜单收起即清空。 */
    pressedValue: string | null
    checkboxValue: string[]
    radioValue: MenuRadioValue
  }
  computed: Record<string, never>
  refs: MenuRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: MenuFocusIntent }
    | { type: 'TOGGLE', focus?: MenuFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' | 'hover' }
    /** 条目被 Space / Enter 或触屏按住；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 按住的条目抬起、失焦或指针取消；只松开 value 对应的那一条。 */
    | { type: 'PRESS.END', value: string }
    | { type: 'CHECKBOX.VALUE.SET', value: string[] }
    | { type: 'RADIO.VALUE.SET', value: MenuRadioValue }
    // 受控回写：宿主改 open prop 后由 watch 派发
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 持有焦点的条目离开了 DOM：浏览器此时不派发 focusout，状态机无法感知，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string, kind: MenuChoiceKind, group?: string, close: boolean }
  tag: never
  guard: 'isOpenControlled' | 'canPress' | 'keepsMenuOpen'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'invokeOnItemSelect'
    | 'syncOpen'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setFocusedValue'
    | 'setInitialFocusedValue'
    | 'clearFocusedValue'
    | 'clearTypeahead'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenDisabled'
    | 'selectChoice'
    | 'setCheckboxValue'
    | 'setRadioValue'
    | 'clearOpenedAtMount'
    | 'reanchor'
  effect: 'trackPosition' | 'trackLayer' | 'trackHover' | 'trackAnchorAria'
}

export interface MenuApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 整张菜单是否禁用。 */
  disabled: boolean
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly MenuNodeMeta[]
  /** 焦点锚点；收起时为 null。 */
  focusedValue: string | null
  checkboxValue: readonly string[]
  radioValue: Readonly<MenuRadioValue>
  isCheckboxItemChecked: (value: string) => boolean
  isRadioItemChecked: (group: string, value: string) => boolean
  setCheckboxValue: (next: string[]) => void
  setRadioValue: (next: MenuRadioValue) => void
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: MenuItemProps) => T['element']
  getCheckboxItemProps: (props: MenuCheckboxItemProps) => T['element']
  getRadioItemProps: (props: MenuRadioItemProps) => T['element']
  /** 条目文字之前的图标格；装饰态，读屏不念。 */
  getItemIconProps: (props: MenuAnyItemProps) => T['element']
  getItemTextProps: (props: MenuAnyItemProps) => T['element']
  getItemIndicatorProps: (props: MenuAnyItemProps) => T['element']
  getItemDescriptionProps: (props: MenuAnyItemProps) => T['element']
  getItemShortcutProps: (props: MenuAnyItemProps) => T['element']
  getItemSuffixProps: (props: MenuAnyItemProps) => T['element']
  /**
   * 子菜单触发条目（submenu 模式）：既是父菜单中的一条 item（value 是它在父菜单
   * 中的身份，父层的方向键与高亮照常识别它），又是本子菜单的触发器（aria-haspopup、
   * 悬停 / 点击 / 右方向键展开）。父层的选中会跳过带 aria-haspopup 的条目。
   */
  getSubmenuTriggerProps: (props: MenuItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getGroupProps: (props: MenuGroupProps) => T['element']
  getRadioGroupProps: (props: MenuGroupProps) => T['element']
  getGroupLabelProps: (props: MenuGroupProps) => T['element']
  getArrowProps: () => T['element']
}

/** 读屏文案，默认英文。 */
export interface MenuTranslations {
  /** 菜单容器的名字。默认不写，读屏改由 aria-labelledby 指向触发器取名；用 anchor 时没有触发器可指，要写上它。 */
  content: string
}

/** 结构里触发器怎么铺、作者接管哪些格。 */
export interface MenuStructureOptions {
  /** 子菜单那一层：触发器是父菜单里的一条条目（div，写着 value），缺省是根菜单，触发器是按钮。 */
  submenu?: boolean
  /** 子菜单在父菜单里的条目身份，写在触发条目上。 */
  value?: string
  /** 触发器的文字：根菜单是按钮里的文字（trigger 插槽没有内容时），子菜单是触发条目的文字。 */
  label?: string
  /** 根菜单锚在外部元素上（写了 anchor）：不铺触发按钮。 */
  anchored?: boolean
  /**
   * 作者给了哪些插槽的内容：trigger（根菜单的触发按钮）；item（整条接管）、item-prefix（标记位：普通条目在行首，勾选与单选条目是对号、排在最后）、
   * item-suffix（行尾），后三个按条目的值带 key。子菜单的触发条目也认 item。
   */
  slotted?: StructureSlotted
}
