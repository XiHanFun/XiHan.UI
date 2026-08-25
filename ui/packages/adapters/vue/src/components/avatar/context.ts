import type { InjectionKey } from 'vue'
import type { AvatarContext } from './use-avatar'
import { inject, provide } from 'vue'

const KEY: InjectionKey<AvatarContext> = Symbol.for('xh-avatar')

export function provideAvatar(ctx: AvatarContext): void {
  provide(KEY, ctx)
}

export function useAvatarContext(): AvatarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Avatar 部件必须用在 XhAvatarRoot 内')
  return ctx
}
