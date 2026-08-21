import type { ResultProps, ResultStatus } from '@xihan-ui/headless'
import { connectResult, resultAnatomy, resultMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-result>` —— 结果页行为宿主，无状态机，把 connectResult 产出的属性打到角色节点上。
 *
 * 除 root 外的部件全部可缺省。图标画什么由作者塞进图标槽，库不带插画资产；
 * status 只落成 root 的 data-status，皮肤据它给图标区上语气色。
 *
 * root 上不写 role：整页结果随页面一起呈现，就地换出来的结果用 `<xh-empty-state>` 或 `<xh-alert>`。
 *
 * @customElement xh-result
 * @attr {'404'|'403'|'500'|'success'|'warning'|'error'|'info'} status - 结果类型，写到 root 的 data-status 上
 * @attr {'sm'|'md'|'lg'} size - 尺寸档位，写到 root 的 data-size 上
 * @csspart root - 承载 data-status 与 data-size 的容器
 * @csspart icon - 装饰图标位，对读屏隐藏，颜色随 status 走
 * @csspart title - 结果标题
 * @csspart description - 标题下的说明
 * @csspart action - 操作按钮槽
 */
export class XhResultElement extends XhElement {
  static override partContract = { anatomy: resultAnatomy, meta: resultMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    status: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare status?: ResultStatus
  declare size?: 'sm' | 'md' | 'lg'

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const props: ResultProps = { status: this.status, size: this.size }
    const api = connectResult(this.configured('result', props), wcNormalize)

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
