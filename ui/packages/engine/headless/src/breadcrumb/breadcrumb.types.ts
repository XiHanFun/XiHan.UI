import type { Direction, PropTypes } from '@xihan-ui/kernel'

/** 读屏用的文案，默认英文。 */
export interface BreadcrumbTranslations {
  /** 根节点的 aria-label，用于区分页面上的多个 nav 地标。 */
  root: string
}

export interface BreadcrumbProps {
  /** 文字方向，只作用于排版；作者没给就不写。 */
  dir?: Direction
  translations?: Partial<BreadcrumbTranslations>
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
  tone?: string
  /** 尺寸：sm / md / lg。 */
  size?: string
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
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getItemProps: () => T['element']
  getLinkProps: (props: BreadcrumbLinkProps) => T['element']
  getSeparatorProps: () => T['element']
  getEllipsisProps: () => T['element']
}
