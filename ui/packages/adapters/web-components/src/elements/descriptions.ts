import type { DescriptionsColumns, DescriptionsPlacement, DescriptionsProps } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import { connectDescriptions, descriptionsAnatomy, descriptionsMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-descriptions>` —— Light-DOM 行为宿主，无状态机，把 connectDescriptions 产出打到各角色节点。
 * 排版走 CSS Grid，columns 落成列数。
 *
 * 标签由作者定，root 写 `<dl>`、label 写 `<dt>`、value 写 `<dd>` 时标签与取值天然成对；
 * 组件不补 role，也不用 `<table>`——这是一份描述列表，不是数据表。
 *
 * @customElement xh-descriptions
 * @attr {1|2|3|4|5|6} columns - 每行摆几组，如实落成根上的 data-columns；不写即每行一组
 * @attr {boolean} bordered - 画外框，并在格与格之间画网格线
 * @attr {'top'|'left'} placement - 标签在上还是在左；不写即在上
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定每格的内边距、组与组的间距与整体字号
 * @csspart root - 网格容器，承载 data-columns / data-placement / data-size / data-bordered
 * @csspart item - 一组「标签 + 取值」，占网格里的一格
 * @csspart label - 标签
 * @csspart value - 取值
 */
export class XhDescriptionsElement extends XhElement {
  static override partContract = { anatomy: descriptionsAnatomy, meta: descriptionsMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    columns: { type: Number },
    bordered: { type: Boolean },
    placement: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare columns?: DescriptionsColumns
  declare bordered?: boolean
  declare placement?: DescriptionsPlacement
  declare size?: Size

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectDescriptions(this.configured('descriptions', {
      columns: this.columns,
      bordered: this.bordered ?? false,
      placement: this.placement,
      size: this.size,
    } satisfies DescriptionsProps), wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 每一组都会出现多次，逐个打
    const putAll = (name: string, attrs: Record<string, unknown>): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, attrs)
    }

    putAll('item', api.getItemProps() as Record<string, unknown>)
    putAll('label', api.getLabelProps() as Record<string, unknown>)
    putAll('value', api.getValueProps() as Record<string, unknown>)
  }
}
