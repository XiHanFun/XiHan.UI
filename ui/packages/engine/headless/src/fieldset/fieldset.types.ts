/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 fieldset 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/** 作者实际渲染了哪些部件；省略的一项按在场处理。 */
export interface FieldsetRenderedParts {
  description?: boolean
  errorText?: boolean
}

export interface FieldsetProps {
  /**
   * 整组禁用。root 是原生 `<fieldset>`，该条落为原生 disabled 属性，
   * 浏览器会把组内每个表单控件一并禁用（首个 `<legend>` 中的控件按 HTML 规范除外）。
   */
  disabled?: boolean
  /** 校验失败态：root 上写 data-invalid，错误文案接入描述链并显示。 */
  invalid?: boolean
  /**
   * 必填标记：落为 data-required，供皮肤给组标题加星号，校验仍由宿主负责。
   * 不产出 aria-required：该属性在 group 角色上不受支持，写入也不进入无障碍树。
   */
  required?: boolean
  /** 文案覆盖。本组件当前没有外露文案，保留该位，接全局配置的通道由适配器铺设。 */
  translations?: Partial<FieldsetTranslations>
  /**
   * 作者实际渲染了哪些部件，由适配器统计；省略即按都在场处理（服务端直出与挂载前）。
   * 不在场的部件不进 root 的描述链：指向不存在的 id 会被判为无效引用。
   * description 渲染了但读不出一句话（判断同 `hasNamingContent`）也按不在场处理。
   */
  parts?: FieldsetRenderedParts
}

export interface FieldsetApi<T extends PropTypes = PropTypes> {
  disabled: boolean
  invalid: boolean
  required: boolean
  getRootProps: () => T['element']
  getLegendProps: () => T['element']
  getDescriptionProps: () => T['element']
  /** 把并排的几个字段划为一段；纯排版，不承担分组语义（组名与描述归 root）。 */
  getFieldGroupProps: () => T['element']
  /** 组末尾的按钮行；纯排版。 */
  getActionsProps: () => T['element']
  getErrorTextProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface FieldsetTranslations {}
