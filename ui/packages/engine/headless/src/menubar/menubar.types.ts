import type { Typeahead } from '@xihan-ui/behavior'
import type { Cleanup, Direction, Layer, Orientation, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 展开菜单时的落焦端：'first'/'last' 从集合两端进，'none' 焦点留在 trigger 上。 */
export type MenubarFocusIntent = 'first' | 'last' | 'none'

/** 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter，缺省时相关副作用短路。 */
export interface MenubarRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄，只在有菜单展开期间调用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 当前展开项的 trigger，定位锚点。 */
  getAnchorEl: () => HTMLElement | null
  /** 当前展开项被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 当前展开项的 content：焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 菜单栏根节点，trigger 集合的查询容器。 */
  getRootEl: () => HTMLElement | null
  /** 连打检索缓冲；菜单收起时清空。 */
  typeahead: Typeahead
  /** 换项时重挂定位；由 trackPosition 在挂载时填入，退出时置空。 */
  reanchor: (() => void) | null
}

export interface MenubarValueChangeDetails {
  /** 当前展开的那一项；都收起时为 null。 */
  value: string | null
}

export interface MenubarSelectDetails {
  /** 条目所属的那张菜单（即 trigger 的 value）。 */
  menu: string
  /** 被选中的条目。 */
  value: string
}

/**
 * 菜单栏数据。顶层节点是一个入口，它的 items 是那张菜单里的条目。
 * 给了 collection，显示文本与禁用就以它为准。
 *
 * 入口的 value 与条目的 value 各自在整条菜单栏内唯一：两者都是禁用回查的键，
 * 条目按 value 跨菜单摊平索引，重名的以先出现的为准。
 */
export interface MenubarNode {
  value: string
  /** 展示文本，也是菜单内连打检索的取字处；缺省退回 value。 */
  label?: string
  /** 禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /** 这张菜单里的条目；只在顶层节点上读。 */
  items?: MenubarNode[]
}

/** 单个节点的元信息，由 collection 推出，不含展开态与焦点态。 */
export interface MenubarNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 这张菜单里的条目元信息；条目自身恒为空数组。 */
  items: readonly MenubarNodeMeta[]
}

/**
 * 触发器属性：值必报，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface MenubarTriggerProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

/** positioner 与 content 靠该值与同一项的 trigger 配对。 */
export interface MenubarContentProps {
  value: string
}

export interface MenubarItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

/** 分组身份，group 与 group-label 靠该值配对。 */
export interface MenubarGroupProps {
  value: string
}

export interface MenubarSchema extends MachineSchema {
  props: {
    /**
     * 菜单栏数据，显示文本与禁用的事实源。给了它，入口与条目部件只需报 value。
     * 缺省即回到「文本与禁用逐个写在部件上」的老路。
     */
    collection?: MenubarNode[]
    /** 当前展开项，给定即受控；null 表示都收起。 */
    value?: string | null
    defaultValue?: string | null
    /** 菜单栏排布轴，默认 horizontal。 */
    orientation?: Orientation
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 整条菜单栏禁用，展开与选中都不发生。 */
    disabled?: boolean
    /** 菜单内的连打检索，默认开。 */
    typeahead?: boolean
    placement?: Placement
    offset?: number
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化回调。 */
    onValueChange?: (details: MenubarValueChangeDetails) => void
    /** 条目被选中；菜单随之收起。 */
    onSelect?: (details: MenubarSelectDetails) => void
  }
  context: {
    /** 当前展开项，受控时 cell 直读 prop。 */
    value: string | null
    /** 定位引擎回填的最新结果。 */
    position: PositionResult | null
    /**
     * 逐菜单记住最后一次定位结果。一排入口共用一台机器一份 position，换菜单时它立刻归
     * 新菜单所有——正在收起的那张若从共享份取坐标会当场归零，退场动画就在视口左上角播。
     */
    placements: Record<string, PositionResult>
    /**
     * 正在一排入口间换张。原生菜单栏的成规：首次展开有进场、末次收起有退场，
     * 相邻切换瞬时换张——快速掠过时若每张都播进出场，一串交叉淡变读起来就是闪烁；
     * 且退场关键帧从不透明度 1 起跳，打断未播完的进场还会亮一下。
     */
    switching: boolean
    /** trigger 的 roving 锚点，焦点离开菜单栏即清空。 */
    focusedValue: string | null
    /** 展开菜单内持有焦点的条目；换项与收起都清空。 */
    focusedItem: string | null
    /** 本次展开的落焦端。'none' 即焦点留在 trigger 上。 */
    focusIntent: MenubarFocusIntent
    /** 最近一次由掠过/聚焦自动展开的项，用于识别聚焦紧跟点击这一对手势。 */
    autoValue: string | null
    /** 收起时是否把焦点归还 trigger；Tab 与层外交互时为 false。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: MenubarRefs
  /** 状态只表示有无菜单展开，展开项看 context.value；由 value 的 watch 派 SYNC.* 转移。 */
  state: 'idle' | 'open'
  event:
    /** 点击 / Enter / Space：展开本项，已展开则收起。 */
    | { type: 'TRIGGER.TOGGLE', value: string }
    /** 交叉轴方向键：展开本项并把焦点落到菜单首/末项。 */
    | { type: 'TRIGGER.OPEN', value: string, focus?: MenubarFocusIntent }
    /** 指针掠过 trigger：已有菜单展开时才切换。 */
    | { type: 'TRIGGER.POINTER', value: string }
    /** trigger 拿到焦点：记 roving 锚点，已有菜单展开时一并切换展开项。 */
    | { type: 'TRIGGER.FOCUS', value: string, disabled?: boolean }
    /** 收起当前菜单。src 决定焦点归还与否。 */
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    /** 焦点离开菜单栏：清 roving 锚点并收起，不抢回焦点。 */
    | { type: 'MENUBAR.BLUR' }
    /** 程序化改写展开项。 */
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'ITEM.FOCUS', value: string }
    /** 持有焦点的条目离开了 DOM：浏览器此时不派 focusout，机器读不到，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string }
    // 状态同步影子事件，由 value 的 watch 派发
    | { type: 'SYNC.OPEN' }
    | { type: 'SYNC.CLOSE' }
  tag: never
  guard: 'hasValue' | 'isCurrent' | 'shouldAbsorbToggle' | 'shouldSwitch'
  action:
    | 'syncOpenState'
    | 'openFromEvent'
    | 'toggleFromEvent'
    | 'switchValue'
    | 'setValueFromEvent'
    | 'clearValue'
    | 'clearAutoValue'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'setFocusedItem'
    | 'clearFocusedItem'
    | 'setInitialFocusedItem'
    | 'setReturnFocus'
    | 'restoreTriggerFocus'
    | 'invokeOnSelect'
    | 'clearTypeahead'
    | 'reanchor'
  effect: 'trackPosition' | 'trackLayer'
}

export interface MenubarApi<T extends PropTypes = PropTypes> {
  /** 当前展开的那一项；都收起时为 null。 */
  value: string | null
  /** collection 推出的入口元信息（各自带着它那张菜单的条目），按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly MenubarNodeMeta[]
  /** 有没有菜单展开着。 */
  open: boolean
  /** trigger 的 roving 锚点；焦点不在菜单栏内时为 null。 */
  focusedValue: string | null
  /** 展开菜单内持有焦点的条目；无锚点时为 null。 */
  focusedItem: string | null
  orientation: Orientation
  disabled: boolean
  isOpen: (value: string) => boolean
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getTriggerProps: (props: MenubarTriggerProps) => T['button']
  getPositionerProps: (props: MenubarContentProps) => T['element']
  getContentProps: (props: MenubarContentProps) => T['element']
  getItemProps: (props: MenubarItemProps) => T['element']
  getItemTextProps: (props: MenubarItemProps) => T['element']
  getItemIndicatorProps: (props: MenubarItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getGroupProps: (props: MenubarGroupProps) => T['element']
  getGroupLabelProps: (props: MenubarGroupProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface MenubarTranslations {}
