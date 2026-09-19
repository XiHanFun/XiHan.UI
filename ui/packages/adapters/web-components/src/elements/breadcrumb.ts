/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 breadcrumb 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { BreadcrumbNode, BreadcrumbSchema, BreadcrumbTranslations } from '@xihan-ui/headless'
import { breadcrumbAnatomy, breadcrumbMachine, breadcrumbMeta, connectBreadcrumb } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }

/** 读作者写在角色节点上的布尔声明：属性缺席或 ="false" 为假，其余为真。 */
function authorFlag(el: HTMLElement, name: string): boolean {
  const raw = el.getAttribute(name)
  return raw != null && raw !== 'false'
}

/**
 * `<xh-breadcrumb>`：面包屑行为宿主，把 connectBreadcrumb 产出的 aria-* 接到角色节点上；机器只承载按压通道（data-pressed）。
 *
 * 标签要求：root 为 `<nav>`，list 为 `<ol>`，item / separator / ellipsis 为 `<li>`，link 为 `<a>`。
 * 运行期改写 link 上的 `current` / `value` 属性不触发重新接线，需作者自行 requestUpdate。
 *
 * @customElement xh-breadcrumb
 * @attr {number} max-items - 最多展开的层数，超出的中间层由 api.items 折叠为一个省略位
 * @attr {'ltr'|'rtl'} dir - 文字方向，写到 root 上；未提供时继承祖先
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @csspart root - nav 地标，承载 aria-label
 * @csspart list - ol 容器
 * @csspart item - li 条目
 * @csspart link - a 链接；写 current 属性的条目得到 aria-current="page" 并拦截点击；value 是链接身份，按压通道按它记住正被按住的那一条，未写时按文档序派生
 * @csspart link-icon - 链接中的图标位，对读屏隐藏
 * @csspart separator - li 分隔符，对读屏隐藏
 * @csspart ellipsis - li 折叠占位，对读屏隐藏
 */
export class XhBreadcrumbElement extends XhElement {
  static override partContract = { anatomy: breadcrumbAnatomy, meta: breadcrumbMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    maxItems: { converter: NUMBER_CONVERTER, attribute: 'max-items' },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 层级数据与文案是对象，只走 property
    collection: { attribute: false },
    translations: { attribute: false },
  }

  declare collection?: readonly BreadcrumbNode[]
  declare maxItems?: number
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<BreadcrumbTranslations>

  private readonly ctrl = new MachineController<BreadcrumbSchema>(this, breadcrumbMachine, () => this.machineProps())

  private machineProps(): Partial<BreadcrumbSchema['props']> {
    return {
      collection: this.collection,
      maxItems: this.maxItems,
      dir: this.direction,
      translations: this.translations,
      tone: this.tone,
      size: this.size,
    }
  }

  protected wire(): void {
    const api = connectBreadcrumb(this.ctrl.service, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    // 多实例 part 逐个打，link 的当前页事实取作者写的 current；
    // 身份取作者写的 value，没写就按文档序派生（只作按压通道的键，不写回 DOM）
    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps() as Record<string, unknown>)

    this.getParts('link').forEach((el, index) => {
      const attrs = api.getLinkProps({ value: el.getAttribute('value') ?? `link:${index}`, current: authorFlag(el, 'current') })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    })

    for (const el of this.getParts('link-icon'))
      this.spreader.spread(el, api.getLinkIconProps() as Record<string, unknown>)

    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    for (const el of this.getParts('ellipsis'))
      this.spreader.spread(el, api.getEllipsisProps() as Record<string, unknown>)
  }
}
