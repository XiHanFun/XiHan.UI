import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ProgressApi, ProgressProps } from './progress.types'
import { progressAnatomy } from './progress.anatomy'

const parts = progressAnatomy.build()

// Progress 无状态机：进度全部来自 props，值域夹取与百分比就地算。
export function connectProgress<T extends PropTypes>(
  props: ProgressProps,
  normalize: NormalizeProps<T>,
): ProgressApi<T> {
  const max = props.max ?? 100
  const value = Math.min(Math.max(props.value ?? 0, 0), max)
  const percent = max === 0 ? 0 : Math.round(value / max * 100)
  const complete = value >= max

  return {
    // 视觉两轴只落在 root：语气与尺寸都靠自定义属性向下继承，track / range 不必各写一份
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': String(max),
      'aria-valuenow': String(value),
      'data-state': complete ? 'complete' : 'loading',
      'data-tone': props.tone,
      'data-size': props.size,
    }),
    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
    }),
    getRangeProps: () => normalize.element({
      ...parts.range.attrs,
      'data-state': complete ? 'complete' : 'loading',
      'style': { inlineSize: `${percent}%` },
    }),
  }
}
