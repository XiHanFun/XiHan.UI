/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// item-description 是条目文案下方的说明行，card 形态里最常用
export const radioGroupAnatomy = createAnatomy('radio-group', ['root', 'label', 'item', 'item-text', 'item-description', 'indicator', 'hidden-input'])
