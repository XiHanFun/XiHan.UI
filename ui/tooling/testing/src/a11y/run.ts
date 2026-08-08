import type { ApplyContext } from '../conformance/apply-step'
import type { AdapterHarness, ConformanceSuite, TestHooks } from '../conformance/types'
import type { AxeCheckOptions } from './axe'
import { applyStep } from '../conformance/apply-step'
import { collectDomSnapshot } from '../snapshot/collect'
import { formatViolations, runAxe } from './axe'

/** 组件名 → 规则 id → 一句话说明。 */
export type KnownViolations = Readonly<Record<string, Readonly<Record<string, string>>>>

export interface A11yRunOptions extends AxeCheckOptions {
  /** 逐组件登记的存量违规，命中不判失败，但一条都不再命中时判登记过期。 */
  readonly known?: KnownViolations
  /** 全组件通用的登记，规则 id → 理由，整轮至少命中一次，否则判登记过期。 */
  readonly knownEverywhere?: Readonly<Record<string, string>>
  /** 步骤在浏览器里放不完的组件，组件名 → 理由；步骤能放完时判豁免过期。 */
  readonly replayExempt?: Readonly<Record<string, string>>
}

async function mount(harness: AdapterHarness, suite: ConformanceSuite, props: Readonly<Record<string, unknown>>, tree: ConformanceSuite['fixture']): Promise<ApplyContext> {
  const { root } = await harness.mount({ component: suite.component, props, tree })
  return { harness, root, doc: root.ownerDocument, component: suite.component, anatomy: suite.anatomy }
}

/** 挡掉表单提交与跨文档链接引发的真实导航；挂在冒泡阶段，不影响组件自身的处理器。 */
function blockNavigation(doc: Document): void {
  doc.addEventListener('submit', e => e.preventDefault())
  doc.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a)
      return
    // 只拦跨文档跳转，片段跳转（#id）放行
    const url = new URL(a.href, doc.baseURI)
    const sameDocument = url.origin === doc.location.origin && url.pathname === doc.location.pathname && url.search === doc.location.search
    if (!sameDocument)
      e.preventDefault()
  })
}

/** 等动画的上限，超过就按当前帧扫。 */
const SETTLE_TIMEOUT_MS = 1000

/**
 * 等有限时长的动画跑完再往下走。
 * 进场淡入期间 getComputedStyle 读到的是插值后的半透明色，色彩对比按那一帧算出来的比值
 * 不是用户最终看到的比值。无限循环的动画（转圈）不等，另加上限防某条动画永远不兑现。
 */
async function settleAnimations(doc: Document): Promise<void> {
  const finite = doc.getAnimations().filter((a) => {
    if (a.playState !== 'running')
      return false
    const timing = a.effect?.getComputedTiming()
    return timing != null && Number.isFinite(timing.endTime as number)
  })
  if (finite.length === 0)
    return
  await Promise.race([
    Promise.all(finite.map(a => a.finished.catch(() => undefined))),
    new Promise(resolve => setTimeout(resolve, SETTLE_TIMEOUT_MS)),
  ])
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

/** 由归一化 DOM 快照算出的形态签名，同一形态多次挂载得到同一串。 */
function signature(ctx: ApplyContext, harness: AdapterHarness): string {
  const snap = collectDomSnapshot({ doc: ctx.doc, component: ctx.component, anatomy: ctx.anatomy, events: harness.drainEvents() })
  return JSON.stringify({ parts: snap.parts, order: snap.order })
}

/**
 * 把一致性套件的 fixture 挂进浏览器，对初始态与各用例终态跑 axe。
 * 扫描目标是 `document.body`，以覆盖 portal 里的浮层内容；终态按形态签名去重。
 */
export function runA11y(
  harness: AdapterHarness,
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
  options: A11yRunOptions = {},
): void {
  const { known = {}, knownEverywhere = {}, replayExempt = {}, ...axeOptions } = options
  blockNavigation(document)

  const componentNames = new Set(suites.map(s => s.component))
  const hitEverywhere = new Set<string>()
  hooks.describe(`a11y 登记表 (${harness.adapterName})`, () => {
    hooks.it('登记的组件都还在', () => {
      const gone = Object.keys(known).filter(c => !componentNames.has(c))
      if (gone.length)
        throw new Error(`登记表里的组件已不存在，请删掉：${gone.join(', ')}`)
    })
  })

  for (const suite of suites) {
    const knownRules = known[suite.component] ?? {}
    const hitRules = new Set<string>()
    const replayReason = replayExempt[suite.component]
    let replayFailures = 0

    /** 扫一次：已登记的规则记账后放行，其余攒进 report 由调用方统一抛出。 */
    const scan = async (ctx: ApplyContext, label: string, report: string[]): Promise<void> => {
      await settleAnimations(ctx.doc)
      const { violations } = await runAxe(ctx.doc.body, axeOptions)
      const fresh = violations.filter((v) => {
        if (v.id in knownEverywhere) {
          hitEverywhere.add(v.id)
          return false
        }
        if (!(v.id in knownRules))
          return true
        hitRules.add(v.id)
        return false
      })
      if (fresh.length)
        report.push(`${label}\n${formatViolations(fresh)}`)
    }

    hooks.describe(`a11y: ${suite.component} (${harness.adapterName})`, () => {
      hooks.it('初始态无违规', async () => {
        const report: string[] = []
        const ctx = await mount(harness, suite, {}, suite.fixture)
        try {
          await harness.flush()
          await scan(ctx, '初始态：', report)
        }
        finally {
          await harness.unmount()
        }
        if (report.length)
          throw new Error(`${suite.component}:\n${report.join('\n')}`)
      })

      const interactive = suite.cases.filter(c => c.steps?.length)
      if (interactive.length > 0) {
        hooks.it(`交互终态无违规（${interactive.length} 个用例，按形态去重）`, async () => {
          const report: string[] = []
          const seen = new Set<string>()
          for (const c of interactive) {
            const ctx = await mount(harness, suite, c.props ?? {}, c.fixture ? c.fixture(suite.fixture) : suite.fixture)
            try {
              await harness.flush()
              for (const step of c.steps!) {
                await applyStep(ctx, step)
                await harness.flush()
              }
              const sig = signature(ctx, harness)
              if (seen.has(sig))
                continue
              seen.add(sig)
              await scan(ctx, `用例「${c.name}」终态：`, report)
            }
            catch (e) {
              replayFailures++
              if (replayReason == null)
                report.push(`用例「${c.name}」在浏览器里推不到终态：${(e as Error).message}`)
            }
            finally {
              await harness.unmount()
            }
          }
          if (report.length)
            throw new Error(`${suite.component}:\n${report.join('\n')}`)
        })
      }

      // 放在最后，等前面几条跑完命中账才记全
      if (Object.keys(knownRules).length > 0) {
        hooks.it('已登记的违规仍然存在', () => {
          const stale = Object.keys(knownRules).filter(id => !hitRules.has(id))
          if (stale.length)
            throw new Error(`已经扫不出来了，请从登记表删掉：${stale.join(', ')}`)
        })
      }
      if (replayReason != null) {
        hooks.it('步骤豁免仍然必要', () => {
          if (replayFailures === 0)
            throw new Error('步骤现在能在浏览器里放完了，请从 replayExempt 里删掉本组件')
        })
      }
    })
  }

  if (Object.keys(knownEverywhere).length > 0) {
    // 放在最后，整轮扫完才知道通用登记有没有命中过
    hooks.describe(`a11y 通用登记 (${harness.adapterName})`, () => {
      hooks.it('通用登记的规则整轮至少命中一次', () => {
        const stale = Object.keys(knownEverywhere).filter(id => !hitEverywhere.has(id))
        if (stale.length)
          throw new Error(`整轮一次都没扫出来，请从通用登记删掉：${stale.join(', ')}`)
      })
    })
  }
}
