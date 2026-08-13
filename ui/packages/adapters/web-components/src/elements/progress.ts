import type { ProgressGapPosition, ProgressVariant } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { connectProgress, progressAnatomy, progressMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-progress>` —— Light-DOM 行为宿主，无状态机，把 connectProgress 产出打到各角色节点。
 *
 * 线形写三层 div（root > track > range）；环形要把 track 与 range 写成 `<circle>`、
 * 外面套一层 `<svg>` 当 canvas，环心的文字放进 label：
 *
 * ```html
 * <xh-progress variant="circle" value="60">
 *   <div data-part="root">
 *     <svg data-part="canvas"><circle data-part="track" /><circle data-part="range" /></svg>
 *     <div data-part="label">60%</div>
 *   </div>
 * </xh-progress>
 * ```
 *
 * @customElement xh-progress
 * @attr {number} value - 当前进度值，越界会被夹到 [0, max]，默认 0
 * @attr {number} max - 满值上限，默认 100
 * @attr {'line'|'circle'|'dashboard'} variant - 形态，默认 line
 * @attr {number} stroke-width - 环的线宽（viewBox 单位），默认 6；只对 circle / dashboard 生效
 * @attr {number} gap-degree - 缺口角度，默认 75；只对 dashboard 生效
 * @attr {'top'|'right'|'bottom'|'left'} gap-position - 缺口朝向，默认 bottom；只对 dashboard 生效
 * @attr {string} value-text - 读屏播报的文字，覆盖默认的数值播报
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸：线形改厚度，环形改直径
 * @csspart root - role=progressbar 的容器（承载 aria-valuenow/aria-valuemax/data-state）
 * @csspart canvas - 承载环的 svg（线形不用）
 * @csspart track - 进度轨道：线形是满长背景，环形是整段弧
 * @csspart range - 已完成区段：线形写内联 inline-size，环形写 stroke-dashoffset
 * @csspart label - 环心那一块，写什么由使用者决定（线形不用）
 */
export class XhProgressElement extends XhElement {
  static override partContract = { anatomy: progressAnatomy, meta: progressMeta }

  static override properties = {
    value: { type: Number },
    max: { type: Number },
    variant: {},
    strokeWidth: { type: Number, attribute: 'stroke-width' },
    gapDegree: { type: Number, attribute: 'gap-degree' },
    gapPosition: { attribute: 'gap-position' },
    valueText: { attribute: 'value-text' },
    tone: {},
    size: {},
  }

  declare value?: number
  declare max?: number
  declare variant?: ProgressVariant
  declare strokeWidth?: number
  declare gapDegree?: number
  declare gapPosition?: ProgressGapPosition
  declare valueText?: string
  declare tone?: Tone
  declare size?: Size

  protected wire(): void {
    const api = connectProgress({
      value: this.value,
      max: this.max,
      variant: this.variant,
      strokeWidth: this.strokeWidth,
      gapDegree: this.gapDegree,
      gapPosition: this.gapPosition,
      valueText: this.valueText,
      tone: this.tone,
      size: this.size,
    }, wcNormalize)

    const put = (name: 'root' | 'canvas' | 'track' | 'range' | 'label', props: unknown): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props as Record<string, unknown>)
    }

    put('root', api.getRootProps())
    put('canvas', api.getCanvasProps())
    put('track', api.getTrackProps())
    put('range', api.getRangeProps())
    put('label', api.getLabelProps())
  }
}
