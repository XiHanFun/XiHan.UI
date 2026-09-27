/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import type { Service, Tone } from '@xihan-ui/core'
import type {
  ChartMark,
  NumberFormatSpec,
  SparklineApi,
  SparklineCurve,
  SparklineMarkers,
  SparklineSchema,
  SparklineTranslations,
  SparklineVariant,
} from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectSparkline, sparklineAnatomy, sparklineMachine, sparklineMeta } from '@xihan-ui/headless'
import { GEN_ATTR, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/** 摘要在生成节点里的 key：标记的 key 都是部件名或带前缀，不会与它相同。 */
const SUMMARY_KEY = 'summary'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-sparkline>`：迷你图宿主，随文画出一组数的趋势形状。
 *
 * 作者写一个空的 `<svg data-xh-part="root">`，在它上面写 aria-label 作为可及名；摘要（`<desc>`）与
 * 参考带、面积、折线、柱、标记点由本元素按数据生成进去，按标记的 key 复用节点。
 * 宿主元素缺省是行内元素，迷你图随文排版，不需要另给宽度。
 *
 * 数据、参考带与数值格式是数组或对象，只走 JS property。
 *
 * @customElement xh-sparkline
 * @attr {string} x - 对象数组的横坐标字段；是数值或日期时按它的间距排开
 * @attr {string} y - 对象数组的数值字段
 * @attr {'line'|'area'|'bar'|'win-loss'} variant - 形态，默认 line
 * @attr {'linear'|'monotone'} curve - 折线与面积的插值，默认 linear
 * @attr {'none'|'last'|'extremes'} markers - 标记点，默认 last
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，默认 neutral
 * @attr {boolean} animated - 播放过渡动画，默认开；`animated="false"` 时直接画终态
 * @attr {string} locale - 摘要里数字与文案的语言；未提供时按宿主语言
 * @csspart root - `<svg role="img">`，承载形态、语气与状态；图形由元素生成
 */
export class XhSparklineElement extends XhElement {
  static override partContract = {
    anatomy: sparklineAnatomy,
    meta: sparklineMeta,
    // root 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，生成的图元也不显示
    tags: { root: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    data: { attribute: false },
    band: { attribute: false },
    format: { attribute: false },
    translations: { attribute: false },
    x: { converter: STRING_CONVERTER },
    y: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    curve: { converter: STRING_CONVERTER },
    markers: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    animated: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare data?: SparklineSchema['props']['data']
  declare band?: readonly [number, number]
  declare format?: NumberFormatSpec | ((value: number) => string)
  declare translations?: Partial<SparklineTranslations>
  declare x?: string
  declare y?: string
  declare variant?: SparklineVariant
  declare curve?: SparklineCurve
  declare markers?: SparklineMarkers
  declare tone?: Tone
  declare animated?: boolean
  declare locale?: string

  private readonly ctrl = new MachineController<SparklineSchema>(
    this,
    sparklineMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SparklineSchema['props']> {
    return {
      data: this.data,
      x: this.x,
      y: this.y,
      variant: this.variant,
      curve: this.curve,
      markers: this.markers,
      band: this.band,
      tone: this.tone,
      format: this.format,
      animated: this.animated,
      locale: this.locale,
      translations: this.translations,
    }
  }

  // onBuilt 在 ctrl 构造期就跑；取值口惰性读，角色节点要等首次 updated 才发现得到
  private injectRefs(svc: Service<SparklineSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('root'))
  }

  /** 生成节点的 key 表。 */
  readonly #keys: KeyedChildren = new WeakMap()

  protected wire(): void {
    const api = connectSparkline(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (!root)
      return
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    const { back, data, front } = api.scene.layers
    // 摘要排在最前，其后是场景标记；两者同一次排序，重画时一起复用
    reconcile<ChartMark | null>(root, [null, ...back, ...data, ...front], this.#keys, mark => mark?.key ?? SUMMARY_KEY, (mark, reuse) =>
      mark == null ? this.#paintSummary(root.ownerDocument, reuse, api) : this.#paintMark(root.ownerDocument, mark, reuse, api))
  }

  #paintSummary(doc: Document, reuse: Element | undefined, api: SparklineApi): Element {
    const node = reuse?.localName === 'desc' ? reuse : doc.createElementNS(SVG_NS, 'desc')
    node.setAttribute(GEN_ATTR, '')
    this.spreader.spread(node as HTMLElement, api.getSummaryProps() as Record<string, unknown>)
    if (node.textContent !== api.summary)
      node.textContent = api.summary
    return node
  }

  /** 场景标记画成 `<path>`：createElementNS 建节点，SVG 图元挂在非 SVG 命名空间下不会显示。 */
  #paintMark(doc: Document, mark: ChartMark, reuse: Element | undefined, api: SparklineApi): Element {
    const node = reuse?.localName === 'path' ? reuse : doc.createElementNS(SVG_NS, 'path')
    node.setAttribute(GEN_ATTR, '')
    this.spreader.spread(node as HTMLElement, api.getMarkProps(mark) as Record<string, unknown>)
    return node
  }
}
