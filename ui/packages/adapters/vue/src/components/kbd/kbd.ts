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
    const api = computed(() => connectKbd(withXhConfig('kbd', {
      keys: props.keys,
      platform: props.platform && props.platform !== 'auto' ? props.platform : detected.value,
      variant: props.variant,
      register: props.register,
      target: props.target,
      preventDefault: props.preventDefault,
      enabled: props.enabled,
      translations: props.translations,
      onHotKey: details => emit('hot-key', details),
    }) as KbdProps, vueNormalize))
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
