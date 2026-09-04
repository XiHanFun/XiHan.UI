import type { AdapterName, ConformanceSuite, Fixture, FixtureNode, TestHooks } from '../conformance/types'
import { scanScopedTags } from './markup'

/**
 * 服务端直出宿主。
 * 只有「把 fixture 渲成一串 HTML」这一件事，与 AdapterHarness 的 DOM 语义无关。
 */
export interface SsrHarness {
  readonly adapterName: AdapterName
  /** 在没有 document 的宿主里直出，返回主文档标记加上 teleport 出去的那部分。 */
  renderToString: (fixture: Fixture) => Promise<string>
}

export interface SsrRunOptions {
  /** 服务端直出会抛异常的组件，组件名 → 理由；不再抛时判豁免过期。 */
  readonly throwExempt?: Readonly<Record<string, string>>
  /** 服务端一个部件都直出不了的组件，组件名 → 理由；直出得了时判豁免过期。 */
  readonly emptyExempt?: Readonly<Record<string, string>>
  /** 服务端不直出的部件，组件名 → 部件名 → 理由；直出得了时判豁免过期。 */
  readonly partExempt?: Readonly<Record<string, Readonly<Record<string, string>>>>
}

/** 一种入参下的直出结果。 */
interface Rendered {
  readonly label: string
  readonly html?: string
  readonly error?: Error
}

/** fixture 树里声明的全部部件名。 */
function declaredParts(node: FixtureNode, out: Set<string> = new Set()): Set<string> {
  if (node.part)
    out.add(node.part)
  for (const child of node.children ?? []) declaredParts(child, out)
  return out
}

let uniqueSeq = 0

/** 入参去重键；函数型 prop 只按「是个函数」计入，序列化不了的入参各算一份。 */
function variantKey(props: unknown, tree: unknown): string {
  try {
    return JSON.stringify([props, tree], (_k, v) => (typeof v === 'function' ? '[fn]' : v))
  }
  catch {
    return `#${uniqueSeq++}`
  }
}

/** 套件默认 fixture 加各用例的初始入参，去重后逐个直出。 */
function variants(suite: ConformanceSuite): { label: string, fixture: Fixture }[] {
  const seen = new Set<string>()
  const out: { label: string, fixture: Fixture }[] = []
  const push = (label: string, props: Readonly<Record<string, unknown>>, tree: FixtureNode): void => {
    const key = variantKey(props, tree)
    if (seen.has(key))
      return
    seen.add(key)
    out.push({ label, fixture: { component: suite.component, props, tree } })
  }
  push('默认 fixture', {}, suite.fixture)
  for (const c of suite.cases)
    push(`用例「${c.name}」`, c.props ?? {}, c.fixture ? c.fixture(suite.fixture) : suite.fixture)
  return out
}

/**
 * 服务端直出的一致性检查。
 * 守住三件事：直出不抛异常、直出标记上的 data-scope/data-part 与解剖表对得上、
 * fixture 声明的部件在某一种入参下直出过。交互态不在这一层断言。
 */
export function runSsrConformance(
  harness: SsrHarness,
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
  options: SsrRunOptions = {},
): void {
  const { throwExempt = {}, emptyExempt = {}, partExempt = {} } = options
  const componentNames = new Set(suites.map(s => s.component))

  hooks.describe(`SSR 豁免表 (${harness.adapterName})`, () => {
    hooks.it('登记的组件都还在', () => {
      const tables: [string, readonly string[]][] = [
        ['throwExempt', Object.keys(throwExempt)],
        ['emptyExempt', Object.keys(emptyExempt)],
        ['partExempt', Object.keys(partExempt)],
      ]
      const gone = tables.flatMap(([name, keys]) =>
        keys.filter(c => !componentNames.has(c)).map(c => `${name}.${c}`))
      if (gone.length)
        throw new Error(`豁免表里的组件已不存在，请删掉：${gone.join(', ')}`)
    })

    hooks.it('登记的部件都还在 fixture 里', () => {
      const gone: string[] = []
      for (const suite of suites) {
        const declared = declaredParts(suite.fixture)
        for (const part of Object.keys(partExempt[suite.component] ?? {})) {
          if (!declared.has(part))
            gone.push(`${suite.component}.${part}`)
        }
      }
      if (gone.length)
        throw new Error(`partExempt 登记的部件已不在 fixture 里，请删掉：${gone.join(', ')}`)
    })
  })

  for (const suite of suites) {
    const scope = suite.anatomy.name
    const knownParts = new Set<string>(suite.anatomy.parts)
    const throwReason = throwExempt[suite.component]
    const emptyReason = emptyExempt[suite.component]
    const exemptParts = partExempt[suite.component] ?? {}
    const cases = variants(suite)
    const rendered: Rendered[] = []
    let started = false

    /** 全部入参各直出一次，结果留给同一 describe 里的后续断言复用。 */
    const renderAll = async (): Promise<void> => {
      if (started)
        return
      started = true
      for (const v of cases) {
        try {
          rendered.push({ label: v.label, html: await harness.renderToString(v.fixture) })
        }
        catch (e) {
          rendered.push({ label: v.label, error: e as Error })
        }
      }
    }

    /**
     * 全部入参直出过的部件名合集，不限 scope。
     * 组件会把一部分部件装配成另一套解剖（scroll-area 的轨道戴 scrollbar 的 scope），
     * 按名字收才对得上 fixture 里写的那一棵树。
     */
    const emittedParts = (): Set<string> => {
      const out = new Set<string>()
      for (const r of rendered) {
        for (const t of scanScopedTags(r.html ?? '')) {
          if (t.part != null)
            out.add(t.part)
        }
      }
      return out
    }

    hooks.describe(`SSR: ${suite.component} (${harness.adapterName})`, () => {
      hooks.it(`直出不抛异常（${cases.length} 种入参）`, async () => {
        await renderAll()
        const failed = rendered.filter(r => r.error != null)
        if (throwReason != null) {
          if (failed.length === 0)
            throw new Error(`${suite.component}: 现在直出不抛了，请从 throwExempt 里删掉本组件`)
          return
        }
        if (failed.length)
          throw new Error(`${suite.component}:\n${failed.map(r => `  ${r.label} —— ${r.error!.message}`).join('\n')}`)
      })

      hooks.it('直出标记上的 data-scope / data-part 与解剖表对得上', async () => {
        await renderAll()
        const errs: string[] = []
        for (const r of rendered) {
          if (r.html == null)
            continue
          const bad = new Set<string>()
          for (const t of scanScopedTags(r.html)) {
            if (t.scope === '')
              bad.add(`<${t.tag} data-part="${t.part}"> 只有 data-part 没有 data-scope`)
            else if (t.scope === scope && t.part == null)
              bad.add(`<${t.tag} data-scope="${scope}"> 只有 data-scope 没有 data-part`)
            else if (t.scope === scope && !knownParts.has(t.part!))
              bad.add(`<${t.tag}> 的 data-part="${t.part}" 不在 ${scope} 的解剖表里`)
          }
          for (const b of bad) errs.push(`  ${r.label} —— ${b}`)
        }
        if (errs.length)
          throw new Error(`${suite.component}:\n${errs.join('\n')}`)
      })

      // 登记成「直出会抛」的组件没有标记可查，这一条对它无从谈起
      hooks.it('fixture 声明的部件都直出过', async () => {
        await renderAll()
        if (throwReason != null)
          return
        const emitted = emittedParts()
        if (emitted.size === 0) {
          if (emptyReason != null)
            return
          throw new Error(`${suite.component}: ${cases.length} 种入参一个部件都没直出，首屏是空的`)
        }
        if (emptyReason != null)
          throw new Error(`${suite.component}: 现在直出了 ${emitted.size} 个部件，请从 emptyExempt 里删掉本组件`)

        const declared = [...declaredParts(suite.fixture)]
        const missing = declared.filter(p => !emitted.has(p) && !(p in exemptParts))
        const stale = Object.keys(exemptParts).filter(p => emitted.has(p))
        const errs: string[] = []
        if (missing.length)
          errs.push(`  没直出：${missing.join(', ')}`)
        if (stale.length)
          errs.push(`  现在直出得了，请从 partExempt 里删掉：${stale.join(', ')}`)
        if (errs.length)
          throw new Error(`${suite.component}:\n${errs.join('\n')}`)
      })
    })
  }
}
