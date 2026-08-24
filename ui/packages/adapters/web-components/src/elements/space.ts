import type { SpaceProps } from '@xihan-ui/headless'
import { connectSpace, spaceAnatomy, spaceMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-space>` —— Light-DOM 行为宿主，无状态机，把 connectSpace 产出打到 root 角色节点。
 * 排布参数原样落成 data-*，排布规则写在皮肤里。
 *
 * 方向与间距恒有值：不写也留 md 间距，这是本组件与 `<xh-flex>` 的分野。
 *
 * 分隔符是一个角色节点：作者把它写在 root 里、夹在两个子项中间，元素替它打上 aria-hidden。
 * 本元素不生成任何结构，也就没法替作者复制节点；Vue 版的 split 插槽是同一件事的另一种写法，
 * 铺开后的 DOM 形状一致。
 *
 * 根上不写 role：容器只做排布，里面装的是列表还是一组按钮由作者自己声明。
 *
 * @customElement xh-space
 * @attr {'horizontal'|'vertical'} orientation - 排布方向，缺省 horizontal
 * @attr {'horizontal'|'vertical'} direction - 排布方向的旧写法，两个都写时以 orientation 为准
 * @attr {'xs'|'sm'|'md'|'lg'|'xl'} gap - 子项间距档位，缺省 md，逐档对应一个间距令牌
 * @attr {'start'|'center'|'end'|'stretch'|'baseline'} align - 交叉轴对齐
 * @attr {'start'|'center'|'end'|'between'|'around'|'evenly'} justify - 主轴分布
 * @attr {boolean} wrap - 一行放不下时折行
 * @attr {boolean} inline - 容器按行内盒排版，宽度收到内容
 * @csspart root - 排布容器，承载 data-orientation / data-gap / data-align / data-justify / data-wrap / data-inline
 * @csspart split - 夹在两个子项之间的分隔符，作者逐个写在 root 里；元素替它打上 aria-hidden
 */
export class XhSpaceElement extends XhElement {
  static override partContract = { anatomy: spaceAnatomy, meta: spaceMeta }

  static override properties = {
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER },
    gap: { converter: STRING_CONVERTER },
    align: { converter: STRING_CONVERTER },
    justify: { converter: STRING_CONVERTER },
    wrap: { converter: BOOLEAN_CONVERTER },
    inline: { converter: BOOLEAN_CONVERTER },
  }

  declare orientation?: SpaceProps['orientation']
  declare direction?: SpaceProps['direction']
  declare gap?: SpaceProps['gap']
  declare align?: SpaceProps['align']
  declare justify?: SpaceProps['justify']
  declare wrap?: boolean
  declare inline?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectSpace({
      orientation: this.orientation,
      direction: this.direction,
      gap: this.gap,
      align: this.align,
      justify: this.justify,
      wrap: this.wrap,
      inline: this.inline,
    } satisfies SpaceProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 分隔符是多实例部件：作者写几个就打几个，一个都没写也成立（只有一个子项时本就没有缝）
    for (const el of this.getParts('split'))
      this.spreader.spread(el, api.getSplitProps() as Record<string, unknown>)
  }
}
