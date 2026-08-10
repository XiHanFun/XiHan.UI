import type { Size, Tone } from '@xihan-ui/kernel'
import { connectProgress, progressAnatomy, progressMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-progress>` —— Light-DOM 行为宿主，无状态机，把 connectProgress 产出打到 root/track/range 角色节点。
 *
 * @customElement xh-progress
 * @attr {number} value - 当前进度值，越界会被夹到 [0, max]，默认 0
 * @attr {number} max - 满值上限，默认 100
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @csspart root - role=progressbar 的容器（承载 aria-valuenow/aria-valuemax/data-state）
 * @csspart track - 进度轨道（满长背景）
 * @csspart range - 已完成区段，长度按百分比写成内联 inline-size
 */
export class XhProgressElement extends XhElement {
  static override partContract = { anatomy: progressAnatomy, meta: progressMeta }

  static override properties = {
    value: { type: Number },
    max: { type: Number },
    tone: {},
    size: {},
  }

  declare value?: number
  declare max?: number
  declare tone?: Tone
  declare size?: Size

  protected wire(): void {
    const api = connectProgress({ value: this.value, max: this.max, tone: this.tone, size: this.size }, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    const track = this.getPart('track')
    if (track)
      this.spreader.spread(track, api.getTrackProps() as Record<string, unknown>)
    const range = this.getPart('range')
    if (!range)
      return
    // style 是对象，摘出来单独写成内联样式，其余键照常 spread。
    const { style, ...attrs } = api.getRangeProps() as Record<string, unknown> & { style?: { inlineSize?: string } }
    this.spreader.spread(range, attrs)
    range.style.inlineSize = style?.inlineSize ?? ''
  }
}
