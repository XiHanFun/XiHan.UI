/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 展示与快捷键注册实现。

import type { KbdPlatform, KbdProps, KbdTarget, KbdTranslations, KbdVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { connectKbd } from '@xihan-ui/headless'
import { computed, defineComponent, h, onBeforeUnmount, watchEffect } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from './use-kbd-platform'

export const XhKbd = defineComponent({
  name: 'XhKbd',
  props: {
    keys: { type: Array as PropType<string[]>, required: true },
    platform: { type: String as PropType<KbdPlatform> },
    variant: { type: String as PropType<KbdVariant> },
    register: { type: Boolean, default: undefined },
    target: { type: [String, Function] as PropType<KbdTarget> },
    preventDefault: { type: Boolean, default: undefined },
    enabled: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<KbdTranslations>> },
  },
  emits: {
    'hot-key': (_details: PayloadOf<KbdProps, 'onHotKey'>) => true,
  },
  setup(props, { emit }) {
    const detected = useKbdPlatform()
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理。
    // 本组件不能把它写进 computed：useKbdPlatform 在 onMounted 改写平台会让 api 失效，
    // 下一次求值发生在下面 watchEffect 的作业里，那时已不在组件上下文中，inject 拿不到
    // 全局配置，translations 与 locale 会被静默丢回内建英文。
    // 代理包的是一组取值函数：props 与 detected 仍在求值期被追踪，响应性不变。
    const configured = withXhConfig('kbd', {
      get keys() {
        return props.keys
      },
      get platform() {
        return props.platform && props.platform !== 'auto' ? props.platform : detected.value
      },
      get variant() {
        return props.variant
      },
      get register() {
        return props.register
      },
      get target() {
        return props.target
      },
      get preventDefault() {
        return props.preventDefault
      },
      get enabled() {
        return props.enabled
      },
      get translations() {
        return props.translations
      },
      onHotKey: (details: PayloadOf<KbdProps, 'onHotKey'>) => emit('hot-key', details),
    }) as KbdProps
    const api = computed(() => connectKbd(configured, vueNormalize))
    const onKeyDown = (event: Event): void => api.value.handleKeyDown(event as KeyboardEvent)
    let bound: EventTarget | null = null
    const stop = (): void => {
      bound?.removeEventListener('keydown', onKeyDown)
      bound = null
    }
    watchEffect(() => {
      const next = api.value.resolveTarget(typeof document === 'undefined' ? null : document)
      if (next === bound)
        return
      stop()
      bound = next
      bound?.addEventListener('keydown', onKeyDown)
    })
    onBeforeUnmount(stop)

    return () => h('kbd', api.value.getRootProps() as Record<string, unknown>, api.value.segments.map((segment, index) => h(
      'span',
      { ...api.value.getKeyProps({ value: segment.source }) as Record<string, unknown>, key: `${segment.source}-${index}` },
      segment.label,
    )))
  },
})
