/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd group 相关实现。

import type { HotkeysPlatform, KbdGroupProps, KbdGroupTranslations, KbdVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectKbdGroup } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from '../kbd/use-kbd-platform'

export interface XhKbdGroupProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  keys: string[]
  platform?: HotkeysPlatform
  variant?: KbdVariant
  translations?: Partial<KbdGroupTranslations>
}

/** 数据驱动的完整组合；整组只由一个 aria-label 朗读，不安装键盘监听。 */
export function XhKbdGroup({
  keys,
  platform,
  variant,
  translations,
  ...rest
}: XhKbdGroupProps): ReactNode {
  const resolvedPlatform = useKbdPlatform(platform)
  const configured = withXhConfig('kbd-group', { keys, platform: resolvedPlatform, variant, translations } as KbdGroupProps)
  const api = connectKbdGroup(configured, reactNormalize)

  return (
    <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.segments.map((segment, index) => (
        <kbd key={`${segment.source}-${index}`} {...api.getKeyProps({ value: segment.source }) as Record<string, unknown>}>{segment.label}</kbd>
      ))}
    </span>
  )
}
