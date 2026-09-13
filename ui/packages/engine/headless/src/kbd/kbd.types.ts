/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 kbd 类型契约。

import type { PropTypes } from '@xihan-ui/core'
import type { HotkeySegment, HotkeysPlatform, HotkeysResolvedPlatform } from '../shared/hotkey'

export type KbdVariant = 'default' | 'light'

export interface KbdProps {
  /** 一枚键的声明，例如 Mod、Shift、Esc 或 S。 */
  value: string
  /** 平台写法；auto 在适配器测出平台前按 other。 */
  platform?: HotkeysPlatform
  /** 外观：default 使用中性底，light 保持透明。 */
  variant?: KbdVariant
  /** 读屏键名覆盖。 */
  translations?: Partial<KbdTranslations>
}

export interface KbdApi<T extends PropTypes = PropTypes> {
  /** 归一化后的键。 */
  segment: HotkeySegment
  /** 键帽可见文本。 */
  label: string
  /** 实际采用的平台写法。 */
  platform: HotkeysResolvedPlatform
  getRootProps: () => T['element']
}

export interface KbdTranslations {
  /** 读屏怎么念这枚归一化后的键。 */
  keyName: (key: string) => string
}
