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
  // 退场窗口走完只是把节点收起，记录还在队列里；删记录归队列管。
  // 这根线由适配器自己接上：作者每写一条通知都要记得手动摘一次的话，
  // 漏掉的那条会永远占着队列的名额（贴着 max 时新通知直接进不来）。
  // 外面没有队列时注入拿到 null，单条使用的行为一点不变。
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
