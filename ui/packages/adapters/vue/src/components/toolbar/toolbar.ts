import type { Direction, Orientation, Size } from '@xihan-ui/core'
import type { ToolbarApi, ToolbarSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideToolbar, useToolbarContext } from './context'
import { useToolbar } from './use-toolbar'

type ToolbarProps = ToolbarSchema['props']

/** 默认插槽的载荷：焦点锚点、生效的主轴与整条工具条的禁用态。 */
export type ToolbarRootSlotProps = Pick<ToolbarApi, 'focusedValue' | 'orientation' | 'disabled'>

export const XhToolbarRoot = defineComponent({
  name: 'XhToolbarRoot',
  // 全部 default: undefined，缺省值由 connect 决定
  props: {
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: ToolbarRootSlotProps) => VNode[]
  }>,
  // 无对外事件，条目的点击与切换由条目自行派发
  setup(props, { slots }) {
    const ctx = useToolbar(props as ToolbarProps)
    provideToolbar(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      focusedValue: ctx.api.value.focusedValue,
      orientation: ctx.api.value.orientation,
      disabled: ctx.api.value.disabled,
    }))
  },
})

export const XhToolbarGroup = defineComponent({
  name: 'XhToolbarGroup',
  setup(_, { slots }) {
    const ctx = useToolbarContext()
    return () => h('div', ctx.api.value.getGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolbarSeparator = defineComponent({
  name: 'XhToolbarSeparator',
  setup() {
    const ctx = useToolbarContext()
    // 分隔线不渲染内容
    return () => h('div', ctx.api.value.getSeparatorProps() as Record<string, unknown>)
  },
})

export const XhToolbarItem = defineComponent({
  name: 'XhToolbarItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
    /** 条目渲染成哪个标签，默认 button；不自动补 type="button"，表单内需自行声明。 */
    as: { type: String, default: 'button' },
  },
  setup(props, { slots }) {
    const ctx = useToolbarContext()
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报工具条失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'TOOLBAR.BLUR' })
    })
    return () => h(
      props.as,
      { ...ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})
