import type { PropTypes } from '@xihan-ui/core'

export interface BadgeProps {
  variant?: 'solid' | 'subtle' | 'outline'
}

export interface BadgeApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}
