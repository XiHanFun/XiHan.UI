import type { PropTypes } from '@xihan-ui/core'

export interface FieldProps {
  /** 校验失败态：控件上 aria-invalid=true，错误文案接入描述链并显出。 */
  invalid?: boolean
  /** 必填：控件上 aria-required=true。 */
  required?: boolean
  disabled?: boolean
  /** 只读：控件上 aria-readonly=true。与 disabled 不同，只读仍可聚焦、仍参与提交。 */
  readOnly?: boolean
  /** 控件 id；作者接管时以它为准。 */
  controlId?: string
}

export interface FieldApi<T extends PropTypes = PropTypes> {
  invalid: boolean
  required: boolean
  disabled: boolean
  readOnly: boolean
  /** 控件实际使用的 id，label 的 for 与它一致。 */
  controlId: string
  /** 标签节点的 id。复合控件把它并进自己的名字链，字段的标签才念得到。 */
  labelId: string
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  /** 控件本身由作者渲染，这里只产出要合并上去的属性。 */
  getControlProps: () => T['element']
  getDescriptionProps: () => T['element']
  getErrorTextProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface FieldTranslations {}
