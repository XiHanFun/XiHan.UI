// 无障碍子入口：只在真实浏览器里跑。
// 与主入口分开是因为它拖着 axe-core，jsdom 侧的单测不该为它付解析成本，
// 更不该有人误以为 jsdom 下的扫描结果作数。
export { expectNoAxeViolations, formatViolations, runAxe, WCAG_21_AA_TAGS } from './axe'
export type { AxeCheckOptions } from './axe'
export { vueA11yBaseline, wcA11yBaseline } from './known'
export { runA11y } from './run'
export type { A11yRunOptions, KnownViolations } from './run'
