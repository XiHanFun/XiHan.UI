import type { BreadcrumbProps, BreadcrumbTranslations } from '@xihan-ui/headless'
import type { Direction, Size, Tone } from '@xihan-ui/kernel'
import { breadcrumbAnatomy, breadcrumbMeta, connectBreadcrumb } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/** 读作者写在角色节点上的布尔声明：属性缺席或 ="false" 为假，其余为真。 */
function authorFlag(el: HTMLElement, name: string): boolean {
  const raw = el.getAttribute(name)
  return raw != null && raw !== 'false'
}

/**
 * `<xh-breadcrumb>` —— 面包屑行为宿主，无状态机，把 connectBreadcrumb 产出的 aria-* 打到角色节点上。
 *
 * 标签要求：root 为 `<nav>`，list 为 `<ol>`，item / separator / ellipsis 为 `<li>`，link 为 `<a>`。
 * 运行期改写 link 上的 `current` 属性不触发重新接线，需作者自行 requestUpdate。
 *
 * @customElement xh-breadcrumb
 * @attr {'ltr'|'rtl'} dir - 文字方向，写到 root 上；不给则继承祖先
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @csspart root - nav 地标，承载 aria-label
 * @csspart list - ol 容器
 * @csspart item - li 条目
 * @csspart link - a 链接；写 current 属性的那条得到 aria-current="page" 并拦住点击
 * @csspart separator - li 分隔符，对读屏隐藏
 * @csspart ellipsis - li 折叠占位，对读屏隐藏
 */
export class XhBreadcrumbElement extends XhElement {
  static override partContract = { anatomy: breadcrumbAnatomy, meta: breadcrumbMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<BreadcrumbTranslations>

  protected wire(): void {
    const props: BreadcrumbProps = {
      dir: this.direction,
      translations: this.translations,
      tone: this.tone,
      size: this.size,
    }
    const api = connectBreadcrumb(this.configured('breadcrumb', props), wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    // 多实例 part 逐个打，link 的身份取作者写的 current。
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
