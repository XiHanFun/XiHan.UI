import type { Size } from '@xihan-ui/core'
import type { InputGroupProps } from '@xihan-ui/headless'
import { connectInputGroup, inputGroupAnatomy, inputGroupMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-input-group>` —— Light-DOM 行为宿主，无状态机，把 connectInputGroup 产出打到各角色节点。
 *
 * 组内每一段是作者自己的控件，不是本组件的角色节点：中缝合并、首尾圆角与层叠顺序
 * 由皮肤按根的身份给。item 可缺省：一组只有控件、没有固定前后缀时就没有它。
 *
 * @customElement xh-input-group
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定 item 的高度、内衬与字号；不写时跟着组内控件的档走
 * @csspart root - 组容器，承载 data-size
 * @csspart item - 前后缀块，内容由作者写
 */
export class XhInputGroupElement extends XhElement {
  static override partContract = { anatomy: inputGroupAnatomy, meta: inputGroupMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare size?: Size

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectInputGroup(this.configured('input-group', {
      size: this.size,
    } satisfies InputGroupProps), wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // item 可以有多枚：前缀一枚、后缀一枚，都拿同一份身份
    for (const item of this.getParts('item'))
      this.spreader.spread(item, api.getItemProps() as Record<string, unknown>)
  }
}
