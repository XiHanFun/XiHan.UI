import type { QrCodeProps, QrLevel } from '@xihan-ui/headless'
import { connectQrCode, qrCodeAnatomy, qrCodeMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * `<xh-qr-code>` —— 二维码宿主，无状态机，把命名与档位打到 root 上，把深色模块铺成一条 `<path>`。
 *
 * 作者写一个空的 `<svg data-xh-part="root"></svg>`，几何由本元素生成：模块是算出来的派生数据，
 * 作者没法自己写。矩阵在 connectQrCode 里算一遍，这里只取现成的 path。
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
 * @csspart root - 根 `<svg>`，承载 viewBox / role=img / aria-label / data-level / data-version / data-modules / data-state
 */
export class XhQrCodeElement extends XhElement {
  static override partContract = {
    anatomy: qrCodeAnatomy,
    meta: qrCodeMeta,
    // root 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，铺进去的 <path> 也不显示
    tags: { root: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    level: { converter: STRING_CONVERTER },
    label: { converter: STRING_CONVERTER },
    size: { type: Number },
    margin: { type: Number },
  }

  declare value?: string
  declare level?: QrLevel
  declare label?: string
  declare size?: number
  declare margin?: number

  /** 上一次铺进哪个 root、铺的是哪条 d。 */
  #painted?: { host: Element, path: string }

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectQrCode({
      value: this.value,
      level: this.level,
      size: this.size,
      margin: this.margin,
      label: this.label,
    } satisfies QrCodeProps, wcNormalize)

    const root = this.getPart('root')
    if (!root)
      return
    // style 是对象，摘出来单独写成内联样式，其余键照常 spread
    const { style, ...attrs } = api.getRootProps() as Record<string, unknown> & {
      style?: { inlineSize?: string, blockSize?: string }
    }
    this.spreader.spread(root, attrs)
    root.style.inlineSize = style?.inlineSize ?? ''
    root.style.blockSize = style?.blockSize ?? ''
    this.#paint(root, api.path)
  }

  /**
   * 把深色模块铺成 root 里唯一的一条 `<path>`。
   * 走 createElementNS 建节点：SVG 图元挂在非 SVG 命名空间下什么都不显示。
   * 子元素个数一并比，兜住外部代码清空过 root 的情形。
   */
  #paint(host: Element, path: string): void {
    const want = path === '' ? 0 : 1
    if (this.#painted?.host === host && this.#painted.path === path && host.childElementCount === want)
      return
    this.#painted = { host, path }
    if (path === '') {
      host.replaceChildren()
      return
    }
    const node = host.ownerDocument.createElementNS(SVG_NS, 'path')
    node.setAttribute('d', path)
    host.replaceChildren(node)
  }
}
