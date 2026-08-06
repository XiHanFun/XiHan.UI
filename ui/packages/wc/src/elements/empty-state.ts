import type { EmptyStateLive, EmptyStateProps } from '@xihan-ui/headless'
import { connectEmptyState, emptyStateAnatomy, emptyStateMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-empty-state>` —— 空状态行为宿主，无状态机，把 connectEmptyState 产出的属性打到角色节点上。
 *
 * root 缺省是 role=status 的活区：节点应当常挂、用 hidden 收起，
 * 整块插进文档的活区读屏通常不播报。首屏静态占位写 live="off"。
 *
 * @customElement xh-empty-state
 * @attr {'sm'|'md'|'lg'} size - 尺寸档位，写到 root 的 data-size 上
 * @attr {'polite'|'off'} live - 播报方式，off 时 root 不带 role
 * @csspart root - 承载 role 与 data-size 的容器
 * @csspart icon - 装饰图标，对读屏隐藏
 * @csspart title - 标题
 * @csspart description - 说明
 * @csspart action - 操作按钮槽
 */
export class XhEmptyStateElement extends XhElement {
  static override partContract = { anatomy: emptyStateAnatomy, meta: emptyStateMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
    live: { converter: STRING_CONVERTER },
  }

  declare size?: 'sm' | 'md' | 'lg'
  declare live?: EmptyStateLive

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const props: EmptyStateProps = { size: this.size, live: this.live }
    const api = connectEmptyState(props, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('icon', api.getIconProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('action', api.getActionProps() as Record<string, unknown>)
  }
}
