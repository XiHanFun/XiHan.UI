import type { AdapterHarness, ConformanceSuite, FixtureNode, TestHooks } from './types'
import { SIZE_IS_NOT_AXIS } from '@xihan-ui/headless'

/** 全局配置能替组件供给的 prop：经 provideXhConfig / XhConfigProvider 给，与写在实例上等价。 */
export type ConfigParityKey = 'size' | 'locale' | 'disabled' | 'translations'

const KEYS: readonly ConfigParityKey[] = ['size', 'locale', 'disabled', 'translations']

export interface ConfigParityOptions {
  /** 组件名 → 根组件声明的 prop 名，取公开面基线的 componentProps：哪些键要比只认它。 */
  readonly props: Readonly<Record<string, readonly string[]>>
  /** 英文包的 translations（组件名 → 那一桶内建文案），据它造出每一条都认得出来的覆盖文案。 */
  readonly translations: object
  /** 逐项豁免：`组件:键` → 理由。豁免的那一项两边仍要比，比出一致时判失败，提醒删掉豁免。 */
  readonly exempt?: Readonly<Record<string, string>>
}

/** 英文包里这个组件的那一桶；语言包一概不收它的键时没有这一桶。 */
function bucketOf(options: ConfigParityOptions, component: string): Readonly<Record<string, unknown>> | undefined {
  return (options.translations as Readonly<Record<string, Readonly<Record<string, unknown>> | undefined>>)[component]
}

/** 每一条文案换成带键名的标记；带参数的文案连参数个数一起写进去。 */
function markerTranslations(source: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(source))
    out[key] = typeof value === 'function' ? (...args: unknown[]) => `⟦${key}:${args.length}⟧` : `⟦${key}⟧`
  return out
}

/** 各键在实例上与全局配置里给的值：都避开缺省值，给了与没给看得出差别。 */
function probe(key: ConfigParityKey, component: string, options: ConfigParityOptions): { instance: Record<string, unknown>, config: Record<string, unknown> } {
  switch (key) {
    case 'size':
      return { instance: { size: 'lg' }, config: { size: 'lg' } }
    case 'locale':
      return { instance: { locale: 'de-DE' }, config: { locale: 'de-DE' } }
    case 'disabled':
      return { instance: { disabled: true }, config: { disabled: true } }
    case 'translations': {
      const markers = markerTranslations(bucketOf(options, component) ?? {})
      return { instance: { translations: markers }, config: { translations: { [component]: markers } } }
    }
  }
}

/**
 * 文档快照：生成的 id 换成按出现次序的编号，React useId 的片段统一抹平，内联样式去掉。
 * 两次挂载的 id 计数器不同步，引用 id 的属性（aria-controls 之类）指向的节点未必在文档里。
 */
function normalizedBody(doc: Document): string {
  const html = doc.body.innerHTML
  const ids: string[] = []
  for (const hit of html.matchAll(/\sid="([^"]+)"/g)) {
    if (!ids.includes(hit[1]!))
      ids.push(hit[1]!)
  }
  let out = html
  ids.sort((a, b) => b.length - a.length).forEach((id, i) => {
    out = out.split(id).join(`#id${i}`)
  })
  return out.replace(/\sstyle="[^"]*"/g, '').replace(/_r_[a-z0-9]+_/g, '_r_')
}

/** 两份快照第一处分歧前后的那几段，失败信息里给人看。 */
function firstDifference(a: string, b: string): string {
  const left = a.split(/(?<=>)/)
  const right = b.split(/(?<=>)/)
  let start = 0
  while (start < left.length && start < right.length && left[start] === right[start])
    start++
  let end = 0
  while (end < left.length - start && end < right.length - start && left[left.length - 1 - end] === right[right.length - 1 - end])
    end++
  const clip = (lines: string[]): string => lines.slice(start, Math.min(lines.length - end, start + 4)).join('').slice(0, 600)
  return `写在实例上：${clip(left)}\n  经全局配置：${clip(right)}`
}

async function snapshotOf(harness: AdapterHarness, suite: ConformanceSuite, tree: FixtureNode, props: Record<string, unknown>, config?: Record<string, unknown>): Promise<string> {
  const { root } = await harness.mount({ component: suite.component, props, tree, config })
  try {
    await harness.flush()
    await harness.flush()
    return normalizedBody(root.ownerDocument)
  }
  finally {
    await harness.unmount()
  }
}

/**
 * 全局配置与逐实例传值等价：同一份夹具，size / locale / disabled / translations 写在实例上与经全局配置给，
 * 渲出的文档必须逐字相同。组件没把全局配置接进来（没经 withXhConfig、桶名写错、读了原始 props、
 * 交给状态机的 props 缺了那个键），全局值就到不了它，两边在这里分岔。
 *
 * 作者写结构与组件铺标准结构各比一次：标准结构里的空态、在途这类文字只在后一种里露面。
 * 夹具看不出某个键（写在实例上与不写渲出同一份文档，如收起的浮层）时这一项无从比较，按通过处理。
 */
export function runConfigParity(
  harness: AdapterHarness,
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
  options: ConfigParityOptions,
): void {
  const exempt = options.exempt ?? {}
  const plan = suites.map((suite) => {
    const declared = new Set(options.props[suite.component] ?? [])
    return { suite, keys: KEYS.filter(key => declared.has(key) && !(key === 'size' && SIZE_IS_NOT_AXIS.has(suite.component))) }
  })
  const covered = new Set(plan.flatMap(({ suite, keys }) => keys.map(key => `${suite.component}:${key}`)))
  for (const { suite, keys } of plan) {
    if (keys.length === 0)
      continue
    hooks.describe(`config parity: ${suite.component} (${harness.adapterName})`, () => {
      for (const key of keys) {
        const id = `${suite.component}:${key}`
        // 这一桶的键语言包一概不收（作者自写的名字、随 Intl 的说法）：英文包里没有它，造不出标记
        if (key === 'translations' && !bucketOf(options, suite.component)) {
          hooks.it(`全局 translations 与写在实例上一致（不比：英文包不收 ${suite.component} 这一桶的键）`, () => {})
          continue
        }
        const reason = exempt[id]
        hooks.it(reason ? `全局 ${key} 与写在实例上一致（豁免：${reason}）` : `全局 ${key} 与写在实例上一致`, async () => {
          const { instance, config } = probe(key, suite.component, options)
          // 夹具自己写了这个键时实例值压过全局，比不出接线：props 与根节点属性里都摘掉
          const base: Record<string, unknown> = { ...suite.defaultProps }
          delete base[key]
          const attrs = { ...suite.fixture.attrs }
          delete attrs[key]
          const authored: FixtureNode = { ...suite.fixture, attrs }
          const variants: Array<[string, FixtureNode]> = [['作者写结构', authored]]
          if (!authored.defaultStructure)
            variants.push(['标准结构', { ...authored, children: undefined, defaultStructure: true }])
          const diverged: string[] = []
          for (const [label, tree] of variants) {
            const bare = await snapshotOf(harness, suite, tree, base)
            const own = await snapshotOf(harness, suite, tree, { ...base, ...instance })
            if (own === bare)
              continue
            const inherited = await snapshotOf(harness, suite, tree, base, config)
            if (inherited !== own)
              diverged.push(`${label}：\n  ${firstDifference(own, inherited)}`)
          }
          if (reason) {
            if (diverged.length === 0)
              throw new Error(`${id} 的豁免已过期：两边已经一致，删掉这条豁免`)
            return
          }
          if (diverged.length)
            throw new Error(`${suite.component} 的 ${key} 经全局配置给与写在实例上渲得不一样，全局值没到它：\n${diverged.join('\n')}`)
        })
      }
    })
  }
  const orphan = Object.keys(exempt).filter(id => !covered.has(id))
  if (orphan.length) {
    hooks.describe(`config parity 豁免表 (${harness.adapterName})`, () => {
      hooks.it('每条豁免都对得上一个要比的组件与键', () => {
        throw new Error(`豁免指向不比的组合（拼错了或组件已不声明这个 prop），请修正或删掉：${orphan.join(', ')}`)
      })
    })
  }
}
