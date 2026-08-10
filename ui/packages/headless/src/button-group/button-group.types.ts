import type { PropTypes } from '@xihan-ui/kernel'

export interface ButtonGroupProps {
  /** 排布：horizontal / vertical，决定相邻两段在哪个轴上合边。 */
  orientation?: 'horizontal' | 'vertical'
  /** 形态：solid / subtle / outline / ghost，落到根上供皮肤写进组内按钮的颜色槽位。 */
  variant?: string
  /** 语气：brand / neutral / success / warning / danger / info，落到根上沿继承流给组内每一段。 */
  tone?: string
  /** 尺寸：sm / md / lg，落到根上供皮肤写进组内按钮的高度、内边距与字号槽位。 */
  size?: string
}

export interface ButtonGroupApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}
