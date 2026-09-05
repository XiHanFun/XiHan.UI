import type { ApprovalApi, ApprovalSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { approvalMachine, connectApproval } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = ApprovalSchema['props']

export interface ApprovalCallbacks {
  onDecision?: Props['onDecision']
  onGrantedScopesChange?: Props['onGrantedScopesChange']
  onNoteChange?: Props['onNoteChange']
}

export interface ApprovalContext {
  api: ComputedRef<ApprovalApi>
}

export function useApproval(props: Props, callbacks: ApprovalCallbacks = {}): ApprovalContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(approvalMachine, () => ({ ...props, ...callbacks }), scope)
  const api = computed(() => connectApproval(service, vueNormalize))
  return { api }
}
