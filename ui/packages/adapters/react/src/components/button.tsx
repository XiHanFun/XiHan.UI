import type { PropTypes } from '@xihan-ui/core'
import type { ButtonProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectButton } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'
import { withXhConfig } from '../config/config'
import { mergeReactProps } from '../runtime/merge-props'
import { useNativeEvents } from '../runtime/native-events'
import { reactNormalize } from '../runtime/normalize-props'
import { useButtonGroupDisabled } from './button-group/context'

/** 从实际调用推出 api 形状，免得再写一遍 normalize 的类型参数。 */
type ReactButtonApi = ReturnType<typeof connectButton<PropTypes>>

const ButtonCtx = createContext<ReactButtonApi | undefined>(undefined)

function useButtonApi(): ReactButtonApi {
  const api = useContext(ButtonCtx)
  if (!api)
    throw new Error('[xh] XhButton 的子部件必须放在 XhButton 里')
  return api
}

export interface XhButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  fullWidth?: boolean
  variant?: ButtonProps['variant']
  tone?: ButtonProps['tone']
  size?: ButtonProps['size']
  shape?: ButtonProps['shape']
  /** 渲染成哪个标签，默认 button；写成 a 时作者自行给 href。 */
  as?: ButtonProps['as']
}

export function XhButton({
  type = 'button',
  disabled,
  loading,
  iconOnly,
  fullWidth,
  variant,
  tone,
  size,
  shape,
  as = 'button',
  children,
  ...rest
}: XhButtonProps): ReactNode {
  const configured = withXhConfig('button', {
    type,
    disabled,
    loading,
    iconOnly,
    fullWidth,
    variant,
    tone,
    size,
    shape,
    as,
  } as ButtonProps)
  // 外层按钮组禁用时整组一起禁用；段自己写了禁用的仍然禁用
  const groupDisabled = useButtonGroupDisabled()
  // 作者写在根节点上的可及名转告连接层，图标按钮缺名时由它提醒
  const api = connectButton({
    ...configured,
    disabled: configured.disabled || !!groupDisabled,
    ariaLabel: (rest as Record<string, unknown>)['aria-label'] as string | undefined,
    ariaLabelledby: (rest as Record<string, unknown>)['aria-labelledby'] as string | undefined,
  }, reactNormalize)
  // 连接层的 onClick 在载入态里调 stopImmediatePropagation 把同节点上作者的处理器一并拦下。
  // 那是 DOM 语义：React 的合成事件既没有这个方法，两个处理器也早被合成一条链，拦不住。
  // 装成原生监听器之后，事件在节点上就被截住、根本到不了 React 委派的那一层
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>)
  const Tag = as as 'button'
  return (
    <ButtonCtx value={api}>
      <Tag {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
        {children}
      </Tag>
    </ButtonCtx>
  )
}

export interface XhButtonLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhButtonLabel({ children, ...rest }: XhButtonLabelProps): ReactNode {
  const api = useButtonApi()
  return <span {...mergeReactProps(api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhButtonPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhButtonPrefix({ children, ...rest }: XhButtonPrefixProps): ReactNode {
  const api = useButtonApi()
  return <span {...mergeReactProps(api.getPrefixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhButtonSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhButtonSuffix({ children, ...rest }: XhButtonSuffixProps): ReactNode {
  const api = useButtonApi()
  return <span {...mergeReactProps(api.getSuffixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhButtonIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 载入态的转圈标记；皮肤给它挂了旋转动画，作者只需摆位置。 */
export function XhButtonIndicator({ children, ...rest }: XhButtonIndicatorProps): ReactNode {
  const api = useButtonApi()
  return <span {...mergeReactProps(api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}
