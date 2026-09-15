/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 matrix code 相关实现。

import type { MatrixCodeApi, MatrixCodeFormat, MatrixCodeLevel, MatrixCodeProps } from '@xihan-ui/headless'
import { connectMatrixCode, matrixCodeAnatomy, matrixCodeMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开——没给与关在 connect 里是两回事
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 本元素生成的几何节点的标记：作者写的节点不带它，重画时只清掉自己生成的那几个。 */
const GEOM_ATTR = 'data-xh-geom'

type ModuleShape = NonNullable<MatrixCodeProps['moduleShape']>
type EyeShape = NonNullable<MatrixCodeProps['eyeShape']>

function makeGeom(doc: Document, tag: string, name: string): Element {
  const node = doc.createElementNS(SVG_NS, tag)
  node.setAttribute(GEOM_ATTR, name)
  return node
}

/**
 * `<xh-matrix-code>`：二维码宿主，无状态机，`format` 选择码制（qr / data-matrix / pdf417 / aztec），把命名与档位写到 root 上，把几何铺进 root。
 *
 * 作者写一个空的 `<svg data-xh-part="root"></svg>`，几何由本元素生成：模块是计算得出的派生数据，
 * 作者无法自行编写。矩阵在 connectMatrixCode 中计算一次，这里只取现成的 path。
 *
 * QR 的几何是两条 `<path>`：除码眼外的模块一条、三个码眼一条，码眼那条另有 `--xh-matrix-code-eye-fg` 可单独上色；
 * 其余码制没有码眼，只有前一条。
 *
 * 需要放置中心 logo 时在 root 中写一个 `<svg data-xh-part="logo">` 并把图形放入，落位与尺寸由本元素写入；
 * 该区域下方会先铺一个底色矩形把模块挖空，作者的图形绘制在它上面。放置 logo 后把 level 提到 Q 或 H：
 * 挖掉的码字超出所选级别的纠错余量时，诊断通道会收到一条 `matrix-code.logo-damage` 警告，码照常绘制。
 * logo 只对 qr 有意义，Data Matrix 下写了 logo 部件会收到一条 `matrix-code.option-ignored` 警告并按未放置处理。
 *
 * 内容超出该码制的最大尺寸时不绘制任何模块，root 上写 `data-state="error"`：
 * 截断可以绘制出可扫描的码，但扫出的是不完整的内容。
 *
 * @customElement xh-matrix-code
 * @attr {'qr'|'data-matrix'|'pdf417'|'aztec'} format - 码制，默认 qr
 * @attr {string} value - 要编码的内容；QR 按 UTF-8 使用字节模式，Data Matrix 使用 ASCII 模式，PDF417 使用字节压缩，Aztec 使用大写 / 小写 / 数字加二进制移位
 * @attr {boolean} gs1 - GS1 模式：最前面放置 FNC1，即 GS1 QR / GS1 DataMatrix；只对这两种码制有意义
 * @attr {string} level - 纠错级别：qr 为 L / M / Q / H（默认 M），pdf417 为 0–8，aztec 为纠错百分比 5–95（默认 33）
 * @attr {boolean} rectangular - 从矩形尺寸中选择；只对 data-matrix 有意义
 * @attr {number} columns - PDF417 的数据列数 1–30；只对 pdf417 有意义
 * @attr {number} pixel-size - 像素宽度，默认 160；高度按模块比例
 * @attr {number} margin - 静区宽度（模块数），默认按码制的规范值（qr 4、data-matrix 1、pdf417 2、aztec 0）
 * @attr {string} label - 可及名，默认使用 value
 * @attr {'square'|'dot'|'rounded'} module-shape - 码点形状，默认 square；pdf417 是条不是点，不适用
 * @attr {'square'|'rounded'} eye-shape - 码眼形状，默认 square；只对 qr 有意义
 * @csspart root - 根 `<svg>`，承载 viewBox / role=img / aria-label / data-format / data-level / data-version / data-columns / data-rows / data-state / data-logo
 * @csspart logo - 码面正中放置 logo 的嵌套 `<svg>`，承载 x / y / width / height
 */
export class XhMatrixCodeElement extends XhElement {
  static override partContract = {
    anatomy: matrixCodeAnatomy,
    meta: matrixCodeMeta,
    // root 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，铺进去的 <path> 也不显示；
    // logo 不是嵌套 <svg> 时 x / y / width / height 无处生效，那块图形会摊在整张码上
    tags: { root: ['svg'], logo: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    format: { converter: STRING_CONVERTER },
    value: { converter: STRING_CONVERTER },
    gs1: { converter: BOOLEAN_CONVERTER },
    // level 的取值域随码制，字符串原样交给 connect 核：qr 认字母档，pdf417 与 aztec 认数字串
    level: { converter: STRING_CONVERTER },
    rectangular: { converter: BOOLEAN_CONVERTER },
    columns: { type: Number },
    label: { converter: STRING_CONVERTER },
    pixelSize: { type: Number, attribute: 'pixel-size' },
    margin: { type: Number },
    moduleShape: { converter: STRING_CONVERTER, attribute: 'module-shape' },
    eyeShape: { converter: STRING_CONVERTER, attribute: 'eye-shape' },
  }

  declare format?: MatrixCodeFormat
  declare value?: string
  declare gs1?: boolean
  declare level?: MatrixCodeLevel
  declare rectangular?: boolean
  declare columns?: number
  declare label?: string
  declare pixelSize?: number
  declare margin?: number
  declare moduleShape?: ModuleShape
  declare eyeShape?: EyeShape

  /** 上一次往哪个 root 铺过哪一版几何。 */
  #painted?: { host: Element, key: string }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    // 作者写没写 logo 部件决定要不要在码面上留位，故先取部件再算矩阵
    const logo = this.getPart('logo')

    // 读响应式 property，不回读 DOM 特性
    const api = connectMatrixCode({
      format: this.format,
      value: this.value,
      gs1: this.gs1,
      level: this.level,
      rectangular: this.rectangular,
      columns: this.columns,
      pixelSize: this.pixelSize,
      margin: this.margin,
      label: this.label,
      moduleShape: this.moduleShape,
      eyeShape: this.eyeShape,
      logo: logo != null,
    } satisfies MatrixCodeProps, wcNormalize)

    // style 是对象，摘出来单独写成内联样式，其余键照常 spread
    const { style, ...attrs } = api.getRootProps() as Record<string, unknown> & {
      style?: { inlineSize?: string, blockSize?: string }
    }
    this.spreader.spread(root, attrs)
    root.style.inlineSize = style?.inlineSize ?? ''
    root.style.blockSize = style?.blockSize ?? ''
    this.#paint(root, api)
    if (logo)
      this.spreader.spread(logo, api.getLogoProps() as Record<string, unknown>)
  }

  /**
   * 把数据模块、码眼、logo 挖空铺进 root，三者都排在作者写的节点之前：
   * 挖空必须位于模块之上、又在 logo 之下。
   *
   * 使用 createElementNS 建节点：SVG 图元挂在非 SVG 命名空间下不会显示。
   * 只清除 root 直属的、本元素自己标记过的几何节点：整个清空会连作者写的 logo 一起移除。
   */
  #paint(host: Element, api: MatrixCodeApi): void {
    const area = api.logoArea
    const key = `${api.path}|${api.eyePath}|${area ? `${area.x} ${area.y} ${area.size}` : ''}`
    const existing = Array.from(host.children).filter(node => node.hasAttribute(GEOM_ATTR))
    const want = (api.path === '' ? 0 : 1) + (api.eyePath === '' ? 0 : 1) + (area ? 1 : 0)
    if (this.#painted?.host === host && this.#painted.key === key && existing.length === want)
      return
    this.#painted = { host, key }

    for (const node of existing) node.remove()
    const doc = host.ownerDocument
    const made: Element[] = []
    if (api.path !== '') {
      const node = makeGeom(doc, 'path', 'modules')
      node.setAttribute('d', api.path)
      made.push(node)
    }
    if (api.eyePath !== '') {
      const node = makeGeom(doc, 'path', 'eyes')
      node.setAttribute('d', api.eyePath)
      made.push(node)
    }
    if (area) {
      const node = makeGeom(doc, 'rect', 'logo-clear')
      node.setAttribute('x', String(area.x))
      node.setAttribute('y', String(area.y))
      node.setAttribute('width', String(area.size))
      node.setAttribute('height', String(area.size))
      made.push(node)
    }
    if (made.length)
      host.prepend(...made)
  }
}
