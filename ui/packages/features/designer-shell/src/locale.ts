/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-shell/locale —— 设计器零件的中文文案。各产品把它并进自己的语言包，宿主只合并一份产品包。

import type { XhConfig } from '@xihan-ui/web-components'
import type {} from './translations'

/** 设计器零件的中文文案。 */
export const designerShellZhCN: XhConfig = {
  translations: {
    'xh-designer-properties': {
      title: '属性',
      empty: '没有可编辑的属性',
      mixed: '多个值',
      invalidJson: '不是合法的 JSON',
    },
    'xh-designer-issues': {
      title: '问题',
      empty: '没有问题',
      errors: count => `${count} 个错误`,
      warnings: count => `${count} 个警告`,
      severityError: '错误',
      severityWarning: '警告',
      filter: '按严重程度显示问题',
    },
  },
}
