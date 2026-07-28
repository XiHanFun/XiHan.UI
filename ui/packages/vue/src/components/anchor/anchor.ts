import type { Direction, Orientation } from '@xihan-ui/core'
import type { AnchorSchema, AnchorTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideAnchor, useAnchorContext } from './context'
import { useAnchor } from './use-anchor'

type AnchorProps = AnchorSchema['props']

/**
 * 根节点是 nav 地标：页内目录是"跳到本页某一节"的导航，读屏用户靠地标列表直接跳进来。
 * 换成 div 的话 aria-label 无处安放，地标也就没了。
 */
export const XhAnchorRoot = defineComponent({
  name: 'XhAnchorRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在机器与 connect
  // （smooth 尤其：裸 Boolean 声明会把缺省压成 false，"未指定"就再也表达不出来）
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    targets: { type: Array as PropType<readonly string[]>, default: undefined },
    offset: { type: Number, default: undefined },
    smooth: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<Partial<AnchorTranslations>>, default: undefined },
    /**
     * 判定线所依附的滚动容器；不给即挂在窗口上。
     * 它是个 DOM 句柄、不是机器的 prop——只经 refs 交给观察器，机器不认识它。
     */
    scrollElement: { type: Object as PropType<HTMLElement | null>, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸值，支持 v-model:value
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: AnchorProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    // 传响应式 props 对象本身而不是快照：机器每次读都重新展开，prop 变了才追得上
    const ctx = useAnchor(props as AnchorProps, notify, () => props.scrollElement ?? null)
    provideAnchor(ctx)
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// ul 而不是 div：目录是一组并列的去处，读屏会念"列表，共 n 项"。
// 不用 ol——它没有面包屑那样的层级顺序语义。
export const XhAnchorList = defineComponent({
  name: 'XhAnchorList',
  setup(_, { slots }) {
    const ctx = useAnchorContext()
    return () => h('ul', {
      ...ctx.api.value.getListProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.listRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhAnchorItem = defineComponent({
  name: 'XhAnchorItem',
  setup(_, { slots }) {
    const ctx = useAnchorContext()
    return () => h('li', ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * href 由 value 派生（`#id`），作者不必再写一遍：那正是这个组件的全部意义。
 * smooth 关掉时整条目录不靠 JS 也能用——原生片段跳转本来就成立。
 */
export const XhAnchorLink = defineComponent({
  name: 'XhAnchorLink',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useAnchorContext()
    return () => h(
      'a',
      ctx.api.value.getLinkProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/**
 * 指示条的位置由机器量好、经内联样式写下来；这里只是个容器，长什么样归样式层。
 *
 * 标签是 li 而不是 div：它得住在 list（ul）里才能以 list 为定位参照系，
 * 而 ul 里只放得下 li。它对读屏隐藏，列表项计数不受影响。
 */
export const XhAnchorIndicator = defineComponent({
  name: 'XhAnchorIndicator',
  setup() {
    const ctx = useAnchorContext()
    return () => h('li', ctx.api.value.getIndicatorProps() as Record<string, unknown>)
  },
})
