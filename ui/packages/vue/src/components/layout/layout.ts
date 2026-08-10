import type { LayoutSchema, LayoutSiderPlacement } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideLayout, useLayoutContext } from './context'
import { useLayout } from './use-layout'

type LayoutProps = LayoutSchema['props']

/** 各段一律渲染成 div：地标（banner / navigation / main / contentinfo）由作者自己标。 */
export const XhLayoutRoot = defineComponent({
  name: 'XhLayoutRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    siderCollapsed: { type: Boolean, default: undefined },
    defaultSiderCollapsed: Boolean,
    siderWidth: { type: String, default: undefined },
    siderCollapsedWidth: { type: String, default: undefined },
    siderPlacement: { type: String as PropType<LayoutSiderPlacement>, default: undefined },
    headerFixed: Boolean,
    siderFixed: Boolean,
    bordered: Boolean,
  },
  // sider-collapsed-change 携带 { collapsed }，update:siderCollapsed 携带裸布尔
  emits: ['sider-collapsed-change', 'update:siderCollapsed'],
  setup(props, { slots, emit }) {
    const notify: LayoutProps['onSiderCollapsedChange'] = (details) => {
      emit('sider-collapsed-change', details)
      emit('update:siderCollapsed', details.collapsed)
    }
    const ctx = useLayout(props as LayoutProps, notify)
    provideLayout(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhLayoutHeader = defineComponent({
  name: 'XhLayoutHeader',
  setup(_, { slots }) {
    const ctx = useLayoutContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhLayoutSider = defineComponent({
  name: 'XhLayoutSider',
  setup(_, { slots }) {
    const ctx = useLayoutContext()
    return () => h('div', ctx.api.value.getSiderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhLayoutContent = defineComponent({
  name: 'XhLayoutContent',
  setup(_, { slots }) {
    const ctx = useLayoutContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhLayoutFooter = defineComponent({
  name: 'XhLayoutFooter',
  setup(_, { slots }) {
    const ctx = useLayoutContext()
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

// 折叠把手渲染成原生 button：Enter/Space 的激活交给平台
export const XhLayoutSiderTrigger = defineComponent({
  name: 'XhLayoutSiderTrigger',
  setup(_, { slots }) {
    const ctx = useLayoutContext()
    return () => h('button', ctx.api.value.getSiderTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
