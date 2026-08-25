import type { ToastApi, ToastSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectToast, toastMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToastContext {
  api: ComputedRef<ToastApi>
}

export function useToast(
  props: ToastSchema['props'],
  onStatusChange?: ToastSchema['props']['onStatusChange'],
  onAction?: ToastSchema['props']['onAction'],
): ToastContext {
  const service = useMachine(toastMachine, () => ({ ...props, onStatusChange, onAction }))
  const api = computed(() => connectToast(service, vueNormalize))
  return { api }
}
