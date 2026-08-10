import type { QrCodeProps, QrLevel } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectQrCode } from '@xihan-ui/headless'
import { Comment, computed, defineComponent, Fragment, h, shallowRef, Text } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideQrCode, useQrCodeContext } from './context'

type ModuleShape = NonNullable<QrCodeProps['moduleShape']>
type EyeShape = NonNullable<QrCodeProps['eyeShape']>

/**
 * 插槽里有没有真会画出东西的节点。
 *
 * 注释节点、空白文本、空的 v-for 片段都不算：`v-if` 为假的子节点仍会留下一个注释节点，
 * 认了它就会在码面正中挖一块什么都不放的洞，白白毁掉一片模块。
 */
function paints(nodes: readonly VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Comment)
      return false
    if (node.type === Text)
      return String(node.children ?? '').trim() !== ''
    if (node.type === Fragment)
      return Array.isArray(node.children) && paints(node.children as VNode[])
    return true
  })
}

/**
 * 整张码画成一个 `<svg>`：数据模块与三个码眼各成一条 `<path>`，静区靠 viewBox 留出。
 * 矩阵由 connect 算一遍，这里只取现成的 path；没有可画的内容时不生成任何几何节点。
 *
 * 默认插槽里放 XhQrCodeLogo 就等于给码面正中放了一块 logo：那片模块底下先铺一个底色矩形挖空，
 * 挖空排在插槽之前，logo 画在它上面。
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
      size: props.size,
      margin: props.margin,
      label: props.label,
      moduleShape: props.moduleShape,
      eyeShape: props.eyeShape,
      logo: hasLogo.value,
    } satisfies QrCodeProps, vueNormalize))
    provideQrCode({ api })

    return () => {
      const content = slots.default?.() ?? []
      hasLogo.value = paints(content)

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
