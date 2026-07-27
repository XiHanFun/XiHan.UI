import type { Direction, PropTypes } from '@xihan-ui/core'

/** 读屏用的文案。默认英文，与 pagination / dialog 的 translations 同一套写法。 */
export interface BreadcrumbTranslations {
  /**
   * 根节点的 aria-label。
   * 一页上常同时有多个 nav 地标（主导航、分页、面包屑），不给名字读屏念出来全是"导航"，
   * 用户分不出跳到了哪一个。
   */
  root: string
}

export interface BreadcrumbProps {
  /**
   * 文字方向。只作用于排版：RTL 下整条路径要从右往左排，靠根节点上的 dir 交给浏览器排。
   * 作者没给就不写——写死 ltr 会切断从 RTL 祖先继承来的方向。
   */
  dir?: Direction
  translations?: Partial<BreadcrumbTranslations>
}

/**
 * 链接自报家门：是不是当前页由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (props, 本部件声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface BreadcrumbLinkProps {
  /** 当前页那一条：输出 aria-current="page"，同时点不动、也不占 Tab 位。 */
  current?: boolean
}

export interface BreadcrumbApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: () => T['element']
  getLinkProps: (props: BreadcrumbLinkProps) => T['element']
  getSeparatorProps: () => T['element']
  getEllipsisProps: () => T['element']
}
