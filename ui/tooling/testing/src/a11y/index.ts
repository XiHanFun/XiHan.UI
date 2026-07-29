// 无障碍子入口，依赖 axe-core，只在真实浏览器里跑，故与主入口分开。
export { expectNoAxeViolations, formatViolations, runAxe, WCAG_21_AA_TAGS } from './axe'
export type { AxeCheckOptions } from './axe'
export { vueA11yBaseline, wcA11yBaseline } from './known'
export { runA11y } from './run'
export type { A11yRunOptions, KnownViolations } from './run'
