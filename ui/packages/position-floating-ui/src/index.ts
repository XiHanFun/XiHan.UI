import type { Placement as FloatingPlacement, Middleware, ReferenceElement } from '@floating-ui/dom'
import type {
  Anchor,
  PositionEnginePort,
  PositionOptions,
  PositionResult,
  VirtualAnchor,
} from '@xihan-ui/core'
import { autoUpdate, computePosition, flip, hide, offset, shift } from '@floating-ui/dom'

// PositionEnginePort 的 @floating-ui/dom 实现。

/** 与端口默认值一致：底部对齐、8px 间距、开启避让。 */
const DEFAULTS = { placement: 'bottom' as const, offset: 8, flip: true, shift: true }

/** 把端口的虚拟锚点（只有 x/y/width/height）补齐成 floating-ui 需要的四条边。 */
function toReference(anchor: Anchor): ReferenceElement {
  if ((anchor as Element).nodeType === 1)
    return anchor as Element
  const virtual = anchor as VirtualAnchor
  return {
    getBoundingClientRect: () => {
      const { x, y, width, height } = virtual.getBoundingClientRect()
      return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height }
    },
  }
}

function buildMiddleware(options: PositionOptions): Middleware[] {
  const list: Middleware[] = [offset(options.offset ?? DEFAULTS.offset)]
  if (options.flip ?? DEFAULTS.flip)
    list.push(flip())
  if (options.shift ?? DEFAULTS.shift)
    list.push(shift({ padding: 4 }))
  // hide 必须排在最后，它读的是前面 middleware 落定后的位置
  list.push(hide())
  return list
}

export function createFloatingUiPositionEngine(): PositionEnginePort {
  return {
    attach(anchor: Anchor, floating: HTMLElement, options: PositionOptions, onResult: (r: PositionResult) => void) {
      const placement = (options.placement ?? DEFAULTS.placement) as FloatingPlacement
      const middleware = buildMiddleware(options)
      const reference = toReference(anchor)

      const update = (): void => {
        void computePosition(reference, floating, { placement, middleware, strategy: 'absolute' })
          .then(({ x, y, placement: resolved, middlewareData }) => {
            onResult({
              x,
              y,
              placement: resolved,
              // referenceHidden 为真表示锚点已滚出可视区
              hidden: middlewareData.hide?.referenceHidden ?? false,
            })
          })
      }

      // 滚动/缩放/尺寸变化时重算，返回值即停止跟随
      return autoUpdate(reference, floating, update)
    },
  }
}
