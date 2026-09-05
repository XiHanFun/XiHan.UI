import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { TagVariant } from '../tag/tag.types'

/**
 * 焦点模型：roving tabindex。焦点真的落在标签上，整组只留一个 Tab 停靠点：
 * 锚点 = focusedValue ?? 首个选中值，认领 tabindex=0，其余一律 -1；
 * 焦点不在组内时由 list 兜底进 Tab 序列，其 onFocus 再把焦点转投给锚点条目。
 *
 * 每枚标签自己的摘除钮一律 tabindex=-1，摘除那一路走 Delete / Backspace。
 * 这是本组件存在的理由：一排十枚可摘标签，逐枚摘除钮各占一个停靠点时 Tab 就没法用了。
 */
export type TagGroupFocusModel = 'roving-tabindex'

/**
 * 选择模式：
 * - none：不参与选中，一排标签只是标记；
 * - single：一次只中一个，点击与确认键为替换；
 * - multiple：复选，点击与确认键为切换。
 */
export type TagGroupSelectionMode = 'none' | 'single' | 'multiple'

export interface TagGroupValueChangeDetails {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
}

export interface TagGroupItemDeleteDetails {
  /** 被摘掉的那一枚。 */
  value: string
}

/** 条目数据。给了 collection，显示文本、禁用与可摘就以它为准。 */
export interface TagGroupNode {
  value: string
  /** 展示文本，也是连打检索与摘除钮可访问名的取字处；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点，也摘不掉。 */
  disabled?: boolean
  /** 逐条覆盖可摘；缺省跟随整组的 deletable。 */
  deletable?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与焦点态。 */
export interface TagGroupNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 数据里没写即 undefined，交由整组的 deletable 定夺。 */
  deletable: boolean | undefined
}

/**
 * 条目自报家门：值必报，禁用与可摘可由 collection 代为声明。
 * connect 不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface TagGroupItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
  /** 逐条覆盖可摘；缺省时回 collection 里查，两处都没有即跟随整组的 deletable。 */
  deletable?: boolean
}

/** 读屏用的文案，默认英文。 */
export interface TagGroupTranslations {
  /**
   * 摘除钮的 aria-label：钮里通常只有一个叉，读屏念不出摘掉的是哪一枚。
   * 缺省 `Delete {标签文字}`，与 tag、select、tags-input 里同一个动作用同一个词。
   */
  deleteItem: (label: string) => string
  /**
   * 标签列表自己的名字。作者没渲染 label 部件时读屏只报得出容器的角色，
   * 这句是它的兜底名字。缺省 'Tags'。
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
     * 条目数据，显示文本、禁用与可摘的事实源。给了它，条目部件只需报 value。
     * 缺省即回到「文本与禁用都写在条目部件上」的老路。
     */
    collection?: TagGroupNode[]
    /** 选中值，给定即受控；单选可写成裸串，内部归一成数组。 */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 选择模式，默认 none。 */
    selectionMode?: TagGroupSelectionMode
    /** 是否给出摘除钮，默认 false。false 时该钮同时被禁用与收起。 */
    deletable?: boolean
    /** 整组禁用：键盘与点击都不再改选中值，也摘不掉任何一枚。 */
    disabled?: boolean
    /** 只读：仍可聚焦、可导航与朗读，但选中值改不动、标签也摘不掉。 */
    readOnly?: boolean
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 方向键轴向，默认 horizontal——标签是成排出现的。 */
    orientation?: Orientation
    /** 连打检索，默认开。 */
    typeahead?: boolean
    /** 形态：solid / subtle / outline，沿继承流下发给每一枚标签。 */
    variant?: TagVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化意图回调。 */
    onValueChange?: (details: TagGroupValueChangeDetails) => void
    /**
     * 摘除意图回调。条目由宿主的数据决定去留，组件只报「用户要摘这一枚」，
     * 顺手把它从选中集合里去掉，并把焦点交给相邻的一枚。
     */
    onItemDelete?: (details: TagGroupItemDeleteDetails) => void
    translations?: Partial<TagGroupTranslations>
  }
  context: {
    /** 选中集合，恒为数组；受控时 cell 直读 prop。 */
    value: string[]
    /** 焦点位于组内时的瞬态锚点，焦点离开即清空。 */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: TagGroupRefs
  /** 只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写选中集合。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 只留这一个。 */
    | { type: 'ITEM.SELECT', value: string }
    /** 切换这一个的选中态。 */
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    /** 摘掉一枚：从选中集合里去掉，通知宿主，锚点指着它时一并清空。 */
    | { type: 'ITEM.DELETE', value: string }
    /** 焦点离开整组，或持有焦点的条目被移出 DOM（后者由适配器上报）。 */
    | { type: 'LIST.BLUR' }
  tag: never
  guard: never
  action: 'setValue' | 'selectItem' | 'toggleItem' | 'deleteItem' | 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface TagGroupApi<T extends PropTypes = PropTypes> {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly TagGroupNodeMeta[]
  /** 生效的选择模式。 */
  selectionMode: TagGroupSelectionMode
  /** 焦点锚点；焦点不在组内时为 null。 */
  focusedValue: string | null
  disabled: boolean
  readOnly: boolean
  /** 整组是否给出摘除钮。 */
  deletable: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string[]) => void
  /** 只留这一个；加选用 toggle。 */
  select: (value: string) => void
  toggle: (value: string) => void
  /** 摘掉一枚。程序化入口，不搬焦点。 */
  deleteItem: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: (props: TagGroupItemProps) => T['element']
  /** 标签里那一格；摘除钮必须落在它之内。 */
  getCellProps: (props: TagGroupItemProps) => T['element']
  getItemTextProps: (props: TagGroupItemProps) => T['element']
  getItemDeleteTriggerProps: (props: TagGroupItemProps) => T['button']
}
