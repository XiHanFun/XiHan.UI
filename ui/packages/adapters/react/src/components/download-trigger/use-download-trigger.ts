import type { Service } from '@xihan-ui/core'
import type { DownloadTriggerApi, DownloadTriggerSchema } from '@xihan-ui/headless'
import { connectDownloadTrigger, downloadTriggerMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface DownloadTriggerContext {
  api: DownloadTriggerApi
  service: Service<DownloadTriggerSchema>
}

// 不建 scope：connect 不派生任何 id
export function useDownloadTrigger(props: DownloadTriggerSchema['props']): DownloadTriggerContext {
  const service = useMachine(downloadTriggerMachine, () => props)
  return { api: connectDownloadTrigger(service, reactNormalize), service }
}
