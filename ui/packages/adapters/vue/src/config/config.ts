/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局配置注入：应用级默认值，实例上写了的以实例为准。
// 取值优先级：实例 props > 最近一层注入 > 外层注入 > 组件内建默认（英文）。
// 注入是可选的——不 provide 时组件走原路，零开销。
import type { XhConfigBase, XhTranslationOverrides } from '@xihan-ui/headless'
import type {
  VisualEnvironmentController,
  VisualEnvironmentControllerOptions,
} from '@xihan-ui/core/visual-environment'
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue'
import { componentTranslations, mergeXhConfig as mergeBase, SIZE_IS_NOT_AXIS } from '@xihan-ui/headless'
import { createVisualEnvironmentController } from '@xihan-ui/core/visual-environment'
import { computed, inject, onScopeDispose, provide, shallowRef, toValue, watch } from 'vue'

export type { XhTranslationOverrides }

type BindVisualRoot<T> = T extends unknown ? Omit<T, 'parent' | 'root'> & { root: Element } : never
export type XhVisualEnvironmentConfig = BindVisualRoot<VisualEnvironmentControllerOptions>

export interface XhConfig extends XhConfigBase {
  /**
   * 浮层默认挂载的容器；返回 null 即挂载到 body。
   * 应用级默认，实例上写了容器时以实例为准。
   */
  portalContainer?: () => Element | null
  /** 本次 provide 的七轴视觉环境；root 必须显式给出，不推测组件 DOM。 */
  visualEnvironment?: XhVisualEnvironmentConfig
}

const KEY: InjectionKey<MaybeRefOrGetter<XhConfig>> = Symbol.for('xh-config')
const VISUAL_KEY: InjectionKey<ComputedRef<VisualEnvironmentController | undefined>> = Symbol.for('xh-visual-environment')

/**
 * 本层与外层逐键合并。
 *
 * 键缺席与写为 undefined 都视为本层未声明，一律回落外层：子树注入只需要改文案时，
 * 不应把外层的 locale 与 portalContainer 一并清除。
 */
export function mergeXhConfig(base: XhConfig | undefined, over: XhConfig): XhConfig {
  return mergeBase(base, over)
}

/**
 * 注入一份配置，作用于本组件子树。传 ref/getter 即可在运行时切换语言，组件随之重渲。
 *
 * 嵌套注入按键合并，不整份遮蔽：内层只写了 translations 时，外层的 locale 仍然生效。
 */
export function provideXhConfig(config: MaybeRefOrGetter<XhConfig>): void {
  const parent = inject(KEY, undefined)
  provide(KEY, parent ? () => mergeXhConfig(toValue(parent), toValue(config)) : config)

  const parentVisual = inject(VISUAL_KEY, undefined)
  const localVisual = shallowRef<VisualEnvironmentController>()
  const visual = computed(() => localVisual.value ?? parentVisual?.value)
  provide(VISUAL_KEY, visual)
  const stop = watch(
    () => {
      const binding = toValue(config).visualEnvironment
      return [
        binding?.root,
        binding?.storageKey,
        binding?.onStorageError,
        binding?.motionSink,
        binding?.initial?.mode,
        binding?.initial?.brand,
        binding?.initial?.density,
        binding?.initial?.dir,
        binding?.initial?.contrast,
        binding?.initial?.motion,
        binding?.initial?.transparency,
        parentVisual?.value,
      ] as const
    },
    ([_root, _storageKey, _onStorageError, _motionSink, _mode, _brand, _density, _dir, _contrast, _motion, _transparency, inherited]) => {
      const binding = toValue(config).visualEnvironment
      localVisual.value?.dispose()
      localVisual.value = binding
        ? createVisualEnvironmentController({ ...binding, parent: inherited })
        : undefined
    },
    { immediate: true },
  )
  onScopeDispose(() => {
    stop()
    localVisual.value?.dispose()
  })
}

/** 读取当前作用域的全局配置（已与外层合并）；未注入时得到空对象。 */
export function useXhConfig(): ComputedRef<XhConfig> {
  const injected = inject(KEY, undefined)
  return computed(() => toValue(injected) ?? {})
}

/**
 * 把全局配置合入组件 props：translations 按键合并（实例键优先），
 * locale 与 size 在实例未提供时回落全局。未注入配置时原样返回，零开销。
 * 只能在 setup 期调用。
 *
 * 运行状态机的组件不必逐个调用它：useMachine 已经把 locale 与 size 合并进去；
 * 本函数负责两件那里无法覆盖的事：按组件名分桶的 translations，以及没有状态机的组件。
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
