import type { ApplyContext } from './apply-step'
import type { AdapterHarness, ConformanceCase, ConformanceSuite, DomSnapshot, TestHooks } from './types'
import { danglingCovers, missingKeyboardRows } from '../machine/transition-coverage'
import { collectDomSnapshot } from '../snapshot/collect'
import { applyStep } from './apply-step'
import { checkExpectation } from './match'

export interface RunOptions {
  /**
   * 逐行豁免：键盘行 id → 豁免理由。只给"在这个运行时里根本演不出来"的行用，
   * 比如需要真实焦点移动的 Tab 环绕（jsdom 按 Tab 不会移动焦点）。
   *
   * 刻意做成逐行而不是一个总开关：总开关一关，整张表就再也没人守，
   * 后来新增的行漏了也没人知道。豁免写在这里，谁被放过、为什么，一眼看得见。
   *
   * 豁免了却其实已经覆盖的行会判失败——理由过期了就该删掉，不留在这儿骗人。
   */
  readonly keyboardCoverageExempt?: Readonly<Record<string, string>>
}

function snap(ctx: ApplyContext, harness: AdapterHarness): DomSnapshot {
  return collectDomSnapshot({
    doc: ctx.doc,
    component: ctx.component,
    anatomy: ctx.anatomy,
    events: harness.drainEvents(),
  })
}

function assertScopeCleared(doc: Document, component: string, adapter: string): void {
  const left = doc.querySelectorAll(`[data-scope="${component}"]`).length
  if (left)
    throw new Error(`${adapter}: 卸载后文档内仍残留 ${left} 个 ${component} scope 节点`)
}

/** 一个用例在一个 harness 上的完整轨迹：第 0 帧是挂载后，第 i+1 帧是第 i 步之后。 */
export async function recordTrace(
  harness: AdapterHarness,
  suite: ConformanceSuite,
  c: ConformanceCase,
): Promise<DomSnapshot[]> {
  const tree = c.fixture ? c.fixture(suite.fixture) : suite.fixture
  const { root } = await harness.mount({ component: suite.component, props: c.props ?? {}, tree })
  const ctx: ApplyContext = {
    harness,
    root,
    doc: root.ownerDocument,
    component: suite.component,
    anatomy: suite.anatomy,
  }
  const frames: DomSnapshot[] = []
  try {
    await harness.flush()
    frames.push(snap(ctx, harness))
    for (const step of c.steps ?? []) {
      await applyStep(ctx, step)
      await harness.flush()
      frames.push(snap(ctx, harness))
    }
  }
  finally {
    await harness.unmount()
    assertScopeCleared(ctx.doc, suite.component, harness.adapterName)
  }
  return frames
}

function assertCaseFrames(c: ConformanceCase, frames: readonly DomSnapshot[]): void {
  const errs: string[] = []
  if (c.initial)
    errs.push(...checkExpectation(frames[0]!, c.initial, 'initial'))
  ;(c.steps ?? []).forEach((step, i) => {
    if (step.expect)
      errs.push(...checkExpectation(frames[i + 1]!, step.expect, `step#${i} (${step.kind})`))
  })
  if (c.expect)
    errs.push(...checkExpectation(frames[frames.length - 1]!, c.expect, 'final'))
  if (errs.length)
    throw new Error(`\n  ${errs.join('\n  ')}`)
}

/** 两个快照按结构字段深比；返回差异描述，空即一致。 */
function diffSnapshot(a: DomSnapshot, b: DomSnapshot): string[] {
  const diffs: string[] = []
  const j = (x: unknown): string => JSON.stringify(x)
  if (j(a.parts) !== j(b.parts))
    diffs.push(`parts:\n    A=${j(a.parts)}\n    B=${j(b.parts)}`)
  if (j(a.order) !== j(b.order))
    diffs.push(`order: A=${j(a.order)} B=${j(b.order)}`)
  if (j(a.activeElement) !== j(b.activeElement))
    diffs.push(`activeElement: A=${j(a.activeElement)} B=${j(b.activeElement)}`)
  if (j(a.events) !== j(b.events))
    diffs.push(`events: A=${j(a.events)} B=${j(b.events)}`)
  if (j(a.strayParts) !== j(b.strayParts))
    diffs.push(`strayParts: A=${j(a.strayParts)} B=${j(b.strayParts)}`)
  return diffs
}

/**
 * 跨适配器轨迹比对：同一份规格在多个 harness 上各自独占文档串行录制，逐帧结构比对。
 * 无人写期望值——只要两端有任一 part 属性/焦点/事件/顺序不一致就在那一帧炸并打印结构 diff。
 */
export function runParity(
  harnesses: readonly AdapterHarness[],
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
): void {
  for (const suite of suites) {
    const names = harnesses.map(h => h.adapterName).join(' vs ')
    hooks.describe(`parity: ${suite.component} (${names})`, () => {
      for (const c of suite.cases) {
        // 计时相关的用例帧序天然对不齐（同一次按住在两侧跑的拍数不一定相同），
        // 逐帧比对对它们没有意义。跳过要写理由，且用例名里标出来，别让人以为它跑过了。
        if (c.skipParity) {
          hooks.it(`${c.name}（不做逐帧比对：${c.skipParity}）`, () => {})
          continue
        }
        hooks.it(c.name, async () => {
          // 串行：同一时刻文档内只有一个 harness 的实例
          const traces: Array<[string, DomSnapshot[]]> = []
          for (const h of harnesses)
            traces.push([h.adapterName, await recordTrace(h, suite, c)])

          const [baseName, baseTrace] = traces[0]!
          for (const [name, trace] of traces.slice(1)) {
            if (trace.length !== baseTrace.length)
              throw new Error(`parity ${name} vs ${baseName}：轨迹帧数 ${trace.length} ≠ ${baseTrace.length}`)
            for (let i = 0; i < baseTrace.length; i++) {
              const diff = diffSnapshot(baseTrace[i]!, trace[i]!)
              if (diff.length) {
                const label = i === 0 ? 'mount' : `step#${i - 1} (${c.steps![i - 1]!.kind})`
                throw new Error(`parity ${name} vs ${baseName} @ ${label}:\n  ${diff.join('\n  ')}`)
              }
            }
          }
        })
      }
    })
  }
}

/** 把一份规格喂给某个 harness，逐帧断言实现是否符合规格。 */
export function runConformance(
  harness: AdapterHarness,
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
  opts: RunOptions = {},
): void {
  const exempt = opts.keyboardCoverageExempt ?? {}
  for (const suite of suites) {
    hooks.describe(`conformance: ${suite.component} (${harness.adapterName})`, () => {
      const missing = missingKeyboardRows(suite)
      const total = suite.keyboard.rows.length
      const unmet = missing.filter(r => !(r.id in exempt))
      const excused = missing.filter(r => r.id in exempt)
      const suffix = excused.length ? `（豁免 ${excused.length}）` : ''
      hooks.it(`键盘表覆盖 ${total - missing.length}/${total}${suffix}`, () => {
        const dangling = danglingCovers(suite)
        if (dangling.length)
          throw new Error(`covers 指向不存在的键盘行：${dangling.join(', ')}`)
        // 豁免过期了就得删：留着会让人以为这行至今演不出来
        const ids = new Set(suite.keyboard.rows.map(r => r.id))
        const stale = Object.keys(exempt)
          .filter(id => ids.has(id) && !missing.some(r => r.id === id))
          .map(id => `${id}（已被覆盖）`)
        if (stale.length)
          throw new Error(`豁免已过期，请删掉：${stale.join(', ')}`)
        if (unmet.length)
          throw new Error(`键盘表未覆盖：${unmet.map(r => r.id).join(', ')}`)
      })
      for (const c of suite.cases) {
        hooks.it(c.name, async () => {
          const frames = await recordTrace(harness, suite, c)
          assertCaseFrames(c, frames)
        })
      }
    })
  }

  // 上面那条过期检查是逐套件跑的，只敢管"这个套件里认得的 id"——
  // 豁免表是全局的，别的套件的行落到这儿必须放过。代价是：**一条拼错组件名或行号的豁免
  // 在每个套件里都被放过，于是永远静默生效**，既不挡什么也没人发现它已经是死条目。
  // 全部套件登记完再统一兜一次底：一次都没对上任何行的豁免键，一定是写错了。
  if (Object.keys(exempt).length > 0) {
    hooks.describe(`conformance 豁免表 (${harness.adapterName})`, () => {
      hooks.it('每条豁免都对得上某个套件的键盘行', () => {
        const known = new Set(suites.flatMap(s => s.keyboard.rows.map(r => r.id)))
        const orphan = Object.keys(exempt).filter(id => !known.has(id))
        if (orphan.length)
          throw new Error(`豁免指向不存在的键盘行（多半是拼错了），请修正或删掉：${orphan.join(', ')}`)
      })
    })
  }
}
