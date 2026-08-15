// 全局配置：locale 与各组件内建文案的应用级默认值。
// 取值优先级：元素上的 property > 这里设的全局值 > 组件内建默认（英文）。
//
// 自定义元素拿不到 Vue 的 provide/inject，文案又是对象、只能走 property 不能走 attribute，
// 所以逐实例设是唯一的老路。这里给一处全局出口，语义与 Vue 适配器的 provideXhConfig 对齐。
import type { XhTranslationOverrides } from '@xihan-ui/headless'

export type { XhTranslationOverrides }

export interface XhConfig {
  /** BCP 47 语言标记，喂给日期时间系组件（calendar / date-* / time-*）。 */
  locale?: string
  translations?: XhTranslationOverrides
}

let current: XhConfig = {}
const listeners = new Set<() => void>()

/** 覆写全局配置。整份替换，不做深合并——想改一处就把整份拿去改。 */
export function setXhConfig(next: XhConfig): void {
  current = next
  for (const listener of [...listeners]) listener()
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

/**
 * 把全局配置并进一份机器 props：`translations` 逐键合并、元素上的压过全局，`locale` 元素上没给才取全局。
 * 全局没配就原样返回，不新建对象。
 */
export function withXhConfig<T extends object>(component: string, props: T): T {
  const config = current
  const globals = (config.translations as TranslationsBag | undefined)?.[component] as object | undefined
  const hasLocale = config.locale !== undefined && 'locale' in props && (props as { locale?: string }).locale === undefined

  if (globals === undefined && !hasLocale)
    return props

  const merged = { ...props } as Record<string, unknown>
  if (globals !== undefined) {
    const own = (props as TranslationsBag).translations as object | undefined
    merged.translations = own === undefined ? globals : { ...globals, ...own }
  }
  if (hasLocale)
    merged.locale = config.locale
  return merged as T
}
