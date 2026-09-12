import type { Size } from '@xihan-ui/core'
import type { HotkeysPlatform, KbdProps, KbdTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectKbd } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from './use-kbd-platform'

export interface XhKbdProps extends Omit<ComponentPropsWithRef<'kbd'>, 'children'> {
  value: string
  platform?: HotkeysPlatform
  size?: Size
  pressed?: boolean
  disabled?: boolean
  translations?: Partial<KbdTranslations>
}

/** 单枚原生 kbd；只展示，不安装任何键盘监听。 */
export function XhKbd({
  value,
  platform,
  size,
  pressed,
  disabled,
  translations,
  ...rest
}: XhKbdProps): ReactNode {
  const resolvedPlatform = useKbdPlatform(platform)
  const configured = withXhConfig('kbd', { value, platform: resolvedPlatform, size, pressed, disabled, translations } as KbdProps)
  const api = connectKbd(configured, reactNormalize)
  return (
    <kbd {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.label}
    </kbd>
  )
}
