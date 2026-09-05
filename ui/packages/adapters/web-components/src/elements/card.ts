import type { CardProps, CardVariant } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import { cardAnatomy, cardMeta, connectCard } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-card>` —— Light-DOM 行为宿主，无状态机，把 connectCard 产出打到各角色节点。
 * 除 root 外的部件全部可缺省：封面、头、身、脚按需摆，一个不写也是一张合法的卡片。
 *
 * 根上不写 role：卡片是不是地标、要不要可及名字，由里面放了什么内容决定，作者自己声明。
 *
 * @customElement xh-card
 * @attr {'outline'|'subtle'|'elevated'|'ghost'} variant - 形态，决定描边、底色与投影怎么用
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定各段的内边距与标题字号
 * @attr {boolean} hoverable - 指针悬停时抬起
 * @attr {boolean} segmented - 在头、身、脚之间画分隔线
 * @csspart root - 卡片根容器，承载 data-variant / data-size / data-hoverable / data-split
 * @csspart media - 封面位，通常放图片，压在头部之上
 * @csspart header - 头部，装标题与描述
 * @csspart title - 标题
 * @csspart description - 标题下的说明
 * @csspart body - 主体内容
 * @csspart footer - 底部，通常放操作
 */
export class XhCardElement extends XhElement {
  static override partContract = { anatomy: cardAnatomy, meta: cardMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    hoverable: { type: Boolean },
    segmented: { type: Boolean },
  }

  declare variant?: CardVariant
  declare size?: Size
  declare hoverable?: boolean
  declare segmented?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectCard(this.configured('card', {
      variant: this.variant,
      size: this.size,
      hoverable: this.hoverable ?? false,
      segmented: this.segmented ?? false,
    } satisfies CardProps), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('media', api.getMediaProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('body', api.getBodyProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
  }
}
