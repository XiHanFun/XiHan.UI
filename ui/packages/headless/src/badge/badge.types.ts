import type { PropTypes } from '@xihan-ui/core'

export interface BadgeProps {
  variant?: 'solid' | 'subtle' | 'outline'
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: string
  /** 尺寸：sm / md / lg */
  size?: string
}

export interface BadgeApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}
