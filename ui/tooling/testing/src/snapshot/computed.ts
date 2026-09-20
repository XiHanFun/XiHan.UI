import type { Anatomy } from '@xihan-ui/core'
import type { AdapterHarness, ConformanceSuite, TestHooks } from '../conformance/types'

/**
 * 采进快照的定量属性。挑的是「同一件事两个组件算出来该不该是同一个像素」能看出来的那些：
 * 盒的内距与圆角描边、字号行高、三处颜色、过渡与动画的三要素、聚焦环。
 * 布局结果（宽高、位置）不采——它随视口与内容变，不是皮肤的裁决。
 */
export const COMPUTED_PROPS: readonly string[] = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'row-gap',
  'column-gap',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'min-height',
  'font-size',
  'line-height',
  'font-weight',
  'color',
  'background-color',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'outline-width',
  'outline-offset',
  'outline-color',
]

export interface ComputedCollectOptions {
  readonly doc: Document
  readonly component: string
  readonly anatomy: Anatomy<string>
}

/** part 名 → 属性名 → 计算值。 */
export type ComputedSnapshot = Record<string, Record<string, string>>

/**
 * 平台画的原生控件上，皮肤没碰过的颜色记成这个值。
 *
 * button / input / select / textarea 只要皮肤没写 appearance: none，颜色就由宿主的原生主题给：
 * ButtonFace 在 Windows 上是 rgb(240, 240, 240)、在 Linux 上是 rgb(239, 239, 239)，
 * select 的底与 range 的 color 两边更是各画各的。这些数不是皮肤的裁决，采进快照只会让基线
 * 跟着录制机的操作系统走——在开发机上录的到 CI 一定红。
 *
 * 判法：把一个只带 UA 相关属性的同类空壳插在旁边、用 all: revert 让它只剩 UA 样式，
 * 颜色与它相等的就是平台给的。皮肤改过的值一律从令牌解析成 oklch，与 UA 的 rgb 不会撞车，
 * 照常采值——接了 Action Control 的按钮 appearance 也是 auto，但底与前景都被皮肤换掉了，不受影响。
 */
export const PLATFORM_PAINTED = 'platform'

const NATIVE_CONTROL_TAGS: ReadonlySet<string> = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'])

/** 采进快照的颜色属性：只有这些会落到平台主题上。 */
const COLOR_PROPS: ReadonlySet<string> = new Set([
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'color',
  'background-color',
  'outline-color',
])

/**
 * 决定 UA 怎么画这个控件的作者属性，探针只带这几个。
 * 不带 data-*：带了皮肤规则会命中探针，Light DOM 宿主的部件观察者也会把它当成新条目。
 */
const UA_SHAPING_ATTRS = ['type', 'multiple', 'size', 'disabled', 'readonly', 'checked'] as const

/** 平台给这个控件的颜色；不是平台画的返回 null。 */
function platformColors(el: HTMLElement, style: CSSStyleDeclaration): Record<string, string> | null {
  if (!NATIVE_CONTROL_TAGS.has(el.tagName) || style.getPropertyValue('appearance') === 'none')
    return null
  const doc = el.ownerDocument
  const view = doc.defaultView
  if (!view)
    return null
  const probe = doc.createElement(el.tagName.toLowerCase())
  for (const name of UA_SHAPING_ATTRS) {
    const value = el.getAttribute(name)
    if (value != null)
      probe.setAttribute(name, value)
  }
  probe.style.setProperty('all', 'revert', 'important')
  // 挂在同一个父节点下：color-scheme 等会影响原生主题取色的继承值要与被测节点一致。
  el.after(probe)
  const ua = view.getComputedStyle(probe)
  const out: Record<string, string> = {}
  for (const prop of COLOR_PROPS)
    out[prop] = ua.getPropertyValue(prop).trim()
  probe.remove()
  return out
}

/**
 * 每个 part 取文档序第一个实例的计算样式。
 * 取第一个而不是全部：同一 part 的多个实例是数据驱动的重复，皮肤规则是同一条。
 */
export function collectComputedSnapshot(opts: ComputedCollectOptions): ComputedSnapshot {
  const { doc, component, anatomy } = opts
  const out: ComputedSnapshot = {}

  for (const part of [...anatomy.parts].sort()) {
    const el = doc.querySelector<HTMLElement>(`[data-scope="${component}"][data-part="${part}"]`)
    if (!el)
      continue
    const style = doc.defaultView?.getComputedStyle(el)
    if (!style)
      continue
    const platform = platformColors(el, style)
    const props: Record<string, string> = {}
    for (const prop of COMPUTED_PROPS) {
      const value = style.getPropertyValue(prop).trim()
      props[prop] = platform && COLOR_PROPS.has(prop) && platform[prop] === value ? PLATFORM_PAINTED : value
    }
    out[part] = props
  }

  return out
}

/** 快照文本：一行一个「part · 属性 = 值」，部件与属性都排过序，两个适配器可逐字对拍。 */
export function formatComputedSnapshot(component: string, snap: ComputedSnapshot): string {
  const lines: string[] = [`# ${component}`]
  for (const part of Object.keys(snap).sort()) {
    const props = snap[part]
    if (!props)
      continue
    lines.push('', `[${part}]`)
    for (const prop of COMPUTED_PROPS)
      lines.push(`${prop}: ${props[prop] ?? ''}`)
  }
  return `${lines.join('\n')}\n`
}

export interface ComputedSnapshotOptions {
  /** 把一个组件的快照文本落盘；由各适配器的 spec 接 vitest 的 toMatchFileSnapshot。 */
  readonly write: (component: string, text: string) => Promise<void>
  /**
   * 挂不起来的组件：组件名 → 理由。登记过的挂载失败不判红；
   * 能挂起来了就判登记过期，名单不会悄悄留着。
   */
  readonly mountExempt?: Readonly<Record<string, string>>
}

/** 等有限时长的动画跑完：进场途中读到的是插值出来的中间值，不是皮肤定的那个值。 */
async function settleAnimations(doc: Document): Promise<void> {
  const finite = doc.getAnimations().filter((a) => {
    if (a.playState !== 'running')
      return false
    const timing = a.effect?.getComputedTiming()
    return timing != null && Number.isFinite(timing.endTime as number)
  })
  if (finite.length > 0) {
    await Promise.race([
      Promise.all(finite.map(a => a.finished.catch(() => undefined))),
      new Promise(resolve => setTimeout(resolve, 1000)),
    ])
  }
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

/**
 * 把每个套件的 fixture 挂进浏览器，取初始态的计算样式快照并落盘。
 * 只取初始态：这一档要答的是「皮肤把这个部件解析成了什么」，不是交互后的状态机。
 */
export function runComputedSnapshot(
  harness: AdapterHarness,
  suites: readonly ConformanceSuite[],
  hooks: TestHooks,
  options: ComputedSnapshotOptions,
): void {
  const { write, mountExempt = {} } = options
  const componentNames = new Set(suites.map(s => s.component))
  const mounted = new Set<string>()

  hooks.describe(`计算样式快照登记表 (${harness.adapterName})`, () => {
    hooks.it('豁免的组件都还在', () => {
      const gone = Object.keys(mountExempt).filter(c => !componentNames.has(c))
      if (gone.length)
        throw new Error(`豁免表里的组件已不存在，请删掉：${gone.join(', ')}`)
    })
  })

  for (const suite of suites) {
    hooks.describe(`计算样式: ${suite.component} (${harness.adapterName})`, () => {
      hooks.it('初始态快照', async () => {
        let snap: ComputedSnapshot
        try {
          const { root } = await harness.mount({
            component: suite.component,
            props: suite.defaultProps ?? {},
            tree: suite.fixture,
          })
          await harness.flush()
          const doc = root.ownerDocument
          await settleAnimations(doc)
          snap = collectComputedSnapshot({ doc, component: suite.component, anatomy: suite.anatomy })
          mounted.add(suite.component)
        }
        catch (err) {
          if (suite.component in mountExempt)
            return
          throw err
        }
        finally {
          await harness.unmount()
        }
        await write(suite.component, formatComputedSnapshot(suite.component, snap))
      })
    })
  }

  hooks.describe(`计算样式快照豁免反查 (${harness.adapterName})`, () => {
    hooks.it('豁免的组件确实挂不起来', () => {
      const stale = Object.keys(mountExempt).filter(c => mounted.has(c))
      if (stale.length)
        throw new Error(`这些组件已经能挂起来了，把豁免删掉：${stale.join(', ')}`)
    })
  })
}
