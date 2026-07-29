import type { ToastApi, ToastSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectToast, toastMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useToasterContextOptional } from '../toaster/context'

export interface ToastContext {
  api: ComputedRef<ToastApi>
}

export function useToast(
  props: ToastSchema['props'],
  onStatusChange?: ToastSchema['props']['onStatusChange'],
  onAction?: ToastSchema['props']['onAction'],
): ToastContext {
  // 退场后由适配器回队列删记录；外层无队列时注入为 null
  const toaster = useToasterContextOptional()
  const notifyStatus: ToastSchema['props']['onStatusChange'] = (details) => {
    onStatusChange?.(details)
    if (details.status === 'unmounted')
      toaster?.dismiss(details.id)
  }
  const service = useMachine(toastMachine, () => ({ ...props, onStatusChange: notifyStatus, onAction }))
  const api = computed(() => connectToast(service, vueNormalize))
  return { api }
}
