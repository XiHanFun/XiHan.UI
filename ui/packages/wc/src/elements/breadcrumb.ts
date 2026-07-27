import type { Direction } from '@xihan-ui/core'
import type { BreadcrumbProps, BreadcrumbTranslations } from '@xihan-ui/headless'
import { connectBreadcrumb } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined：缺省值的唯一事实源留在 connect。
// Lit 自带的转换器会在属性被移除时把值落成 null，那样 dir 就再也表达不了"跟着祖先继承"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * 作者写在角色节点上的布尔声明，三态读法：属性缺席 = false，="false" = false，其余 = true。
 * 与宿主属性的三态转换器同一套规矩，`current="false"` 不会因为"属性在"就被当成真。
 */
function authorFlag(el: HTMLElement, name: string): boolean {
  const raw = el.getAttribute(name)
  return raw != null && raw !== 'false'
}

/**
 * `<xh-breadcrumb>` —— Light-DOM 行为宿主，无状态机：作者写
 * root/list/item/link/separator/ellipsis 角色节点，元素把 connectBreadcrumb 产出的
 * aria-* 打上去。
 *
 * 标签由作者写，且必须写对：root 是 `<nav>`（地标语义只有标签给得了），list 是 `<ol>`，
 * item / separator / ellipsis 都是 `<li>`（`<ol>` 里只放得下 `<li>`），link 是 `<a>`。
 * href 归作者写——那是路由的事，元素只在当前页那条上拦住点击。
 *
 * 已知边界：作者在运行期原地改写 link 上的 `current` 属性时元素不会重新接线
 * （基类只观察 value / disabled / aria-disabled 三个作者属性）。
 * 面包屑随路由变化时整条路径都会重建（那是 childList 变动，照常触发重接线），
 * 唯独"DOM 不动、只翻一个属性"这一路要作者自己 requestUpdate。
 *
 * @customElement xh-breadcrumb
 * @attr {'ltr'|'rtl'} dir - 文字方向，写到 root 上交给浏览器排版；不给则继承祖先
 * @csspart root - nav 地标，承载 aria-label
 * @csspart list - ol 容器，层级顺序由标签自己给
 * @csspart item - li 条目
 * @csspart link - a 链接；当前页那条写 current 属性，得到 aria-current="page" 并被拦住点击
 * @csspart separator - li 分隔符，对读屏隐藏
 * @csspart ellipsis - li 折叠占位，对读屏隐藏
 */
export class XhBreadcrumbElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare direction?: Direction
  declare translations?: Partial<BreadcrumbTranslations>

  protected wire(): void {
    // 读声明好的响应式属性，不回读 DOM 特性：作者与框架绑定（Vue 的 :prop、Lit 的 .prop）
    // 走的都是 property 这条路，回读特性会让那条路完全空转。
    const props: BreadcrumbProps = {
      dir: this.direction,
      translations: this.translations,
    }
    const api = connectBreadcrumb(props, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    // 多实例 part 逐个打。item / separator / ellipsis 三者不带任何身份，
    // 拿到的属性完全相同；link 的身份是"是不是当前页"，由作者写在节点上。
    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps() as Record<string, unknown>)

    for (const el of this.getParts('link')) {
      const attrs = api.getLinkProps({ current: authorFlag(el, 'current') })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    }

    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    for (const el of this.getParts('ellipsis'))
      this.spreader.spread(el, api.getEllipsisProps() as Record<string, unknown>)
  }
}
