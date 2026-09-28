/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { ComponentMeta } from '../spec/types'

// text 与 trigger 不进必需表：正文里的引用常随流式正文到达（流式正文的行内挂点），首帧一个引用都没有是真实首帧；
// 只列来源、正文由流式正文承担时也没有 text 部件。
export const citationMeta: ComponentMeta = {
  component: 'citation',
  requiredParts: ['root', 'preview', 'preview-title', 'list', 'source', 'source-link'],
}
