import type { FieldProps } from '@xihan-ui/headless'
import type { VNode } from 'vue'
import { cloneVNode, Comment, defineComponent, h, Text } from 'vue'
import { provideField, useFieldContext } from './context'
import { useField } from './use-field'

/** 只留挂得上属性的节点：注释（v-if 的假分支占位）与纯文本承不了 props。 */
function attributable(nodes: readonly VNode[]): VNode[] {
  return nodes.filter(node => node.type !== Comment && node.type !== Text)
}

export const XhFieldRoot = defineComponent({
  name: 'XhFieldRoot',
  props: {
    invalid: Boolean,
    required: Boolean,
    disabled: Boolean,
    // 叫 controlId 而不是 id：id 是宿主根节点自己的 DOM id，声明成 prop 会被 Vue 从 $attrs 摘走，
    // 作者再也没法给根容器加 id；WC 侧同样用 control-id，两个适配器保持一致
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
      // control props 经 slot props 交给作者：渲染 input / select / 自定义控件由作者决定，
      // 这里不替他建节点，id 与 aria-* 必须落在真正的输入控件上而不是外面包一层
      const children = slots.default?.(controlProps) ?? []
      const nodes = attributable(children)
      // 作者只给一个节点时直接合并，省掉 v-bind；给多个节点时视为作者已用 slot props 自行接线
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
    // 节点常挂、靠 hidden 显隐：不卸载作者写的错误文案
    return () => h('p', ctx.api.value.getErrorTextProps() as Record<string, unknown>, slots.default?.())
  },
})
