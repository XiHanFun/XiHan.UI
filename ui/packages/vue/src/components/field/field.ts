import type { FieldProps } from '@xihan-ui/headless'
import type { VNode } from 'vue'
import { cloneVNode, Comment, defineComponent, h, Text } from 'vue'
import { provideField, useFieldContext } from './context'
import { useField } from './use-field'

/** 滤掉注释与纯文本节点，只留能挂属性的节点。 */
function attributable(nodes: readonly VNode[]): VNode[] {
  return nodes.filter(node => node.type !== Comment && node.type !== Text)
}

export const XhFieldRoot = defineComponent({
  name: 'XhFieldRoot',
  props: {
    invalid: Boolean,
    required: Boolean,
    disabled: Boolean,
    // 控件节点的 id，不占用根节点自己的 DOM id
    controlId: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useField(props as FieldProps)
    provideField(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldLabel = defineComponent({
  name: 'XhFieldLabel',
  setup(_, { slots }) {
    const ctx = useFieldContext()
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldControl = defineComponent({
  name: 'XhFieldControl',
  setup(_, { slots }) {
    const ctx = useFieldContext()
    return () => {
      const controlProps = ctx.api.value.getControlProps() as Record<string, unknown>
      // control props 经 slot props 交给作者，控件节点由作者渲染
      const children = slots.default?.(controlProps) ?? []
      const nodes = attributable(children)
      // 单个节点直接合并属性，多个节点视为作者已用 slot props 自行接线
      return nodes.length === 1 ? cloneVNode(nodes[0]!, controlProps) : children
    }
  },
})

export const XhFieldDescription = defineComponent({
  name: 'XhFieldDescription',
  setup(_, { slots }) {
    const ctx = useFieldContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldErrorText = defineComponent({
  name: 'XhFieldErrorText',
  setup(_, { slots }) {
    const ctx = useFieldContext()
    // 节点常挂，靠 hidden 显隐
    return () => h('p', ctx.api.value.getErrorTextProps() as Record<string, unknown>, slots.default?.())
  },
})
