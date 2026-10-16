/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 field 类型契约。

import type { PropTypes } from '@xihan-ui/core'

export interface FieldProps {
  /** 校验失败态：控件上 aria-invalid=true，错误文案接入描述链并显示。 */
  invalid?: boolean
  /** 必填：控件上 aria-required=true。 */
  required?: boolean
  disabled?: boolean
  /** 只读：控件上 aria-readonly=true。与 disabled 不同，只读仍可聚焦、仍参与提交。 */
  readOnly?: boolean
  /** 控件 id；作者接管时以它为准。 */
  controlId?: string
  /**
   * 作者实际渲染了哪些部件，由适配器统计；省略即按都在场处理（服务端直出与挂载前）。
   * 不在场的部件不进控件的名字链与描述链：指向不存在的 id 会被判为无效引用。
   * description 渲染了但没有文字也按不在场处理。
   */
  parts?: FieldRenderedParts
}

/** 字段里哪些部件在场；某一项省略即按在场处理。 */
export interface FieldRenderedParts {
  label?: boolean
  description?: boolean
  errorText?: boolean
}

export interface FieldApi<T extends PropTypes = PropTypes> {
  invalid: boolean
  required: boolean
  disabled: boolean
  readOnly: boolean
  /** 控件实际使用的 id，label 的 for 与它一致。 */
  controlId: string
  /** 标签节点的 id。复合控件把它并入自身的名字链，字段的标签才能被朗读。 */
  labelId: string
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  /** 控件本身由作者渲染，这里只产出需要合并的属性。 */
  getControlProps: () => T['element']
  getDescriptionProps: () => T['element']
  getErrorTextProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface FieldTranslations {}
