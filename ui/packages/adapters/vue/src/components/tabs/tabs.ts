import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { TabsActivationMode, TabsNode, TabsNodeMeta, TabsSchema, TabsVariant } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { slotPaints } from '../../runtime/slot-content'
import { provideTabs, useTabsContext } from './context'
import { useTabs } from './use-tabs'

type TabsProps = TabsSchema['props']

export const XhTabsRoot = defineComponent({
  name: 'XhTabsRoot',
  // 全部 default: undefined，缺省值由 connect 决定
  props: {
    collection: { type: Array as PropType<TabsNode[]>, default: undefined },
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    activationMode: { type: String as PropType<TabsActivationMode>, default: undefined },
    loop: { type: Boolean, default: undefined },
    variant: { type: String as PropType<TabsVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    /** 标签可以拖着换位。整个标签都是拖动源，不另出把手。 */
    reorderable: Boolean,
    translations: { type: Object as PropType<TabsProps['translations']>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<TabsProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TabsProps, 'onValueChange'>['value']) => true,
    // 换位是通知，标签序的真源在使用者的数据里，故没有配对的 update:*
    'tab-move': (_details: PayloadOf<TabsProps, 'onTabMove'>) => true,
  },
  setup(props, { slots, emit }) {
    const notify: TabsProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    // 监听器不进 props 对象，故作为位置参数交给 useTabs，不能指望 { ...props } 带上
    const onTabMove: TabsProps['onTabMove'] = (details) => {
      emit('tab-move', details)
    }
    const ctx = useTabs(withXhConfig('tabs', props) as TabsProps, notify, onTabMove)
    provideTabs(ctx)
    return () => {
      // 默认插槽里有真内容就照旧交给作者；只剩注释或空白时当没写，给了 collection 就按数据铺开整套结构
      const authored = slots.default?.()
      const children = slotPaints(authored)
        ? authored
        : (props.collection ? renderDefaultTree(ctx.api.value.collection, slots.panel) : undefined)
      return h('div', ctx.api.value.getRootProps() as Record<string, unknown>, children)
    }
  },
})

export const XhTabsList = defineComponent({
  name: 'XhTabsList',
  setup(_, { slots }) {
    const ctx = useTabsContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 拖动过程的读屏播报区，视觉上不可见。
 *
 * 放在 root 里、与 list 部件平级。它必须在拖动开始**之前**就在 DOM 上——
 * 读屏不播报后插入的节点，等到拖起才渲出来等于没有。
 */
export const XhTabsLiveRegion = defineComponent({
  name: 'XhTabsLiveRegion',
  setup() {
    const ctx = useTabsContext()
    return () => h(
      'div',
      ctx.api.value.getLiveRegionProps() as Record<string, unknown>,
      ctx.service.context.get('announcement'),
    )
  },
})

export const XhTabsTrigger = defineComponent({
  name: 'XhTabsTrigger',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useTabsContext()
    // 本节点持有焦点时，value 变更重报焦点标签，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'TRIGGER.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      if (ctx.service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && ctx.service.scope.getActiveElement() === itemEl.value)
        ctx.service.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'button',
      { ...ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

/**
 * 标签拖拽把手。放在标签里，自带 touch-action: none，按下即拖，不等激活距离。
 * 对读屏隐藏、也不占 Tab 位；键盘换位由标签带上的 Alt + 方向键承担。
 * 整个标签起手那一路照旧可用，把手是叠加的第二个入口。
 */
export const XhTabsTabDragTrigger = defineComponent({
  name: 'XhTabsTabDragTrigger',
  props: {
    /** 所属标签的 value。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTabsContext()
    return () => h(
      'span',
      ctx.api.value.getTabDragTriggerProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTabsContent = defineComponent({
  name: 'XhTabsContent',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTabsContext()
    return () => h(
      'div',
      ctx.api.value.getContentProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 面板内容走 panel 插槽，没写就是空面板。
 */
function renderDefaultTree(
  collection: readonly TabsNodeMeta[],
  panelSlot?: (node: TabsNodeMeta) => VNode[],
): VNode[] {
  return [
    h(XhTabsList, null, () => collection.map(node =>
      h(XhTabsTrigger, { key: node.value, value: node.value }, () => node.label),
    )),
    ...collection.map(node =>
      h(XhTabsContent, { key: node.value, value: node.value }, () => panelSlot?.(node) ?? []),
    ),
  ]
}
