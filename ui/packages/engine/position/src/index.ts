import type { Anchor, PositionEnginePort, PositionOptions, PositionResult } from '@xihan-ui/core'
import type { PositionBox } from './compute'
import { computePlacement, intersectEdges, isFullyClipped } from './compute'
import {
  boxToFrame,
  clippingAncestors,
  edgesToFrame,
  frameOf,
  getContainingBlock,
  getWindow,
  isHtmlElement,
  paddingEdgesOf,
  VIEWPORT_FRAME,
  viewportEdges,
} from './dom'
import { observePosition } from './observe'

// PositionEnginePort 的自研实现，零第三方依赖。

/** 与端口默认值一致：底部对齐、8px 间距、开启避让。 */
const DEFAULTS = { placement: 'bottom' as const, offset: 8, flip: true, shift: true, strategy: 'absolute' as const }

/** shift 贴边时留出的余量。 */
const SHIFT_PADDING = 4

/** 锚点此刻的视口矩形。元素锚点与虚拟锚点在这一步之后就没有区别了。 */
function anchorBox(anchor: Anchor): PositionBox {
  const rect = anchor.getBoundingClientRect()
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
}

/** size 选项归一：true 即只用默认余量，关掉时不给计算层。 */
function sizeSpec(size: PositionOptions['size']): { padding: number } | undefined {
  if (!size)
    return undefined
  return { padding: (size === true ? undefined : size.padding) ?? SHIFT_PADDING }
}

export function createPositionEngine(): PositionEnginePort {
  return {
    attach(anchor: Anchor, floating: HTMLElement, options: PositionOptions, onResult: (r: PositionResult) => void) {
      const anchorEl = isHtmlElement(anchor) ? anchor : null
      const win = getWindow(floating)

      const update = (): void => {
        const view = viewportEdges(win)
        const anchorViewport = anchorBox(anchor)

        // 浮层写回 left/top 用的是包含块的布局坐标，锚点、可用区域、自身尺寸全换算到这套坐标里
        const strategy = options.strategy ?? DEFAULTS.strategy
        const block = getContainingBlock(floating, strategy)
        const frame = block ? frameOf(block, win) : (strategy === 'fixed' ? VIEWPORT_FRAME : frameOf(null, win))
        const floatingRect = floating.getBoundingClientRect()

        // fixed 只被劫持了它包含块的那个祖先及其内层裁；没有这样的祖先时只受视口约束。
        // 不截断这条链，浮层会逃出裁剪却仍在躲一条已经不存在的边界，照样莫名翻面或被推回去
        const clipChain = strategy === 'fixed'
          ? (block ? clippingAncestors(floating, block) : [])
          : clippingAncestors(floating)
        const clipViewport = clipChain
          .reduce((edges, ancestor) => intersectEdges(edges, paddingEdgesOf(ancestor)), view)

        const placed = computePlacement({
          anchor: boxToFrame(anchorViewport, frame),
          floating: {
            width: floatingRect.width / frame.scaleX,
            height: floatingRect.height / frame.scaleY,
          },
          clip: edgesToFrame(clipViewport, frame),
          placement: options.placement ?? DEFAULTS.placement,
          offset: options.offset ?? DEFAULTS.offset,
          flip: options.flip ?? DEFAULTS.flip,
          shift: options.shift ?? DEFAULTS.shift,
          padding: SHIFT_PADDING,
          dir: options.dir,
          arrow: options.arrow,
          size: sizeSpec(options.size),
        })

        // hidden 问的是锚点还看得见吗，与浮层落在哪儿无关，因此按锚点自己的裁剪祖先算
        const anchorClip = clippingAncestors(anchorEl)
          .reduce((edges, ancestor) => intersectEdges(edges, paddingEdgesOf(ancestor)), view)

        onResult({ ...placed, hidden: isFullyClipped(anchorViewport, anchorClip) })
      }

      const stop = observePosition(anchorEl, floating, update)
      update()
      return stop
    },
  }
}

export { computePlacement, intersectEdges, isFullyClipped, joinPlacement, splitPlacement } from './compute'
export type { ComputeInput, ComputeOutput, PositionBox, PositionEdges } from './compute'
