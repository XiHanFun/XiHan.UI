/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd group 相关实现。

import type { HotkeysPlatform, KbdGroupProps, KbdGroupTranslations, KbdVariant } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectKbdGroup } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from '../kbd/use-kbd-platform'

/** 数据驱动的完整组合；整组只由一个 aria-label 朗读，不安装键盘监听。 */
export const XhKbdGroup = defineComponent({
  name: 'XhKbdGroup',
  props: {
    keys: { type: Array as PropType<string[]>, required: true },
    platform: { type: String as PropType<HotkeysPlatform> },
    variant: { type: String as PropType<KbdVariant> },
    translations: { type: Object as PropType<Partial<KbdGroupTranslations>> },
  },
  setup(props) {
    const detected = useKbdPlatform()
    const configured = withXhConfig('kbd-group', props)
    const api = computed(() => connectKbdGroup({
      ...configured,
      platform: props.platform && props.platform !== 'auto' ? props.platform : detected.value,
    } as KbdGroupProps, vueNormalize))

    return () => {
      const current = api.value
      const children: VNode[] = []
      current.segments.forEach((segment, index) => {
        children.push(h(
          'kbd',
          { ...current.getKeyProps({ value: segment.source }) as Record<string, unknown>, key: `xh-kbd-group-key-${index}` },
          segment.label,
        ))
      })
      return h('span', current.getRootProps() as Record<string, unknown>, children)
    }
  },
})
