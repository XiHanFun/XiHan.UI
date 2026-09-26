/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局配置注入：应用级默认值，实例上写了的以实例为准。
// 取值优先级：实例 props > 最近一层 Provider > 外层 Provider > 组件内建默认（英文）。
// 不套 Provider 时组件走原路，零开销。
import type {
  VisualEnvironmentController,
  VisualEnvironmentControllerOptions,
} from '@xihan-ui/core/visual-environment'
import type { XhConfigBase, XhTranslationOverrides } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { createVisualEnvironmentController } from '@xihan-ui/core/visual-environment'
import { componentTranslations, mergeXhConfig as mergeBase, SIZE_IS_NOT_AXIS } from '@xihan-ui/headless'
import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'

export type { XhTranslationOverrides }

type BindVisualRoot<T> = T extends unknown ? Omit<T, 'parent' | 'root'> & { root: Element } : never
export type XhVisualEnvironmentConfig = BindVisualRoot<VisualEnvironmentControllerOptions>

export interface XhConfig extends XhConfigBase {
  /**
   * 浮层默认挂载的容器；返回 null 即挂载到 body。
   * 应用级默认，实例上写了容器时以实例为准。
   */
  portalContainer?: () => Element | null
  /** 本 Provider 的八轴视觉环境；root 必须显式给出，不推测 DOM 边界。 */
  visualEnvironment?: XhVisualEnvironmentConfig
}

interface XhConfigContextValue {
  config: XhConfig
  visualEnvironment?: VisualEnvironmentController
  visualEnvironmentPending: boolean
}

const XhConfigContext = createContext<XhConfigContextValue | undefined>(undefined)

/**
 * 本层与外层逐键合并。
 *
 * 键缺席与写为 undefined 都视为本层未声明，一律回落外层：子树只需要改文案时，
 * 不应把外层的 locale 与 portalContainer 一并清除。
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
  const parentContext = useContext(XhConfigContext)
  const config = useMemo(
    () => (parentContext ? mergeXhConfig(parentContext.config, props.config) : props.config),
    [parentContext, props.config],
  )
  const binding = props.config.visualEnvironment
  const [localVisualEnvironment, setLocalVisualEnvironment] = useState<VisualEnvironmentController>()

  useLayoutEffect(() => {
    if (!binding) {
      setLocalVisualEnvironment(undefined)
      return
    }
    if (parentContext?.visualEnvironmentPending)
      return
    const controller = createVisualEnvironmentController({
      ...binding,
      parent: parentContext?.visualEnvironment,
    })
    setLocalVisualEnvironment(controller)
    return () => {
      controller.dispose()
    }
  }, [binding, parentContext?.visualEnvironment, parentContext?.visualEnvironmentPending])

  const context = useMemo<XhConfigContextValue>(() => ({
    config,
    visualEnvironment: localVisualEnvironment ?? parentContext?.visualEnvironment,
    visualEnvironmentPending: Boolean(binding) && !localVisualEnvironment,
  }), [binding, config, localVisualEnvironment, parentContext?.visualEnvironment])
  return <XhConfigContext value={context}>{props.children}</XhConfigContext>
}

const EMPTY: XhConfig = {}

/** 读取当前作用域的全局配置（已与外层合并）；未包裹 Provider 时得到空对象。 */
export function useXhConfig(): XhConfig {
  return useContext(XhConfigContext)?.config ?? EMPTY
}

/**
 * 把全局配置合入组件 props：translations 按键合并（实例键优先），
 * locale 与 size 在实例未提供时回落全局。未包裹 Provider 时原样返回，零开销。
 *
 * 运行状态机的组件不必逐个调用它：useMachine 已经把 locale 与 size 合并进去；
 * 本函数负责两件那里无法覆盖的事：按组件名分桶的 translations，以及没有状态机的组件。
 */
export function withXhConfig<T extends object>(component: keyof XhTranslationOverrides, props: T): T {
  const config = useContext(XhConfigContext)
  if (!config)
    return props

  /** 这三个键由本层接管；size 只在它是尺寸轴的组件上接管。 */
  const managed = (key: string | symbol): boolean =>
    key === 'translations' || key === 'locale' || (key === 'size' && !SIZE_IS_NOT_AXIS.has(component))

  const read = (target: T, key: string | symbol, receiver?: unknown): unknown => {
    const value = Reflect.get(target, key, receiver)
    if (key === 'translations')
      return componentTranslations(component, value as object | undefined, config.config)
    if (key === 'locale')
      return value ?? config.config.locale
    if (key === 'size' && !SIZE_IS_NOT_AXIS.has(component))
      return value ?? config.config.size
    return value
  }

  return new Proxy(props, {
    get: (target, key, receiver) => read(target, key, receiver),
    has: (target, key) => managed(key) || Reflect.has(target, key),
    // 接管的这三个键即使作者没写，也要算作自有键。
    //
    // React 的 props 只有作者真写了的那几个键，与 Vue 那种「声明了就一定在」不同：
    // 作者没写 translations 时它不是自有键，展开（useMachine 里那次 { ...props }）就带不走，
    // 全局配置里按组件名分桶的那份文案于是原地蒸发，组件回落到内建英文。
    // 有人读得出来（get 陷阱还在），但没人读——机器拿到的是展开后的普通对象。
    ownKeys(target) {
      const keys = Reflect.ownKeys(target)
      const extra = (['translations', 'locale', 'size'] as const)
        .filter(k => managed(k) && !keys.includes(k) && read(target, k) !== undefined)
      return [...keys, ...extra]
    },
    getOwnPropertyDescriptor(target, key) {
      const own = Reflect.getOwnPropertyDescriptor(target, key)
      if (own)
        return own
      if (!managed(key))
        return undefined
      const value = read(target, key)
      return value === undefined ? undefined : { value, enumerable: true, configurable: true, writable: true }
    },
  }) as T
}
