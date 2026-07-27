import type { ClipboardApi, ClipboardSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { clipboardMachine, connectClipboard } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ClipboardContext {
  api: ComputedRef<ClipboardApi>
}

export function useClipboard(
  props: ClipboardSchema['props'],
  callbacks: Pick<ClipboardSchema['props'], 'onStatusChange' | 'onCopyError'> = {},
): ClipboardContext {
  // 两个回调由外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(clipboardMachine, () => ({ ...props, ...callbacks }))
  const api = computed(() => connectClipboard(service, vueNormalize))
  return { api }
}
