import type { ActionVariant, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface IconWrapperProps {
  /** 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 */
  variant?: ActionVariant
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
  tone?: Tone
  /** 尺寸：sm / md / lg，决定底座直径与里面图元的直径。 */
  size?: Size
}

export interface IconWrapperApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface IconWrapperTranslations {}
