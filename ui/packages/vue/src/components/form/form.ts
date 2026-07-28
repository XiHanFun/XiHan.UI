import type { FormErrorPatch, FormSchema, FormValidateOn, FormValues } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideForm, useFormContext } from './context'
import { useForm } from './use-form'

type FormProps = FormSchema['props']

export const XhFormRoot = defineComponent({
  name: 'XhFormRoot',
  // 缺省值的唯一事实源在 connect 与机器里 —— 凡是那边有兜底的一律 default: undefined。
  // values / errors 尤其：落成 {} 等于宣称"受控且当前为空"，之后一个字段都写不进来
  props: {
    values: { type: Object as PropType<FormValues>, default: undefined },
    defaultValues: { type: Object as PropType<FormValues>, default: undefined },
    errors: { type: Object as PropType<FormErrorPatch>, default: undefined },
    defaultErrors: { type: Object as PropType<FormErrorPatch>, default: undefined },
    validate: { type: Function as PropType<FormProps['validate']>, default: undefined },
    validateOn: { type: String as PropType<FormValidateOn>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
  },
  // *-change 携带 details 对象；update:* 携带裸表，支持 v-model:values / v-model:errors。
  // submit 只在校验通过时派发，invalid 只在校验不通过时派发，两者互斥
  emits: ['values-change', 'errors-change', 'submit', 'invalid', 'update:values', 'update:errors'],
  setup(props, { slots, emit }) {
    const ctx = useForm(props as FormProps, {
      onValuesChange: (details) => {
        emit('values-change', details)
        emit('update:values', details.values)
      },
      onErrorsChange: (details) => {
        emit('errors-change', details)
        emit('update:errors', details.errors)
      },
      onSubmit: details => emit('submit', details),
      onInvalid: details => emit('invalid', details),
    })
    provideForm(ctx)

    // 根节点必须是 <form>：回车的隐式提交、type=submit 按钮、以及"提交时 preventDefault"
    // 这三件事全长在原生表单元素上，换成 div 就得自己重造一套，且必然与原生行为漂移
    return () => h('form', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default?.({
      values: ctx.api.value.values,
      errors: ctx.api.value.errors,
      errorNames: ctx.api.value.errorNames,
      invalid: ctx.api.value.invalid,
      submitFailed: ctx.api.value.submitFailed,
      getFieldId: ctx.api.value.getFieldId,
      getFieldError: ctx.api.value.getFieldError,
      setFieldValue: ctx.setFieldValue,
      setFieldError: ctx.setFieldError,
      clearErrors: ctx.clearErrors,
      submit: ctx.submit,
      reset: ctx.reset,
    }))
  },
})

export const XhFormFieldGroup = defineComponent({
  name: 'XhFormFieldGroup',
  props: {
    /**
     * 字段名，与 values / errors 表里的键一致。
     * 名字叫 value 是与 WC 侧对齐：那边作者写的是 `value` 属性（宿主基类只观察这几个
     * 「作者声明」属性，换个名字，列表复用节点时的原地改名在 WC 侧就不会重新接线）。
     */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFormContext()
    // 作用域插槽把这个字段自己的错误交出去：作者据此给里面那个 Field 传 invalid 与错误文案，
    // 不必再自己从整张表里挑一遍
    return () => h(
      'div',
      ctx.api.value.getFieldGroupProps({ name: props.value }) as Record<string, unknown>,
      slots.default?.({
        name: props.value,
        value: ctx.api.value.getFieldValue(props.value),
        error: ctx.api.value.getFieldError(props.value),
        invalid: ctx.api.value.isFieldInvalid(props.value),
        controlId: ctx.api.value.getFieldId(props.value),
        setValue: (next: unknown) => ctx.setFieldValue(props.value, next),
      }),
    )
  },
})

export const XhFormErrorSummary = defineComponent({
  name: 'XhFormErrorSummary',
  setup(_, { slots }) {
    const ctx = useFormContext()
    return () => h('div', ctx.api.value.getErrorSummaryProps() as Record<string, unknown>, slots.default?.({
      errors: ctx.api.value.errors,
      errorNames: ctx.api.value.errorNames,
      errorCount: ctx.api.value.errorCount,
    }))
  },
})

export const XhFormErrorSummaryItem = defineComponent({
  name: 'XhFormErrorSummaryItem',
  props: {
    /** 这一条指向哪个字段。命名与 XhFormFieldGroup 的 value 同源。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFormContext()
    // 必须是 <a>：读屏会把它归进链接列表，用户因此能用链接导航直接跳到出错的地方；
    // href 指向字段容器的 id，即便脚本没跑起来这条链接也仍然是可用的
    return () => h(
      'a',
      ctx.api.value.getErrorSummaryItemProps({ name: props.value }) as Record<string, unknown>,
      slots.default?.({ name: props.value, error: ctx.api.value.getFieldError(props.value) }),
    )
  },
})

export const XhFormSubmitTrigger = defineComponent({
  name: 'XhFormSubmitTrigger',
  setup(_, { slots }) {
    const ctx = useFormContext()
    return () => h('button', ctx.api.value.getSubmitTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFormResetTrigger = defineComponent({
  name: 'XhFormResetTrigger',
  setup(_, { slots }) {
    const ctx = useFormContext()
    return () => h('button', ctx.api.value.getResetTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
