import type { KnownViolations } from './run'

/** axe 存量违规登记表，两个适配器共用；修好一条即从表里删一条，否则判登记过期。 */
export const knownA11yViolations: KnownViolations = {}

/** 全组件通用登记，整轮至少命中一次即可。 */
export const knownA11yViolationsEverywhere: Readonly<Record<string, string>> = {}

/** 步骤在浏览器里推不到终态的组件。 */
const replayExempt: Readonly<Record<string, string>> = {
  breadcrumb: '扫描必须拦下跨文档跳转否则测试宿主被导航走，而用例断言的正是不拦下，同一文档里不可兼得',
}

/** Vue 适配器的基线。 */
export const vueA11yBaseline = {
  known: knownA11yViolations,
  knownEverywhere: knownA11yViolationsEverywhere,
  replayExempt,
}

/** WC 适配器的基线，在共用表之上逐条列出 WC 独有的登记。 */
export const wcA11yBaseline = {
  known: {
    ...knownA11yViolations,
    // 必需子节点由作者手写
    steps: { 'aria-required-children': 'WC 侧作者手写的部件缺角色要求的直接子节点' },
  },
  knownEverywhere: knownA11yViolationsEverywhere,
  replayExempt,
}
