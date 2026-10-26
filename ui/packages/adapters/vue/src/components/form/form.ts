/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 form 相关实现。

import type { PropTypes } from '@xihan-ui/core'
import type {
  FormApi,
  FormColumns,
  FormErrorPatch,
  FormErrorPatchOf,
  FormFieldPath,
  FormFieldSpan,
  FormInvalidDetails,
  FormPath,
  FormPathValue,
  FormRules,
  FormSchema,
  FormStandardSchema,
  FormSubmitDetails,
  FormSubmitErrorDetails,
  FormValidateOn,
  FormValidationErrorDetails,
  FormValues,
  FormValuesChangeDetails,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { BivariantCallback } from '../../runtime/bivariant'
import type { PayloadOf } from '../../runtime/payload'
import { formFieldModel } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideForm, provideFormField, useFormContext } from './context'
import { useForm } from './use-form'

type FormProps = FormSchema['props']

/** 默认插槽的载荷：整表的值与错误、校验与提交在途、改动与触碰，以及逐字段读写、清错、校验、提交、重置的命令。TValues 是整表的值类型。 */
export type FormRootSlotProps<TValues = FormValues> = Pick<
  FormApi<PropTypes, TValues>,
  | 'values'
  | 'errors'
  | 'errorNames'
  | 'invalid'
  | 'submitFailed'
  | 'validating'
  | 'submitting'
  | 'dirty'
  | 'validationError'
  | 'getFieldId'
  | 'getFieldError'
  | 'isFieldDirty'
  | 'isFieldTouched'
  | 'setFieldValue'
  | 'setFieldError'
  | 'clearErrors'
  | 'submit'
  | 'validateAll'
  | 'validateField'
  | 'validateFields'
  | 'resetField'
  | 'reset'
>

/** 字段容器默认插槽的载荷：该字段的名字、值、错误与控件 id，以及写值的命令。给了值类型时值按字段收窄。 */
export interface FormFieldGroupSlotProps<TValues = FormValues, P = FormPath> {
  name: P
  value: FormPathValue<TValues, P> | undefined
  error: string | undefined
  invalid: boolean
  controlId: string
  setValue: (next: FormPathValue<TValues, P>) => void
}

/** 错误摘要默认插槽的载荷：整表的错误、出错字段名与条数。 */
export type FormErrorSummarySlotProps = Pick<FormApi, 'errors' | 'errorNames' | 'errorCount'>

/** 错误摘要单条默认插槽的载荷：该条指向的字段名与它的错误文案。 */
export interface FormErrorSummaryItemSlotProps<P = FormPath> {
  name: P
  error: string | undefined
}

// 运行时的根组件按缺省的值表收；对外导出的 XhFormRoot 在它上面套一层按值类型收窄的类型，见文件后面
const XhFormRootImpl = defineComponent({
  name: 'XhFormRoot',
  // 缺省值由 connect 与机器给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    values: { type: Object as PropType<FormValues> },
    defaultValues: { type: Object as PropType<FormValues> },
    errors: { type: Object as PropType<FormErrorPatch> },
    defaultErrors: { type: Object as PropType<FormErrorPatch> },
    validate: { type: Function as PropType<FormProps['validate']> },
    /** Standard Schema（zod、valibot、arktype 的 schema 都是）：它报的问题按路径落到字段上，与 validate、rules 并用。 */
    schema: { type: Object as PropType<FormStandardSchema> },
    rules: { type: Object as PropType<FormProps['rules']> },
    validateMessages: { type: Object as PropType<FormProps['validateMessages']> },
    /** 校验报错的文案模板；全局语言包经它到达，validateMessages 再逐条压在上面。 */
    translations: { type: Object as PropType<FormProps['translations']> },
    validateOn: { type: String as PropType<FormValidateOn> },
    layout: { type: String as PropType<FormProps['layout']> },
    /** grid 排布下分几列：整数即各档同一个列数，断点对象 `{ base, sm, md, lg, xl }` 则逐档取值。 */
    columns: { type: [Number, Object] as PropType<FormColumns> },
    labelWidth: { type: [Number, String] },
    labelAlign: { type: String as PropType<FormProps['labelAlign']> },
    disabled: Boolean,
    readOnly: Boolean,
    /**
     * 校验通过才调用。返回 thenable 期间 submitting 为真、再提交不发生，拒绝经 submit-error 报出。
     * 模板中照常写 @submit，Vue 会把它落到该 prop 上。
     */
    onSubmit: { type: Function as PropType<FormProps['onSubmit']> },
  },
  // *-change 携带 details 对象，update:* 携带裸表；submit 与 invalid 按校验结果二选一
  emits: {
    'values-change': (_details: PayloadOf<FormProps, 'onValuesChange'>) => true,
    'errors-change': (_details: PayloadOf<FormProps, 'onErrorsChange'>) => true,
    'invalid': (_details: PayloadOf<FormProps, 'onInvalid'>) => true,
    'submit-error': (_details: PayloadOf<FormProps, 'onSubmitError'>) => true,
    'validation-error': (_details: PayloadOf<FormProps, 'onValidationError'>) => true,
    'update:values': (_values: PayloadOf<FormProps, 'onValuesChange'>['values']) => true,
    'update:errors': (_errors: PayloadOf<FormProps, 'onErrorsChange'>['errors']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: FormRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useForm(withXhConfig('form', props) as FormProps, {
      onValuesChange: (details) => {
        emit('values-change', details)
        emit('update:values', details.values)
      },
      onErrorsChange: (details) => {
        emit('errors-change', details)
        emit('update:errors', details.errors)
      },
      // 返回值要交给机器：thenable 即进入提交在途
      onSubmit: details => props.onSubmit?.(details),
      onSubmitError: details => emit('submit-error', details),
      onInvalid: details => emit('invalid', details),
      onValidationError: details => emit('validation-error', details),
    })
    provideForm(ctx)

    // 根节点渲染为原生 form，隐式提交与 submit 事件都依赖它
    return () => h('form', {
      ...ctx.api.value.getRootProps(),
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default?.({
      values: ctx.api.value.values,
      errors: ctx.api.value.errors,
      errorNames: ctx.api.value.errorNames,
      invalid: ctx.api.value.invalid,
      submitFailed: ctx.api.value.submitFailed,
      validating: ctx.api.value.validating,
      submitting: ctx.api.value.submitting,
      dirty: ctx.api.value.dirty,
      validationError: ctx.api.value.validationError,
      getFieldId: ctx.api.value.getFieldId,
      getFieldError: ctx.api.value.getFieldError,
      isFieldDirty: ctx.api.value.isFieldDirty,
      isFieldTouched: ctx.api.value.isFieldTouched,
      setFieldValue: ctx.setFieldValue,
      setFieldError: ctx.setFieldError,
      clearErrors: ctx.clearErrors,
      submit: ctx.submit,
      validateAll: ctx.validateAll,
      validateField: ctx.validateField,
      validateFields: ctx.validateFields,
      resetField: ctx.resetField,
      reset: ctx.reset,
    }))
  },
})

/** 根组件里随值类型收窄的那几项 prop：值表、校验、规则与几个回调的载荷。 */
export interface XhFormRootValueProps<TValues> {
  'values'?: TValues
  'defaultValues'?: TValues
  'validate'?: (values: TValues) => FormErrorPatchOf<TValues> | Promise<FormErrorPatchOf<TValues>>
  'rules'?: FormRules<TValues>
  'onSubmit'?: BivariantCallback<[details: FormSubmitDetails<TValues>], void | PromiseLike<unknown>>
  'onValuesChange'?: BivariantCallback<[details: FormValuesChangeDetails<TValues>]>
  'onUpdate:values'?: BivariantCallback<[values: TValues]>
  'onInvalid'?: BivariantCallback<[details: FormInvalidDetails<TValues>]>
  'onSubmitError'?: BivariantCallback<[details: FormSubmitErrorDetails<TValues>]>
  'onValidationError'?: BivariantCallback<[details: FormValidationErrorDetails<TValues>]>
}

type XhFormRootInstance = InstanceType<typeof XhFormRootImpl>

/**
 * 按值类型收窄的根组件类型。模板里由 Volar 照 defaultValues（或 values）推断值类型：rules 的键、validate 交回的键
 * 只能写它的字段，onSubmit 与默认插槽里按字段取写的值都按它收窄。`h()` 推断不了泛型，那里按缺省的值表收。
 */
export type XhFormRootComponent = Omit<typeof XhFormRootImpl, never> & {
  new<TValues extends object = FormValues>(props?: Omit<XhFormRootInstance['$props'], keyof XhFormRootValueProps<TValues>> & XhFormRootValueProps<TValues>): Omit<XhFormRootInstance, '$props' | '$slots'> & {
    $props: Omit<XhFormRootInstance['$props'], keyof XhFormRootValueProps<TValues>> & XhFormRootValueProps<TValues>
    $slots: { default?: (props: FormRootSlotProps<TValues>) => VNode[] }
  }
}

export const XhFormRoot = XhFormRootImpl as unknown as XhFormRootComponent

export const XhFormFieldGroup = defineComponent({
  name: 'XhFormFieldGroup',
  props: {
    /** 字段路径；字符串含点仍是单键，数组才表示层级。 */
    name: { type: [String, Array] as PropType<FormPath>, required: true },
    /** grid 排布下该格占多宽：1 至 4 跨相应列数，'full' 占满整行；未写时占一列。 */
    span: { type: [Number, String] as PropType<FormFieldSpan> },
  },
  slots: Object as SlotsType<{
    default?: (props: FormFieldGroupSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useFormContext()
    // 后代 Field 据此从表单上下文自取校验态，省掉逐字段搬运；没给值的录入控件经值端口按字段名读写
    const name = (): FormPath => props.name
    provideFormField({ name, model: formFieldModel(ctx.service, name) })
    // 作用域插槽暴露本字段的值、错误与写入方法
    return () => h(
      'div',
      ctx.api.value.getFieldGroupProps({ name: props.name, span: props.span }),
      slots.default?.({
        name: props.name,
        value: ctx.api.value.getFieldValue(props.name),
        error: ctx.api.value.getFieldError(props.name),
        invalid: ctx.api.value.isFieldInvalid(props.name),
        controlId: ctx.api.value.getFieldId(props.name),
        setValue: (next: unknown) => ctx.setFieldValue(props.name, next),
      }),
    )
  },
})

export const XhFormErrorSummary = defineComponent({
  name: 'XhFormErrorSummary',
  slots: Object as SlotsType<{
    default?: (props: FormErrorSummarySlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useFormContext()
    // 摘要读它自己那版错误表：退场途中文案与条数照撤下之前的写
    return () => h('div', ctx.api.value.getErrorSummaryProps(), slots.default?.({
      errors: ctx.api.value.summaryErrors,
      errorNames: ctx.api.value.summaryErrorNames,
      errorCount: ctx.api.value.summaryErrorCount,
    }))
  },
})

export const XhFormErrorSummaryItem = defineComponent({
  name: 'XhFormErrorSummaryItem',
  props: {
    /** 该条指向哪个字段路径。 */
    name: { type: [String, Array] as PropType<FormPath>, required: true },
  },
  slots: Object as SlotsType<{
    default?: (props: FormErrorSummaryItemSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useFormContext()
    // 渲染为原生 a，href 指向字段容器的 id
    return () => h(
      'a',
      ctx.api.value.getErrorSummaryItemProps({ name: props.name }),
      slots.default?.({ name: props.name, error: ctx.api.value.getSummaryError(props.name) }),
    )
  },
})

export const XhFormSubmitTrigger = defineComponent({
  name: 'XhFormSubmitTrigger',
  setup(_, { slots }) {
    const ctx = useFormContext()
    return () => h('button', ctx.api.value.getSubmitTriggerProps(), slots.default?.())
  },
})

export const XhFormResetTrigger = defineComponent({
  name: 'XhFormResetTrigger',
  setup(_, { slots }) {
    const ctx = useFormContext()
    return () => h('button', ctx.api.value.getResetTriggerProps(), slots.default?.())
  },
})

type XhFormFieldGroupInstance = InstanceType<typeof XhFormFieldGroup>
type XhFormErrorSummaryItemInstance = InstanceType<typeof XhFormErrorSummaryItem>

/** 按值类型收窄的字段组：name 只能写值表的字段，作用域插槽里的 value 与 setValue 是那个字段的类型。 */
export type XhFormFieldGroupComponent<TValues> = Omit<typeof XhFormFieldGroup, never> & {
  new<P extends FormFieldPath<TValues>>(props: Omit<XhFormFieldGroupInstance['$props'], 'name'> & { name: P }): Omit<XhFormFieldGroupInstance, '$props' | '$slots'> & {
    $props: Omit<XhFormFieldGroupInstance['$props'], 'name'> & { name: P }
    $slots: { default?: (props: FormFieldGroupSlotProps<TValues, P>) => VNode[] }
  }
}

/** 按值类型收窄的错误摘要条目：name 只能写值表的字段。 */
export type XhFormErrorSummaryItemComponent<TValues> = Omit<typeof XhFormErrorSummaryItem, never> & {
  new<P extends FormFieldPath<TValues>>(props: Omit<XhFormErrorSummaryItemInstance['$props'], 'name'> & { name: P }): Omit<XhFormErrorSummaryItemInstance, '$props' | '$slots'> & {
    $props: Omit<XhFormErrorSummaryItemInstance['$props'], 'name'> & { name: P }
    $slots: { default?: (props: FormErrorSummaryItemSlotProps<P>) => VNode[] }
  }
}

/**
 * 按值类型收窄的字段组与错误摘要条目：`const { FieldGroup } = defineFormFields<SignUp>()`，模板里写
 * `<FieldGroup name="email">`，字段名只能写 SignUp 的字段，作用域插槽里的 value 是那个字段的类型。
 * 字段组是表单根的子组件，推断不到根上的值类型，所以要这样交一次；拿到的就是 XhFormFieldGroup 与
 * XhFormErrorSummaryItem 本身，只在类型上收窄。
 */
export function defineFormFields<TValues extends object>(): {
  FieldGroup: XhFormFieldGroupComponent<TValues>
  ErrorSummaryItem: XhFormErrorSummaryItemComponent<TValues>
} {
  return {
    FieldGroup: XhFormFieldGroup as unknown as XhFormFieldGroupComponent<TValues>,
    ErrorSummaryItem: XhFormErrorSummaryItem as unknown as XhFormErrorSummaryItemComponent<TValues>,
  }
}
