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
  FormFieldPath,
  FormFieldSpan,
  FormPath,
  FormPathValue,
  FormSchema,
  FormStandardSchema,
  FormValidateOn,
  FormValues,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import type { FormCallbacks } from './use-form'
import { formFieldModel } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { FormFieldProvider, FormProvider, useFormContext } from './context'
import { useForm } from './use-form'

type FormProps = FormSchema['props']

/** 函数式 children 的载荷：整表的值与错误、校验态，以及逐字段读写、清错、提交、重置的命令。TValues 是整表的值类型。 */
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

/** 字段容器函数式 children 的载荷：该字段的名字、值、错误与控件 id，以及写值的命令。给了值类型时值按字段收窄。 */
export interface FormFieldGroupSlotProps<TValues = FormValues, P = FormPath> {
  name: P
  value: FormPathValue<TValues, P> | undefined
  error: string | undefined
  invalid: boolean
  controlId: string
  setValue: (next: FormPathValue<TValues, P>) => void
}

/** 错误摘要函数式 children 的载荷：整表的错误、出错字段名与条数。 */
export type FormErrorSummarySlotProps = Pick<FormApi, 'errors' | 'errorNames' | 'errorCount'>

/** 错误摘要单条函数式 children 的载荷：该条指向的字段名与它的错误文案。 */
export interface FormErrorSummaryItemSlotProps<P = FormPath> {
  name: P
  error: string | undefined
}

/** 三个语义回调另有含义，同名的原生表单事件由 connect 在根节点上接管。 */
type FormElementProps = Omit<ComponentPropsWithRef<'form'>, 'onSubmit' | 'onReset' | 'onInvalid' | 'children'>

/**
 * TValues 是整表的值类型，按 defaultValues（或 values）推断，缺省 FormValues：rules 的键、validate 交回的键只能写它的字段，
 * onSubmit 与 children 里按字段取写的值都按它收窄。字段组要按字段名收窄，经 defineFormFields 拿。
 */
export interface XhFormRootProps<TValues extends object = FormValues> extends FormElementProps {
  values?: TValues
  defaultValues?: TValues
  errors?: FormErrorPatch
  defaultErrors?: FormErrorPatch
  validate?: FormSchema<TValues>['props']['validate']
  /** Standard Schema（zod、valibot、arktype 的 schema 都是）：它报的问题按路径落到字段上，与 validate、rules 并用。 */
  schema?: FormStandardSchema
  rules?: FormSchema<TValues>['props']['rules']
  validateMessages?: FormProps['validateMessages']
  /** 校验报错的文案模板；全局语言包经它到达，validateMessages 再逐条压在上面。 */
  translations?: FormProps['translations']
  validateOn?: FormValidateOn
  layout?: FormProps['layout']
  /** grid 排布下分几列：整数即各档同一个列数，断点对象 `{ base, sm, md, lg, xl }` 则逐档取值。 */
  columns?: FormColumns
  labelWidth?: number | string
  labelAlign?: FormProps['labelAlign']
  disabled?: boolean
  readOnly?: boolean
  onValuesChange?: FormSchema<TValues>['props']['onValuesChange']
  onErrorsChange?: FormProps['onErrorsChange']
  onSubmit?: FormSchema<TValues>['props']['onSubmit']
  onInvalid?: FormSchema<TValues>['props']['onInvalid']
  onValidationError?: FormSchema<TValues>['props']['onValidationError']
  onSubmitError?: FormSchema<TValues>['props']['onSubmitError']
  children?: SlotChildren<FormRootSlotProps<TValues>>
}

/** 根节点渲染为原生 form，隐式提交与 submit 事件都依赖它。 */
export function XhFormRoot<TValues extends object = FormValues>({
  values,
  defaultValues,
  errors,
  defaultErrors,
  validate,
  schema,
  rules,
  validateMessages,
  translations,
  validateOn,
  layout,
  columns,
  labelWidth,
  labelAlign,
  disabled,
  readOnly,
  onValuesChange,
  onErrorsChange,
  onSubmit,
  onInvalid,
  onValidationError,
  onSubmitError,
  children,
  ...rest
}: XhFormRootProps<TValues>): ReactNode {
  // 值类型只给作者看：交给机器时擦回缺省的值表，交回 children 时再按它收窄
  const ctx = useForm(
    withXhConfig('form', {
      values,
      defaultValues,
      errors,
      defaultErrors,
      validate,
      schema,
      rules,
      validateMessages,
      translations,
      validateOn,
      layout,
      columns,
      labelWidth,
      labelAlign,
      disabled,
      readOnly,
    } as unknown as FormProps),
    { onValuesChange, onErrorsChange, onSubmit, onInvalid, onValidationError, onSubmitError } as unknown as FormCallbacks,
  )
  const api = ctx.api
  return (
    <FormProvider value={ctx}>
      <form
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          values: api.values,
          errors: api.errors,
          errorNames: api.errorNames,
          invalid: api.invalid,
          submitFailed: api.submitFailed,
          validating: api.validating,
          submitting: api.submitting,
          dirty: api.dirty,
          validationError: api.validationError,
          getFieldId: api.getFieldId,
          getFieldError: api.getFieldError,
          isFieldDirty: api.isFieldDirty,
          isFieldTouched: api.isFieldTouched,
          setFieldValue: ctx.setFieldValue,
          setFieldError: ctx.setFieldError,
          clearErrors: ctx.clearErrors,
          submit: ctx.submit,
          validateAll: ctx.validateAll,
          validateField: ctx.validateField,
          validateFields: ctx.validateFields,
          resetField: ctx.resetField,
          reset: ctx.reset,
        } as unknown as FormRootSlotProps<TValues>)}
      </form>
    </FormProvider>
  )
}

XhFormRoot.xhEvents = ['submit'] as const

/**
 * TValues 是整表的值类型、P 是这个字段的路径（按 name 推断）：给了值类型时 name 只能写它的字段，
 * children 里的值是那个字段的类型。值类型经 defineFormFields 交一次。
 */
export interface XhFormFieldGroupProps<TValues = FormValues, P extends FormFieldPath<TValues> = FormFieldPath<TValues>>
  extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 字段路径；字符串含点仍是单键，数组才表示层级。 */
  name: P
  /** grid 排布下该格占多宽：1 至 4 跨相应列数，'full' 占满整行；未写时占一列。 */
  span?: FormFieldSpan
  children?: SlotChildren<FormFieldGroupSlotProps<TValues, P>>
}

export function XhFormFieldGroup<TValues = FormValues, P extends FormFieldPath<TValues> = FormFieldPath<TValues>>({
  name: field,
  span,
  children,
  ...rest
}: XhFormFieldGroupProps<TValues, P>): ReactNode {
  // 机器按缺省的值表跑：字段路径交给它时就是 FormPath
  const name = field as FormPath
  const ctx = useFormContext()
  const api = ctx.api
  // 后代 Field 据此从表单上下文自取校验态，省掉逐字段搬运；没给值的录入控件经值端口按字段名读写。
  // 字段值进依赖：表单从外面改了这个字段（重置、setFieldValue），组里的控件凭 handle 换身份重渲
  const value = api.getFieldValue(name)
  const handle = useMemo(() => ({ name, model: formFieldModel(ctx.service, () => name) }), [name, ctx.service, value])
  return (
    <FormFieldProvider value={handle}>
      <div
        {...mergeReactProps(
          api.getFieldGroupProps({ name, span }) as Record<string, unknown>,
          rest as Record<string, unknown>,
        )}
      >
        {renderSlot(children, {
          name: field,
          value: api.getFieldValue(name),
          error: api.getFieldError(name),
          invalid: api.isFieldInvalid(name),
          controlId: api.getFieldId(name),
          setValue: (next: unknown) => ctx.setFieldValue(name, next),
        } as FormFieldGroupSlotProps<TValues, P>)}
      </div>
    </FormFieldProvider>
  )
}

export interface XhFormErrorSummaryProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?: SlotChildren<FormErrorSummarySlotProps>
}

export function XhFormErrorSummary({ children, ...rest }: XhFormErrorSummaryProps): ReactNode {
  const api = useFormContext().api
  return (
    <div {...mergeReactProps(api.getErrorSummaryProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {/* 摘要读它自己那版错误表：退场途中文案与条数照撤下之前的写 */}
      {renderSlot(children, {
        errors: api.summaryErrors,
        errorNames: api.summaryErrorNames,
        errorCount: api.summaryErrorCount,
      })}
    </div>
  )
}

/** TValues 是整表的值类型、P 是这条指向的字段路径：给了值类型时 name 只能写它的字段。 */
export interface XhFormErrorSummaryItemProps<TValues = FormValues, P extends FormFieldPath<TValues> = FormFieldPath<TValues>>
  extends Omit<ComponentPropsWithRef<'a'>, 'children'> {
  /** 该条指向哪个字段路径。 */
  name: P
  children?: SlotChildren<FormErrorSummaryItemSlotProps<P>>
}

/** 渲染为原生 a，href 指向字段容器的 id。 */
export function XhFormErrorSummaryItem<TValues = FormValues, P extends FormFieldPath<TValues> = FormFieldPath<TValues>>({
  name: field,
  children,
  ...rest
}: XhFormErrorSummaryItemProps<TValues, P>): ReactNode {
  const name = field as FormPath
  const api = useFormContext().api
  return (
    <a
      {...mergeReactProps(
        api.getErrorSummaryItemProps({ name }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {renderSlot(children, { name: field, error: api.getSummaryError(name) })}
    </a>
  )
}

export interface XhFormSubmitTriggerProps extends ComponentPropsWithRef<'button'> {}

export function XhFormSubmitTrigger({ children, ...rest }: XhFormSubmitTriggerProps): ReactNode {
  const api = useFormContext().api
  return (
    <button {...mergeReactProps(api.getSubmitTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhFormResetTriggerProps extends ComponentPropsWithRef<'button'> {}

export function XhFormResetTrigger({ children, ...rest }: XhFormResetTriggerProps): ReactNode {
  const api = useFormContext().api
  return (
    <button {...mergeReactProps(api.getResetTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

/**
 * 按值类型收窄的字段组与错误摘要条目：`const { FieldGroup } = defineFormFields<SignUp>()`，再写 `<FieldGroup name="email">`，
 * 字段名只能写 SignUp 的字段，children 里的 value 是那个字段的类型（按 name 推断）。
 * 字段组是表单根的子组件，推断不到根上的值类型，所以要这样交一次；拿到的就是 XhFormFieldGroup 与
 * XhFormErrorSummaryItem 本身，只在类型上收窄。
 */
export function defineFormFields<TValues extends object>(): {
  FieldGroup: <P extends FormFieldPath<TValues>>(props: XhFormFieldGroupProps<TValues, P>) => ReactNode
  ErrorSummaryItem: <P extends FormFieldPath<TValues>>(props: XhFormErrorSummaryItemProps<TValues, P>) => ReactNode
} {
  return { FieldGroup: XhFormFieldGroup, ErrorSummaryItem: XhFormErrorSummaryItem }
}
