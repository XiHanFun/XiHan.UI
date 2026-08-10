import type { StatisticProps } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { connectStatistic, statisticAnatomy, statisticMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-statistic>` —— Light-DOM 行为宿主，无状态机，把 connectStatistic 产出打到各角色节点。
 *
 * 除 root 外的部件全部可缺省：只摆一个数值也是一块合法的统计。
 * 数值由作者格式化好再塞进 value 槽，组件不做千分位、不做单位换算、不做动画。
 *
 * root 上不写 role：一块统计数是不是列表项、要不要可及名字，由它被摆在哪里决定。
 *
 * @customElement xh-statistic
 * @attr {'sm'|'md'|'lg'} size - 尺寸档位，写到 root 的 data-size 上
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，写到 root 的 data-tone 上
 * @csspart root - 承载 data-size 与 data-tone 的容器
 * @csspart label - 数值上方的标签
 * @csspart value - 数值本体，用等宽数字排版
 * @csspart prefix - 数值前的货币符号或升降箭头
 * @csspart suffix - 数值后的单位或百分号
 */
export class XhStatisticElement extends XhElement {
  static override partContract = { anatomy: statisticAnatomy, meta: statisticMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
  }

  declare size?: Size
  declare tone?: Tone

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const props: StatisticProps = { size: this.size, tone: this.tone }
    const api = connectStatistic(props, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('value', api.getValueProps() as Record<string, unknown>)
    put('prefix', api.getPrefixProps() as Record<string, unknown>)
    put('suffix', api.getSuffixProps() as Record<string, unknown>)
  }
}
