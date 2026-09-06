// 全局配置注入：应用级默认值，实例上写了的以实例为准。
// 取值优先级：实例 props > 最近一层 Provider > 外层 Provider > 组件内建默认（英文）。
// 不套 Provider 时组件走原路，零开销。
import type { XhConfigBase, XhTranslationOverrides } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { componentTranslations, mergeXhConfig as mergeBase, SIZE_IS_NOT_AXIS } from '@xihan-ui/headless'
import { setMotionOverride } from '@xihan-ui/motion'
import { createContext, useContext, useEffect, useMemo } from 'react'

export type { XhTranslationOverrides }

export interface XhConfig extends XhConfigBase {
  /**
   * 浮层默认挂到哪个容器；返回 null 即挂 body。
   * 应用级默认，实例上写了容器的以实例为准。
   */
  portalContainer?: () => Element | null
}

const XhConfigContext = createContext<XhConfig | undefined>(undefined)

/**
 * 本层与外层逐键合并。
 *
 * 键缺席与写成 undefined 都算「这一层没说」，一律回落外层——子树只想改文案时，
 * 不该把外层的 locale 与 portalContainer 一并抹掉。
 */
export function mergeXhConfig(base: XhConfig | undefined, over: XhConfig): XhConfig {
  return mergeBase(base, over)
}

export interface XhConfigProviderProps {
  config: XhConfig
  children?: ReactNode
}

/** 注入一份配置，作用于本子树。嵌套按键合并，不整份遮蔽。 */
export function XhConfigProvider(props: XhConfigProviderProps): ReactNode {
  const parent = useContext(XhConfigContext)
  const value = useMemo(
    () => (parent ? mergeXhConfig(parent, props.config) : props.config),
    [parent, props.config],
  )
  // 这一层写了 motion 才调；缺席不碰——别的地方设的 override 不在这里清
  useEffect(() => {
    if (value.motion !== undefined)
      setMotionOverride(value.motion)
  }, [value.motion])
  return <XhConfigContext value={value}>{props.children}</XhConfigContext>
}

const EMPTY: XhConfig = {}

/** 读当前作用域的全局配置（已与外层合并）；没套 Provider 时得到空对象。 */
export function useXhConfig(): XhConfig {
  return useContext(XhConfigContext) ?? EMPTY
}

/**
 * 把全局配置垫进组件 props：translations 按键合并（实例键胜出），
 * locale 与 size 在实例没给时回落全局。没套 Provider 时原样返回，零开销。
 *
 * 跑机器的组件不必逐个调它——useMachine 那一处已经把 locale 与 size 并进去了；
 * 这个函数管两件那里管不到的事：按组件名分桶的 translations，以及没有机器的那十几个组件。
 */
export function withXhConfig<T extends object>(component: keyof XhTranslationOverrides, props: T): T {
  const config = useContext(XhConfigContext)
  if (!config)
    return props
  return new Proxy(props, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      if (key === 'translations')
        return componentTranslations(component, value as object | undefined, config)
      if (key === 'locale')
        return value ?? config.locale
      if (key === 'size' && !SIZE_IS_NOT_AXIS.has(component))
        return value ?? config.size
      return value
    },
  }) as T
}
