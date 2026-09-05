import type { SkeletonProps, SkeletonShape } from '@xihan-ui/headless'
import { connectSkeleton, skeletonAnatomy, skeletonMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 允许的形状名，作者写错时落回容器的默认值。 */
const SHAPES: readonly string[] = ['text', 'circle', 'rect']

/** 读单根骨架条自报的形状。 */
function itemShape(el: HTMLElement): SkeletonShape | undefined {
  const raw = el.getAttribute('shape')
  return raw != null && SHAPES.includes(raw) ? raw as SkeletonShape : undefined
}

/**
 * `<xh-skeleton>` —— 骨架屏宿主，无状态机，把 connectSkeleton 产出的属性打到角色节点上。
 *
 * 骨架条自报形状：在 item 节点上写 `shape`。运行期改写这个属性不触发重新接线，
 * 需作者自行 requestUpdate。
 *
 * @customElement xh-skeleton
 * @attr {boolean} loading - 是否还在加载，写 "false" 结束加载态
 * @attr {'text'|'circle'|'rect'} shape - 容器内骨架条的默认形状
 * @csspart root - 骨架容器，加载期间带 aria-busy，结束后带 hidden
 * @csspart item - 单根骨架条，加载期间带 aria-hidden，不进无障碍树
 */
export class XhSkeletonElement extends XhElement {
  static override partContract = { anatomy: skeletonAnatomy, meta: skeletonMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    loading: { converter: BOOLEAN_CONVERTER },
    shape: { converter: STRING_CONVERTER },
  }

  declare loading?: boolean
  declare shape?: SkeletonShape

  protected wire(): void {
    const props: SkeletonProps = { loading: this.loading, shape: this.shape }
    const api = connectSkeleton(props, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 多实例 part 逐个打，形状取该节点自报的 shape
    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps({ shape: itemShape(el) }) as Record<string, unknown>)
  }
}
