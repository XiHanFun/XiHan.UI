/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd group 相关实现。

import type { HotkeysPlatform, KbdGroupApi, KbdGroupProps, KbdGroupTranslations, KbdVariant } from '@xihan-ui/headless'
import { connectKbdGroup, detectHotkeysPlatform, kbdGroupAnatomy, kbdGroupMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const ARRAY_CONVERTER = { fromAttribute: (v: string | null) => (v == null ? undefined : v.split(',').map(s => s.trim()).filter(s => s !== '')) }

/**
 * `<xh-kbd-group>` —— 数据驱动的纯展示组合。root 承担唯一 aria-label，子键帽只作视觉。
 *
 * @customElement xh-kbd-group
 * @attr {string} keys - 组合里的各枚键，逗号分隔；逗号本身作为主键时改用 property 传数组
 * @attr {'auto'|'mac'|'other'} platform - 平台写法，缺省挂载后实测
 * @attr {'default'|'light'} variant - 外观，默认 default
 * @csspart root - 整组容器，承载唯一可读名称
 * @csspart key - 元素按 keys 生成的一枚原生 kbd
 */
export class XhKbdGroupElement extends XhElement {
  static override partContract = { anatomy: kbdGroupAnatomy, meta: kbdGroupMeta }
  static override properties = {
    keys: { converter: ARRAY_CONVERTER },
    platform: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare keys: string[]
  declare platform?: HotkeysPlatform
  declare variant?: KbdVariant
  declare translations?: Partial<KbdGroupTranslations>

  #detected: HotkeysPlatform = 'auto'
  #painted?: { host: Element, key: string }

  override connectedCallback(): void {
    this.#detected = detectHotkeysPlatform()
    super.connectedCallback()
  }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    const api = connectKbdGroup(this.configured('kbd-group', {
      keys: this.keys,
      platform: this.platform && this.platform !== 'auto' ? this.platform : this.#detected,
      variant: this.variant,
      translations: this.translations,
    } satisfies KbdGroupProps), wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    this.#paint(root, api)
  }

  #paint(root: HTMLElement, api: KbdGroupApi): void {
    const key = JSON.stringify(api.segments)
    if (this.#painted?.host === root && this.#painted.key === key)
      return
    this.#painted = { host: root, key }

    const frame = root.ownerDocument.createDocumentFragment()
    api.segments.forEach((segment) => {
      const keycap = root.ownerDocument.createElement('kbd')
      this.spreader.spread(keycap, api.getKeyProps({ value: segment.source }) as Record<string, unknown>)
      keycap.textContent = segment.label
      frame.appendChild(keycap)
    })
    root.replaceChildren(frame)
  }
}
