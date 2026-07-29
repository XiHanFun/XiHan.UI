// 基于 axe-core 的无障碍断言，只在浏览器模式下引用。
import axe from 'axe-core'

/** 默认规则集，覆盖 WCAG 2.1 A/AA，不含 best-practice。 */
export const WCAG_21_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

export interface AxeCheckOptions {
  /** 只跑这些标签的规则，默认 {@link WCAG_21_AA_TAGS}。 */
  tags?: readonly string[]
  /** 要关掉的规则 id。 */
  disableRules?: readonly string[]
}

function toRunOptions(options: AxeCheckOptions): axe.RunOptions {
  const { tags = WCAG_21_AA_TAGS, disableRules = [] } = options
  const rules: Record<string, { enabled: boolean }> = {}
  for (const id of disableRules) rules[id] = { enabled: false }
  return {
    runOnly: { type: 'tag', values: [...tags] },
    rules,
    // 只保留 violations，不要 passes/incomplete
    resultTypes: ['violations'],
  }
}

/** 对给定容器跑一次 axe，返回原始结果。 */
export function runAxe(target: Element | Document = document, options: AxeCheckOptions = {}): Promise<axe.AxeResults> {
  return axe.run(target, toRunOptions(options))
}

/** 把违规列表渲染成含规则 id、影响等级、命中选择器与修复说明的文本报告。 */
export function formatViolations(violations: readonly axe.Result[]): string {
  const lines = violations.map((v) => {
    const nodes = v.nodes.map(n => `      ${n.target.join(' ')}\n        ${n.failureSummary?.replace(/\n/g, '\n        ') ?? ''}`)
    return [`  [${v.impact ?? 'unknown'}] ${v.id} — ${v.help}`, `    ${v.helpUrl}`, ...nodes].join('\n')
  })
  return `axe 发现 ${violations.length} 条违规：\n${lines.join('\n')}`
}

/** 断言给定容器无 axe 违规，有违规时抛出格式化后的报告。 */
export async function expectNoAxeViolations(target: Element | Document = document, options: AxeCheckOptions = {}): Promise<void> {
  const { violations } = await runAxe(target, options)
  if (violations.length > 0)
    throw new Error(formatViolations(violations))
}
