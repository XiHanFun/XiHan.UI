/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 qr code 相关实现。

import type { ComponentMeta } from '../spec/types'

export const qrCodeMeta: ComponentMeta = {
  // logo 可选：没写这个部件时整张码照画，root 上也不落 data-logo
  component: 'qr-code',
  requiredParts: ['root'],
}
