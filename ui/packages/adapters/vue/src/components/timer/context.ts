import type { InjectionKey } from 'vue'
import type { TimerContext } from './use-timer'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TimerContext> = Symbol.for('xh-timer')

export function provideTimer(ctx: TimerContext): void {
  provide(KEY, ctx)
}

export function useTimerContext(): TimerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Timer 部件必须用在 XhTimerRoot 内')
  return ctx
}
