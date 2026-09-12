import type { HotkeysApi, HotkeysPlatform, HotkeysProps, HotkeysTarget, HotkeysTriggerDetails } from '@xihan-ui/headless'
import { connectHotkeys, detectHotkeysPlatform } from '@xihan-ui/headless'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
const ARRAY_CONVERTER = { fromAttribute: (v: string | null) => (v == null ? undefined : v.split(',').map(s => s.trim()).filter(s => s !== '')) }

/**
 * `<xh-hotkeys>` —— 纯行为快捷键注册器，不生成键帽、不接管子节点，也没有视觉 part。
 *
 * 可见快捷键提示使用 `<xh-kbd-group>`；局部监听通过 target property 传入显式 resolver，
 * 不再从展示节点猜测 parent。
 *
 * @customElement xh-hotkeys
 * @attr {string} keys - 组合里的各枚键，逗号分隔；逗号本身作为主键时改用 property 传数组
 * @attr {'auto'|'mac'|'other'} platform - 匹配所用平台，缺省挂载后实测
 * @attr {boolean} prevent-default - 命中后是否阻止默认动作，默认开启
 * @attr {boolean} enabled - 监听是否生效，默认开启
 * @fires hot-key - 组合被按出来；detail 为 `{ keys: string[], event: KeyboardEvent }`
 */
export class XhHotkeysElement extends XhElement {
  static override properties = {
    keys: { converter: ARRAY_CONVERTER },
    platform: { converter: STRING_CONVERTER },
    // resolver 是函数，只能走 property；缺省监听 ownerDocument。
    target: { attribute: false },
    preventDefault: { converter: BOOLEAN_CONVERTER, attribute: 'prevent-default' },
    enabled: { converter: BOOLEAN_CONVERTER },
  }

  declare keys: string[]
  declare platform?: HotkeysPlatform
  declare target?: HotkeysTarget
  declare preventDefault?: boolean
  declare enabled?: boolean

  #detected: HotkeysPlatform = 'auto'
  #bound: EventTarget | null = null

  #notify = (details: HotkeysTriggerDetails): void => {
    this.dispatchEvent(new CustomEvent('hot-key', { detail: details, bubbles: true, composed: true }))
  }

  #api(): HotkeysApi {
    return connectHotkeys({
      keys: this.keys,
      platform: this.platform && this.platform !== 'auto' ? this.platform : this.#detected,
      target: this.target,
      preventDefault: this.preventDefault,
      enabled: this.enabled,
      onHotKey: this.#notify,
    } satisfies HotkeysProps)
  }

  #onKeyDown = (event: Event): void => {
    this.#api().handleKeyDown(event as KeyboardEvent)
  }

  #syncListener(): void {
    const next = this.#api().resolveTarget(this.ownerDocument)
    if (next === this.#bound)
      return
    this.#bound?.removeEventListener('keydown', this.#onKeyDown)
    this.#bound = next
    next?.addEventListener('keydown', this.#onKeyDown)
  }

  override connectedCallback(): void {
    this.#detected = detectHotkeysPlatform()
    super.connectedCallback()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#bound?.removeEventListener('keydown', this.#onKeyDown)
    this.#bound = null
  }

  protected wire(): void {
    this.#syncListener()
  }
}
