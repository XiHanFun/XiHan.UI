// locale 解析：把「作者没给 locale」这件事收敛成一条链，日期时间系组件共用。
import type { Scope } from './scope'
import { isSSR } from './guards'

/** 解析链走到底仍没有语言标记时用的兜底。 */
export const XH_FALLBACK_LOCALE = 'en-US'

/**
 * 宿主自己的语言标记；SSR 期与读不到时返回 undefined。
 * 给了 scope 就问它所属的那个 window，没给才问全局。
 */
export function hostLocale(scope?: Scope): string | undefined {
  if (isSSR())
    return undefined
  const tag = (scope?.getWin() ?? window).navigator?.language
  return typeof tag === 'string' && tag !== '' ? tag : undefined
}

/** 语言标记的解析链：显式给的 → 宿主语言 → en-US。 */
export function resolveLocale(locale: string | undefined, scope?: Scope): string {
  return locale ?? hostLocale(scope) ?? XH_FALLBACK_LOCALE
}
