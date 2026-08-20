import type { KnownViolations } from './run'

/** axe 存量违规登记表，两个适配器共用；修好一条即从表里删一条，否则判登记过期。 */
export const knownA11yViolations: KnownViolations = {
  // 禁用标签的文字用 --xh-fg-disabled 落在 --xh-bg-muted 上，实测 2.36:1（浅色）/ 1.94:1（深色）。
  // 这不是 tag 自己的取值：整个禁用族都是这一档——toggle-group 条目、download-trigger、
  // form 提交钮、number-field 步进钮、signature-pad 清除钮、timer 控制钮、toolbar、calendar 格子
  // 同样是 fg-disabled 落在 bg-muted 上，逐个算都是 2.36 / 1.94；
  // 输入框一族（text-field、number-field、combobox、date-field、time-field、tags-input、
  // pin-input、password-input、mention、editable、field、file-upload、cascader、tree-select、
  // color-picker、date-picker）落在 bg-subtle 上，与 bg-muted 同值，也是 2.36 / 1.94；
  // 改用 opacity 表达禁用的那一族（button、checkbox）更低，浅色只有 1.34 ~ 1.9。
  // 令牌层对此有明写的口径（tokens/tests/contrast.spec.ts「禁用态按 1.4.3 豁免」）：
  // WCAG 1.4.3 对失效的用户界面组件免除对比度要求，这一档只钉住不低于 2.5（对 bg-canvas）。
  // 只有 tag 被 axe 扫出来，是因为 axe 跳过带原生 disabled 或 aria-disabled 的节点，
  // 而 tag 的 root 是个没有角色的容器，禁用只表达成 data-disabled——同样的 2.36
  // 在别处 axe 看不见，在这里看得见。单独把 tag 调亮会让它与整个禁用族对不上，
  // 真要改是把 fg.disabled 整层抬上去，那是令牌层的决定，不在这条登记的范围内。
  tag: { 'color-contrast': '禁用标签的文字是全库统一的 fg-disabled/bg-muted 一档（2.36:1），按 1.4.3 失效控件豁免；tag 的 root 没有 axe 认得的禁用语义，所以只有它被扫出来' },
}

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
