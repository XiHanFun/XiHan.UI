import type { DownloadTriggerApi, DownloadTriggerSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectDownloadTrigger, downloadTriggerMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface DownloadTriggerContext {
  api: ComputedRef<DownloadTriggerApi>
}

// 不建 scope：connect 不派生任何 id
export function useDownloadTrigger(
  props: DownloadTriggerSchema['props'],
  callbacks: Pick<DownloadTriggerSchema['props'], 'onDownloadComplete' | 'onDownloadError'> = {},
): DownloadTriggerContext {
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(downloadTriggerMachine, () => ({ ...props, ...callbacks }))
  const api = computed(() => connectDownloadTrigger(service, vueNormalize))
  return { api }
}
