import type { TransferApi, TransferSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectTransfer, transferMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TransferContext {
  api: ComputedRef<TransferApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<TransferSchema>
}

export function useTransfer(
  props: TransferSchema['props'],
  handlers: Pick<TransferSchema['props'], 'onValueChange' | 'onSelectedChange'> = {},
): TransferContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 两侧集合全由 collection + value + 搜索串推导，适配器不必注入 refs
  const service = useMachine(transferMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectTransfer(service, vueNormalize))
  return { api, service }
}
