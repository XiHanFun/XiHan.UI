/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 progress 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type {
  ProgressApi,
  ProgressGapPosition,
  ProgressIndicator,
  ProgressScaleOptions,
  ProgressSemantics,
  ProgressThreshold,
  ProgressTranslations,
  ProgressVariant,
} from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectProgress, progressAnatomy, progressMeta } from '@xihan-ui/headless'
import { GEN_ATTR, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * 把一组生成节点按次序排在 ref 之前（ref 为 null 时排在末尾）。已经在位的不挪：
 * 挪动节点会打断它身上正在走的过渡，指针转到一半会跳到终点。
 */
function placeRun(parent: Element, nodes: readonly Element[], ref: Element | null): void {
  let cursor: Node | null = ref
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]!
    if (node.parentNode !== parent || node.nextSibling !== cursor)
      parent.insertBefore(node, cursor)
    cursor = node
  }
}

/**
 * `<xh-progress>`：Light-DOM 行为宿主，无状态机，把 connectProgress 产出接到各角色节点。
 *
 * 线形写三层 div（root > track > range）；环形要把 track 与 range 写为 `<circle>`、
 * 外层套一层 `<svg>` 作为 canvas，环心的文字放进 label：
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
 * @attr {boolean} indeterminate - 进度未知：进度条改为往复动画，读屏侧不报数
 * @attr {string} value-text - 读屏播报的文字，覆盖默认的数值播报
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸：线形影响厚度，环形影响直径
 * @attr {'progress'|'meter'} semantics - 报告的是进度还是量，默认 progress；meter 发出 role=meter 且不接受 indeterminate
 * @attr {number} target - 目标值：画一道目标刻度；只在 semantics=meter 下生效
 * @attr {'fill'|'needle'} indicator - 仪表盘的指示方式，默认 fill；只在 semantics=meter 下的 dashboard 生效
 * @attr {string} locale - 刻度值与读屏文字的语言
 * @attr {boolean} scale - 画出量程刻度与刻度值；要指定刻度数量与数字格式时走 property：`el.scale = { ticks: 4, format }`
 * @csspart root - role=progressbar（semantics=meter 时 role=meter）的容器（承载 aria-valuenow / aria-valuemax / data-state）
 * @csspart canvas - 承载环的 svg（线形不使用）
 * @csspart track - 进度轨道：线形是满长背景，环形是整段弧
 * @csspart range - 已完成区段：线形写内联 inline-size，环形写 stroke-dashoffset
 * @csspart label - 环心区域，内容由使用者决定（线形不使用）
 * @csspart threshold - 分段色带，由元素按 thresholds 生成：线形在 track 里、环形在 canvas 里，都排在 range 之前
 * @csspart target - 目标刻度，由元素生成：线形在 root 里、环形在 canvas 里
 * @csspart scale - 刻度值的容器，由元素生成在 root 末尾
 * @csspart scale-tick - 刻度线，由元素生成：线形在 scale 里、环形在 canvas 里
 * @csspart scale-label - 刻度值，由元素生成在 scale 里
 * @csspart needle - 仪表盘的指针，由元素生成在 canvas 末尾
 *
 * 分段、目标、刻度与指示方式是量（semantics=meter）才有的刻画。分段与刻度的配置是数组或对象，只走 JS property：
 * `el.thresholds = [{ value: 60, tone: 'success', label: '正常' }]`。
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
    indeterminate: { type: Boolean },
    valueText: { attribute: 'value-text' },
    tone: {},
    size: {},
    semantics: {},
    thresholds: { attribute: false },
    // 写属性 scale 即开启缺省刻度；要指定刻度数量与数字格式时走 property 给对象
    scale: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    translations: { attribute: false },
    target: { type: Number },
    indicator: {},
    locale: {},
  }

  declare value?: number
  declare max?: number
  declare variant?: ProgressVariant
  declare strokeWidth?: number
  declare gapDegree?: number
  declare gapPosition?: ProgressGapPosition
  declare indeterminate?: boolean
  declare valueText?: string
  declare tone?: Tone
  declare size?: Size
  declare semantics?: ProgressSemantics
  declare thresholds?: readonly ProgressThreshold[]
  declare target?: number
  declare scale?: boolean | ProgressScaleOptions
  declare indicator?: ProgressIndicator
  declare locale?: string
  declare translations?: Partial<ProgressTranslations>

  /** 刻度值容器里的生成节点按它复用。 */
  readonly #keys: KeyedChildren = new WeakMap()
  /** 其余生成节点按「宿主节点 + 组名」复用。 */
  readonly #groups = new WeakMap<Element, Map<string, Map<string, Element>>>()

  protected wire(): void {
    const api = connectProgress(this.configured('progress', {
      value: this.value,
      max: this.max,
      variant: this.variant,
      strokeWidth: this.strokeWidth,
      gapDegree: this.gapDegree,
      gapPosition: this.gapPosition,
      indeterminate: this.indeterminate,
      valueText: this.valueText,
      tone: this.tone,
      size: this.size,
      semantics: this.semantics,
      thresholds: this.thresholds,
      target: this.target,
      scale: this.scale,
      indicator: this.indicator,
      locale: this.locale,
      translations: this.translations,
    }), wcNormalize)

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
    this.#paintMeter(api)
  }

  /** 按 key 复用一组生成节点，返回按次序排好的节点；没用上的摘掉。 */
  #group<T>(host: Element, name: string, items: readonly T[], keyOf: (item: T) => string, make: () => Element, paint: (node: Element, item: T) => void): Element[] {
    const byName = this.#groups.get(host) ?? new Map<string, Map<string, Element>>()
    this.#groups.set(host, byName)
    const known = byName.get(name) ?? new Map<string, Element>()
    const next = new Map<string, Element>()
    for (const item of items) {
      const key = keyOf(item)
      const node = known.get(key) ?? make()
      node.setAttribute(GEN_ATTR, '')
      paint(node, item)
      next.set(key, node)
    }
    for (const [key, node] of known) {
      if (!next.has(key))
        node.remove()
    }
    byName.set(name, next)
    return [...next.values()]
  }

  /** 量的刻画：分段色带、目标刻度、刻度与指针都按数据生成，作者只写外壳。 */
  #paintMeter(api: ProgressApi): void {
    const root = this.getPart('root')
    if (!root)
      return
    const doc = root.ownerDocument
    const ring = api.variant !== 'line'
    const spread = (node: Element, props: unknown): void => this.spreader.spread(node as HTMLElement, props as Record<string, unknown>)
    const svg = (tag: string) => (): Element => doc.createElementNS(SVG_NS, tag)
    const html = (tag: string) => (): Element => doc.createElement(tag)
    const range = this.getPart('range')

    // 色带排在 range 之前：填充要压在色带上面
    const bandHost = ring ? this.getPart('canvas') : this.getPart('track')
    if (bandHost) {
      const bands = this.#group(bandHost, 'threshold', api.bands, band => band.key, ring ? svg('circle') : html('div'), (node, band) => spread(node, api.getThresholdProps(band)))
      placeRun(bandHost, bands, range?.parentNode === bandHost ? range : null)
    }

    // 目标刻度与指针：环形排在 canvas 末尾（刻度线在它们之前），线形的目标刻度排在 root 里
    const target = api.target == null ? [] : [null]
    const needle = api.indicator === 'needle' ? [null] : []
    const canvas = this.getPart('canvas')
    if (ring && canvas) {
      const ticks = this.#group(canvas, 'scale-tick', api.ticks, tick => tick.key, svg('line'), (node, tick) => spread(node, api.getScaleTickProps(tick)))
      const targets = this.#group(canvas, 'target', target, () => 'target', svg('line'), node => spread(node, api.getTargetProps()))
      const needles = this.#group(canvas, 'needle', needle, () => 'needle', svg('path'), node => spread(node, api.getNeedleProps()))
      placeRun(canvas, [...ticks, ...targets, ...needles], null)
    }

    // 刻度值的容器排在 root 末尾：线形在轨道下方、刻度线也放在里面，环形叠在环上
    const tail = ring ? [] : this.#group(root, 'target', target, () => 'target', html('div'), node => spread(node, api.getTargetProps()))
    const scale = this.#group(root, 'scale', api.ticks.length > 0 ? [null] : [], () => 'scale', html('div'), (node) => {
      spread(node, api.getScaleProps())
      const items = [
        ...(ring ? [] : api.ticks.map(tick => ({ tick, label: false }))),
        ...api.ticks.map(tick => ({ tick, label: true })),
      ]
      reconcile(node, items, this.#keys, item => `${item.label ? 'l' : 't'}${item.tick.key}`, (item, reuse) => {
        const el = reuse ?? doc.createElement('span')
        el.setAttribute(GEN_ATTR, '')
        spread(el, item.label ? api.getScaleLabelProps(item.tick) : api.getScaleTickProps(item.tick))
        if (item.label && el.textContent !== item.tick.label)
          el.textContent = item.tick.label
        return el
      })
    })
    placeRun(root, [...tail, ...scale], null)
  }
}
