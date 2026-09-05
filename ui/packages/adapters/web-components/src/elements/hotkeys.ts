import type { Size } from '@xihan-ui/core'
import type { HotkeysApi, HotkeysPlatform, HotkeysProps, HotkeysTarget, HotkeysTranslations, HotkeysTriggerDetails } from '@xihan-ui/headless'
import { connectHotkeys, detectHotkeysPlatform, hotkeysAnatomy, hotkeysMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值的唯一事实源留在 connect。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 enabled / prevent-default 因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 组合写成逗号分隔的一串：keys="Mod,S"。
// 逗号是分隔符，因此属性写法表达不出「逗号本身」这枚主键，Mod+, 一类组合只能走 property。
const ARRAY_CONVERTER = { fromAttribute: (v: string | null) => (v == null ? undefined : v.split(',').map(s => s.trim()).filter(s => s !== '')) }

/**
 * `<xh-hotkeys>` —— Light-DOM 行为宿主：作者写一个空的行内容器当 root，
 * 元素把 keys 翻成当前平台的写法铺成一排键帽，并在 document 或父节点上接住这组组合。
 *
 * 键帽与连接符出多少枚由 keys 与平台决定，作者写不出来，故 root 的内容整份由本元素接管，
 * 写在里面的东西会被替换掉。
 *
 * `Mod` 在 Mac 上是 ⌘、其余平台是 Ctrl，同一份 keys 两边都对。平台缺省测出来的那个，
 * 显式写 `platform` 即以它为准。
 *
 * 命中后默认拦下浏览器的默认动作；组合里除 Shift 外没有别的修饰键时，
 * 落在输入框、文本域、可编辑区里的按键一律让给输入。
 *
 * @customElement xh-hotkeys
 * @attr {string} keys - 组合里的各枚键，逗号分隔，如 `Mod,S`；逗号本身这枚主键写不进属性，那种组合走 property 传数组
 * @attr {'auto'|'mac'|'other'} platform - 按哪个平台的写法显示与解析，缺省测出来的那个
 * @attr {'document'|'parent'} target - 监听装在哪儿，缺省 document
 * @attr {boolean} prevent-default - 命中后拦下浏览器的默认动作，默认开启
 * @attr {boolean} enabled - 监听是否生效，默认开启
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires hot-key - 组合被按出来；detail 为 `{ keys: string[], event: KeyboardEvent }`
 * @csspart root - 键帽的容器（承载 role=img 与整组组合的名字）
 * @csspart key - 一枚键帽，由元素铺进 root
 * @csspart separator - 两枚键帽之间的连接符，由元素铺进 root；Mac 的写法里收起
 */
export class XhHotkeysElement extends XhElement {
  static override partContract = { anatomy: hotkeysAnatomy, meta: hotkeysMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    keys: { converter: ARRAY_CONVERTER },
    platform: { converter: STRING_CONVERTER },
    target: { converter: STRING_CONVERTER },
    preventDefault: { converter: BOOLEAN_CONVERTER, attribute: 'prevent-default' },
    enabled: { converter: BOOLEAN_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，属性装不下，只走 property
    translations: { attribute: false },
  }

  declare keys?: string[]
  declare platform?: HotkeysPlatform
  declare target?: HotkeysTarget
  declare preventDefault?: boolean
  declare enabled?: boolean
  declare size?: Size
  declare translations?: Partial<HotkeysTranslations>

  /** 接进文档后测出来的平台；测出来之前是 auto，connect 按非 Mac 出。 */
  #detected: HotkeysPlatform = 'auto'

  /** 当前挂着监听的节点。 */
  #bound: EventTarget | null = null

  #notify = (details: HotkeysTriggerDetails): void => {
    this.dispatchEvent(new CustomEvent('hot-key', { detail: details, bubbles: true, composed: true }))
  }

  // 每次按键都现建一份：接不接这次按键的判据随 property 走，缓存下来会停在旧值上
  #api(): HotkeysApi {
    const props = this.configured('hotkeys', {
      keys: this.keys,
      // 作者显式写了平台就以他为准，写 auto 或没写才用实测值
      platform: this.platform && this.platform !== 'auto' ? this.platform : this.#detected,
      target: this.target,
      preventDefault: this.preventDefault,
      enabled: this.enabled,
      size: this.size,
      translations: this.translations,
      onHotKey: this.#notify,
    } satisfies HotkeysProps)
    return connectHotkeys(props, wcNormalize)
  }

  #onKeyDown = (event: Event): void => {
    this.#api().handleKeyDown(event as KeyboardEvent)
  }

  /** 监听装在文档或父节点上；节点没换就不重挂。 */
  #syncListener(target: HotkeysTarget): void {
    const next: EventTarget | null = target === 'parent' ? this.parentElement : this.ownerDocument
    if (next === this.#bound)
      return
    this.#bound?.removeEventListener('keydown', this.#onKeyDown)
    this.#bound = next
    next?.addEventListener('keydown', this.#onKeyDown)
  }

  override connectedCallback(): void {
    // 先测平台再交给基类排更新：反过来的话首帧铺的会是「还没测出来」的那套写法
    this.#detected = detectHotkeysPlatform()
    super.connectedCallback()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#bound?.removeEventListener('keydown', this.#onKeyDown)
    this.#bound = null
  }

  /** 上一次往哪个 root 铺过哪一排键帽。 */
  #painted?: { host: Element, key: string }

  protected wire(): void {
    const api = this.#api()
    this.#syncListener(api.target)

    const root = this.getPart('root')
    if (!root)
      return
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    this.#paint(root, api)
  }

  /**
   * 把键帽与连接符铺进 root。
   * 这一排没变就不重铺——每帧重建节点会把用户正在拖的选区弄没。
   */
  #paint(root: HTMLElement, api: HotkeysApi): void {
    const key = JSON.stringify([api.segments, api.separator])
    if (this.#painted?.host === root && this.#painted.key === key)
      return
    this.#painted = { host: root, key }

    const doc = root.ownerDocument
    const frame = doc.createDocumentFragment()
    const separatorProps = api.getSeparatorProps() as Record<string, unknown>
    api.segments.forEach((segment, index) => {
      if (index > 0) {
        const separator = doc.createElement('span')
        this.spreader.spread(separator, separatorProps)
        separator.textContent = api.separator
        frame.appendChild(separator)
      }
      const cap = doc.createElement('kbd')
      this.spreader.spread(cap, api.getKeyProps({ value: segment.source }) as Record<string, unknown>)
      cap.textContent = segment.label
      frame.appendChild(cap)
    })
    root.replaceChildren(frame)
  }
}
