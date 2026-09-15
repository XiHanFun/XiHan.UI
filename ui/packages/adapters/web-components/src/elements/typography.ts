/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 typography 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { TypographyAlign, TypographyProps, TypographyVariant, TypographyWeight } from '@xihan-ui/headless'
import { connectTypography, typographyAnatomy, typographyMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * 读取作者写在角色节点上的声明；属性缺席即 undefined。
 *
 * 期望类型由调用方给出：值来自 HTML，类型系统无法触及，因此这里是断言不是校验。
 * 写错值的后果是软性的：它不匹配任何皮肤选择器，该档样式不生效，不抛错也不降级。
 */
function authorValue<T extends string = string>(el: HTMLElement, name: string): T | undefined {
  return (el.getAttribute(name) as T | null) ?? undefined
}

/**
 * `<xh-typography>`：Light-DOM 行为宿主，无状态机，把 connectTypography 产出接到各角色节点。
 *
 * 标签全部由作者编写：`<h2 data-xh-part="heading">`、`<p data-xh-part="paragraph">`、
 * `<span data-xh-part="text">`、`<a data-xh-part="link">`，皮肤识别的是 data-scope + data-part。
 * 标题的字号档位取节点上的 `level`，行内文字的变体、颜色与字重取节点上的 `variant`、`tone` 与 `weight`。
 * 运行期改写这四个属性不触发重新接线，需作者自行 requestUpdate。
 *
 * @customElement xh-typography
 * @attr {'sm'|'md'|'lg'} size - 尺寸，整块正文的字号与段间距随之换档
 * @attr {'start'|'center'|'end'|'justify'} align - 对齐，整块正文随之变化
 * @attr {'regular'|'medium'|'semibold'|'bold'} weight - 字重，整块正文随之变化
 * @csspart root - 正文块容器，管理段间距与最大行宽，承载 data-size / data-align / data-weight
 * @csspart heading - 标题，写 level="1".."6" 切换字号档位
 * @csspart paragraph - 段落
 * @csspart text - 行内文字，支持变体、颜色和字重
 * @csspart link - 行内链接
 * @csspart prose - 富文本容器，外来的 HTML 铺入其中按标签设置样式
 */
export class XhTypographyElement extends XhElement {
  static override partContract = { anatomy: typographyAnatomy, meta: typographyMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
    align: { converter: STRING_CONVERTER },
    weight: { converter: STRING_CONVERTER },
  }

  declare size?: Size
  declare align?: TypographyAlign
  declare weight?: TypographyWeight

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectTypography(this.configured('typography', {
      size: this.size,
      align: this.align,
      weight: this.weight,
    } satisfies TypographyProps), wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 四类内容部件都能有多份，逐个打；档位、形态、语气取作者写在各自节点上的声明
    for (const el of this.getParts('heading')) {
      const attrs = api.getHeadingProps({ level: authorValue(el, 'level') })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    }

    for (const el of this.getParts('paragraph'))
      this.spreader.spread(el, api.getParagraphProps() as Record<string, unknown>)

    for (const el of this.getParts('text')) {
      const attrs = api.getTextProps({
        tone: authorValue<Tone>(el, 'tone'),
        variant: authorValue<TypographyVariant>(el, 'variant'),
        weight: authorValue<TypographyWeight>(el, 'weight'),
      })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    }

    for (const el of this.getParts('link'))
      this.spreader.spread(el, api.getLinkProps() as Record<string, unknown>)

    for (const el of this.getParts('prose'))
      this.spreader.spread(el, api.getProseProps() as Record<string, unknown>)
  }
}
