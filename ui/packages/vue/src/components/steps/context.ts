import type { StepsItemProps } from '@xihan-ui/headless'
import type { InjectionKey } from 'vue'
import type { StepsContext } from './use-steps'
import { inject, provide } from 'vue'

const KEY: InjectionKey<StepsContext> = Symbol('xh-steps')
/**
 * 条目身份下传给 trigger/indicator/title/description/separator。
 * 用 getter 而非快照，条目改 value/disabled 时才跟得上。
 */
const ITEM_KEY: InjectionKey<() => StepsItemProps> = Symbol('xh-steps-item')

export function provideSteps(ctx: StepsContext): void {
  provide(KEY, ctx)
}

export function useStepsContext(): StepsContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Steps 部件必须用在 XhStepsRoot 内')
  return ctx
}

export function provideStepsItem(item: () => StepsItemProps): void {
  provide(ITEM_KEY, item)
}

export function useStepsItem(): () => StepsItemProps {
  const item = inject(ITEM_KEY, null)
  if (!item)
    throw new Error('[xh] Steps 条目部件必须用在 XhStepsItem 内')
  return item
}
