/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 rating 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 是包住标题、星星与表单影子的外壳，control 是承载键盘与 aria 关系的 role=radiogroup 星星带。
export const ratingAnatomy = createAnatomy('rating', ['root', 'label', 'control', 'value-text', 'item', 'hidden-input'])
