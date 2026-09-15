/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 bar code 相关实现。

import type { BarCodeApi, BarCodeFormat, BarCodeProps } from '@xihan-ui/headless'
import { barCodeAnatomy, barCodeMeta, connectBarCode } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开——没给与关在 connect 里是两回事
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 本元素生成的几何节点的标记：作者写的节点不带它，重画时只清掉自己生成的那几个。 */
const GEOM_ATTR = 'data-xh-geom'

function makeGeom(doc: Document, tag: string, name: string): Element {
  const node = doc.createElementNS(SVG_NS, tag)
  node.setAttribute(GEOM_ATTR, name)
  return node
}

/**
 * `<xh-bar-code>`：条形码宿主，无状态机，`format` 选择码制，把命名与档位写到 root 上，把几何铺进 root。
 *
 * 作者写一个空的 `<svg data-xh-part="root"></svg>`，几何由本元素生成：条空序列是计算得出的派生数据，
 * 作者无法自行编写。序列在 connectBarCode 中计算一次，这里只取现成的 path 与文字。
 *
 * 几何恒为一条 `<path>`（全部条，含守卫条的延长段与承载条）加若干 `<text>`（人读文字，每段一个）。
 *
 * 内容不符合码制规则（字符不在字符集、位数不对、校验位不匹配）或码制未知时不绘制任何条，
 * root 上写 `data-state="error"`：绘制出的码可以扫描，但扫出的内容是错误的。
 *
 * @customElement xh-bar-code
 * @attr {'code128'|'ean13'|'ean8'|'upca'|'upce'|'itf14'|'code39'} format - 码制，默认 code128
 * @attr {string} value - 要编码的内容；定长数字码制接受不带或带校验位的两种长度
 * @attr {boolean} gs1 - GS1-128：起始符后放置 FNC1，内容中的 GS 编码为分隔；只对 code128 有意义
 * @attr {boolean} text - 条下方是否打印人读文字，默认打印
 * @attr {boolean} checksum - 附加 mod 43 校验字符；只对 code39 有意义
 * @attr {number} bar-width - 最窄条的像素宽度，默认 2
 * @attr {number} height - 条的像素高度，默认 64
 * @attr {number} margin - 两侧静区（模块数），默认按码制的规范值
 * @attr {boolean} bearer-bars - 上下承载条，默认绘制；只对 itf14 有意义
 * @attr {string} label - 可及名，默认使用 value
 * @csspart root - 根 `<svg>`，承载 viewBox / role=img / aria-label / data-format / data-modules / data-state
 */
export class XhBarCodeElement extends XhElement {
  static override partContract = {
    anatomy: barCodeAnatomy,
    meta: barCodeMeta,
    // root 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，铺进去的 <path> 也不显示
    tags: { root: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    format: { converter: STRING_CONVERTER },
    value: { converter: STRING_CONVERTER },
    gs1: { converter: BOOLEAN_CONVERTER },
    text: { converter: BOOLEAN_CONVERTER },
    checksum: { converter: BOOLEAN_CONVERTER },
    barWidth: { type: Number, attribute: 'bar-width' },
    height: { type: Number },
    margin: { type: Number },
    bearerBars: { converter: BOOLEAN_CONVERTER, attribute: 'bearer-bars' },
    label: { converter: STRING_CONVERTER },
  }

  declare format?: BarCodeFormat
  declare value?: string
  declare gs1?: boolean
  declare text?: boolean
  declare checksum?: boolean
  declare barWidth?: number
  declare height?: number
  declare margin?: number
  declare bearerBars?: boolean
  declare label?: string

  /** 上一次往哪个 root 铺过哪一版几何。 */
  #painted?: { host: Element, key: string }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    // 读响应式 property，不回读 DOM 特性
    const api = connectBarCode({
      format: this.format,
      value: this.value,
      gs1: this.gs1,
      text: this.text,
      checksum: this.checksum,
      barWidth: this.barWidth,
      height: this.height,
      margin: this.margin,
      bearerBars: this.bearerBars,
      label: this.label,
    } satisfies BarCodeProps, wcNormalize)

    // style 是对象，摘出来单独写成内联样式，其余键照常 spread
    const { style, ...attrs } = api.getRootProps() as Record<string, unknown> & {
      style?: { inlineSize?: string, blockSize?: string }
    }
    this.spreader.spread(root, attrs)
    root.style.inlineSize = style?.inlineSize ?? ''
    root.style.blockSize = style?.blockSize ?? ''
    this.#paint(root, api)
  }

  /**
   * 把条与人读文字铺进 root，排在作者写的节点之前。
   *
   * 走 createElementNS 建节点：SVG 图元挂在非 SVG 命名空间下什么都不显示。
   * 只清 root 直属的、本元素自己标记过的几何节点：整个清空会连作者写的东西一起端掉。
   */
  #paint(host: Element, api: BarCodeApi): void {
    const key = `${api.path}|${api.fontSize}|${api.text.map(t => `${t.x},${t.y},${t.anchor},${t.text}`).join(';')}`
    const existing = Array.from(host.children).filter(node => node.hasAttribute(GEOM_ATTR))
    const want = (api.path === '' ? 0 : 1) + api.text.length
    if (this.#painted?.host === host && this.#painted.key === key && existing.length === want)
      return
    this.#painted = { host, key }

    for (const node of existing) node.remove()
    const doc = host.ownerDocument
    const made: Element[] = []
    if (api.path !== '') {
      const node = makeGeom(doc, 'path', 'bars')
      node.setAttribute('d', api.path)
      made.push(node)
    }
    for (const run of api.text) {
      const node = makeGeom(doc, 'text', 'text')
      node.setAttribute('x', String(run.x))
      node.setAttribute('y', String(run.y))
      node.setAttribute('text-anchor', run.anchor)
      node.setAttribute('font-size', String(api.fontSize))
      node.textContent = run.text
      made.push(node)
    }
    if (made.length)
      host.prepend(...made)
  }
}
