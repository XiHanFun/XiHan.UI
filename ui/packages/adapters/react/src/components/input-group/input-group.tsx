import type { Size } from '@xihan-ui/core'
import type { InputGroupProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectInputGroup } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { InputGroupProvider, useInputGroupContext } from './context'

export interface XhInputGroupRootProps extends ComponentPropsWithRef<'div'> {
  /** 档位：落到根上，皮肤据此给前后缀块换高度与字号。 */
  size?: Size
}

/** 一排控件拼成一段：组内每一段由作者自己写进 children，中缝合并与首尾圆角由皮肤按身份给。 */
export function XhInputGroupRoot({ size, children, ...rest }: XhInputGroupRootProps): ReactNode {
  const api = connectInputGroup(withXhConfig('input-group', { size } as InputGroupProps), reactNormalize)
  return (
    <InputGroupProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </InputGroupProvider>
  )
}

export interface XhInputGroupItemProps extends ComponentPropsWithRef<'span'> {}

/** 前后缀块：文本由作者写，高度、描边与圆角由皮肤按这个身份给。 */
export function XhInputGroupItem({ children, ...rest }: XhInputGroupItemProps): ReactNode {
  const ctx = useInputGroupContext()
  return (
    <span {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
