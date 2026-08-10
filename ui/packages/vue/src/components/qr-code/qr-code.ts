import type { QrCodeProps, QrLevel } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectQrCode } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 整张码画成一个 `<svg>`：深色模块按行并成一条 `<path>`，静区靠 viewBox 留出。
 * 矩阵由 connect 算一遍，这里只取现成的 path；没有可画的内容时不生成任何子节点。
 */
export const XhQrCode = defineComponent({
  name: 'XhQrCode',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    value: { type: String, default: undefined },
    level: { type: String as PropType<QrLevel>, default: undefined },
    size: { type: Number, default: undefined },
    margin: { type: Number, default: undefined },
    label: { type: String, default: undefined },
  },
  setup(props) {
    const api = computed(() => connectQrCode(props as QrCodeProps, vueNormalize))
    return () => h(
      'svg',
      api.value.getRootProps() as Record<string, unknown>,
      api.value.path === '' ? [] : [h('path', { d: api.value.path })],
    )
  },
})
