import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'

export interface ProgressProps {
  /** 当前进度值，越界会被夹到 [0, max]。 */
  value?: number
  /** 满值上限，默认 100。 */
  max?: number
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: Tone
  /** 尺寸：sm / md / lg，决定轨道厚度 */
  size?: Size
}

export interface ProgressApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
}
