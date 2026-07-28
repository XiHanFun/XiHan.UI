// 无障碍断言：跑真实浏览器里的 axe-core。
// jsdom 拿不到布局、计算样式与可见性，色彩对比、目标尺寸、遮挡判定在那里全是假绿，
// 所以本模块只在浏览器模式下被引用。
import axe from 'axe-core'

/** 默认规则集：WCAG 2.1 A/AA。best-practice 不在内，要用得显式传。 */
export const WCAG_21_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

export interface AxeCheckOptions {
  /** 只跑这些标签的规则，默认 {@link WCAG_21_AA_TAGS}。 */
  tags?: readonly string[]
  /** 关掉的规则 id。每关一条都必须在调用处注明理由。 */
  disableRules?: readonly string[]
}

function toRunOptions(options: AxeCheckOptions): axe.RunOptions {
  const { tags = WCAG_21_AA_TAGS, disableRules = [] } = options
  const rules: Record<string, { enabled: boolean }> = {}
  for (const id of disableRules) rules[id] = { enabled: false }
  return {
    runOnly: { type: 'tag', values: [...tags] },
    rules,
    // 结果里只留断言要用的部分，省掉 passes/incomplete 的大对象
    resultTypes: ['violations'],
  }
}

/** 对给定容器跑一次 axe，返回原始结果。 */
export function runAxe(target: Element | Document = document, options: AxeCheckOptions = {}): Promise<axe.AxeResults> {
  return axe.run(target, toRunOptions(options))
}

/** 把违规列表渲染成人能读的报告：规则 id、影响等级、命中选择器、修复说明。 */
export function formatViolations(violations: readonly axe.Result[]): string {
  const lines = violations.map((v) => {
    const nodes = v.nodes.map(n => `      ${n.target.join(' ')}\n        ${n.failureSummary?.replace(/\n/g, '\n        ') ?? ''}`)
    return [`  [${v.impact ?? 'unknown'}] ${v.id} — ${v.help}`, `    ${v.helpUrl}`, ...nodes].join('\n')
  })
  return `axe 发现 ${violations.length} 条违规：\n${lines.join('\n')}`
}

/**
 * 断言给定容器无 axe 违规。
 * 有违规时抛出，错误信息含规则 id、影响等级、命中选择器与修复说明。
 */
export async function expectNoAxeViolations(target: Element | Document = document, options: AxeCheckOptions = {}): Promise<void> {
  const { violations } = await runAxe(target, options)
  if (violations.length > 0)
    throw new Error(formatViolations(violations))
}
