/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 page header 类型契约。

import type { ControlVariant, PropTypes, Size } from '@xihan-ui/core'

export interface PageHeaderProps {
  /** 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 */
  size?: Size
  /** 在页头底部绘制一条分隔线，把页头与下方内容分开；有面的两档不画它，边界由描边承担。 */
  split?: boolean
  /** 形态：ghost 贴在页面底色上（默认），outline 为带描边的独立面，subtle 淡底。默认 ghost。 */
  variant?: ControlVariant
}

export interface PageHeaderApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  /** 面包屑位：整行排在标题之上。内容由作者决定，组件只划定位置。 */
  getBreadcrumbProps: () => T['element']
  getBackTriggerProps: () => T['element']
  /** 头像 / 图标位：排在返回位与标题之间，不随标题行换行。 */
  getMediaProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getExtraProps: () => T['element']
  getFooterProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface PageHeaderTranslations {}
