import type { ApplyContext } from './apply-step'
import type { AdapterHarness, ConformanceCase, ConformanceSuite, DomSnapshot, TestHooks } from './types'
import { danglingCovers, missingKeyboardRows } from '../machine/transition-coverage'
import { collectDomSnapshot } from '../snapshot/collect'
import { applyStep } from './apply-step'
import { pendingFrames, settleFrame, settleTeardown } from './frame'
import { checkExpectation } from './match'

export interface RunOptions {
  /** 逐行豁免：键盘行 id → 理由。 */
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

function describeElement(el: Element): string {
  const attrs = Array.from(el.attributes)
    .filter(a => a.name.startsWith('data-') || a.name === 'id')
    .map(a => `${a.name}="${a.value}"`)
    .join(' ')
  return `<${el.tagName.toLowerCase()}${attrs ? ` ${attrs}` : ''}>`
}

/**
 * 卸载并收尾之后，文档必须回到这条轨迹开始前的样子：没有残留的 scope 节点，没有还排着的动画帧，
 * 焦点不落在任何元素上。三条里任何一条不成立，下一条轨迹就跑在这一条的尾巴上。
 */
function assertTraceCleared(doc: Document, component: string, adapter: string): void {
  const left = doc.querySelectorAll(`[data-scope="${component}"]`).length
  if (left)
    throw new Error(`${adapter}: 卸载后文档内仍残留 ${left} 个 ${component} scope 节点`)
  const frames = pendingFrames(doc)
  if (frames)
    throw new Error(`${adapter}: ${component} 卸载后仍有 ${frames} 个动画帧回调排着，会跑进下一条轨迹`)
  const active = doc.activeElement
  if (active && active !== doc.body)
    throw new Error(`${adapter}: ${component} 卸载后焦点仍在 ${describeElement(active)} 上`)
}

/**
 * 每个 harness 此刻归哪条轨迹。
 *
 * 用例超时后测试框架转去跑下一条，超时那条却没有被停下：它的 settle 还在轮询、步骤还在往下走，
 * 走到 finally 还会卸载——卸的是宿主上当下挂着的、属于下一条的那个实例，下一条从此按在一具空壳上。
 * 挂载即登记归属，每一步和收尾前都核对：归属换了人，这条就停在原地，不再碰宿主。
 */
const traceOwners = new WeakMap<AdapterHarness, object>()

/**
 * 一个用例在一个 harness 上的完整轨迹：第 0 帧是挂载后，第 i+1 帧是第 i 步之后。
 * 每一帧都等到动画帧过去再采样（见 settleFrame），采的是能画到屏幕上的那个状态。
 * 卸载后把这条轨迹排下的回调收干净（见 settleTeardown）再核对文档，下一条轨迹从干净的文档起步。
 */
export async function recordTrace(
  harness: AdapterHarness,
  suite: ConformanceSuite,
  c: ConformanceCase,
): Promise<DomSnapshot[]> {
  const tree = c.fixture ? c.fixture(suite.fixture) : suite.fixture
  const { root } = await harness.mount({
    component: suite.component,
    props: { ...suite.defaultProps, ...c.props },
    tree,
  })
  const owner = {}
  traceOwners.set(harness, owner)
  const owned = (): boolean => traceOwners.get(harness) === owner
  const assertOwned = (): void => {
    if (!owned())
      throw new Error(`${harness.adapterName}: ${suite.component} 这条轨迹已超时，宿主归下一条了，不再往下跑`)
  }
  const ctx: ApplyContext = {
    harness,
    root,
    doc: root.ownerDocument,
    component: suite.component,
    anatomy: suite.anatomy,
  }
  const frames: DomSnapshot[] = []
  try {
    await settleFrame(harness, ctx.doc)
    assertOwned()
    frames.push(snap(ctx, harness))
    for (const step of c.steps ?? []) {
      assertOwned()
      await applyStep(ctx, step)
      await settleFrame(harness, ctx.doc)
      assertOwned()
      frames.push(snap(ctx, harness))
    }
  }
  finally {
    // 归属已换的轨迹不卸载：宿主上挂着的已经是别人的实例
    if (owned()) {
      await harness.unmount()
      await settleTeardown(harness, ctx.doc)
      assertTraceCleared(ctx.doc, suite.component, harness.adapterName)
    }
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
function diffSnapshot(a: DomSnapshot, b: DomSnapshot, ignore: ReadonlySet<ParityField>): string[] {
  const diffs: string[] = []
  const j = (x: unknown): string => JSON.stringify(x)
  if (j(a.parts) !== j(b.parts))
    diffs.push(`parts:\n    A=${j(a.parts)}\n    B=${j(b.parts)}`)
  if (j(a.order) !== j(b.order))
    diffs.push(`order: A=${j(a.order)} B=${j(b.order)}`)
  if (!ignore.has('activeElement') && j(a.activeElement) !== j(b.activeElement))
    diffs.push(`activeElement: A=${j(a.activeElement)} B=${j(b.activeElement)}`)
  if (j(a.events) !== j(b.events))
    diffs.push(`events: A=${j(a.events)} B=${j(b.events)}`)
  if (j(a.strayParts) !== j(b.strayParts))
    diffs.push(`strayParts: A=${j(a.strayParts)} B=${j(b.strayParts)}`)
  return diffs
}

/** 逐帧比对里可以声明不比的字段。 */
export type ParityField = 'activeElement'

export interface RunParityOptions {
  /**
   * 声明不比的帧字段，每一项都要在调用处写清为什么。
   *
   * `activeElement` 是唯一会因适配器调度差异而抖的一项：移焦由提交后的回调放下去，
   * 各家排这一步的时机不同，而两侧的 tick 都盯 DOM 变动、看不见移焦，
   * 于是同一帧里可能一个已经移完、另一个还在半路——同一份代码两次跑能得出两种结果。
   * 声明不比它之后，焦点仍由各自的一致性套件用 settle 等着断言，那一侧是确定的。
   */
  readonly ignore?: readonly ParityField[]
}

/** 跨适配器轨迹比对：同一份规格在多个 harness 上串行录制，逐帧结构比对并打印 diff。 */
export function runParity(
  harnesses: readonly AdapterHarness[],
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
  options: RunParityOptions = {},
): void {
  const ignore = new Set<ParityField>(options.ignore ?? [])
  for (const suite of suites) {
    const names = harnesses.map(h => h.adapterName).join(' vs ')
    hooks.describe(`parity: ${suite.component} (${names})`, () => {
      for (const c of suite.cases) {
        // skipParity 的用例只登记一条占位测试
        if (c.skipParity) {
          hooks.it(`${c.name}（不做逐帧比对：${c.skipParity}）`, () => {})
          continue
        }
        hooks.it(c.name, async () => {
          // 串行录制各 harness 的轨迹
          const traces: Array<[string, DomSnapshot[]]> = []
          for (const h of harnesses)
            traces.push([h.adapterName, await recordTrace(h, suite, c)])

          const [baseName, baseTrace] = traces[0]!
          for (const [name, trace] of traces.slice(1)) {
            if (trace.length !== baseTrace.length)
              throw new Error(`parity ${name} vs ${baseName}：轨迹帧数 ${trace.length} ≠ ${baseTrace.length}`)
            for (let i = 0; i < baseTrace.length; i++) {
              const diff = diffSnapshot(baseTrace[i]!, trace[i]!, ignore)
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
        // 已被覆盖的豁免视为过期
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

  // 全局兜底：对不上任何套件的豁免键判失败
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
