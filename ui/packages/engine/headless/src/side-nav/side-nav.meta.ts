import type { ComponentMeta } from '../spec/types'

// list 与至少一条 link 是侧栏的最小组合；分组、分支与折叠都可缺省。
export const sideNavMeta: ComponentMeta = {
  component: 'side-nav',
  requiredParts: ['root', 'list', 'link'],
}
