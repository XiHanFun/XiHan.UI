import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ButtonGroupProps } from '@xihan-ui/headless'
import { buttonGroupAnatomy, buttonGroupMeta, connectButtonGroup } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const BOOLEAN_CONVERTER = { fromAttribute: (value: string | null) => (value === null ? undefined : value !== 'false') }

/**
 * `<xh-button-group>` —— Light-DOM 行为宿主，无状态机，把 connectButtonGroup 产出打到 root 角色节点。
 *
 * 组内每一段是作者自己的按钮，不是本组件的角色节点：三个视觉轴写在根上，
 * 皮肤把它们翻成 `--xh-button-*` 槽位，沿继承流给每一段。
 *
 * @customElement xh-button-group
 * @attr {'horizontal'|'vertical'} orientation - 排布，决定相邻两段在哪个轴上合边，默认 horizontal
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 变体，决定底色、描边与前景怎么用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 颜色
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定各段的高度、内边距与字号
 * @attr {boolean} disabled - 整组禁用：组内每一段都写上原生 disabled；段自己写了禁用的仍然禁用
 * @attr {boolean} full-width - 撑满行宽，每段等分剩余空间
 * @attr {boolean} separators - 是否自动在相邻按钮之间生成分隔线，默认 true
 * @csspart root - 组容器，承载 role=group 与 data-orientation / data-variant / data-tone / data-size
 */
export class XhButtonGroupElement extends XhElement {
  static override partContract = { anatomy: buttonGroupAnatomy, meta: buttonGroupMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    orientation: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    disabled: { type: Boolean },
    fullWidth: { type: Boolean, attribute: 'full-width' },
    separators: { converter: BOOLEAN_CONVERTER },
  }

  declare orientation?: string
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size
  declare disabled?: boolean
  declare fullWidth?: boolean
  declare separators?: boolean

  /**
   * 作者在标记里写的段禁用，按元素记住头一回见到的那一份。
   * 整组禁用期间每一段上都被写了 disabled，第二帧起现读分不清是作者写的还是自己上一帧写的，
   * 解禁时就再也解不开。
   */
  private readonly declaredDisabled = new WeakMap<Element, boolean>()
  private observedRoot: HTMLElement | null = null
  private readonly segmentObserver = new MutationObserver((records) => {
    const authoredChange = records.some(record => [...record.addedNodes, ...record.removedNodes]
      .some(node => node instanceof Element && !node.hasAttribute('data-xh-button-group-separator')))
    if (authoredChange)
      this.requestUpdate()
  })

  override disconnectedCallback(): void {
    this.segmentObserver.disconnect()
    this.observedRoot = null
    super.disconnectedCallback()
  }

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectButtonGroup(this.configured('button-group', {
      orientation: this.orientation as ButtonGroupProps['orientation'],
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      disabled: this.disabled,
      fullWidth: this.fullWidth,
      separators: this.separators,
    } satisfies ButtonGroupProps), wcNormalize)

    const root = this.getPart('root')
    this.observeSegments(root)
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    const separators = root ? this.syncAutomaticSeparators(root, api.separators) : []
    for (const separator of separators) {
      separator.setAttribute('aria-hidden', 'true')
      separator.setAttribute('data-orientation', api.orientation === 'horizontal' ? 'vertical' : 'horizontal')
      separator.toggleAttribute('data-disabled', api.disabled)
    }

    if (root)
      this.applyGroupDisabled(root, api.disabled, separators)
  }

  /** ButtonGroup 的按钮不是本组件 part，单独观察 root 的直接子节点。 */
  private observeSegments(root: HTMLElement | null): void {
    if (root === this.observedRoot)
      return
    this.segmentObserver.disconnect()
    this.observedRoot = root
    if (root)
      this.segmentObserver.observe(root, { childList: true })
  }

  /** 默认补齐相邻按钮间的分隔线。 */
  private syncAutomaticSeparators(root: HTMLElement, enabled: boolean): HTMLElement[] {
    const children = [...root.children] as HTMLElement[]
    const generated = children.filter(child => child.hasAttribute('data-xh-button-group-separator'))

    if (!enabled) {
      for (const separator of generated)
        separator.remove()
      return []
    }

    const segments = children.filter(child => !child.hasAttribute('data-xh-button-group-separator'))
    const current = generated.length === Math.max(0, segments.length - 1)
      && segments.slice(1).every((segment, index) => segment.previousElementSibling === generated[index])
    if (current)
      return generated

    for (const separator of generated)
      separator.remove()
    for (const segment of segments.slice(1)) {
      const separator = root.ownerDocument.createElement('span')
      separator.setAttribute('data-xh-button-group-separator', '')
      segment.before(separator)
    }
    return [...root.querySelectorAll<HTMLElement>(':scope > [data-xh-button-group-separator]')]
  }

  /**
   * 把整组的禁用落到每一段的原生 disabled 上。
   * 只打 data-* 是假禁用——段照样可聚焦、照样派 click。
   * 分隔线不是段，跳过它。
   */
  private applyGroupDisabled(root: HTMLElement, groupDisabled: boolean, separators: readonly HTMLElement[]): void {
    for (const child of root.children) {
      if (separators.includes(child as HTMLElement))
        continue
      if (!this.declaredDisabled.has(child))
        this.declaredDisabled.set(child, child.hasAttribute('disabled'))
      child.toggleAttribute('disabled', groupDisabled || this.declaredDisabled.get(child)!)
    }
  }
}
