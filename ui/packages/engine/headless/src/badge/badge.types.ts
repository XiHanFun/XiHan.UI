import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'

/** 形态。取值与 badge.css 的选择器一一对应。 */
export type BadgeVariant = 'outline' | 'solid' | 'subtle'

export interface BadgeProps {
  variant?: BadgeVariant
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: Tone
  /** 尺寸：sm / md / lg */
  size?: Size
}

export interface BadgeApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface BadgeTranslations {}
