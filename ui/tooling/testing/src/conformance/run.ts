import type { ApplyContext } from './apply-step'
import type { AdapterHarness, ConformanceCase, ConformanceSuite, DomSnapshot, TestHooks } from './types'
import { danglingCovers, missingKeyboardRows } from '../machine/transition-coverage'
import { collectDomSnapshot } from '../snapshot/collect'
import { applyStep } from './apply-step'
import { checkExpectation } from './match'

export interface RunOptions {
  /** 键盘表未全覆盖是否判失败。默认 true；浏览器态之外的键盘/焦点行只能在真机验证时置 false。 */
  readonly enforceKeyboardCoverage?: boolean
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

/** 把一份规格喂给某个 harness，逐帧断言实现是否符合规格。 */
export function runConformance(
  harness: AdapterHarness,
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
  opts: RunOptions = {},
): void {
  const enforce = opts.enforceKeyboardCoverage ?? true
  for (const suite of suites) {
    hooks.describe(`conformance: ${suite.component} (${harness.adapterName})`, () => {
      const missing = missingKeyboardRows(suite)
      const total = suite.keyboard.rows.length
      hooks.it(`键盘表覆盖 ${total - missing.length}/${total}`, () => {
        const dangling = danglingCovers(suite)
        if (dangling.length)
          throw new Error(`covers 指向不存在的键盘行：${dangling.join(', ')}`)
        if (enforce && missing.length)
          throw new Error(`键盘表未覆盖：${missing.map(r => r.id).join(', ')}`)
      })
      for (const c of suite.cases) {
        hooks.it(c.name, async () => {
          const frames = await recordTrace(harness, suite, c)
          assertCaseFrames(c, frames)
        })
      }
    })
  }
}
