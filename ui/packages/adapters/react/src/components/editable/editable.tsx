import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { EditableActivationMode, EditableApi, EditableSchema, EditableSubmitMode } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { EditableProvider, useEditableContext } from './context'
import { useEditable } from './use-editable'

type EditableProps = EditableSchema['props']

/** 函数式 children 的载荷：当下的值与预览文字、编辑态，以及写值、进入编辑、提交、撤销的命令。 */
export type EditableRootSlotProps = Pick<
  EditableApi,
  'value' | 'displayValue' | 'editing' | 'empty' | 'setValue' | 'edit' | 'submit' | 'cancel'
>

export interface XhEditableRootProps {
  value?: string
  defaultValue?: string
  /** 受控编辑态。 */
  edit?: boolean
  defaultEdit?: boolean
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  maxLength?: number
  /** 表单字段名；给了才参与提交。 */
  name?: string
  submitMode?: EditableSubmitMode
  activationMode?: EditableActivationMode
  selectOnFocus?: boolean
  autoResize?: boolean
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: EditableProps['onValueChange']
  onValueCommit?: EditableProps['onValueCommit']
  onValueRevert?: EditableProps['onValueRevert']
  onEditChange?: EditableProps['onEditChange']
  children?: SlotChildren<EditableRootSlotProps>
}

export function XhEditableRoot({ children, ...props }: XhEditableRootProps): ReactNode {
  const ctx = useEditable(props as EditableProps)
  const api = ctx.api
  return (
    <EditableProvider value={ctx}>
      <div
        {...api.getRootProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.rootRef.current = el }}
      >
        {renderSlot(children, {
          value: api.value,
          displayValue: api.displayValue,
          editing: api.editing,
          empty: api.empty,
          setValue: api.setValue,
          edit: api.edit,
          submit: api.submit,
          cancel: api.cancel,
        })}
      </div>
    </EditableProvider>
  )
}

XhEditableRoot.xhEvents = ['value-change', 'value-commit', 'value-revert', 'edit-change'] as const

export interface XhEditableLabelProps extends ComponentPropsWithRef<'label'> {}
export function XhEditableLabel({ children, ...rest }: XhEditableLabelProps): ReactNode {
  const ctx = useEditableContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhEditableControlProps extends ComponentPropsWithRef<'div'> {}
/** 预览区、输入框与三颗按钮的容器，只作排版落点。 */
export function XhEditableControl({ children, ...rest }: XhEditableControlProps): ReactNode {
  const ctx = useEditableContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhEditablePreviewProps extends ComponentPropsWithRef<'span'> {}

/**
 * 预览区。有内容用内容，否则显示当前值、值为空时显示 placeholder。
 * connect 挂的 onFocus 是不冒泡的 DOM focus，改装成原生监听器，与另外两家同一条到达路径。
 */
export function XhEditablePreview({ children, ...rest }: XhEditablePreviewProps): ReactNode {
  const ctx = useEditableContext()
  const bind = useNativeEvents(ctx.api.getPreviewProps() as Record<string, unknown>, ['onFocus'])
  return (
    <span
      {...mergeReactProps(
        bind.attrs,
        { ref: bind.ref },
        rest as Record<string, unknown>,
        { ref: (el: HTMLSpanElement | null) => { ctx.previewRef.current = el } },
      )}
    >
      {slotPaints(children) ? children : ctx.api.displayValue}
    </span>
  )
}

export interface XhEditableInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhEditableInput({ ...rest }: XhEditableInputProps): ReactNode {
  const ctx = useEditableContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getInputProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLInputElement | null) => { ctx.inputRef.current = el } },
      )}
    />
  )
}

export interface XhEditableEditTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhEditableEditTrigger({ children, ...rest }: XhEditableEditTriggerProps): ReactNode {
  const ctx = useEditableContext()
  return (
    <button {...mergeReactProps(ctx.api.getEditTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhEditableSubmitTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhEditableSubmitTrigger({ children, ...rest }: XhEditableSubmitTriggerProps): ReactNode {
  const ctx = useEditableContext()
  return (
    <button {...mergeReactProps(ctx.api.getSubmitTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhEditableCancelTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhEditableCancelTrigger({ children, ...rest }: XhEditableCancelTriggerProps): ReactNode {
  const ctx = useEditableContext()
  return (
    <button {...mergeReactProps(ctx.api.getCancelTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
