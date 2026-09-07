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
