import type { Orientation } from '@xihan-ui/core'
import type { AccordionSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideAccordion, provideAccordionItem, useAccordionContext, useAccordionItem } from './context'
import { useAccordion } from './use-accordion'

type AccordionProps = AccordionSchema['props']

export const XhAccordionRoot = defineComponent({
  name: 'XhAccordionRoot',
  props: {
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    multiple: Boolean,
    collapsible: Boolean,
    orientation: { type: String as PropType<Orientation>, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸数组，支持 v-model:value
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: AccordionProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useAccordion(props as AccordionProps, notify)
    provideAccordion(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAccordionItem = defineComponent({
  name: 'XhAccordionItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
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

// h3 是常见页面层级下的默认标题级别，与 connect 给出的 aria-level 对齐。
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
    return () => h('div', ctx.api.value.getContentProps(item()) as Record<string, unknown>, slots.default?.())
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
