import type { FileUploadApi, FileUploadSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectFileUpload, fileUploadMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FileUploadContext {
  api: ComputedRef<FileUploadApi>
}

export function useFileUpload(
  props: FileUploadSchema['props'],
  handlers: Pick<FileUploadSchema['props'], 'onFilesChange' | 'onFileAccept' | 'onFileReject' | 'onRemoteFilesChange' | 'onUploadComplete' | 'onUploadError'> = {},
): FileUploadContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 与隐藏输入不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(fileUploadMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectFileUpload(service, vueNormalize))
  return { api }
}
