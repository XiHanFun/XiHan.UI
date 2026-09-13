/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 highlight 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 包住整段文本，mark 是命中关键词的那一小段；mark 有几个由文本与关键词算出来。
export const highlightAnatomy = createAnatomy('highlight', ['root', 'mark'])
