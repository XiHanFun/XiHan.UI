import type { SlotsType, VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { mergeIntoChild } from '../../runtime/as-child'
import { useOptionalFormContext, useOptionalFormField } from '../form/context'
import { useFormControlProps } from '../form/use-form-control'
import { provideField, useFieldContext } from './context'
import { useField } from './use-field'

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
    const ctx = useField(useFormControlProps(props))
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
export function wiringOnly(controlProps: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(controlProps)) {
    if (key !== 'data-scope' && key !== 'data-part')
      rest[key] = value
  }
  return rest
}

export const XhFieldControl = defineComponent({
  name: 'XhFieldControl',
  props: {
    /**
     * 把接线属性合到唯一的子节点上，缺省开。
     *
     * 子节点是薄封装（根不是可聚焦元素）时关掉它：属性只经插槽载荷交出去，
     * 由封装内部调 useFieldControl 绑到真控件上。
     */
    asChild: { type: Boolean, default: true },
  },
  slots: Object as SlotsType<{
    default?: (props: FieldControlSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useFieldContext()
    return () => {
      const controlProps = ctx.api.value.getControlProps() as Record<string, unknown>
      // control props 经 slot props 交给作者，控件节点由作者渲染
      const children = slots.default?.(controlProps) ?? []
      // 手工接线必须显式关闭 asChild，不能根据无效结构猜测作者意图。
      if (!props.asChild)
        return children
      return mergeIntoChild(children, controlProps, 'field/control')
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
