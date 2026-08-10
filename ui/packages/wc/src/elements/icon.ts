import type { IconApi, IconProps, IconSize, IconWeight } from '@xihan-ui/headless'
import type { IconNode, IconRecord } from '@xihan-ui/kernel'
import { connectIcon, iconAnatomy, iconMeta } from '@xihan-ui/headless'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 自带可及名字的控件；图标落在它们里面时名字该写在控件上。 */
const NAMED_CONTROLS = 'button, a[href], [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="option"]'

/**
 * 按记录建一棵 SVG 子树。
 * 走 createElementNS + setAttribute，全程不碰 HTML 解析器；SVG 命名空间下属性名大小写原样保留。
 */
function buildNode(doc: Document, node: IconNode): SVGElement {
  const el = doc.createElementNS(SVG_NS, node.tag)
  for (const [key, value] of Object.entries(node.attrs ?? {}))
    el.setAttribute(key, value)
  for (const child of node.children ?? [])
    el.appendChild(buildNode(doc, child))
  return el
}

/**
 * `<xh-icon>` —— 图标宿主，无状态机，把命名与档位打到 root 上，把图元铺进 glyph 空壳。
 *
 * 作者在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>` 即授权本元素
 * 在其内部铺图元；不写 glyph 时元素一个节点都不动，几何归作者（手写内联 SVG 或 `<use>`），
 * 命名与档位照常打在 root 上。
 *
 * 图标记录是对象，只走 property：`el.icon = checkIcon`。
 *
 * @customElement xh-icon
 * @attr {string} label - 可及名字；非空白时输出 role=img + aria-label，否则输出 aria-hidden=true
 * @attr {'sm'|'md'|'lg'} size - 直径档位，缺省 md
 * @attr {'light'|'regular'|'bold'} weight - 描边粗细档位，缺省 regular
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @csspart root - 根 `<svg>`，承载 viewBox/data-icon/命名属性/data-size/data-weight/data-tone
 * @csspart glyph - 作者留出的空 `<g>`，图元铺在它内部
 */
export class XhIconElement extends XhElement {
  static override partContract = {
    anatomy: iconAnatomy,
    meta: iconMeta,
    // root 不是 <svg> 时 viewBox 会被小写化而静默失效；glyph 不是 <g> 时铺进去的图元挂在 HTML 元素下，什么都不显示
    tags: { root: ['svg'], glyph: ['g'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    label: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    weight: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    // 记录是对象，只走 property
    icon: { attribute: false },
  }

  declare label?: string
  declare size?: IconSize
  declare weight?: IconWeight
  declare tone?: string
  declare icon?: IconRecord

  /** 一个 glyph 节点归谁，首次见到时定死。 */
  readonly #glyphOwned = new WeakMap<Element, boolean>()

  /** 上一次铺进哪个 glyph 节点、铺的是哪条记录。 */
  #painted?: { host: Element, record: IconRecord }

  protected wire(): void {
    const props: IconProps = {
      icon: this.icon,
      label: this.label,
      size: this.size,
      weight: this.weight,
      tone: this.tone,
    }
    const api = connectIcon(props, wcNormalize)

    const root = this.getPart('root')
    const glyph = this.getPart('glyph')
    // 所有权在写 root 之前定：本次 wire 刚写上的 data-icon 会把首次客户端渲染也算成服务端画过
    const owned = glyph ? this.#ownsGlyph(glyph, root) : false

    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    if (glyph)
      this.spreader.spread(glyph, api.getGlyphProps() as Record<string, unknown>)

    this.#paint(glyph, owned, api.content)
    this.#report(root, glyph, owned, api)
  }

  /**
   * 一个 glyph 节点归谁，首次见到时定死：
   * 空壳 = 授权；非空但 root 上已有 data-icon = 服务端渲染出来的、也是本元素的产出。
   * data-icon 只由 connect 写出。
   */
  #ownsGlyph(host: Element, root: Element | null): boolean {
    let owned = this.#glyphOwned.get(host)
    if (owned === undefined) {
      owned = host.childElementCount === 0 || root?.hasAttribute('data-icon') === true
      this.#glyphOwned.set(host, owned)
    }
    return owned
  }

  /**
   * 把记录的图元铺进 glyph。
   * 本元素其余各处都不替作者生成节点，这里是唯一的例外：图元是算出来的派生数据，作者没法自己写，
   * 且铺设范围被限死在作者显式留出的那个空壳里。
   * 内容判据是记录的引用相等——记录是模块级常量，同一个图标永远是同一个对象。
   * childElementCount 那一条兜住外部代码清空过 glyph 的情形。
   */
  #paint(host: Element | null, owned: boolean, record: IconRecord | undefined): void {
    if (!host || !record) {
      this.#painted = undefined
      return
    }
    if (!owned)
      return
    if (this.#painted?.host === host && this.#painted.record === record && host.childElementCount > 0)
      return
    this.#painted = { host, record }

    const doc = host.ownerDocument
    const frame = doc.createDocumentFragment()
    for (const node of record.nodes)
      frame.appendChild(buildNode(doc, node))
    host.replaceChildren(frame)
  }

  /** 传了图标却铺不上、以及在自带名字的控件里又给图标命名，两类都会静默走偏，报出来。 */
  #report(root: Element | null, glyph: Element | null, owned: boolean, api: IconApi): void {
    const scope = iconAnatomy.name
    if (api.content && !glyph) {
      reportDiagnostic({
        code: DIAGNOSTIC_CODES.warn,
        level: 'warn',
        message: '传了 icon 却没有 data-xh-part="glyph" 空壳，图元无处可铺；要么补上空的 <g data-xh-part="glyph">，要么自己把几何写进 root',
        scope,
        part: 'glyph',
        node: this,
      })
    }
    else if (api.content && glyph && !owned) {
      reportDiagnostic({
        code: DIAGNOSTIC_CODES.warn,
        level: 'warn',
        message: 'glyph 里已有作者写的内容，这些节点不会被改写，传入的 icon 不生效',
        scope,
        part: 'glyph',
        node: glyph,
      })
    }
    if (api.label !== undefined && root?.closest(NAMED_CONTROLS)) {
      reportDiagnostic({
        code: DIAGNOSTIC_CODES.warn,
        level: 'warn',
        message: '可聚焦控件内部的图标应当是装饰态，名字写在控件上，否则读屏会念两遍',
        scope,
        part: 'root',
        node: root,
      })
    }
  }
}
