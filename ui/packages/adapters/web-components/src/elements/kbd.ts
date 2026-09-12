import type { Size } from '@xihan-ui/core'
import type { HotkeysPlatform, KbdProps, KbdTranslations } from '@xihan-ui/headless'
import { connectKbd, detectHotkeysPlatform, kbdAnatomy, kbdMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-kbd>` —— 单枚纯展示键帽。root 应使用原生 `<kbd>`，元素按 value 写入可见文本与可读名称。
 *
 * @customElement xh-kbd
 * @attr {string} value - 一枚键的声明，例如 Mod、Shift、Esc 或 S
 * @attr {'auto'|'mac'|'other'} platform - 平台写法，缺省挂载后实测
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} pressed - 作者确认动作真实激活时的轻压事实
 * @attr {boolean} disabled - 所提示动作是否不可用
 * @csspart root - 原生 kbd 键帽
 */
export class XhKbdElement extends XhElement {
  static override partContract = { anatomy: kbdAnatomy, meta: kbdMeta }
  static override properties = {
    value: { converter: STRING_CONVERTER },
    platform: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    pressed: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  declare value: string
  declare platform?: HotkeysPlatform
  declare size?: Size
  declare pressed?: boolean
  declare disabled?: boolean
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
      size: this.size,
      pressed: this.pressed,
      disabled: this.disabled,
      translations: this.translations,
    } satisfies KbdProps), wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    if (root.textContent !== api.label)
      root.textContent = api.label
  }
}
