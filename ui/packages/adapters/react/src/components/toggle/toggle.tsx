import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ToggleSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { useToggle } from './use-toggle'

type ToggleProps = ToggleSchema['props']

export interface XhToggleProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  pressed?: boolean
  defaultPressed?: boolean
  disabled?: boolean
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  iconOnly?: boolean
  fullWidth?: boolean
  onPressedChange?: ToggleProps['onPressedChange']
  children?: ReactNode
}

export function XhToggle({
  pressed,
  defaultPressed,
  disabled,
  variant,
  tone,
  size,
  iconOnly,
  fullWidth,
  onPressedChange,
  children,
  ...rest
}: XhToggleProps): ReactNode {
  const { api } = useToggle({
    pressed,
    defaultPressed,
    disabled,
    variant,
    tone,
    size,
    iconOnly,
    fullWidth,
    onPressedChange,
  } as ToggleProps)
  return (
    <button {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

XhToggle.xhEvents = ['pressed-change'] as const
