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
  handlers: Pick<FileUploadSchema['props'], 'onFilesChange' | 'onFileAccept' | 'onFileReject'> = {},
): FileUploadContext {
  // scope id 走 Vue 的 useId：label 的 for 与投放区的 aria-labelledby 都是 IDREF，
  // 更要紧的是机器打开选择框时按 id 找隐藏输入——同页两个上传控件拿到同一份 id，
  // 点这个控件会弹出另一个控件的文件选择框
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(fileUploadMachine, () => ({ ...props, ...handlers }), scope)
  const api = computed(() => connectFileUpload(service, vueNormalize))
  return { api }
}
