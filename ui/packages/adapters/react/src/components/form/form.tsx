import type {
  FormApi,
  FormColumns,
  FormErrorPatch,
  FormFieldSpan,
  FormSchema,
  FormValidateOn,
  FormValues,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { FormFieldProvider, FormProvider, useFormContext } from './context'
import { useForm } from './use-form'

type FormProps = FormSchema['props']

/** 函数式 children 的载荷：整表的值与错误、校验态，以及逐字段读写、清错、提交、重置的命令。 */
export type FormRootSlotProps = Pick<
  FormApi,
  | 'values'
  | 'errors'
  | 'errorNames'
  | 'invalid'
  | 'submitFailed'
  | 'validating'
  | 'validationError'
  | 'getFieldId'
  | 'getFieldError'
  | 'setFieldValue'
  | 'setFieldError'
  | 'clearErrors'
  | 'submit'
  | 'reset'
>

/** 字段容器函数式 children 的载荷：这一个字段的名字、值、错误与控件 id，以及写值的命令。 */
export interface FormFieldGroupSlotProps {
  name: string
  value: unknown
  error: string | undefined
  invalid: boolean
  controlId: string
  setValue: (next: unknown) => void
}

/** 错误摘要函数式 children 的载荷：整表的错误、出错字段名与条数。 */
export type FormErrorSummarySlotProps = Pick<FormApi, 'errors' | 'errorNames' | 'errorCount'>

/** 错误摘要单条函数式 children 的载荷：这一条指向的字段名与它的错误文案。 */
export interface FormErrorSummaryItemSlotProps {
  name: string
  error: string | undefined
}

/** 三个语义回调另有含义，同名的原生表单事件由 connect 在根节点上接管。 */
type FormElementProps = Omit<ComponentPropsWithRef<'form'>, 'onSubmit' | 'onReset' | 'onInvalid' | 'children'>

export interface XhFormRootProps extends FormElementProps {
  values?: FormValues
  defaultValues?: FormValues
  errors?: FormErrorPatch
  defaultErrors?: FormErrorPatch
  validate?: FormProps['validate']
  rules?: FormProps['rules']
  validateMessages?: FormProps['validateMessages']
  validateOn?: FormValidateOn
  layout?: FormProps['layout']
  /** grid 排布下分几列：整数即各档同一个列数，断点对象 `{ base, sm, md, lg, xl }` 则逐档取值。 */
  columns?: FormColumns
  labelWidth?: number | string
  labelAlign?: FormProps['labelAlign']
  disabled?: boolean
  readOnly?: boolean
  onValuesChange?: FormProps['onValuesChange']
  onErrorsChange?: FormProps['onErrorsChange']
  onSubmit?: FormProps['onSubmit']
  onInvalid?: FormProps['onInvalid']
  onValidationError?: FormProps['onValidationError']
  children?: SlotChildren<FormRootSlotProps>
}

/** 根节点渲染为原生 form，隐式提交与 submit 事件都依赖它。 */
export function XhFormRoot({
  values,
  defaultValues,
  errors,
  defaultErrors,
  validate,
  rules,
  validateMessages,
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
  children,
  ...rest
}: XhFormRootProps): ReactNode {
  const ctx = useForm(
    {
      values,
      defaultValues,
      errors,
      defaultErrors,
      validate,
      rules,
      validateMessages,
      validateOn,
      layout,
      columns,
      labelWidth,
      labelAlign,
      disabled,
      readOnly,
    } as FormProps,
    { onValuesChange, onErrorsChange, onSubmit, onInvalid, onValidationError },
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
          validationError: api.validationError,
          getFieldId: api.getFieldId,
          getFieldError: api.getFieldError,
          setFieldValue: ctx.setFieldValue,
          setFieldError: ctx.setFieldError,
          clearErrors: ctx.clearErrors,
          submit: ctx.submit,
          reset: ctx.reset,
        })}
      </form>
    </FormProvider>
  )
}

XhFormRoot.xhEvents = ['submit'] as const

export interface XhFormFieldGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 字段名，与 values / errors 表里的键一致。 */
  value: string
  /** grid 排布下这一格占多宽：1 至 4 跨这么多列，'full' 占满整行；不写占一列。 */
  span?: FormFieldSpan
  children?: SlotChildren<FormFieldGroupSlotProps>
}

export function XhFormFieldGroup({ value, span, children, ...rest }: XhFormFieldGroupProps): ReactNode {
  const ctx = useFormContext()
  const api = ctx.api
  // 后代 Field 据此从表单上下文自取校验态，省掉逐字段搬运
  const handle = useMemo(() => ({ name: value }), [value])
  return (
    <FormFieldProvider value={handle}>
      <div
        {...mergeReactProps(
          api.getFieldGroupProps({ name: value, span }) as Record<string, unknown>,
          rest as Record<string, unknown>,
        )}
      >
        {renderSlot(children, {
          name: value,
          value: api.getFieldValue(value),
          error: api.getFieldError(value),
          invalid: api.isFieldInvalid(value),
          controlId: api.getFieldId(value),
          setValue: (next: unknown) => ctx.setFieldValue(value, next),
        })}
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
      {renderSlot(children, {
        errors: api.errors,
        errorNames: api.errorNames,
        errorCount: api.errorCount,
      })}
    </div>
  )
}

export interface XhFormErrorSummaryItemProps extends Omit<ComponentPropsWithRef<'a'>, 'children'> {
  /** 这一条指向哪个字段。 */
  value: string
  children?: SlotChildren<FormErrorSummaryItemSlotProps>
}

/** 渲染为原生 a，href 指向字段容器的 id。 */
export function XhFormErrorSummaryItem({ value, children, ...rest }: XhFormErrorSummaryItemProps): ReactNode {
  const api = useFormContext().api
  return (
    <a
      {...mergeReactProps(
        api.getErrorSummaryItemProps({ name: value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {renderSlot(children, { name: value, error: api.getFieldError(value) })}
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
