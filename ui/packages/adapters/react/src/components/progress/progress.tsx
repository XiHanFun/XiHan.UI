import type { Size, Tone } from '@xihan-ui/core'
import type { ProgressGapPosition, ProgressProps, ProgressSemantics, ProgressVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectProgress } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

export interface XhProgressProps extends ComponentPropsWithRef<'div'> {
  /** 当前进度值，越界会被夹到 [0, max]。 */
  value?: number
  /** 进度未知：条子改为往复动画，读屏那侧不报数。 */
  indeterminate?: boolean
  /** 满值上限，默认 100。 */
  max?: number
  /** 形态，默认 line。circle 画整环，dashboard 在环上留一个缺口。 */
  variant?: ProgressVariant
  /** 环的线宽，走 viewBox 单位，默认 6；只对环形生效。 */
  strokeWidth?: number
  /** 缺口角度，默认 75；只对 dashboard 生效。 */
  gapDegree?: number
  /** 缺口朝向，默认 bottom；只对 dashboard 生效。 */
  gapPosition?: ProgressGapPosition
  /** 读屏播报的文字，覆盖默认的数值播报。 */
  valueText?: string
  /** 语气：决定用哪族颜色。 */
  tone?: Tone
  /** 尺寸：线形改轨道厚度，环形改直径。 */
  size?: Size
  /** 报的是进度还是量，默认 progress。 */
  semantics?: ProgressSemantics
}

/**
 * 进度条。线形渲成一条轨道加一截进度，环形把同一份进度画进一个 svg。
 *
 * children 是环心那一块的内容，只在环形下渲染。
 */
export function XhProgress({
  value,
  indeterminate,
  max,
  variant,
  strokeWidth,
  gapDegree,
  gapPosition,
  valueText,
  tone,
  size,
  semantics,
  children,
  ...rest
}: XhProgressProps): ReactNode {
  const api = connectProgress(
    withXhConfig('progress', {
      value,
      indeterminate,
      max,
      variant,
      strokeWidth,
      gapDegree,
      gapPosition,
      valueText,
      tone,
      size,
      semantics,
    }) as ProgressProps,
    reactNormalize,
  )
  const rootProps = mergeReactProps(
    api.getRootProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )

  if (api.variant === 'line') {
    return (
      <div {...rootProps}>
        <div {...api.getTrackProps() as Record<string, unknown>}>
          <div {...api.getRangeProps() as Record<string, unknown>} />
        </div>
      </div>
    )
  }

  // 环心的内容归作者：没写就不渲染那一层，免得一个空盒子压在环上挡住指针
  return (
    <div {...rootProps}>
      <svg {...api.getCanvasProps() as Record<string, unknown>}>
        <circle {...api.getTrackProps() as Record<string, unknown>} />
        <circle {...api.getRangeProps() as Record<string, unknown>} />
      </svg>
      {slotPaints(children)
        ? <div {...api.getLabelProps() as Record<string, unknown>}>{children}</div>
        : null}
    </div>
  )
}
