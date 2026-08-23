import type { HotkeysPlatform, HotkeysProps, HotkeysTarget, HotkeysTranslations } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { useHotkeys } from './use-hotkeys'

/**
 * 把一组键铺成一排键帽，并按 target 指定的节点接住这次组合。
 *
 * 内容整份由 keys 与平台算出，组件不收默认插槽——键帽上写什么、连接符出不出，
 * 两个平台的答案不一样，内容另有来源就对不上了。
 *
 * 注册与渲染是两件事：只要注册不要键帽就直接用 useHotkeys。
 */
export const XhHotkeys = defineComponent({
  name: 'XhHotkeys',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    keys: { type: Array as PropType<string[]>, default: undefined },
    platform: { type: String as PropType<HotkeysPlatform>, default: undefined },
    target: { type: String as PropType<HotkeysTarget>, default: undefined },
    preventDefault: { type: Boolean, default: undefined },
    enabled: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<HotkeysTranslations>>, default: undefined },
  },
  // 只读事件：组合没有可双向绑定的值
  emits: {
    'hot-key': (_details: PayloadOf<HotkeysProps, 'onHotKey'>) => true,
  },
  setup(props, { emit }) {
    const rootEl = ref<HTMLElement | null>(null)
    const merged = withXhConfig('hotkeys', props)

    const { api } = useHotkeys(() => ({
      keys: props.keys,
      platform: props.platform,
      target: props.target,
      preventDefault: props.preventDefault,
      enabled: props.enabled,
      size: props.size,
      translations: merged.translations,
      onHotKey: details => emit('hot-key', details),
    }), rootEl)

    return () => {
      const current = api.value
      const separatorProps = current.getSeparatorProps() as Record<string, unknown>
      const children: VNode[] = []
      current.segments.forEach((segment, index) => {
        if (index > 0)
          children.push(h('span', { ...separatorProps, key: `xh-hotkeys-separator-${index}` }, current.separator))
        children.push(h(
          'kbd',
          { ...current.getKeyProps({ value: segment.source }) as Record<string, unknown>, key: `xh-hotkeys-key-${index}` },
          segment.label,
        ))
      })
      return h('span', { ...current.getRootProps() as Record<string, unknown>, ref: rootEl }, children)
    }
  },
})
