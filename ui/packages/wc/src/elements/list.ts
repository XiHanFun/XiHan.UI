import type { ListProps, ListSize } from '@xihan-ui/headless'
import { connectList, listAnatomy, listMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-list>` —— Light-DOM 行为宿主，无状态机，把 connectList 产出打到各角色节点。
 * 除 root 外的部件全部可缺省：空列表、只有一行标题的条目都是合法形态。
 *
 * 标签由作者定：root 写 `<ul>`/`<ol>` 就进读屏的列表语义，写 `<div>` 就只是一摞盒子；
 * item 同理。组件不补 role。
 *
 * @customElement xh-list
 * @attr {boolean} bordered - 给整份列表画一圈描边与圆角
 * @attr {boolean} hoverable - 指针悬停时条目换底色
 * @attr {boolean} split - 条目之间画分隔线
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定条目的内边距、图文间距与两行文字的字号
 * @csspart root - 列表根容器，承载 data-size / data-bordered / data-hoverable / data-split
 * @csspart item - 一条条目
 * @csspart item-media - 条目最前的媒体位，放头像、图标或缩略图
 * @csspart item-content - 条目的文字区，装标题与说明
 * @csspart item-title - 条目标题
 * @csspart item-description - 条目标题下的说明
 * @csspart item-action - 条目末尾的操作位
 */
export class XhListElement extends XhElement {
  static override partContract = { anatomy: listAnatomy, meta: listMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    bordered: { type: Boolean },
    hoverable: { type: Boolean },
    split: { type: Boolean },
    size: { converter: STRING_CONVERTER },
  }

  declare bordered?: boolean
  declare hoverable?: boolean
  declare split?: boolean
  declare size?: ListSize

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectList({
      bordered: this.bordered ?? false,
      hoverable: this.hoverable ?? false,
      split: this.split ?? false,
      size: this.size,
    } satisfies ListProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 条目与条目内的四个位都可以出现多次，逐个打
    const putAll = (name: string, attrs: Record<string, unknown>): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, attrs)
    }

    putAll('item', api.getItemProps() as Record<string, unknown>)
    putAll('item-media', api.getItemMediaProps() as Record<string, unknown>)
    putAll('item-content', api.getItemContentProps() as Record<string, unknown>)
    putAll('item-title', api.getItemTitleProps() as Record<string, unknown>)
    putAll('item-description', api.getItemDescriptionProps() as Record<string, unknown>)
    putAll('item-action', api.getItemActionProps() as Record<string, unknown>)
  }
}
