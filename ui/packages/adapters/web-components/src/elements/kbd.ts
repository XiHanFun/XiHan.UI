/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 展示与快捷键注册实现。

import type { KbdApi, KbdPlatform, KbdProps, KbdTarget, KbdTranslations, KbdTriggerDetails, KbdVariant } from '@xihan-ui/headless'
import { connectKbd, detectKbdPlatform, kbdAnatomy, kbdMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
const ARRAY_CONVERTER = { fromAttribute: (v: string | null) => (v == null ? undefined : v.split(',').map(s => s.trim()).filter(Boolean)) }

/**
 * `<xh-kbd>`：单键、组合键与可选快捷键监听的统一入口。
 * @customElement xh-kbd
 * @attr {string} keys - 按键组合，逗号分隔
 * @attr {'auto'|'mac'|'other'} platform - 平台写法，默认挂载后实测
 * @attr {'default'|'light'} variant - 外观，默认 default
 * @attr {boolean} register - 是否注册快捷键监听，默认 false
 * @attr {boolean} prevent-default - 命中后是否阻止默认动作，默认 true
 * @attr {boolean} enabled - 已注册监听是否生效，默认 true
 * @fires hot-key - 组合被按下；detail 为 `{ keys: string[], event: KeyboardEvent }`
 * @csspart root - 原生 kbd 表面与整组可读名称
 * @csspart key - 一个可见键名
 */
export class XhKbdElement extends XhElement {
  static override partContract = { anatomy: kbdAnatomy, meta: kbdMeta }
  static override properties = {
    keys: { converter: ARRAY_CONVERTER },
    platform: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    register: { converter: BOOLEAN_CONVERTER },
    target: { attribute: false },
    preventDefault: { converter: BOOLEAN_CONVERTER, attribute: 'prevent-default' },
    enabled: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  declare keys: string[]
  declare platform?: KbdPlatform
  declare variant?: KbdVariant
  declare register?: boolean
  declare target?: KbdTarget
  declare preventDefault?: boolean
  declare enabled?: boolean
  declare translations?: Partial<KbdTranslations>

  #detected: KbdPlatform = 'auto'
  #bound: EventTarget | null = null
  #painted = ''
  #notify = (details: KbdTriggerDetails): void => {
    this.dispatchEvent(new CustomEvent('hot-key', { detail: details, bubbles: true, composed: true }))
  }

  #api(): KbdApi {
    return connectKbd(this.configured('kbd', {
      keys: this.keys,
      platform: this.platform && this.platform !== 'auto' ? this.platform : this.#detected,
      variant: this.variant,
      register: this.register,
      target: this.target,
      preventDefault: this.preventDefault,
      enabled: this.enabled,
      translations: this.translations,
      onHotKey: this.#notify,
    } satisfies KbdProps), wcNormalize)
  }

  #onKeyDown = (event: Event): void => this.#api().handleKeyDown(event as KeyboardEvent)

  override connectedCallback(): void {
    this.#detected = detectKbdPlatform()
    super.connectedCallback()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#bound?.removeEventListener('keydown', this.#onKeyDown)
    this.#bound = null
  }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    if (root.localName !== 'kbd')
      throw new TypeError('[xh] <xh-kbd> 的 root 必须使用原生 <kbd>')
    const api = this.#api()
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    const key = JSON.stringify(api.segments)
    if (key !== this.#painted) {
      this.#painted = key
      const frame = root.ownerDocument.createDocumentFragment()
      for (const segment of api.segments) {
        const node = root.ownerDocument.createElement('span')
        this.spreader.spread(node, api.getKeyProps({ value: segment.source }) as Record<string, unknown>)
        node.textContent = segment.label
        frame.append(node)
      }
      root.replaceChildren(frame)
    }
    const next = api.resolveTarget(this.ownerDocument)
    if (next !== this.#bound) {
      this.#bound?.removeEventListener('keydown', this.#onKeyDown)
      this.#bound = next
      next?.addEventListener('keydown', this.#onKeyDown)
    }
  }
}
