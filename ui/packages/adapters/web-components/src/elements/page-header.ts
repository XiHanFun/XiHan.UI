import type { PageHeaderProps } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import { connectPageHeader, pageHeaderAnatomy, pageHeaderMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-page-header>` —— Light-DOM 行为宿主，无状态机，把 connectPageHeader 产出打到各角色节点。
 * 除 root 外的部件全部可缺省：返回位、标题、副标题、操作、页脚按需摆。
 *
 * 返回位只拿身份与位置：标签、type、可及名字、点了往哪走，全归作者自己的按钮。
 * root 上不写 role：这一块算不算 banner 地标取决于它摆在页面的哪一层，由作者自己声明。
 *
 * @customElement xh-page-header
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定标题字号与整块的上下留白
 * @attr {boolean} bordered - 底部画一条分隔线
 * @csspart root - 页头根容器，承载 data-size / data-bordered
 * @csspart back-trigger - 返回位，作者自己的按钮，组件只摆位置
 * @csspart title - 页面标题
 * @csspart subtitle - 与标题同行的补充信息
 * @csspart extra - 行尾的操作区
 * @csspart footer - 整行另起的附加区，装描述、标签页或一组摘要
 */
export class XhPageHeaderElement extends XhElement {
  static override partContract = { anatomy: pageHeaderAnatomy, meta: pageHeaderMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
    bordered: { type: Boolean },
  }

  declare size?: Size
  declare bordered?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectPageHeader({
      size: this.size,
      bordered: this.bordered ?? false,
    } satisfies PageHeaderProps, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('back-trigger', api.getBackTriggerProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('subtitle', api.getSubtitleProps() as Record<string, unknown>)
    put('extra', api.getExtraProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
  }
}
