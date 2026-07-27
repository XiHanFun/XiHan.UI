import type { Placement as FloatingPlacement, Middleware, ReferenceElement } from '@floating-ui/dom'
import type {
  Anchor,
  PositionEnginePort,
  PositionOptions,
  PositionResult,
  VirtualAnchor,
} from '@xihan-ui/core'
import { autoUpdate, computePosition, flip, hide, offset, shift } from '@floating-ui/dom'

// PositionEnginePort 的 @floating-ui/dom 实现。core 只持有端口契约、零运行时依赖，
// 具体引擎装在本包里，换引擎不动上层。

/** 与端口默认值一致：底部对齐、8px 间距、开启避让。 */
const DEFAULTS = { placement: 'bottom' as const, offset: 8, flip: true, shift: true }

/**
 * 端口的虚拟锚点只承诺 x/y/width/height，floating-ui 还要四条边。
 * 阻抗匹配放在本包，端口契约就不必被具体引擎的形状污染。
 */
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
  // hide 必须排在最后：它读的是前面 middleware 落定后的位置
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
              // referenceHidden 为真 = 锚点被滚出可视区，浮层应一并隐藏
              hidden: middlewareData.hide?.referenceHidden ?? false,
            })
          })
      }

      // autoUpdate 会在滚动/缩放/尺寸变化时重算，返回值即停止跟随
      return autoUpdate(reference, floating, update)
    },
  }
}
