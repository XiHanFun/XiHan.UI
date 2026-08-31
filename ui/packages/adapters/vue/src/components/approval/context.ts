import type { InjectionKey } from 'vue'
import type { ApprovalContext } from './use-approval'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ApprovalContext> = Symbol.for('xh-approval')

export function provideApproval(ctx: ApprovalContext): void {
  provide(KEY, ctx)
}

export function useApprovalContext(): ApprovalContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Approval 部件必须用在 XhApprovalRoot 内')
  return ctx
}
