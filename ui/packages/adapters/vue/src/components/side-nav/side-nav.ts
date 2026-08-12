import type { SideNavNode, SideNavSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideSideNav, provideSideNavNode, useSideNavContext, useSideNavNodeContext } from './context'
import { useSideNav } from './use-side-nav'

type SideNavProps = SideNavSchema['props']

export const XhSideNavRoot = defineComponent({
  name: 'XhSideNavRoot',
  // 缺省值由 connect 与机器给出，这里一律 default: undefined
  props: {
    collection: { type: Array as PropType<SideNavNode[]>, default: undefined },
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    expandedValue: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedValue: { type: Array as PropType<string[]>, default: undefined },
    accordion: Boolean,
    collapsed: { type: Boolean, default: undefined },
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<SideNavProps['dir']>, default: undefined },
    translations: { type: Object as PropType<SideNavProps['translations']>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值，支持 v-model:value 与 v-model:expanded-value
  emits: {
    'value-change': (_details: PayloadOf<SideNavProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<SideNavProps, 'onValueChange'>['value']) => true,
    'expanded-change': (_details: PayloadOf<SideNavProps, 'onExpandedChange'>) => true,
    'update:expandedValue': (_value: PayloadOf<SideNavProps, 'onExpandedChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const ctx = useSideNav(withXhConfig('side-nav', props) as SideNavProps, {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onExpandedChange: (details) => {
        emit('expanded-change', details)
        emit('update:expandedValue', details.value)
      },
    })
    provideSideNav(ctx)
    // 经插槽暴露状态与命令，供折叠开关这类外部控件使用
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      expandedValue: ctx.api.value.expandedValue,
      collapsed: ctx.api.value.collapsed,
      isSelected: ctx.api.value.isSelected,
      isExpanded: ctx.api.value.isExpanded,
      isActiveBranch: ctx.api.value.isActiveBranch,
      select: ctx.api.value.select,
      setValue: ctx.api.value.setValue,
      setExpandedValue: ctx.api.value.setExpandedValue,
      expand: ctx.api.value.expand,
      collapse: ctx.api.value.collapse,
    }))
  },
})

export const XhSideNavList = defineComponent({
  name: 'XhSideNavList',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    return () => h('ul', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavGroup = defineComponent({
  name: 'XhSideNavGroup',
  props: {
    /** 分组身份，与 group-label 靠它配对。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    return () => h('li', ctx.api.value.getGroupProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavGroupLabel = defineComponent({
  name: 'XhSideNavGroupLabel',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    return () => h('div', ctx.api.value.getGroupLabelProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranch = defineComponent({
  name: 'XhSideNavBranch',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    provideSideNavNode(props)
    return () => h('li', ctx.api.value.getBranchProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranchTrigger = defineComponent({
  name: 'XhSideNavBranchTrigger',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    const node = useSideNavNodeContext()
    return () => h('button', ctx.api.value.getBranchTriggerProps({ value: node.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranchIndicator = defineComponent({
  name: 'XhSideNavBranchIndicator',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    const node = useSideNavNodeContext()
    return () => h('span', ctx.api.value.getBranchIndicatorProps({ value: node.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranchContent = defineComponent({
  name: 'XhSideNavBranchContent',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    const node = useSideNavNodeContext()
    return () => h('ul', ctx.api.value.getBranchContentProps({ value: node.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavLink = defineComponent({
  name: 'XhSideNavLink',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    // 链接是行内容器里的一等行，外面包一层 li 维持列表语义
    return () => h('li', null, [
      h('a', ctx.api.value.getLinkProps({ value: props.value }) as Record<string, unknown>, slots.default?.()),
    ])
  },
})
