import type { FormErrorPatch, FormSchema, FormValidateOn, FormValues } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideForm, useFormContext } from './context'
import { useForm } from './use-form'

type FormProps = FormSchema['props']

export const XhFormRoot = defineComponent({
  name: 'XhFormRoot',
  // 缺省值由 connect 与机器给出，这里一律 default: undefined
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
  // *-change 携带 details 对象，update:* 携带裸表；submit 与 invalid 按校验结果二选一
  emits: {
    'values-change': (_details: PayloadOf<FormProps, 'onValuesChange'>) => true,
    'errors-change': (_details: PayloadOf<FormProps, 'onErrorsChange'>) => true,
    'submit': (_details: PayloadOf<FormProps, 'onSubmit'>) => true,
    'invalid': (_details: PayloadOf<FormProps, 'onInvalid'>) => true,
    'update:values': (_values: PayloadOf<FormProps, 'onValuesChange'>['values']) => true,
    'update:errors': (_errors: PayloadOf<FormProps, 'onErrorsChange'>['errors']) => true,
  },
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

    // 根节点渲染为原生 form，隐式提交与 submit 事件都依赖它
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
    /** 字段名，与 values / errors 表里的键一致。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFormContext()
    // 作用域插槽暴露本字段的值、错误与写入方法
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
    /** 这一条指向哪个字段。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFormContext()
    // 渲染为原生 a，href 指向字段容器的 id
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
