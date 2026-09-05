import type { Direction, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 读屏用的文案，默认英文。 */
export interface BreadcrumbTranslations {
  /** 根节点的 aria-label，用于区分页面上的多个 nav 地标。 */
  root: string
}

/** 一层路径的数据。给了 collection，文字、链接与当前页就以它为准。 */
export interface BreadcrumbNode {
  /** 层级身份，落到 data-value。 */
  value: string
  /** 显示文字；缺省退回 value。 */
  label?: string
  /** 链接地址；不给即渲染成不带 href 的 a。 */
  href?: string
  /** 图标文本，落进 link-icon 部件；要放图形改用插槽。 */
  icon?: string
  /** 当前页那一层。 */
  current?: boolean
}

/** 单层的元信息，由 collection 推出。 */
export interface BreadcrumbNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  href?: string
  icon?: string
  current: boolean
}

/** 折叠后序列里的一项：一层路径，或一段被折叠掉的层级。 */
export type BreadcrumbItem
  = | { type: 'node', node: BreadcrumbNodeMeta }
    | { type: 'ellipsis', nodes: readonly BreadcrumbNodeMeta[] }

export interface BreadcrumbProps {
  /**
   * 层级数据，文字、链接与当前页的事实源。
   * 缺省即回到「层级逐个写成部件」的老路。
   */
  collection?: readonly BreadcrumbNode[]
  /** 最多展开几层，超出的中间层折成一个省略位；不给即全列。 */
  maxItems?: number
  /** 文字方向，只作用于排版；作者没给就不写。 */
  dir?: Direction
  translations?: Partial<BreadcrumbTranslations>
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
  tone?: Tone
  /** 尺寸：sm / md / lg。 */
  size?: Size
}

/**
 * 链接自报是不是当前页，connect 据此产出属性。
 * connect 不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface BreadcrumbLinkProps {
  /** 当前页那一条：输出 aria-current="page"，点不动、不占 Tab 位。 */
  current?: boolean
}

export interface BreadcrumbApi<T extends PropTypes = PropTypes> {
  /** collection 推出的层级元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly BreadcrumbNodeMeta[]
  /** 按 maxItems 折叠后的序列，省略位自带被折叠的那几层；没给 collection 即空数组。 */
  items: readonly BreadcrumbItem[]
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: () => T['element']
  getLinkProps: (props: BreadcrumbLinkProps) => T['element']
  getLinkIconProps: () => T['element']
  getSeparatorProps: () => T['element']
  getEllipsisProps: () => T['element']
}
