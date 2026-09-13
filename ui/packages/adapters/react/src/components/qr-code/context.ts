/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { QrCodeApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface QrCodeContext {
  api: QrCodeApi
}

const Ctx = createContext<QrCodeContext | undefined>(undefined)

export const QrCodeProvider = Ctx

export function useQrCodeContext(): QrCodeContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhQrCode 的部件要放在 XhQrCode 里')
  return ctx
}
