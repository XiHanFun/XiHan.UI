/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 展示与快捷键匹配实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { HotkeySegment } from '../shared/hotkey'
import type { KbdApi, KbdProps } from './kbd.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/core'
import { formatHotkey, isTypingTarget, matchesHotkey, resolveKbdPlatform } from '../shared/hotkey'
import { kbdAnatomy } from './kbd.anatomy'

const parts = kbdAnatomy.build()

export function connectKbd<T extends PropTypes>(props: KbdProps, normalize: NormalizeProps<T>): KbdApi<T> {
  if (!Array.isArray(props.keys) || props.keys.length === 0 || props.keys.some(key => typeof key !== 'string' || key === ''))
    throw new TypeError('[xh] Kbd keys 必须是非空且每项均为非空字符串的组合')
  const register = props.register ?? false
  const platform = resolveKbdPlatform(props.platform)
  const segments = formatHotkey(props.keys, platform)
  const mainKeyCount = segments.filter(segment => !segment.modifier).length
  if (mainKeyCount > 1 || (register && mainKeyCount !== 1))
    throw new TypeError('[xh] Kbd 展示最多包含一枚主键，注册时必须且只能包含一枚主键')
  const names = segments.map(segment => props.translations?.keyName?.(segment.key) ?? segment.name)
  const label = props.translations?.hotkey?.(names) ?? names.join(' + ')
  if (names.some(name => name.trim() === '') || label.trim() === '')
    throw new TypeError('[xh] Kbd 的逐键名称与整组可读名称不能为空')
  const enabled = register && (props.enabled ?? true)
  const preventDefault = props.preventDefault ?? true
  const target = props.target ?? 'document'
  if (target !== 'document' && typeof target !== 'function')
    throw new TypeError('[xh] Kbd target 只能是 \'document\' 或返回 EventTarget 的函数')
  const hasCommandModifier = segments.some(segment => segment.modifier && segment.key !== 'Shift')
  const segmentOf = (value: string): HotkeySegment | null =>
    segments.find(segment => segment.source === value) ?? null

  const matches = (event: KeyboardEvent): boolean => {
    if (isComposingEvent(event))
      return false
    if (!hasCommandModifier && isTypingTarget(event.target))
      return false
    return matchesHotkey(event, props.keys, props.platform)
  }
  const resolveTarget = (documentTarget: EventTarget | null): EventTarget | null => {
    if (!register)
      return null
    const resolved = target === 'document' ? documentTarget : target()
    if (resolved == null)
      return null
    const candidate = resolved as unknown as { addEventListener?: unknown, removeEventListener?: unknown }
    if (typeof candidate.addEventListener !== 'function' || typeof candidate.removeEventListener !== 'function')
      throw new TypeError('[xh] Kbd target resolver 必须返回可监听 keydown 的 EventTarget 或 null')
    return resolved
  }

  return {
    segments,
    platform,
    register,
    enabled,
    target,
    resolveTarget,
    matches,
    handleKeyDown: (event) => {
      if (!enabled || !matches(event))
        return
      if (preventDefault)
        event.preventDefault()
      props.onHotKey?.({ keys: [...props.keys], event })
    },
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 原生 kbd 对应的是 generic 角色，ARIA 禁止在它身上写 aria-label（读屏直接忽略，整组就没有名字了）。
      // 视觉键帽各自 aria-hidden、整组只朗读一次，这副「若干字形合成一个可读名称」的结构就是 img 的语义，
      // 由 img 承接名字：放进按钮或菜单项时，名字照常汇入宿主的可访问名称
      'role': 'img',
      'aria-label': label,
      'data-platform': platform,
      'data-variant': props.variant ?? 'default',
      'data-register': dataAttr(register),
      'data-disabled': dataAttr(register && !enabled),
    }),
    getKeyProps: ({ value }) => normalize.element({
      ...parts.key.attrs,
      'aria-hidden': true,
      'data-key': segmentOf(value)?.key,
    }),
  }
}
