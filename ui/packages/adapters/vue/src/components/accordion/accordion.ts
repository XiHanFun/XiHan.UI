import type { AccordionNode, AccordionNodeMeta, AccordionSchema } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, ref } from 'vue'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { provideAccordion, provideAccordionItem, useAccordionContext, useAccordionItem } from './context'
import { useAccordion } from './use-accordion'

type AccordionProps = AccordionSchema['props']

export const XhAccordionRoot = defineComponent({
  name: 'XhAccordionRoot',
  props: {
    collection: { type: Array as PropType<AccordionNode[]>, default: undefined },
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    multiple: Boolean,
    collapsible: Boolean,
    orientation: { type: String as PropType<Orientation>, default: undefined },
    // 只改水平轴上左右键的语义，不写进 DOM
    dir: { type: String as PropType<Direction>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸数组
  emits: {
    'value-change': (_details: PayloadOf<AccordionProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<AccordionProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: AccordionProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useAccordion(props as AccordionProps, notify)
    provideAccordion(ctx)
    return () => h(
      'div',
      ctx.api.value.getRootProps() as Record<string, unknown>,
      slots.default
        ? slots.default()
        : props.collection
          ? renderDefaultTree(ctx.api.value.collection, slots.content)
          : [],
    )
  },
})

export const XhAccordionItem = defineComponent({
  name: 'XhAccordionItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useAccordionContext()
    provideAccordionItem(() => ({ value: props.value, disabled: props.disabled }))
    return () => h(
      'div',
      ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

// 渲染为 h3，与 connect 给出的 aria-level 对齐
export const XhAccordionHeader = defineComponent({
  name: 'XhAccordionHeader',
  setup(_, { slots }) {
    const ctx = useAccordionContext()
    const item = useAccordionItem()
    return () => h('h3', ctx.api.value.getHeaderProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhAccordionTrigger = defineComponent({
  name: 'XhAccordionTrigger',
  setup(_, { slots }) {
    const ctx = useAccordionContext()
    const item = useAccordionItem()
    return () => h('button', ctx.api.value.getTriggerProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhAccordionContent = defineComponent({
  name: 'XhAccordionContent',
  setup(_, { slots }) {
    const ctx = useAccordionContext()
    const item = useAccordionItem()
    const contentRef = ref<HTMLElement | null>(null)
    // 闸门按面板各开一个：手风琴模式下切换项时，一个进场一个退场是同时发生的
    const visible = useOverlayExit({
      config: ctx.config,
      isOpen: () => ctx.api.value.isOpen(item().value),
      contentRef,
    })
    return () => h('div', {
      ...ctx.api.value.getContentProps(item()) as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhAccordionIndicator = defineComponent({
  name: 'XhAccordionIndicator',
  setup(_, { slots }) {
    const ctx = useAccordionContext()
    const item = useAccordionItem()
    return () => h('span', ctx.api.value.getIndicatorProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 正文默认取 node.content，写 content 插槽即由作者接管。
 */
function renderDefaultTree(
  collection: readonly AccordionNodeMeta[],
  contentSlot?: (node: AccordionNodeMeta) => VNode[],
): VNode[] {
  return collection.map(node => h(XhAccordionItem, { key: node.value, value: node.value }, () => [
    h(XhAccordionHeader, null, () => [
      h(XhAccordionTrigger, null, () => [
        h('span', null, node.label),
        h(XhAccordionIndicator),
      ]),
    ]),
    h(XhAccordionContent, null, () => contentSlot?.(node) ?? node.content ?? ''),
  ]))
}
