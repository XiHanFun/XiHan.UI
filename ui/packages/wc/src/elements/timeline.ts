import type { TimelineItemProps, TimelinePlacement, TimelineProps } from '@xihan-ui/headless'
import type { Orientation } from '@xihan-ui/kernel'
import { connectTimeline, timelineAnatomy, timelineMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

const ITEM_SELECTOR = '[data-xh-part="item"]'

/**
 * `<xh-timeline>` —— 事件流行为宿主，无状态机，把 connectTimeline 产出打到角色节点上。
 *
 * 作者写 root / item / indicator / connector / content / title / description / time 角色节点，
 * 元素只往上打属性，不替作者生成任何节点。
 * 标签上的建议：root 写 `<ol>`、item 写 `<li>`、time 写 `<time datetime="…">`，
 * 机读时间归作者，元素不代填。
 *
 * 这不是步骤条：`<xh-steps>` 表达「流程走到第几步」，有当前项与完成态；
 * 这里表达「按时间排的事件流」，条目已经发生、彼此平等，没有当前项，也就没有任何状态属性。
 * 一条与另一条的差别只有语气色，写在 item 节点的 `tone` 属性上，圆点向上找自己的 item 取用。
 * 运行期改写 item 上的 `tone` 不触发重新接线，需作者自行 requestUpdate。
 *
 * @customElement xh-timeline
 * @attr {'vertical'|'horizontal'} orientation - 事件排列方向，默认 vertical
 * @attr {'start'|'end'|'alternate'} placement - 内容在线的哪一侧；alternate 逐条交替
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定圆点直径、条目间距与字号
 * @csspart root - role=list 的容器，承载 data-orientation / data-placement / data-size
 * @csspart item - role=listitem 的单条事件；作者在此写 tone（这一条的语气色）
 * @csspart indicator - 事件那一刻的圆点，对读屏隐藏，颜色随所属条目的 tone 走
 * @csspart connector - 圆点之间的连线，对读屏隐藏；长度与首尾裁切归皮肤
 * @csspart content - 这一条的文字容器
 * @csspart title - 事件标题
 * @csspart description - 标题下的说明
 * @csspart time - 时刻文本
 */
export class XhTimelineElement extends XhElement {
  static override partContract = { anatomy: timelineAnatomy, meta: timelineMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    orientation: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare orientation?: Orientation
  declare placement?: TimelinePlacement
  declare size?: string

  /**
   * 取角色节点所属条目的语气：tone 写在 item 节点上，圆点向上找自己的 item。
   * 没有 item 包裹层时退回读节点自身，扁平结构也能用；
   * 越出本宿主的 item 不算数——时间线套时间线时内层圆点不会认外层条目。
   */
  private itemProps(el: HTMLElement): TimelineItemProps {
    const owner = el.closest<HTMLElement>(ITEM_SELECTOR)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { tone: source.getAttribute('tone') ?? undefined }
  }

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectTimeline({
      orientation: this.orientation,
      placement: this.placement,
      size: this.size,
    } satisfies TimelineProps, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)

    // 集合类 part 逐个 spread：条目数由作者的 DOM 决定，不依赖下标，增删无需记账
    const putAll = (name: string, get: (el: HTMLElement) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(el) as Record<string, unknown>)
    }
    putAll('item', () => api.getItemProps())
    putAll('indicator', el => api.getIndicatorProps(this.itemProps(el)))
    putAll('connector', () => api.getConnectorProps())
    putAll('content', () => api.getContentProps())
    putAll('title', () => api.getTitleProps())
    putAll('description', () => api.getDescriptionProps())
    putAll('time', () => api.getTimeProps())
  }
}
