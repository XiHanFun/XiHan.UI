/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 展示与快捷键注册实现。

import type { KbdPlatform, KbdProps, KbdTarget, KbdTranslations, KbdVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectKbd } from '@xihan-ui/headless'
import { useCallback, useEffect, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useKbdPlatform } from './use-kbd-platform'

export interface XhKbdProps extends Omit<ComponentPropsWithRef<'kbd'>, 'children'> {
  keys: string[]
  platform?: KbdPlatform
  variant?: KbdVariant
  register?: boolean
  target?: KbdTarget
  preventDefault?: boolean
  enabled?: boolean
  translations?: Partial<KbdTranslations>
  onHotKey?: KbdProps['onHotKey']
}

export function XhKbd({ keys, platform, variant, register, target, preventDefault, enabled, translations, onHotKey, ...rest }: XhKbdProps): ReactNode {
  const resolvedPlatform = useKbdPlatform(platform)
  const api = connectKbd(withXhConfig('kbd', {
    keys,
    platform: resolvedPlatform,
    variant,
    register,
    target,
    preventDefault,
    enabled,
    translations,
    onHotKey,
  }) as KbdProps, reactNormalize)
  const latest = useRef({ api })
  latest.current = { api }
  const bound = useRef<EventTarget | null>(null)
  const onKeyDown = useCallback((event: Event) => latest.current.api.handleKeyDown(event as KeyboardEvent), [])
  const stop = useCallback(() => {
    bound.current?.removeEventListener('keydown', onKeyDown)
    bound.current = null
  }, [onKeyDown])
  useIsomorphicLayoutEffect(() => {
    const next = latest.current.api.resolveTarget(typeof document === 'undefined' ? null : document)
    if (next === bound.current)
      return
    stop()
    bound.current = next
    next?.addEventListener('keydown', onKeyDown)
  })
  useEffect(() => stop, [stop])

  return (
    <kbd {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.segments.map((segment, index) => (
        <span key={`${segment.source}-${index}`} {...api.getKeyProps({ value: segment.source }) as Record<string, unknown>}>
          {segment.label}
        </span>
      ))}
    </kbd>
  )
}

XhKbd.xhEvents = ['hot-key'] as const
