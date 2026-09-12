import type { HotkeysPlatform, HotkeysProps, HotkeysTarget } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent } from 'vue'
import { useHotkeys } from './use-hotkeys'

/**
 * 只注册一组快捷键，不渲染 DOM。需要可见提示时另行组合 XhKbdGroup。
 */
export const XhHotkeys = defineComponent({
  name: 'XhHotkeys',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    keys: { type: Array as PropType<string[]>, required: true },
    platform: { type: String as PropType<HotkeysPlatform> },
    target: { type: [String, Function] as PropType<HotkeysTarget> },
    preventDefault: { type: Boolean, default: undefined },
    enabled: { type: Boolean, default: undefined },
  },
  // 只读事件：组合没有可双向绑定的值
  emits: {
    'hot-key': (_details: PayloadOf<HotkeysProps, 'onHotKey'>) => true,
  },
  setup(props, { emit }) {
    useHotkeys(() => ({
      keys: props.keys,
      platform: props.platform,
      target: props.target,
      preventDefault: props.preventDefault,
      enabled: props.enabled,
      onHotKey: details => emit('hot-key', details),
    }))

    return () => null
  },
})
