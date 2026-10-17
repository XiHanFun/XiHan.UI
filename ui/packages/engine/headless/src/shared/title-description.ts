/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标题与说明两个可选部件在不在场：浮层与提示类组件只引用在场的部件。

/** 标题与说明两个可选部件在不在场，由适配器统计；某一项省略即按在场处理（服务端直出与挂载前）。 */
export interface TitleDescriptionParts {
  title?: boolean
  description?: boolean
}
