import type { ButtonGroupProps } from '@xihan-ui/headless'
import type { ActionVariant, Size, Tone } from '@xihan-ui/kernel'
import { buttonGroupAnatomy, buttonGroupMeta, connectButtonGroup } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-button-group>` —— Light-DOM 行为宿主，无状态机，把 connectButtonGroup 产出打到 root 角色节点。
 *
 * 组内每一段是作者自己的按钮，不是本组件的角色节点：三个视觉轴写在根上，
 * 皮肤把它们翻成 `--xh-button-*` 槽位，沿继承流给每一段。
 *
 * @customElement xh-button-group
 * @attr {'horizontal'|'vertical'} orientation - 排布，决定相邻两段在哪个轴上合边，默认 horizontal
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 形态，决定底色、描边与前景怎么用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定用哪族颜色
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定各段的高度、内边距与字号
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
  }

  declare orientation?: string
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectButtonGroup({
      orientation: this.orientation as ButtonGroupProps['orientation'],
      variant: this.variant,
      tone: this.tone,
      size: this.size,
    } satisfies ButtonGroupProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
