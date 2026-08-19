import type { FieldProps } from '@xihan-ui/headless'
import type { SlotsType, VNode } from 'vue'
import { cloneVNode, Comment, defineComponent, h, Text } from 'vue'
import { carriesOwnAnatomy } from '../../runtime/as-child'
import { useOptionalFormContext, useOptionalFormField } from '../form/context'
import { provideField, useFieldContext } from './context'
import { useField } from './use-field'

/** 滤掉注释与纯文本节点，只留能挂属性的节点。 */
function attributable(nodes: readonly VNode[]): VNode[] {
  return nodes.filter(node => node.type !== Comment && node.type !== Text)
}

export const XhFieldRoot = defineComponent({
  name: 'XhFieldRoot',
  // 三个布尔缺省 undefined：在 XhFormFieldGroup 里没写就从表单上下文自取，写了以写的为准
  props: {
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    // 控件节点的 id，不占用根节点自己的 DOM id
    controlId: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const form = useOptionalFormContext()
    const handle = useOptionalFormField()
    // getter 透传保住响应性：props 与表单 api 谁变都会带动 connect 重算
    const merged: FieldProps = {
      get invalid() {
        return props.invalid ?? (form && handle ? form.api.value.isFieldInvalid(handle.name()) : undefined)
      },
      get required() {
        return props.required ?? (form && handle ? form.api.value.isFieldRequired(handle.name()) : undefined)
      },
      get disabled() {
        return props.disabled ?? (form && handle ? form.api.value.disabled : undefined)
      },
      get readOnly() {
        return props.readOnly ?? (form && handle ? form.api.value.readOnly : undefined)
      },
      get controlId() {
        return props.controlId
      },
    }
    const ctx = useField(merged)
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

/** 默认插槽的载荷：控件节点该挂的那组属性，作者把它交给自己渲染的控件。 */
export type FieldControlSlotProps = Record<string, unknown>

/** 去掉角色标记，只留接线属性（id 与 aria-*）。 */
function wiringOnly(controlProps: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(controlProps)) {
    if (key !== 'data-scope' && key !== 'data-part')
      rest[key] = value
  }
  return rest
}

export const XhFieldControl = defineComponent({
  name: 'XhFieldControl',
  slots: Object as SlotsType<{
    default?: (props: FieldControlSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useFieldContext()
    return () => {
      const controlProps = ctx.api.value.getControlProps() as Record<string, unknown>
      // control props 经 slot props 交给作者，控件节点由作者渲染
      const children = slots.default?.(controlProps) ?? []
      const nodes = attributable(children)
      // 多个节点视为作者已用 slot props 自行接线
      if (nodes.length !== 1)
        return children
      const node = nodes[0]!
      // 单个节点合并属性；它自带角色标记时不覆盖，只落接线属性
      return cloneVNode(node, carriesOwnAnatomy(node) ? wiringOnly(controlProps) : controlProps)
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
    const form = useOptionalFormContext()
    const handle = useOptionalFormField()
    // 节点常挂，靠 hidden 显隐；插槽没给内容时在表单里自取该字段的错误文案
    return () => {
      const kids = slots.default?.()
      const auto = (!kids || kids.length === 0) && form && handle
        ? form.api.value.getFieldError(handle.name())
        : undefined
      return h('p', ctx.api.value.getErrorTextProps() as Record<string, unknown>, kids?.length ? kids : auto)
    }
  },
})
