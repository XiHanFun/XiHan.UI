import { connectProgress } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-progress>` —— Light-DOM 行为宿主，无状态机：宿主属性即 progress props，
 * wire 时算 connectProgress 打到 root/track/range 三个角色节点。
 *
 * @customElement xh-progress
 * @attr {number} value - 当前进度值，越界会被夹到 [0, max]，默认 0
 * @attr {number} max - 满值上限，默认 100
 * @csspart root - role=progressbar 的容器（承载 aria-valuenow/aria-valuemax/data-state）
 * @csspart track - 进度轨道（满长背景）
 * @csspart range - 已完成区段，长度按百分比写成内联 inline-size
 */
export class XhProgressElement extends XhElement {
  static override properties = {
    value: { type: Number },
    max: { type: Number },
  }

  declare value?: number
  declare max?: number

  protected wire(): void {
    const api = connectProgress({ value: this.value, max: this.max }, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    const track = this.getPart('track')
    if (track)
      this.spreader.spread(track, api.getTrackProps() as Record<string, unknown>)
    const range = this.getPart('range')
    if (!range)
      return
    // getRangeProps 的 style 是对象（{ inlineSize: 'NN%' }），而 spreader 对非事件键一律
    // setAttribute(key, String(value))，直接 spread 会写出 style="[object Object]"。
    // 故把 style 摘出来写成内联样式，其余键照常 spread。
    const { style, ...attrs } = api.getRangeProps() as Record<string, unknown> & { style?: { inlineSize?: string } }
    this.spreader.spread(range, attrs)
    range.style.inlineSize = style?.inlineSize ?? ''
  }
}
