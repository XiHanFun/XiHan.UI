import type { PropTypes } from '@xihan-ui/core'

export interface FieldProps {
  /** 校验失败态：控件上 aria-invalid=true，错误文案接入描述链并显出。 */
  invalid?: boolean
  /** 必填：控件上 aria-required=true。 */
  required?: boolean
  disabled?: boolean
  /** 控件 id；作者接管时以它为准。刻意不叫 id——那是宿主自身的 DOM id，撞名会让两者抢同一个值。 */
  controlId?: string
}

export interface FieldApi<T extends PropTypes = PropTypes> {
  invalid: boolean
  required: boolean
  disabled: boolean
  /** 控件实际使用的 id，label 的 for 与它一致。 */
  controlId: string
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  /** 控件本身由作者渲染（input / select / textarea / 自定义控件），这里只产出要合并上去的属性。 */
  getControlProps: () => T['element']
  getDescriptionProps: () => T['element']
  getErrorTextProps: () => T['element']
}
