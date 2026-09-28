/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 toolbar 类型契约。

import type { ControlVariant, Direction, MachineSchema, Orientation, PropTypes, Size } from '@xihan-ui/core'

/**
 * 条目的声明：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 * 工具条只发身份标记、Tab 停靠位与 aria-disabled，条目的角色、按下态与点击行为归条目自身。
 */
export interface ToolbarItemProps {
  value: string
  disabled?: boolean
}

/**
 * 一个收进「更多」菜单的条目。收纳由挂载后的量测决定，这些事实同样在量测时从条目上读出：
 * 工具条不持有条目的文字与按下态，它们归条目自己。
 */
export interface ToolbarOverflowItem {
  /** 条目的身份值。 */
  value: string
  /** 菜单里的文字：条目的 aria-label，没有时取 aria-labelledby 指向的文字，再没有取条目自己的文字。 */
  label: string
  /** 条目禁用，或整条工具条禁用。 */
  disabled: boolean
  /** 条目写了 aria-pressed 时是开关，这里是它的按下态，菜单里显示为勾选项；普通条目为 null。 */
  pressed: boolean | null
  /** 与菜单里的上一条之间隔着分隔线或分组边界，菜单在两者之间画一条分隔线。 */
  separatorBefore: boolean
}

/** 读屏文案，默认英文。 */
export interface ToolbarTranslations {
  /** 「更多」钮的可及名：放不下的条目都收在它弹出的菜单里。 */
  overflowTrigger: string
}

export interface ToolbarRefs {
  /** root 节点：条目与「更多」钮的查询容器，也是收纳量测的参照系。 */
  getRootEl: () => HTMLElement | null
}

export interface ToolbarSchema extends MachineSchema {
  props: {
    /**
     * 主轴，默认 horizontal。它决定 root 的 aria-orientation、方向键接管哪一对键
     * （另一轴原样放行给页面），以及分隔线的朝向（恒与主轴垂直）。
     */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 */
    dir?: Direction
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 整条禁用：条目全部为 aria-disabled，方向键不再接管。 */
    disabled?: boolean
    /** 形态：ghost 只组织控件不画面（默认），outline 为附着式工具面，subtle 为淡底。默认 ghost。 */
    variant?: ControlVariant
    /** 尺寸：sm / md / lg，同时调整排布与默认条目尺寸。 */
    size?: Size
    /** 读屏文案：「更多」钮的可及名，缺省 More。 */
    translations?: Partial<ToolbarTranslations>
  }
  context: {
    /**
     * 焦点位于工具条内时的瞬态锚点，焦点离开即清空。
     * 焦点模型是 roving tabindex，整条只保留一个 Tab 停靠点；锚点只有焦点这一个来源。
     * 锚点为空时由 root 兜底进入 Tab 序列，它的 onFocus 再把焦点转交给第一个可停留条目。
     */
    focusedValue: string | null
    /**
     * 焦点停在「更多」钮上：此刻它是 roving 的锚点，占住 Tab 停靠位，focusedValue 为 null。
     * 焦点离开整条或落到某个条目上即撤下。
     */
    overflowTriggerFocused: boolean
    /**
     * 按压通道：正被 Space / Enter 或触屏手指按住的条目的 value，该条目投影 data-pressed；没有按住时为 null。
     * 抬起、失焦、指针取消，或按住途中整条转为禁用时撤下；与焦点锚点互相独立。
     */
    pressedValue: string | null
    /**
     * 收进「更多」菜单的条目，文档序。放了 overflow-trigger 时挂载后量出，容器与条目尺寸变化、
     * 条目增减或改写后重量；全部放得下、或没放 overflow-trigger 时为空数组。不受控、不对外通知。
     */
    overflowItems: ToolbarOverflowItem[]
  }
  computed: Record<string, never>
  refs: ToolbarRefs
  /** 焦点锚点不编码进状态，状态机因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 焦点落到某个条目上（方向键移动，或指针 / 程序直接聚焦）。 */
    | { type: 'ITEM.FOCUS', value: string }
    /** 焦点落到「更多」钮上。 */
    | { type: 'OVERFLOW_TRIGGER.FOCUS' }
    /** 焦点离开整条工具条，或持有焦点的条目被移出 DOM（浏览器此时不派发 focusout，由适配器如实上报）。 */
    | { type: 'TOOLBAR.BLUR' }
    /** 按压通道（shared/press）：某个条目被 Space / Enter 或触屏按住；条目自身的禁用只有 connect 知道，随事件带给守卫。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 该条目抬起、失焦或指针取消。 */
    | { type: 'PRESS.END', value: string }
    /** 「更多」菜单里选中了一项：替收起的条目触发它自己的点击。 */
    | { type: 'OVERFLOW.SELECT', value: string }
  tag: never
  guard: 'canPress'
  action:
    | 'setFocusedValue'
    | 'setOverflowTriggerFocused'
    | 'clearFocusedValue'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
    | 'measureOverflow'
    | 'measureOverflowAfterRender'
    | 'activateOverflowItem'
  effect: 'trackOverflow'
}

export interface ToolbarApi<T extends PropTypes = PropTypes> {
  /** 焦点锚点；焦点不在工具条内、或停在「更多」钮上时为 null。 */
  focusedValue: string | null
  /** 生效的主轴。 */
  orientation: Orientation
  /** 分隔线的朝向：恒与主轴垂直（横向工具条中的分隔线是竖线）。 */
  separatorOrientation: Orientation
  disabled: boolean
  /** 收进「更多」菜单的条目，文档序；全部放得下时为空数组。 */
  overflowItems: readonly ToolbarOverflowItem[]
  getRootProps: () => T['element']
  getGroupProps: () => T['element']
  getItemProps: (props: ToolbarItemProps) => T['element']
  getSeparatorProps: () => T['element']
  /** 行尾的「更多」钮，也是「更多」菜单的触发器：适配器按 asChild 的规则把菜单的开合接线合进来，解剖标记归工具条，工具条的处理器先跑。 */
  getOverflowTriggerProps: () => T['button']
}
