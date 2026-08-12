import type { Direction, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 读屏用的文案，默认英文。 */
export interface SideNavTranslations {
  /** 根节点的 aria-label，用于区分同页的多个 nav 地标。 */
  root: string
}

/**
 * 一条入口。children 是数组即为分支（内嵌展开的子级）；
 * 叶子是去处：给 href 渲染成链接，不给则是命令入口（选中走 onValueChange）。
 */
export interface SideNavNode {
  value: string
  /** 入口文本；缺省退回 value，也是连打检索的取字处。 */
  label?: string
  /** 入口禁用：方向键跳过它，但它仍可聚焦。不向下传导给子级。 */
  disabled?: boolean
  /** 直达去处；只对叶子有意义。 */
  href?: string
  children?: SideNavNode[]
}

export interface SideNavValueChangeDetails {
  /** 选中的那条叶子；尚未选中为 null。 */
  value: string | null
}

export interface SideNavExpandedChangeDetails {
  /** 变化之后的完整展开集合，不是增量。 */
  value: string[]
}

export interface SideNavSchema extends MachineSchema {
  props: {
    /** 入口树，层级与文本的唯一事实源。缺省为空。 */
    collection?: SideNavNode[]
    /** 选中的叶子（单选）。给定即受控：cell 直读 prop，写只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 展开集合。给定即受控，语义同上。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 同层手风琴：展开一枝时收起同层其余分支，默认 false（可多开）。 */
    accordion?: boolean
    /**
     * 折叠成图标栏：内嵌展开整体收起、文字由皮肤藏掉，只剩图标一列。
     * 折叠态下分支的子级弹出（浮层子菜单）尚未提供，先保持纯视觉档。
     */
    collapsed?: boolean
    /** 整个侧栏禁用。 */
    disabled?: boolean
    /** 上下键走到首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 */
    dir?: Direction
    translations?: Partial<SideNavTranslations>
    /** 选中意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: SideNavValueChangeDetails) => void
    /** 展开集合变化意图回调；语义同上。 */
    onExpandedChange?: (details: SideNavExpandedChangeDetails) => void
  }
  context: {
    /** 选中的叶子。受控（value 给定）时 cell 直读 prop。 */
    value: string | null
    /** 展开集合。受控（expandedValue 给定）时 cell 直读 prop。 */
    expandedValue: string[]
    /** roving tabindex 的锚点。 */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 没有第二种模式，单状态位。 */
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string | null }
    /** 点叶子：落选中并通知。 */
    | { type: 'LINK.SELECT', value: string }
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    | { type: 'NODE.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
  tag: never
  guard: 'canChange'
  action:
    | 'setValue'
    | 'selectLink'
    | 'setExpanded'
    | 'expandBranch'
    | 'collapseBranch'
    | 'toggleBranch'
    | 'setFocusedValue'
    | 'clearFocusedValue'
  effect: never
}

/** 分支与叶子共用的身份声明。 */
export interface SideNavNodeProps {
  value: string
}

export interface SideNavApi<T extends PropTypes = PropTypes> {
  /** 选中的叶子；尚未选中为 null。 */
  value: string | null
  expandedValue: string[]
  /** 折叠成图标栏（纯视觉档）。 */
  collapsed: boolean
  /** roving tabindex 的锚点；无可见锚点为 null。 */
  focusedValue: string | null
  isSelected: (value: string) => boolean
  isExpanded: (value: string) => boolean
  /** 选中项的祖先分支：展开高亮「当前所在的那一枝」。 */
  isActiveBranch: (value: string) => boolean
  select: (value: string) => void
  setValue: (next: string | null) => void
  setExpandedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getGroupProps: (props: SideNavNodeProps) => T['element']
  getGroupLabelProps: (props: SideNavNodeProps) => T['element']
  getBranchProps: (props: SideNavNodeProps) => T['element']
  getBranchTriggerProps: (props: SideNavNodeProps) => T['button']
  /** 行文字的载体：折叠成图标栏时由皮肤整个藏掉，不会裁出半个字。 */
  getBranchTextProps: () => T['element']
  getBranchIndicatorProps: (props: SideNavNodeProps) => T['element']
  getBranchContentProps: (props: SideNavNodeProps) => T['element']
  getLinkProps: (props: SideNavNodeProps) => T['element']
  /** 链接文字的载体：折叠时由皮肤整个藏掉。 */
  getLinkTextProps: () => T['element']
}
