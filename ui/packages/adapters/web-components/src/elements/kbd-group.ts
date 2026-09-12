import type { Size } from '@xihan-ui/core'
import type { HotkeysPlatform, KbdGroupApi, KbdGroupProps, KbdGroupTranslations } from '@xihan-ui/headless'
import { connectKbdGroup, detectHotkeysPlatform, kbdGroupAnatomy, kbdGroupMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
const ARRAY_CONVERTER = { fromAttribute: (v: string | null) => (v == null ? undefined : v.split(',').map(s => s.trim()).filter(s => s !== '')) }

/**
 * `<xh-kbd-group>` —— 数据驱动的纯展示组合。root 承担唯一 aria-label，子键帽与连接符只作视觉。
 *
 * @customElement xh-kbd-group
 * @attr {string} keys - 组合里的各枚键，逗号分隔；逗号本身作为主键时改用 property 传数组
 * @attr {'auto'|'mac'|'other'} platform - 平台写法，缺省挂载后实测
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} pressed - 作者确认动作真实激活时的轻压事实
 * @attr {boolean} disabled - 所提示动作是否不可用
 * @csspart root - 整组容器，承载唯一可读名称
 * @csspart key - 元素按 keys 生成的一枚原生 kbd
 * @csspart separator - 非 Mac 平台两枚键之间的加号
 */
export class XhKbdGroupElement extends XhElement {
  static override partContract = { anatomy: kbdGroupAnatomy, meta: kbdGroupMeta }
  static override properties = {
    keys: { converter: ARRAY_CONVERTER },
    platform: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    pressed: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  declare keys: string[]
  declare platform?: HotkeysPlatform
  declare size?: Size
  declare pressed?: boolean
  declare disabled?: boolean
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
      size: this.size,
      pressed: this.pressed,
      disabled: this.disabled,
      translations: this.translations,
    } satisfies KbdGroupProps), wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    this.#paint(root, api)
  }

  #paint(root: HTMLElement, api: KbdGroupApi): void {
    const key = JSON.stringify([api.segments, api.separator])
    if (this.#painted?.host === root && this.#painted.key === key)
      return
    this.#painted = { host: root, key }

    const frame = root.ownerDocument.createDocumentFragment()
    const separatorProps = api.getSeparatorProps() as Record<string, unknown>
    api.segments.forEach((segment, index) => {
      if (index > 0) {
        const separator = root.ownerDocument.createElement('span')
        this.spreader.spread(separator, separatorProps)
        separator.textContent = api.separator
        frame.appendChild(separator)
      }
      const keycap = root.ownerDocument.createElement('kbd')
      this.spreader.spread(keycap, api.getKeyProps({ value: segment.source }) as Record<string, unknown>)
      keycap.textContent = segment.label
      frame.appendChild(keycap)
    })
    root.replaceChildren(frame)
  }
}
