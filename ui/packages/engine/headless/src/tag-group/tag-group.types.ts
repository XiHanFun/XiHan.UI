/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tag group 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { TagPressedPart, TagVariant } from '../tag/tag.types'

/**
 * 焦点模型：roving tabindex。焦点实际落在标签（tag 的 root）上，整组只保留一个 Tab 停靠点：
 * 锚点 = focusedValue ?? 首个选中值，承担 tabindex=0，其余一律 -1；
 * 焦点不在组内时由 list 兜底进入 Tab 序列，其 onFocus 再把焦点转交给锚点条目。
 *
 * 每个标签自身的移除按钮（tag 的 close-trigger）一律 tabindex=-1，移除经 Delete / Backspace。
 * 这是本组件存在的理由：一排十个可移除标签，逐个移除按钮各占一个停靠点时 Tab 无法使用。
 */
export type TagGroupFocusModel = 'roving-tabindex'

/**
 * 选择模式：
 * - none：不参与选中，一排标签只是标记；
 * - single：一次只选中一个，点击与确认键为替换；
 * - multiple：复选，点击与确认键为切换。
 */
export type TagGroupSelectionMode = 'none' | 'single' | 'multiple'

export interface TagGroupValueChangeDetails {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
}

export interface TagGroupItemDeleteDetails {
  /** 被移除的标签。 */
  value: string
}

/** 条目数据。提供 collection 时，显示文本、禁用与可移除以它为准。 */
export interface TagGroupNode {
  value: string
  /** 展示文本，也是连打检索与移除按钮可访问名的取字来源；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点，也不可移除。 */
  disabled?: boolean
  /** 逐条覆盖可移除；未提供时跟随整组的 deletable。 */
  deletable?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含选中态与焦点态。 */
export interface TagGroupNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 数据中未提供时为 undefined，由整组的 deletable 决定。 */
  deletable: boolean | undefined
}

/**
 * 条目声明的身份：值必须声明，禁用与可移除可由 collection 代为声明。
 * connect 不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface TagGroupItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
  /** 逐条覆盖可移除；未提供时从 collection 查询，两处都未声明即跟随整组的 deletable。 */
  deletable?: boolean
}

/** 读屏文案，默认英文。 */
export interface TagGroupTranslations {
  /**
   * 移除按钮的 aria-label：按钮内通常只有一个叉，读屏无法朗读移除的是哪一个。
   * 默认 `Delete {标签文字}`，经 tag 的 translations.close 写到该按钮上，
   * 与 tag、select、tags-input 中同一动作使用同一个词。
   */
  deleteItem: (label: string) => string
  /**
   * 标签列表自身的名字。作者未渲染 label 部件时读屏只能报告容器的角色，
   * 该文案是它的兜底名字。默认 'Tags'。
   */
  list: string
}

export interface TagGroupRefs {
  /** 连打检索缓冲，随服务存活。 */
  typeahead: Typeahead
}

export interface TagGroupSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本、禁用与可移除的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本与禁用都写在条目部件上的方式。
     */
    collection?: TagGroupNode[]
    /** 选中值，提供即受控；单选可写为裸串，内部归一为数组。 */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 选择模式，默认 none。 */
    selectionMode?: TagGroupSelectionMode
    /** 是否提供移除按钮，默认 false。false 时该按钮同时被禁用与收起。 */
    deletable?: boolean
    /** 整组禁用：键盘与点击都不再修改选中值，也不可移除任何标签。 */
    disabled?: boolean
    /** 只读：仍可聚焦、可导航与朗读，但选中值不可修改、标签也不可移除。 */
    readOnly?: boolean
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 方向键轴向，默认 horizontal：标签成排出现。 */
    orientation?: Orientation
    /** 连打检索，默认开启。 */
    typeahead?: boolean
    /** 形态：solid / subtle / outline，逐个写到每个标签（tag 的 root）上。 */
    variant?: TagVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，使用 tag 的三档。 */
    size?: Size
    /** value 变化意图回调。 */
    onValueChange?: (details: TagGroupValueChangeDetails) => void
    /**
     * 移除意图回调。条目由宿主的数据决定去留，组件只报告用户要移除该标签，
     * 同时把它从选中集合中移除，并把焦点交给相邻的标签。
     */
    onItemDelete?: (details: TagGroupItemDeleteDetails) => void
    translations?: Partial<TagGroupTranslations>
  }
  context: {
    /** 选中集合，恒为数组；受控时 cell 直读 prop。 */
    value: string[]
    /** 焦点位于组内时的瞬态锚点，焦点离开即清空。 */
    focusedValue: string | null
    /**
     * 按压通道：Space / Enter 或触屏手指按下到松开之间正被按住的部件，root 是标签本体（可选条目）、
     * close-trigger 是它的移除按钮；没有按住时为 null。整组禁用或只读时谁都不进，条目自身的禁用、
     * 不可选与不可移除由 connect 判定后随事件带入。
     */
    pressedPart: TagPressedPart | null
    /** 正被按住的那一枚标签的 value；没有按住时为 null。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: TagGroupRefs
  /** 只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写选中集合。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 只保留该条目。 */
    | { type: 'ITEM.SELECT', value: string }
    /** 切换该条目的选中态。 */
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    /** 移除一个标签：从选中集合中移除，通知宿主，锚点指向它时一并清空。 */
    | { type: 'ITEM.DELETE', value: string }
    /** 焦点离开整组，或持有焦点的条目被移出 DOM（后者由适配器上报）。 */
    | { type: 'LIST.BLUR' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part + value 说的是哪一枚的哪个部件；
    // disabled 是该部件自身按不动的事实（条目禁用、不可选、不可移除），由 connect 判定后随事件带入
    | { type: 'PRESS.START', part: TagPressedPart, value: string, disabled?: boolean }
    | { type: 'PRESS.END', part: TagPressedPart, value: string }
  tag: never
  guard: 'canPress'
  action:
    | 'setValue'
    | 'selectItem'
    | 'toggleItem'
    | 'deleteItem'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

export interface TagGroupApi<T extends PropTypes = PropTypes> {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly TagGroupNodeMeta[]
  /** 生效的选择模式。 */
  selectionMode: TagGroupSelectionMode
  /** 焦点锚点；焦点不在组内时为 null。 */
  focusedValue: string | null
  disabled: boolean
  readOnly: boolean
  /** 整组是否提供移除按钮。 */
  deletable: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string[]) => void
  /** 只保留该条目；加选使用 toggle。 */
  select: (value: string) => void
  toggle: (value: string) => void
  /** 移除一个标签。程序化入口，不移动焦点。 */
  deleteItem: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getListProps: () => T['element']
  /**
   * 一个标签：库内 tag 的 root（data-scope="tag"），三轴与置灰由 tag 提供；
   * row 角色、身份、roving tabindex、选中（data-selected）与锚点（data-highlighted）叠加在它上面。
   */
  getItemProps: (props: TagGroupItemProps) => T['element']
  /** 标签内的格子；移除按钮必须落在它之内。 */
  getCellProps: (props: TagGroupItemProps) => T['element']
  /**
   * 选中标记：落在格子内、文字之前，选中时展示、未选中时以 hidden 收起；
   * 对读屏隐藏，选中态由标签上的 aria-selected 表达。内容留空时由皮肤绘制对号，也可放入图标。
   */
  getItemIndicatorProps: (props: TagGroupItemProps) => T['element']
  /** 标签文字：tag 的 label，截断规则挂在该层。 */
  getItemTextProps: (props: TagGroupItemProps) => T['element']
  /** 移除按钮：所在标签那份 tag 的 close-trigger，不占 Tab 位；可及名、禁用与收起都由 tag 提供。 */
  getItemDeleteTriggerProps: (props: TagGroupItemProps) => T['button']
}
