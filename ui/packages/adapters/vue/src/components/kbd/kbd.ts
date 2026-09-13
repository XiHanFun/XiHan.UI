/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 相关实现。

import type { HotkeysPlatform, KbdProps, KbdTranslations, KbdVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectKbd } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from './use-kbd-platform'

/** 单枚原生 kbd；只展示，不安装任何键盘监听。 */
export const XhKbd = defineComponent({
  name: 'XhKbd',
  props: {
    value: { type: String, required: true },
    platform: { type: String as PropType<HotkeysPlatform> },
    variant: { type: String as PropType<KbdVariant> },
    translations: { type: Object as PropType<Partial<KbdTranslations>> },
  },
  setup(props) {
    const detected = useKbdPlatform()
    const configured = withXhConfig('kbd', props)
    const api = computed(() => connectKbd({
      ...configured,
      platform: props.platform && props.platform !== 'auto' ? props.platform : detected.value,
    } as KbdProps, vueNormalize))
    return () => h('kbd', api.value.getRootProps() as Record<string, unknown>, api.value.label)
  },
})
