/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 相关实现。

import type { HotkeysPlatform, KbdProps, KbdTranslations, KbdVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectKbd } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from './use-kbd-platform'

export interface XhKbdProps extends Omit<ComponentPropsWithRef<'kbd'>, 'children'> {
  value: string
  platform?: HotkeysPlatform
  variant?: KbdVariant
  translations?: Partial<KbdTranslations>
}

/** 单枚原生 kbd；只展示，不安装任何键盘监听。 */
export function XhKbd({
  value,
  platform,
  variant,
  translations,
  ...rest
}: XhKbdProps): ReactNode {
  const resolvedPlatform = useKbdPlatform(platform)
  const configured = withXhConfig('kbd', { value, platform: resolvedPlatform, variant, translations } as KbdProps)
  const api = connectKbd(configured, reactNormalize)
  return (
    <kbd {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.label}
    </kbd>
  )
}
