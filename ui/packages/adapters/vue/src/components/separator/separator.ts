import type { SeparatorAlign, SeparatorProps, SeparatorVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectSeparator } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { provideSeparator, useSeparatorContext } from './context'

const separatorProps = {
  orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  decorative: Boolean,
  variant: { type: String as PropType<SeparatorVariant>, default: undefined },
  dashed: { type: Boolean, default: undefined },
  align: { type: String as PropType<SeparatorAlign>, default: undefined },
} as const

/**
 * 分隔本身。默认插槽为空时它就是那条线；放进 XhSeparatorLine 与 XhSeparatorContent
 * 之后它改当容器，线由 line 画。
 */
export const XhSeparatorRoot = defineComponent({
  name: 'XhSeparatorRoot',
  props: separatorProps,
  setup(props, { slots }) {
    const api = computed(() => connectSeparator(props as SeparatorProps, vueNormalize))
    provideSeparator({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 分节文字两侧的那条线，纯装饰。 */
export const XhSeparatorLine = defineComponent({
  name: 'XhSeparatorLine',
  setup() {
    const ctx = useSeparatorContext()
    return () => h('div', ctx.api.value.getLineProps() as Record<string, unknown>)
  },
})

/** 夹在两条线中间的分节文字。 */
export const XhSeparatorContent = defineComponent({
  name: 'XhSeparatorContent',
  setup(_, { slots }) {
    const ctx = useSeparatorContext()
    return () => h('span', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 一步到位的写法：不给插槽就是一条线；给了插槽就自动排成「线 · 文字 · 线」三段。
 *
 * 要往分节文字里塞自定义结构（比如一枚图标加一段字）时改用
 * XhSeparatorRoot + XhSeparatorLine + XhSeparatorContent。
 */
export const XhSeparator = defineComponent({
  name: 'XhSeparator',
  props: separatorProps,
  setup(props, { slots }) {
    return () => {
      const content = slots.default?.()
      // 注释与空白不算给了文案：假分支与模板缩进都会留下节点，包进三段就是一条断开的线
      if (!slotPaints(content))
        return h(XhSeparatorRoot, props)
      return h(XhSeparatorRoot, props, () => [
        h(XhSeparatorLine),
        h(XhSeparatorContent, null, () => content),
        h(XhSeparatorLine),
      ])
    }
  },
})
