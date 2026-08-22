import type { Size } from '@xihan-ui/kernel'
import type { MotionPreference } from '@xihan-ui/motion'
import type { XhTranslationOverrides } from './translations'

/**
 * 全局配置里与适配器无关的那几项；各适配器的 XhConfig 在它之上各自扩展
 * （Vue 多一个 portalContainer）。合并与垫底的规则只在这里写一遍，两个适配器共用。
 */
export interface XhConfigBase {
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
  /**
   * 应用级动效偏好，写了就调 setMotionOverride 覆盖系统设置（JS 动画与退场租约都读它）。
   * 它不碰 DOM：CSS 侧的令牌降级由作者自己把 data-motion="reduce" 打到容器或 html 上。
   */
  motion?: MotionPreference
}

/**
 * size 同名不同义的组件：floating-panel 的 size 是一对像素数，垫一个 'md' 进去会当场坏掉。
 * qr-code 与 splitter 同属这一类，但它们没有名为 size 的 prop，天然够不着。
 * 判据由 check-config-wiring 守住：headless 里凡是 props 声明了非 Size 型 size 的都要在这儿。
 */
export const SIZE_IS_NOT_AXIS: ReadonlySet<string> = new Set(['floating-panel'])

/** 逐组件合并文案：同名组件下按键并，内层胜出。 */
export function mergeTranslations(
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
export function mergeXhConfig<T extends XhConfigBase>(base: T | undefined, over: T | undefined): T {
  if (!base)
    return over ?? ({} as T)
  if (!over)
    return base
  const out: T = { ...base }
  for (const [key, value] of Object.entries(over) as Array<[keyof T, unknown]>) {
    if (value !== undefined)
      (out as Record<keyof T, unknown>)[key] = value
  }
  const translations = mergeTranslations(base.translations, over.translations)
  if (translations)
    out.translations = translations
  return out
}

/** 某个组件看到的文案：全局那一桶垫底，实例自己写的键压上去。 */
export function componentTranslations<T extends object>(
  component: string,
  own: T | undefined,
  config: XhConfigBase,
): T | undefined {
  const globals = (config.translations as Record<string, object | undefined> | undefined)?.[component] as T | undefined
  if (!globals)
    return own
  return own ? { ...globals, ...own } : globals
}

/**
 * 能由全局配置垫底的 props。
 *
 * 只收那些「同一个键在所有组件上是同一件事」的：locale 是 BCP 47 标记，size 是三轴那档。
 * translations 不在此列——它按组件名分桶，合并要知道自己是谁，走 componentTranslations。
 */
const GLOBAL_KEYS = ['locale', 'size'] as const

/**
 * 把全局配置垫进一份 props：键在、实例没给（undefined）才填。
 *
 * 「键在」这条判据是精确的：Vue 的 props 对象为每个声明过的 prop 都留了键（没传即 undefined），
 * 各适配器交上来的对象字面量同理。所以没声明 size 的组件不会平白多出一个 size。
 * 一个都没填时原样返回，不新建对象。
 */
export function fillXhConfigDefaults<T extends object>(
  component: string,
  props: T,
  config: XhConfigBase,
): T {
  let out: T | undefined
  for (const key of GLOBAL_KEYS) {
    if (key === 'size' && SIZE_IS_NOT_AXIS.has(component))
      continue
    const value = config[key]
    if (value === undefined || !(key in props) || (props as Record<string, unknown>)[key] !== undefined)
      continue
    out ??= { ...props }
    ;(out as Record<string, unknown>)[key] = value
  }
  return out ?? props
}

/**
 * 一份 props 并上全局配置：translations 按组件名分桶、locale 与 size 回落。
 * 一处都没并到就原样返回。
 */
export function withXhConfigBase<T extends object>(component: string, props: T, config: XhConfigBase): T {
  const filled = fillXhConfigDefaults(component, props, config)
  const own = (props as { translations?: object }).translations
  const translations = componentTranslations(component, own, config)
  if (translations === own)
    return filled
  return { ...filled, translations } as T
}
