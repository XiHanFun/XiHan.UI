// 全局配置注入：应用级默认值，实例上写了的以实例为准。
// 取值优先级：实例 props > 最近一层注入 > 外层注入 > 组件内建默认（英文）。
// 注入是可选的——不 provide 时组件走原路，零开销。
import type { XhConfigBase, XhTranslationOverrides } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue'
import { componentTranslations, mergeXhConfig as mergeBase, SIZE_IS_NOT_AXIS } from '@xihan-ui/headless'
import { setMotionOverride } from '@xihan-ui/motion'
import { computed, inject, provide, toValue, watch } from 'vue'

export type { XhTranslationOverrides }

export interface XhConfig extends XhConfigBase {
  /**
   * 浮层默认挂到哪个容器；返回 null 即挂 body。
   * 应用级默认，实例上写了容器的以实例为准。
   */
  portalContainer?: () => Element | null
}

const KEY: InjectionKey<MaybeRefOrGetter<XhConfig>> = Symbol.for('xh-config')

/**
 * 本层与外层逐键合并。
 *
 * 键缺席与写成 undefined 都算「这一层没说」，一律回落外层——子树注入只想改文案时，
 * 不该把外层的 locale 与 portalContainer 一并抹掉。
 */
export function mergeXhConfig(base: XhConfig | undefined, over: XhConfig): XhConfig {
  return mergeBase(base, over)
}

/**
 * 注入一份配置，作用于本组件子树。传 ref/getter 即可运行时切语言，组件跟着重渲。
 *
 * 嵌套注入按键合并，不整份遮蔽：内层只写了 translations 时，外层的 locale 仍然生效。
 */
export function provideXhConfig(config: MaybeRefOrGetter<XhConfig>): void {
  applyMotionOverride(config)
  const parent = inject(KEY, undefined)
  if (!parent) {
    provide(KEY, config)
    return
  }
  provide(KEY, () => mergeXhConfig(toValue(parent), toValue(config)))
}

/**
 * 这一层写了 motion 才调 setMotionOverride；缺席不碰——别的地方设的 override 不在这里清。
 * 配置是 ref/getter 时跟着它变。
 */
function applyMotionOverride(config: MaybeRefOrGetter<XhConfig>): void {
  watch(
    () => toValue(config).motion,
    (motion) => {
      if (motion !== undefined)
        setMotionOverride(motion)
    },
    { immediate: true },
  )
}

/** 读当前作用域的全局配置（已与外层合并）；没注入时得到空对象。 */
export function useXhConfig(): ComputedRef<XhConfig> {
  const injected = inject(KEY, undefined)
  return computed(() => toValue(injected) ?? {})
}

/**
 * 把全局配置垫进组件 props：translations 按键合并（实例键胜出），
 * locale 与 size 在实例没给时回落全局。没注入配置时原样返回，零开销。
 * 只能在 setup 期调用。
 *
 * 跑机器的组件不必逐个调它——useMachine 那一处已经把 locale 与 size 并进去了；
 * 这个函数管两件那里管不到的事：按组件名分桶的 translations，以及没有机器的那十几个组件。
 */
export function withXhConfig<T extends object>(component: keyof XhTranslationOverrides, props: T): T {
  const injected = inject(KEY, undefined)
  if (!injected)
    return props
  return new Proxy(props, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      if (key === 'translations')
        return componentTranslations(component, value as object | undefined, toValue(injected) ?? {})
      if (key === 'locale')
        return value ?? toValue(injected)?.locale
      if (key === 'size' && !SIZE_IS_NOT_AXIS.has(component))
        return value ?? toValue(injected)?.size
      return value
    },
  }) as T
}
