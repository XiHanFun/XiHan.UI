/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 kbd 类型契约。

import type { PropTypes } from '@xihan-ui/core'
import type { HotkeySegment, KbdPlatform, KbdResolvedPlatform } from '../shared/hotkey'

export type KbdVariant = 'default' | 'light'
export type KbdTarget = 'document' | (() => EventTarget | null)

export interface KbdTriggerDetails {
  keys: string[]
  event: KeyboardEvent
}

export interface KbdProps {
  /** 单键或组合键，例如 ['Escape']、['Mod', 'K']。 */
  keys: string[]
  /** 平台键名；auto 在适配器探测前按非 Mac 输出。 */
  platform?: KbdPlatform
  /** 视觉外观，默认 default。 */
  variant?: KbdVariant
  /** 是否注册快捷键监听，默认 false。 */
  register?: boolean
  /** 监听目标，默认 document；局部监听传入返回 EventTarget 的函数。 */
  target?: KbdTarget
  /** 命中时是否阻止浏览器默认动作，默认 true。 */
  preventDefault?: boolean
  /** 已注册的监听是否生效，默认 true。 */
  enabled?: boolean
  /** 逐键名称和整组读屏文案。 */
  translations?: Partial<KbdTranslations>
  /** 已注册组合被按下时触发。 */
  onHotKey?: (details: KbdTriggerDetails) => void
}

export interface KbdKeyProps {
  value: string
}

export interface KbdApi<T extends PropTypes = PropTypes> {
  segments: readonly HotkeySegment[]
  platform: KbdResolvedPlatform
  register: boolean
  enabled: boolean
  target: KbdTarget
  resolveTarget: (documentTarget: EventTarget | null) => EventTarget | null
  matches: (event: KeyboardEvent) => boolean
  handleKeyDown: (event: KeyboardEvent) => void
  getRootProps: () => T['element']
  getKeyProps: (props: KbdKeyProps) => T['element']
}

export interface KbdTranslations {
  keyName: (key: string) => string
  hotkey: (names: readonly string[]) => string
}
