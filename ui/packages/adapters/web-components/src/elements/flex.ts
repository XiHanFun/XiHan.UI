import type { FlexProps } from '@xihan-ui/headless'
import { connectFlex, flexAnatomy, flexMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-flex>` —— Light-DOM 行为宿主，无状态机，把 connectFlex 产出打到 root 角色节点。
 * 六个排版参数原样落成 data-*，排布规则写在皮肤里。
 *
 * 根上不写 role：容器只做排布，里面装的是列表还是一组按钮由作者自己声明。
 *
 * @customElement xh-flex
 * @attr {'horizontal'|'vertical'} orientation - 主轴方向，缺省 horizontal
 * @attr {'start'|'center'|'end'|'stretch'|'baseline'} align - 交叉轴对齐
 * @attr {'start'|'center'|'end'|'between'|'around'|'evenly'} justify - 主轴分布
 * @attr {'xs'|'sm'|'md'|'lg'|'xl'} gap - 子项间距档位，逐档对应一个间距令牌
 * @attr {boolean} wrap - 一行放不下时折行
 * @attr {boolean} inline - 容器按行内盒排版，宽度收到内容
 * @csspart root - 排布容器，承载 data-orientation / data-align / data-justify / data-gap / data-wrap / data-inline
 */
export class XhFlexElement extends XhElement {
  static override partContract = { anatomy: flexAnatomy, meta: flexMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    orientation: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    align: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    justify: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    gap: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    wrap: { type: Boolean },
    inline: { type: Boolean },
  }

  declare orientation?: string
  declare align?: string
  declare justify?: string
  declare gap?: string
  declare wrap?: boolean
  declare inline?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectFlex({
      orientation: this.orientation as FlexProps['orientation'],
      align: this.align as FlexProps['align'],
      justify: this.justify as FlexProps['justify'],
      gap: this.gap as FlexProps['gap'],
      wrap: this.wrap ?? false,
      inline: this.inline ?? false,
    } satisfies FlexProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
