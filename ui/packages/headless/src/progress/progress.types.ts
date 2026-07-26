import type { PropTypes } from '@xihan-ui/core'

export interface ProgressProps {
  /** 当前进度值，越界会被夹到 [0, max]。 */
  value?: number
  /** 满值上限，默认 100。 */
  max?: number
}

export interface ProgressApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
}
