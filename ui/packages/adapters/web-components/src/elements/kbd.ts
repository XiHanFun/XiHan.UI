/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 相关实现。

import type { HotkeysPlatform, KbdProps, KbdTranslations, KbdVariant } from '@xihan-ui/headless'
import { connectKbd, detectHotkeysPlatform, kbdAnatomy, kbdMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-kbd>` —— 单枚纯展示键帽。root 应使用原生 `<kbd>`，元素按 value 写入可见文本与可读名称。
 *
 * @customElement xh-kbd
 * @attr {string} value - 一枚键的声明，例如 Mod、Shift、Esc 或 S
 * @attr {'auto'|'mac'|'other'} platform - 平台写法，缺省挂载后实测
 * @attr {'default'|'light'} variant - 外观，默认 default
 * @csspart root - 原生 kbd 键帽
 */
export class XhKbdElement extends XhElement {
  static override partContract = { anatomy: kbdAnatomy, meta: kbdMeta }
  static override properties = {
    value: { converter: STRING_CONVERTER },
    platform: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value: string
  declare platform?: HotkeysPlatform
  declare variant?: KbdVariant
  declare translations?: Partial<KbdTranslations>

  #detected: HotkeysPlatform = 'auto'

  override connectedCallback(): void {
    this.#detected = detectHotkeysPlatform()
    super.connectedCallback()
  }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    if (root.localName !== 'kbd')
      throw new TypeError('[xh] <xh-kbd> 的 root 必须使用原生 <kbd>')
    const api = connectKbd(this.configured('kbd', {
      value: this.value,
      platform: this.platform && this.platform !== 'auto' ? this.platform : this.#detected,
      variant: this.variant,
      translations: this.translations,
    } satisfies KbdProps), wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    if (root.textContent !== api.label)
      root.textContent = api.label
  }
}
