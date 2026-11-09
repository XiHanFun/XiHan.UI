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

/** 等动画的上限，超过就按当前帧扫。 */
const SETTLE_TIMEOUT_MS = 1000

/**
 * 等有限时长的动画跑完再往下走。
 * 进场淡入期间 getComputedStyle 读到的是插值后的半透明色，色彩对比按那一帧算出来的比值
 * 不是用户最终看到的比值。无限循环的动画（转圈）不等，另加上限防某条动画永远不兑现。
 * 一轮等完再看一眼：浮层的进场是"先落位、下一帧才起淡入"，与入口面的过渡不同时起跑，
 * 只等第一轮捕到的那批会在第二批还没跑完的那一帧扫到半透明的文字；没有新起的动画才算落定。
 */
export async function settleAnimations(doc: Document): Promise<void> {
  const deadline = performance.now() + SETTLE_TIMEOUT_MS
  while (true) {
    const finite = doc.getAnimations().filter((a) => {
      if (a.playState !== 'running')
        return false
      const timing = a.effect?.getComputedTiming()
      return timing != null && Number.isFinite(timing.endTime as number)
    })
    const remaining = deadline - performance.now()
    if (finite.length === 0 || remaining <= 0)
      return
    await Promise.race([
      Promise.all(finite.map(a => a.finished.catch(() => undefined))),
      new Promise(resolve => setTimeout(resolve, remaining)),
    ])
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
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

/**
 * 断言给定容器无 axe 违规，有违规时抛出格式化后的报告。
 * 先等进场动画落定：露面淡入的那几帧文字是半透明的，按那一帧算出的对比度不是用户最终看到的
 */
export async function expectNoAxeViolations(target: Element | Document = document, options: AxeCheckOptions = {}): Promise<void> {
  await settleAnimations(target instanceof Document ? target : target.ownerDocument)
  const { violations } = await runAxe(target, options)
  if (violations.length > 0)
    throw new Error(formatViolations(violations))
}
