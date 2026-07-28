import type { Typeahead } from '@xihan-ui/behavior'
import type { Cleanup, Direction, Layer, Orientation, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 展开某张菜单时焦点落在哪一端：
 * - 'first' / 'last' 键盘入口（交叉轴方向键）从集合两端进；
 * - 'none' 指针、点击与挂载即展开走这条——焦点留在 trigger 上，一个条目都不预先高亮。
 *   菜单栏与单张 Menu 的分野正在这里：掠过一排 trigger 时若每换一张就把焦点抢进浮层，
 *   用户连"我还在菜单栏上"这件事都会失掉。
 */
export type MenubarFocusIntent = 'first' | 'last' | 'none'

/**
 * 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；纯逻辑测试与 SSR 下保持缺省，
 * 此时副作用一律短路（机器状态照常转移，只是不定位、不挂消解层与焦点域）。
 *
 * 三个浮层 getter 都按"当前展开的那一项"解析：菜单栏同时只展开一张菜单，
 * 换项时它们指向的元素随之改变，定位因此要重挂（见 reanchor）。
 */
export interface MenubarRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在有菜单展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 当前展开项的 trigger，定位锚点。 */
  getAnchorEl: () => HTMLElement | null
  /** 当前展开项被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 当前展开项的 content：焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 菜单栏根节点：trigger 集合的查询容器，收起时按锚点归还焦点也靠它。 */
  getRootEl: () => HTMLElement | null
  /** 连打检索缓冲；菜单收起时清空，免得下次打开第一个字母被拼进上一轮。 */
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
 * 部件自报家门：身份与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (state/context/prop, 本部件声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface MenubarTriggerProps {
  value: string
  disabled?: boolean
}

/** positioner 与 content 靠这一个值与同一项的 trigger 互相认领。 */
export interface MenubarContentProps {
  value: string
}

export interface MenubarItemProps {
  value: string
  disabled?: boolean
}

/** 分组自报身份：分组标题的 id 由它派生，group 与 group-label 靠这一个值互相认领。 */
export interface MenubarGroupProps {
  value: string
}

export interface MenubarSchema extends MachineSchema {
  props: {
    /**
     * 当前展开的那一项。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * null 表示都收起。
     */
    value?: string | null
    defaultValue?: string | null
    /** 菜单栏自身的排布轴，默认 horizontal；决定方向键在 trigger 之间走哪一对键。 */
    orientation?: Orientation
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 */
    dir?: Direction
    /** 整条菜单栏禁用：每个 trigger 都报 aria-disabled，展开与选中一概不发生。 */
    disabled?: boolean
    /** 菜单内的连打检索，默认开。 */
    typeahead?: boolean
    placement?: Placement
    offset?: number
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: MenubarValueChangeDetails) => void
    /** 条目被选中；菜单随之收起。 */
    onSelect?: (details: MenubarSelectDetails) => void
  }
  context: {
    /** 当前展开的那一项。受控（value 给定）时 cell 直读 prop。 */
    value: string | null
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /**
     * 菜单栏那一排 trigger 的 roving 锚点，同时是主轴方向键的起点。
     * 焦点离开整条菜单栏即清空，容器据此重新认领 Tab 位。
     */
    focusedValue: string | null
    /** 展开菜单内持有焦点的条目；换项与收起都清空。 */
    focusedItem: string | null
    /** 本次展开的落焦端。'none' 即焦点留在 trigger 上。 */
    focusIntent: MenubarFocusIntent
    /**
     * 最近一次「不是用户显式点出来的」展开是哪一项：掠过与聚焦换项记在这儿，显式激活清空。
     * 不受控、不对外通知——它存在的唯一理由是把「聚焦紧跟着点击」这一对手势认出来，
     * 而受控的 value 在宿主写回之前一直是旧的，担不起这个判据。
     */
    autoValue: string | null
    /** 收起时是否把焦点归还 trigger；Tab 与层外交互时为 false，让焦点自然离开。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: MenubarRefs
  /**
   * 两个状态只管"有没有菜单展开着"，哪一项展开着一律看 context.value——两套说法不并存。
   * 状态由 value 单向派生：用户事件只改 value，watch 追到变化后派影子事件 SYNC.* 转移状态，
   * 受控与非受控因此走同一条路（受控时 value 要等宿主写回才变，状态也就跟着晚一拍，不抢跑）。
   */
  state: 'idle' | 'open'
  event:
    /** 点击 / Enter / Space：展开本项，已展开则收起。 */
    | { type: 'TRIGGER.TOGGLE', value: string }
    /** 交叉轴方向键：展开本项并把焦点落到菜单首/末项。 */
    | { type: 'TRIGGER.OPEN', value: string, focus?: MenubarFocusIntent }
    /**
     * 指针掠过某个 trigger。已经有菜单展开着才切换过去，一个都没展开时什么也不做——
     * 这就是"打开态传染"：进了菜单栏之后掠过即切换，没进来之前掠过不打扰。
     */
    | { type: 'TRIGGER.POINTER', value: string }
    /** 某个 trigger 拿到焦点：记 roving 锚点；已有菜单展开着则一并把展开项切过去。 */
    | { type: 'TRIGGER.FOCUS', value: string, disabled?: boolean }
    /** 收起当前菜单。src 决定焦点归还与否。 */
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    /** 焦点离开整条菜单栏：清 roving 锚点并收起，且不抢回焦点。 */
    | { type: 'MENUBAR.BLUR' }
    /** 程序化改写展开项。 */
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'ITEM.FOCUS', value: string }
    /** 持有焦点的条目离开了 DOM：浏览器不派 focusout，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string }
    // 状态同步影子事件：由 value 的 watch 派发，无条件跳转，不再通知
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
  /** 有没有菜单展开着。 */
  open: boolean
  /** 菜单栏那一排 trigger 的 roving 锚点；焦点不在菜单栏内时为 null。 */
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
