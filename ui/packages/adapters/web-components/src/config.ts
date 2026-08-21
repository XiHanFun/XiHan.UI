// 全局配置：locale、尺寸档与各组件内建文案的应用级默认值。
// 取值优先级：元素上的 property > 最近一个 <xh-config> > 外层 <xh-config> > setXhConfig 的全局值 > 组件内建默认。
//
// 自定义元素拿不到 Vue 的 provide/inject，文案又是对象、只能走 property 不能走 attribute。
// 这里给两条出口：setXhConfig 管整页，<xh-config> 管一棵子树，语义与 Vue 适配器的
// provideXhConfig 对齐（那边是组件树，这边是 DOM 树）。
import type { XhTranslationOverrides } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'

export type { XhTranslationOverrides }

export interface XhConfig {
  /** BCP 47 语言标记，喂给日期时间系组件（calendar / date-* / time-*）。 */
  locale?: string
  translations?: XhTranslationOverrides
  /**
   * 尺寸档的应用级默认值，落到每个声明了三轴 size 的组件上。
   * 同名不同义的那几个（floating-panel 的像素尺寸）不受它影响。
   */
  size?: Size
  /**
   * 真正在滚的那个元素；返回 null 即由滚动锁自行探测。
   * 宿主把滚动搬进内容容器（body 本身不滚）时必须给，否则模态浮层背后照样能滚。
   */
  scrollRoot?: () => HTMLElement | null
}

let current: XhConfig = {}
const listeners = new Set<() => void>()

/** 配置变了就叫一遍：全局那份改了、任一 <xh-config> 改了或进出文档，都走这里。 */
export function notifyXhConfigChange(): void {
  for (const listener of [...listeners]) listener()
}

/** 覆写全局配置。整份替换，不做深合并——想改一处就把整份拿去改。 */
export function setXhConfig(next: XhConfig): void {
  current = next
  notifyXhConfigChange()
}

export function getXhConfig(): Readonly<XhConfig> {
  return current
}

/** 订阅配置变更，返回退订函数。已挂载的元素靠它在切语言时重渲。 */
export function onXhConfigChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

type TranslationsBag = Record<string, unknown>

/** 逐组件合并文案：同名组件下按键并，内层胜出。 */
function mergeTranslations(
  base: XhTranslationOverrides | undefined,
  over: XhTranslationOverrides | undefined,
): XhTranslationOverrides | undefined {
  if (!base)
    return over
  if (!over)
    return base
  const out = { ...base } as Record<string, object | undefined>
  for (const [component, value] of Object.entries(over as Record<string, object | undefined>)) {
    const inherited = out[component]
    out[component] = inherited && value ? { ...inherited, ...value } : (value ?? inherited)
  }
  return out as XhTranslationOverrides
}

/**
 * 外层与内层逐键合并。
 *
 * 键缺席与写成 undefined 都算「这一层没说」，一律回落外层——子树里只想改文案时，
 * 不该把外层的 locale 一并抹掉。
 */
export function mergeXhConfig(base: XhConfig | undefined, over: XhConfig | undefined): XhConfig {
  if (!base)
    return over ?? {}
  if (!over)
    return base
  const out: XhConfig = { ...base }
  for (const [key, value] of Object.entries(over) as Array<[keyof XhConfig, unknown]>) {
    if (value !== undefined)
      (out as Record<string, unknown>)[key] = value
  }
  const translations = mergeTranslations(base.translations, over.translations)
  if (translations)
    out.translations = translations
  return out
}

/** `<xh-config>` 认领这个接口，配置解析沿 DOM 祖先链找它，不必反向依赖元素类。 */
export interface XhConfigScope extends Element {
  readonly xhConfig: XhConfig
}

function isConfigScope(node: Element): node is XhConfigScope {
  return 'xhConfig' in node
}

/**
 * 某个节点看到的配置：从全局那份起，沿祖先链自外向内逐层并进来。
 *
 * 不传节点（或它还没进文档）就只有全局那份。跨 shadow root 不追：
 * 本适配器是 Light DOM，作者的 <xh-config> 与元素天然同树。
 */
export function resolveXhConfig(node: Element | null | undefined): XhConfig {
  if (!node)
    return current
  const chain: XhConfigScope[] = []
  for (let el: Element | null = node; el; el = el.parentElement) {
    if (isConfigScope(el))
      chain.push(el)
  }
  // 祖先链是自内向外收的，合并要自外向内
  let out = current
  for (let i = chain.length - 1; i >= 0; i--)
    out = mergeXhConfig(out, chain[i]!.xhConfig)
  return out
}

/**
 * size 同名不同义的组件：floating-panel 的 size 是一对像素数，垫一个 'md' 进去会当场坏掉。
 * 判据由 check-config-wiring 守住，与 Vue 侧那份同名同内容。
 */
const SIZE_IS_NOT_AXIS = new Set(['floating-panel'])

/**
 * 把配置并进一份机器 props：`translations` 逐键合并、元素上的压过全局；
 * `locale` 与 `size` 在元素上没给（键在但值是 undefined）时取配置里的。
 * 一处都没并到就原样返回，不新建对象。
 *
 * host 是发起解析的元素，给了就沿它的祖先链找 `<xh-config>`；不给只看全局那份。
 */
export function withXhConfig<T extends object>(component: string, props: T, host?: Element | null): T {
  const config = host === undefined ? current : resolveXhConfig(host)
  const globals = (config.translations as TranslationsBag | undefined)?.[component] as object | undefined

  const fill: Array<'locale' | 'size'> = []
  for (const key of ['locale', 'size'] as const) {
    if (key === 'size' && SIZE_IS_NOT_AXIS.has(component))
      continue
    if (config[key] !== undefined && key in props && (props as Record<string, unknown>)[key] === undefined)
      fill.push(key)
  }

  if (globals === undefined && fill.length === 0)
    return props

  const merged = { ...props } as Record<string, unknown>
  if (globals !== undefined) {
    const own = (props as TranslationsBag).translations as object | undefined
    merged.translations = own === undefined ? globals : { ...globals, ...own }
  }
  for (const key of fill)
    merged[key] = config[key]
  return merged as T
}
