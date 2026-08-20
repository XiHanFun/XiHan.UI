import type { HotkeysPlatform, HotkeysProps, HotkeysTarget, HotkeysTranslations } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { connectHotkeys, detectHotkeysPlatform } from '@xihan-ui/headless'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 把一组键铺成一排键帽，并按 target 指定的节点接住这次组合。
 *
 * 内容整份由 keys 与平台算出，组件不收默认插槽——键帽上写什么、连接符出不出，
 * 两个平台的答案不一样，内容另有来源就对不上了。
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
    // 平台要等挂载后才测得出来；测出来之前按 connect 的缺省（非 Mac）出
    const detected = ref<HotkeysPlatform>('auto')
    onMounted(() => {
      detected.value = detectHotkeysPlatform()
    })

    const merged = withXhConfig('hotkeys', props)
    const api = computed(() => connectHotkeys({
      keys: props.keys,
      // 作者显式写了平台就以他为准，写 auto 或没写才用实测值
      platform: props.platform && props.platform !== 'auto' ? props.platform : detected.value,
      target: props.target,
      preventDefault: props.preventDefault,
      enabled: props.enabled,
      size: props.size,
      translations: merged.translations,
      onHotKey: details => emit('hot-key', details),
    }, vueNormalize))

    // 每次都现取 api：监听节点可以不变，接不接这次按键的判据却随 props 走
    const onKeyDown = (event: Event): void => api.value.handleKeyDown(event as KeyboardEvent)
    let bound: EventTarget | null = null
    const unbind = (): void => {
      bound?.removeEventListener('keydown', onKeyDown)
      bound = null
    }
    // 监听装在文档或组件所在的那一层父节点上，后者把组合限制在一块面板里
    watchEffect(() => {
      const el = rootEl.value
      const next = el === null ? null : (api.value.target === 'parent' ? el.parentElement : el.ownerDocument)
      if (next === bound)
        return
      unbind()
      bound = next
      bound?.addEventListener('keydown', onKeyDown)
    })
    onBeforeUnmount(unbind)

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
