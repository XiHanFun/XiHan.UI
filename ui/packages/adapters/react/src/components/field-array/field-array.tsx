import type { FieldArrayApi, FieldArraySchema, FieldArrayTranslations, FormPath } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { useOptionalFormContext } from '../form/context'
import { FieldArrayItemProvider, FieldArrayProvider, useFieldArrayContext, useFieldArrayItemContext } from './context'
import { useFieldArray } from './use-field-array'

type FieldArrayProps = FieldArraySchema['props']

/** 函数式 children 的载荷：逐行投影与整份值、行数与上下限状态，以及整份替换、增删、移动的动作。 */
export type FieldArrayRootSlotProps = Pick<
  FieldArrayApi,
  | 'items'
  | 'value'
  | 'count'
  | 'empty'
  | 'atMin'
  | 'atMax'
  | 'canAdd'
  | 'setValue'
  | 'add'
  | 'remove'
  | 'move'
  | 'moveUp'
  | 'moveDown'
>

export interface XhFieldArrayRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  value?: unknown[]
  defaultValue?: unknown[]
  min?: number
  max?: number
  /** 新增一行时造一个空项；不给就插一个 null。 */
  createItem?: () => unknown
  movable?: boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  name?: FormPath
  translations?: Partial<FieldArrayTranslations>
  onValueChange?: FieldArrayProps['onValueChange']
  children?: SlotChildren<FieldArrayRootSlotProps>
}

export function XhFieldArrayRoot({
  value,
  defaultValue,
  min,
  max,
  createItem,
  movable,
  disabled,
  readOnly,
  invalid,
  name,
  translations,
  onValueChange,
  children,
  ...rest
}: XhFieldArrayRootProps): ReactNode {
  const form = useOptionalFormContext()
  const ctx = useFieldArray(withXhConfig('field-array', {
    value,
    defaultValue,
    min,
    max,
    createItem,
    movable,
    disabled,
    readOnly,
    invalid,
    name,
    translations,
    onValueChange,
  }) as FieldArrayProps, form?.service)
  const api = ctx.api

  return (
    <FieldArrayProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {/* items 里每一项都带 key，作者铺行时直接用 row.key */}
        {renderSlot(children, {
          items: api.items,
          value: api.value,
          count: api.count,
          empty: api.empty,
          atMin: api.atMin,
          atMax: api.atMax,
          canAdd: api.canAdd,
          setValue: api.setValue,
          add: api.add,
          remove: api.remove,
          move: api.move,
          moveUp: api.moveUp,
          moveDown: api.moveDown,
        })}
      </div>
    </FieldArrayProvider>
  )
}

XhFieldArrayRoot.xhEvents = ['value-change'] as const

export interface XhFieldArrayItemProps extends ComponentPropsWithRef<'div'> {
  /** 下标由作者声明；兼收字符串，与另外两家的属性口径对齐。 */
  index: number | string
}
export function XhFieldArrayItem({ index, children, ...rest }: XhFieldArrayItemProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useMemo(() => ({ index: Math.trunc(Number(index)) }), [index])
  return (
    <FieldArrayItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </FieldArrayItemProvider>
  )
}

export interface XhFieldArrayItemLabelProps extends ComponentPropsWithRef<'span'> {}
/** 行前的行号或名目；纯标注，不与行里的控件建 for 关联。 */
export function XhFieldArrayItemLabel({ children, ...rest }: XhFieldArrayItemLabelProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <span {...mergeReactProps(ctx.api.getItemLabelProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhFieldArrayItemContentProps extends ComponentPropsWithRef<'div'> {}
export function XhFieldArrayItemContent({ children, ...rest }: XhFieldArrayItemContentProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <div {...mergeReactProps(ctx.api.getItemContentProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldArrayItemActionProps extends ComponentPropsWithRef<'div'> {}
export function XhFieldArrayItemAction({ children, ...rest }: XhFieldArrayItemActionProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <div {...mergeReactProps(ctx.api.getItemActionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldArrayAddTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayAddTrigger({ children, ...rest }: XhFieldArrayAddTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  return <button {...mergeReactProps(ctx.api.getAddTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFieldArrayItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayItemDeleteTrigger({ children, ...rest }: XhFieldArrayItemDeleteTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFieldArrayMoveUpTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayMoveUpTrigger({ children, ...rest }: XhFieldArrayMoveUpTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <button {...mergeReactProps(ctx.api.getMoveUpTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFieldArrayMoveDownTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayMoveDownTrigger({ children, ...rest }: XhFieldArrayMoveDownTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <button {...mergeReactProps(ctx.api.getMoveDownTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
