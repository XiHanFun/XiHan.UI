import type { QrCodeProps, QrLevel } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectQrCode } from '@xihan-ui/headless'
import { computed, defineComponent, h, shallowRef } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { provideQrCode, useQrCodeContext } from './context'

type ModuleShape = NonNullable<QrCodeProps['moduleShape']>
type EyeShape = NonNullable<QrCodeProps['eyeShape']>

/**
 * 整张码画成一个 `<svg>`：数据模块与三个码眼各成一条 `<path>`，静区靠 viewBox 留出。
 * 矩阵由 connect 算一遍，这里只取现成的 path；没有可画的内容时不生成任何几何节点。
 *
 * 默认插槽里放 XhQrCodeLogo 就等于给码面正中放了一块 logo：那片模块底下先铺一个底色矩形挖空，
 * 挖空排在插槽之前，logo 画在它上面。挖掉的码字超出所选 level 的纠错余量时，
 * connect 会往诊断通道报一条警告，码照画。
 */
export const XhQrCode = defineComponent({
  name: 'XhQrCode',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    value: { type: String, default: undefined },
    level: { type: String as PropType<QrLevel>, default: undefined },
    pixelSize: { type: Number, default: undefined },
    margin: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    moduleShape: { type: String as PropType<ModuleShape>, default: undefined },
    eyeShape: { type: String as PropType<EyeShape>, default: undefined },
  },
  setup(props, { slots }) {
    // 插槽里有没有东西是渲染期才知道的事实，进不了 computed 的依赖：先落到 ref 上，再让 api 依赖这个 ref。
    // 值没变时写入是空操作，不会多排一帧。
    const hasLogo = shallowRef(false)
    const api = computed(() => connectQrCode({
      value: props.value,
      level: props.level,
      pixelSize: props.pixelSize,
      margin: props.margin,
      label: props.label,
      moduleShape: props.moduleShape,
      eyeShape: props.eyeShape,
      logo: hasLogo.value,
    } satisfies QrCodeProps, vueNormalize))
    provideQrCode({ api })

    return () => {
      const content = slots.default?.() ?? []
      // 插槽里只剩注释或空白时不算放了 logo：挖空是拿底色盖住一片模块，白挖一块就是白毁一片
      hasLogo.value = slotPaints(content)

      const current = api.value
      const children: VNode[] = []
      if (current.path !== '')
        children.push(h('path', { 'data-xh-geom': 'modules', 'd': current.path }))
      if (current.eyePath !== '')
        children.push(h('path', { 'data-xh-geom': 'eyes', 'd': current.eyePath }))
      const area = current.logoArea
      if (area)
        children.push(h('rect', { 'data-xh-geom': 'logo-clear', 'x': area.x, 'y': area.y, 'width': area.size, 'height': area.size }))
      children.push(...content)

      return h('svg', current.getRootProps() as Record<string, unknown>, children)
    }
  },
})

/**
 * 码面正中那块 logo：落位与尺寸由 connect 给出，作者只管往里放图形。
 * 渲染成嵌套 `<svg>`，里面写 `width="100%" height="100%"` 即铺满这块，溢出部分被它自己裁掉。
 */
export const XhQrCodeLogo = defineComponent({
  name: 'XhQrCodeLogo',
  setup(_, { slots }) {
    const ctx = useQrCodeContext()
    return () => h('svg', ctx.api.value.getLogoProps() as Record<string, unknown>, slots.default?.())
  },
})
