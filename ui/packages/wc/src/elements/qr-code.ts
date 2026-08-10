import type { QrCodeApi, QrCodeProps, QrLevel } from '@xihan-ui/headless'
import { connectQrCode, qrCodeAnatomy, qrCodeMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 本元素生成的几何节点的标记：作者写的节点不带它，重画时只清掉自己生成的那几个。 */
const GEOM_ATTR = 'data-xh-geom'

type ModuleShape = NonNullable<QrCodeProps['moduleShape']>
type EyeShape = NonNullable<QrCodeProps['eyeShape']>

function makeGeom(doc: Document, tag: string, name: string): Element {
  const node = doc.createElementNS(SVG_NS, tag)
  node.setAttribute(GEOM_ATTR, name)
  return node
}

/**
 * `<xh-qr-code>` —— 二维码宿主，无状态机，把命名与档位打到 root 上，把几何铺进 root。
 *
 * 作者写一个空的 `<svg data-xh-part="root"></svg>`，几何由本元素生成：模块是算出来的派生数据，
 * 作者没法自己写。矩阵在 connectQrCode 里算一遍，这里只取现成的 path。
 *
 * 几何恒是两条 `<path>`：除码眼外的模块一条、三个码眼一条，码眼那条另有 `--xh-qr-code-eye-fg` 可单独上色。
 *
 * 要放中心 logo 就在 root 里写一个 `<svg data-xh-part="logo">` 并把图形放进去，落位与尺寸由本元素写上；
 * 那块底下会先铺一个底色矩形把模块挖空，作者的图形画在它上面。放了 logo 就把 level 提到 Q 或 H：
 * 挖掉的码字超出所选级别的纠错余量时，诊断通道会收到一条 `qr-code.logo-damage` 警告，码照画。
 *
 * 内容超出 40 版容量时不画任何模块，root 上落 `data-state="error"`：
 * 截断能画出一张扫得开的码，但扫出来的是半截内容。
 *
 * @customElement xh-qr-code
 * @attr {string} value - 要编码的内容，按 UTF-8 取字节走字节模式
 * @attr {'L'|'M'|'Q'|'H'} level - 纠错级别，缺省 M
 * @attr {number} size - 像素边长，缺省 160
 * @attr {number} margin - 静区宽度（模块数），缺省 4
 * @attr {string} label - 可及名字，缺省用 value
 * @attr {'square'|'dot'|'rounded'} module-shape - 码点形状，缺省 square
 * @attr {'square'|'rounded'} eye-shape - 码眼形状，缺省 square
 * @csspart root - 根 `<svg>`，承载 viewBox / role=img / aria-label / data-level / data-version / data-modules / data-state / data-logo
 * @csspart logo - 码面正中放 logo 的嵌套 `<svg>`，承载 x / y / width / height
 */
export class XhQrCodeElement extends XhElement {
  static override partContract = {
    anatomy: qrCodeAnatomy,
    meta: qrCodeMeta,
    // root 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，铺进去的 <path> 也不显示；
    // logo 不是嵌套 <svg> 时 x / y / width / height 无处生效，那块图形会摊在整张码上
    tags: { root: ['svg'], logo: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    level: { converter: STRING_CONVERTER },
    label: { converter: STRING_CONVERTER },
    size: { type: Number },
    margin: { type: Number },
    moduleShape: { converter: STRING_CONVERTER, attribute: 'module-shape' },
    eyeShape: { converter: STRING_CONVERTER, attribute: 'eye-shape' },
  }

  declare value?: string
  declare level?: QrLevel
  declare label?: string
  declare size?: number
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
    const api = connectQrCode({
      value: this.value,
      level: this.level,
      size: this.size,
      margin: this.margin,
      label: this.label,
      moduleShape: this.moduleShape,
      eyeShape: this.eyeShape,
      logo: logo != null,
    } satisfies QrCodeProps, wcNormalize)

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
   * 把数据模块、码眼、logo 挖空铺进 root，三样都排在作者写的节点之前——
   * 挖空必须压在模块之上、又在 logo 之下。
   *
   * 走 createElementNS 建节点：SVG 图元挂在非 SVG 命名空间下什么都不显示。
   * 只清 root 直属的、本元素自己标记过的几何节点：整个清空会连作者写的 logo 一起端掉。
   */
  #paint(host: Element, api: QrCodeApi): void {
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
