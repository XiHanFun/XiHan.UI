import type { FieldsetProps, FieldsetTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { FieldsetProvider, useFieldsetContext } from './context'
import { useFieldset } from './use-fieldset'

export interface XhFieldsetRootProps extends ComponentPropsWithRef<'fieldset'> {
  /** 整组禁用：落成原生 disabled，浏览器把组内每个表单控件一并停掉。 */
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  translations?: Partial<FieldsetTranslations>
  children?: ReactNode
}

/** 必须是原生 fieldset：整组禁用连坐组内控件是浏览器给的，换成 div 就只剩一层灰样式。 */
export function XhFieldsetRoot({
  disabled,
  invalid,
  required,
  translations,
  children,
  ...rest
}: XhFieldsetRootProps): ReactNode {
  const ctx = useFieldset(withXhConfig('fieldset', {
    disabled,
    invalid,
    required,
    translations,
  }) as FieldsetProps)
  return (
    <FieldsetProvider value={ctx}>
      <fieldset {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </fieldset>
    </FieldsetProvider>
  )
}

export interface XhFieldsetLegendProps extends ComponentPropsWithRef<'legend'> {}
/** 原生 legend 只有作为 fieldset 的首个子节点时才充当这一组的名字。 */
export function XhFieldsetLegend({ children, ...rest }: XhFieldsetLegendProps): ReactNode {
  const ctx = useFieldsetContext()
  return <legend {...mergeReactProps(ctx.api.getLegendProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</legend>
}

export interface XhFieldsetDescriptionProps extends ComponentPropsWithRef<'p'> {}
export function XhFieldsetDescription({ children, ...rest }: XhFieldsetDescriptionProps): ReactNode {
  const ctx = useFieldsetContext()
  return <p {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhFieldsetFieldGroupProps extends ComponentPropsWithRef<'div'> {}
/** 把并排的几个字段圈成一段；纯排版。 */
export function XhFieldsetFieldGroup({ children, ...rest }: XhFieldsetFieldGroupProps): ReactNode {
  const ctx = useFieldsetContext()
  return <div {...mergeReactProps(ctx.api.getFieldGroupProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldsetActionsProps extends ComponentPropsWithRef<'div'> {}
/** 组末尾那一行按钮；纯排版。 */
export function XhFieldsetActions({ children, ...rest }: XhFieldsetActionsProps): ReactNode {
  const ctx = useFieldsetContext()
  return <div {...mergeReactProps(ctx.api.getActionsProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldsetErrorTextProps extends ComponentPropsWithRef<'p'> {}
/** 节点常挂，靠 hidden 显隐：活区要先在场才播报得出来，卸载重挂读屏读不到。 */
export function XhFieldsetErrorText({ children, ...rest }: XhFieldsetErrorTextProps): ReactNode {
  const ctx = useFieldsetContext()
  return <p {...mergeReactProps(ctx.api.getErrorTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}
