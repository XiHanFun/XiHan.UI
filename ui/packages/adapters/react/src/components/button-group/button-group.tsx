import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ButtonGroupProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { connectButtonGroup } from '@xihan-ui/headless'
import { Children, Fragment, isValidElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { ButtonGroupDisabledProvider } from './context'

export interface XhButtonGroupProps extends ComponentPropsWithRef<'div'> {
  /** 排布：horizontal / vertical，决定相邻两段在哪个轴上合边。 */
  orientation?: 'horizontal' | 'vertical'
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  /** 整组禁用：组内每一段跟着禁用，段自己写了禁用的仍然禁用。 */
  disabled?: boolean
  /** 撑满行宽：整组占满可用宽度，每段等分剩余空间。 */
  fullWidth?: boolean
  /** 是否自动在相邻按钮之间插入分隔线，默认 true。 */
  separators?: boolean
}

function flattenChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = []
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === Fragment) {
      flattenChildren((child as ReactElement<{ children?: ReactNode }>).props.children).forEach(value => result.push(value))
      continue
    }
    if (child !== null && child !== undefined && typeof child !== 'boolean')
      result.push(child)
  }
  return result
}

function renderChildren(children: ReactNode, api: ReturnType<typeof connectButtonGroup>): ReactNode[] {
  const nodes = flattenChildren(children)
  if (!api.separators)
    return nodes
  return nodes.flatMap((node, index) => index === 0
    ? [node]
    : [
        <span
          key={`separator-${index}`}
          aria-hidden="true"
          data-xh-button-group-separator=""
          data-orientation={api.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
          data-disabled={api.disabled ? '' : undefined}
        />,
        node,
      ])
}

/** 一组连排的按钮：组内每一段是作者放进 children 的按钮，直接当直接子节点摆。 */
export function XhButtonGroup({
  orientation,
  variant,
  tone,
  size,
  disabled,
  fullWidth,
  separators,
  children,
  ...rest
}: XhButtonGroupProps): ReactNode {
  const configured = withXhConfig('button-group', {
    orientation,
    variant,
    tone,
    size,
    disabled,
    fullWidth,
    separators,
  } as ButtonGroupProps)
  const api = connectButtonGroup(configured, reactNormalize)
  return (
    <ButtonGroupDisabledProvider value={api.disabled}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderChildren(children, api)}
      </div>
    </ButtonGroupDisabledProvider>
  )
}
