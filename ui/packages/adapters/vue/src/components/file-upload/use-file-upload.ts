/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use file upload 相关实现。

import type { FileUploadApi, FileUploadSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectFileUpload, fileUploadMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FileUploadContext {
  /**
   * 已渲染的 label 部件数量，由 XhFileUploadLabel 在 setup 里同步登记、卸载时撤销。
   * 可聚焦部件的 aria-labelledby 据此决定指不指过去：label 排在输入之前时，首帧与服务端直出就带上名字。
   */
  labelCount: Ref<number>
  api: ComputedRef<FileUploadApi>
}

export function useFileUpload(
  props: FileUploadSchema['props'],
  handlers: Pick<FileUploadSchema['props'], 'onFilesChange' | 'onFileAccept' | 'onFileReject' | 'onRemoteFilesChange' | 'onUploadComplete' | 'onUploadError' | 'onUploadCancel'> = {},
): FileUploadContext {
  // scope id 走 Vue 的 useId，保证同页多实例的 IDREF 与隐藏输入不相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const labelCount = ref(0)
  const service = useMachine(fileUploadMachine, () => ({ ...props, labelled: labelCount.value > 0, ...handlers }), scope)
  const api = computed(() => connectFileUpload(service, vueNormalize))
  return { labelCount, api }
}
