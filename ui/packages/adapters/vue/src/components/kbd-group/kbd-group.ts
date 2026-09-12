import type { Size } from '@xihan-ui/core'
import type { HotkeysPlatform, KbdGroupProps, KbdGroupTranslations } from '@xihan-ui/headless'
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
    size: { type: String as PropType<Size> },
    pressed: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
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
      const separatorProps = current.getSeparatorProps() as Record<string, unknown>
      const children: VNode[] = []
      current.segments.forEach((segment, index) => {
        if (index > 0)
          children.push(h('span', { ...separatorProps, key: `xh-kbd-group-separator-${index}` }, current.separator))
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
