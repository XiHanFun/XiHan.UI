import type { Direction, Orientation } from '@xihan-ui/core'
import type { AnchorSchema, AnchorTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideAnchor, useAnchorContext } from './context'
import { useAnchor } from './use-anchor'

type AnchorProps = AnchorSchema['props']

/** 根节点渲染为 nav 地标 */
export const XhAnchorRoot = defineComponent({
  name: 'XhAnchorRoot',
  // 缺省值由机器与 connect 决定，这里一律 default: undefined
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    targets: { type: Array as PropType<readonly string[]>, default: undefined },
    offset: { type: Number, default: undefined },
    smooth: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<Partial<AnchorTranslations>>, default: undefined },
    /** 判定线所依附的滚动容器，缺省挂在窗口上；经 refs 交给观察器。 */
    scrollElement: { type: Object as PropType<HTMLElement | null>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: AnchorProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
    const ctx = useAnchor(props as AnchorProps, notify, () => props.scrollElement ?? null)
    provideAnchor(ctx)
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 用 ul 而非 div：目录是一组并列的去处，读屏会念"列表，共 n 项"；不用 ol，目录没有层级顺序语义。
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

/** href 由 value 派生为 `#id`；smooth 关闭时退化为原生片段跳转 */
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

/** 指示条容器，位置由机器算好写入内联样式；渲染为 li 以 list 为定位参照系 */
export const XhAnchorIndicator = defineComponent({
  name: 'XhAnchorIndicator',
  setup() {
    const ctx = useAnchorContext()
    return () => h('li', ctx.api.value.getIndicatorProps() as Record<string, unknown>)
  },
})
