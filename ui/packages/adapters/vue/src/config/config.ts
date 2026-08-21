// 全局配置注入：应用级默认值，实例上写了的以实例为准。
// 取值优先级：实例 props > 最近一层注入 > 外层注入 > 组件内建默认（英文）。
// 注入是可选的——不 provide 时组件走原路，零开销。
import type {
  XhTranslationOverrides,
} from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'

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
   * 浮层默认挂到哪个容器；返回 null 即挂 body。
   * 应用级默认，实例上写了容器的以实例为准。
   */
  portalContainer?: () => Element | null
  /**
   * 真正在滚的那个元素；返回 null 即由滚动锁自行探测。
   * 宿主把滚动搬进内容容器（body 本身不滚）时必须给，否则模态浮层背后照样能滚。
   */
  scrollRoot?: () => HTMLElement | null
}

const KEY: InjectionKey<MaybeRefOrGetter<XhConfig>> = Symbol('xh-config')

/** 逐组件合并文案：同名组件下按键并，本层胜出。 */
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
 * 本层与外层逐键合并。
 *
 * 键缺席与写成 undefined 都算「这一层没说」，一律回落外层——子树注入只想改文案时，
 * 不该把外层的 locale 与 portalContainer 一并抹掉。
 */
export function mergeXhConfig(base: XhConfig | undefined, over: XhConfig): XhConfig {
  if (!base)
    return over
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

/**
 * 注入一份配置，作用于本组件子树。传 ref/getter 即可运行时切语言，组件跟着重渲。
 *
 * 嵌套注入按键合并，不整份遮蔽：内层只写了 translations 时，外层的 locale 仍然生效。
 */
export function provideXhConfig(config: MaybeRefOrGetter<XhConfig>): void {
  const parent = inject(KEY, undefined)
  if (!parent) {
    provide(KEY, config)
    return
  }
  provide(KEY, () => mergeXhConfig(toValue(parent), toValue(config)))
}

/** 读当前作用域的全局配置（已与外层合并）；没注入时得到空对象。 */
export function useXhConfig(): ComputedRef<XhConfig> {
  const injected = inject(KEY, undefined)
  return computed(() => toValue(injected) ?? {})
}

/**
 * size 同名不同义的组件：floating-panel 的 size 是一对像素数，垫一个 'md' 进去会当场坏掉。
 * qr-code 与 splitter 同属这一类，但它们没有名为 size 的 prop，天然够不着。
 * 判据由 check-config-wiring 守住：headless 里凡是 props 声明了非 Size 型 size 的都要在这儿。
 */
export const SIZE_IS_NOT_AXIS = new Set(['floating-panel'])

/**
 * 把全局配置垫进组件 props：translations 按键合并（实例键胜出），
 * locale 与 size 在实例没给时回落全局。没注入配置时原样返回，零开销。
 * 只能在 setup 期调用。
 *
 * 跑机器的组件不必逐个调它——useMachine 那一处已经把 locale 与 size 并进去了；
 * 这个函数管两件那里管不到的事：按组件名分桶的 translations，以及没有机器的那十几个组件。
 */
export function withXhConfig<T extends object>(component: keyof XhTranslationOverrides | 'calendar' | 'time' | 'time-field' | 'time-picker', props: T): T {
  const injected = inject(KEY, undefined)
  if (!injected)
    return props
  return new Proxy(props, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      if (key === 'translations') {
        const globals = (toValue(injected)?.translations as Record<string, object | undefined> | undefined)?.[component]
        if (!globals)
          return value
        return value ? { ...globals, ...(value as object) } : globals
      }
      if (key === 'locale')
        return value ?? toValue(injected)?.locale
      if (key === 'size' && !SIZE_IS_NOT_AXIS.has(component))
        return value ?? toValue(injected)?.size
      return value
    },
  }) as T
}
