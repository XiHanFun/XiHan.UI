/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标题与说明两个可选部件在不在场：按作者写没写这两个角色节点判断。

import type { TitleDescriptionParts } from '@xihan-ui/headless'
import { hasNamingContent } from '@xihan-ui/headless'

/** 读不出一句话的说明按不在场处理。 */
export function renderedTitleDescription(title: HTMLElement | null, description: HTMLElement | null): TitleDescriptionParts {
  return { title: title != null, description: description != null && hasNamingContent(description) }
}
