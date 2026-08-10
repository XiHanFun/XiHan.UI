import type { QrCodeApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface QrCodeContext {
  api: ComputedRef<QrCodeApi>
}

const KEY: InjectionKey<QrCodeContext> = Symbol('xh-qr-code')

export function provideQrCode(ctx: QrCodeContext): void {
  provide(KEY, ctx)
}

export function useQrCodeContext(): QrCodeContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] QrCode 部件必须用在 XhQrCode 内')
  return ctx
}
