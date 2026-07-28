import type { ApplyContext } from '../conformance/apply-step'
import type { AdapterHarness, ConformanceSuite, TestHooks } from '../conformance/types'
import type { AxeCheckOptions } from './axe'
import { applyStep } from '../conformance/apply-step'
import { collectDomSnapshot } from '../snapshot/collect'
import { formatViolations, runAxe } from './axe'

/** 组件名 → 规则 id → 一句话说明。 */
export type KnownViolations = Readonly<Record<string, Readonly<Record<string, string>>>>

export interface A11yRunOptions extends AxeCheckOptions {
  /**
   * 已登记的存量违规：命中不判失败，但**必须仍然命中**。
   *
   * 做成逐条登记而不是关规则，是为了让每一条都带着组件名、规则 id 和理由摆在明面上；
   * 修好了就得从表里删掉，否则判"登记过期"失败——不然表会变成一张没人再看的免死金牌。
   */
  readonly known?: KnownViolations
  /**
   * 全组件通用的登记：规则 id → 理由。
   *
   * 给那些"命中哪几个组件取决于浮层当帧渲染到哪一步"的规则用（典型是 color-contrast）。
   * 逐组件登记会随机漂移，登记表天天要改。这里只要求整轮至少命中一次，
   * 一次都不命中同样判过期。
   */
  readonly knownEverywhere?: Readonly<Record<string, string>>
  /**
   * 步骤在浏览器里放不出来的组件：组件名 → 理由。
   *
   * 一致性套件的步骤是照 jsdom 写的，少数组件到真实浏览器里前提就不成立
   * （退场动画真的要走完、真实选区行为不同、焦点时序不同）。
   * 这类用例只是推不到终态，扫不到那个形态而已，本身该由浏览器态一致性去追，
   * 不是无障碍问题——但要写明是哪个组件、为什么，且它一旦能放出来就得删。
   *
   * 按组件而不是按用例登记：同一个根因常常同时打掉同组件的六七个用例，
   * 逐用例登记只会把同一句理由抄六遍，还会被用例改名冲掉。
   */
  readonly replayExempt?: Readonly<Record<string, string>>
}

async function mount(harness: AdapterHarness, suite: ConformanceSuite, props: Readonly<Record<string, unknown>>, tree: ConformanceSuite['fixture']): Promise<ApplyContext> {
  const { root } = await harness.mount({ component: suite.component, props, tree })
  return { harness, root, doc: root.ownerDocument, component: suite.component, anatomy: suite.anatomy }
}

/**
 * 挡掉真实导航。
 *
 * jsdom 里表单提交与链接点击都是空操作，浏览器里它们会真的把页面导航走——
 * 测试宿主的 iframe 一旦跳走，整个文件剩下的用例全部失联。
 *
 * 挂在冒泡阶段而不是捕获阶段：捕获阶段就 preventDefault 会让归一化层的
 * `defaultPrevented` 守卫提前短路，组件自己的处理器根本轮不到，测的就不是真实行为了。
 * 冒泡阶段拿到事件时组件已经处理完，此时取消默认动作只挡导航。
 */
function blockNavigation(doc: Document): void {
  doc.addEventListener('submit', e => e.preventDefault())
  doc.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a)
      return
    // 只拦跨文档跳转。片段跳转（#id）留着——锚点组件的降级路径正是靠它，
    // 一律拦下会把"没有 JS 时链接还能用"这条断言直接判死。
    const url = new URL(a.href, doc.baseURI)
    const sameDocument = url.origin === doc.location.origin && url.pathname === doc.location.pathname && url.search === doc.location.search
    if (!sameDocument)
      e.preventDefault()
  })
}

/** 归一化快照签名：id 已被抹成 @self、IDREF 已翻成 part 引用，同一形态多次挂载得到同一串。 */
function signature(ctx: ApplyContext, harness: AdapterHarness): string {
  const snap = collectDomSnapshot({ doc: ctx.doc, component: ctx.component, anatomy: ctx.anatomy, events: harness.drainEvents() })
  return JSON.stringify({ parts: snap.parts, order: snap.order })
}

/**
 * 无障碍扫描：把一致性套件的 fixture 挂进真实浏览器，对初始态与各用例终态跑 axe。
 *
 * 扫的是 `document.body` 而不是宿主根元素——浮层组件的内容挂在 portal 里，在根之外。
 *
 * 终态按归一化快照去重：大量用例走不同路径收敛到同一个 DOM 形态，
 * 逐个重扫只是把同一份结果算 N 次。
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

    /**
     * 扫一次；已登记的规则记账后放行，其余攒进 report。
     * 攒而不是当场抛：一次跑完能看到该组件全部未登记的违规，
     * 当场抛的话每跑一轮只露出第一条，得来回跑十几遍才能把账对齐。
     */
    const scan = async (ctx: ApplyContext, label: string, report: string[]): Promise<void> => {
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

      // 放在最后：前面几条跑完，命中账才记全
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
    // 登记在最后：整轮扫完才知道通用登记有没有命中过
    hooks.describe(`a11y 通用登记 (${harness.adapterName})`, () => {
      hooks.it('通用登记的规则整轮至少命中一次', () => {
        const stale = Object.keys(knownEverywhere).filter(id => !hitEverywhere.has(id))
        if (stale.length)
          throw new Error(`整轮一次都没扫出来，请从通用登记删掉：${stale.join(', ')}`)
      })
    })
  }
}
