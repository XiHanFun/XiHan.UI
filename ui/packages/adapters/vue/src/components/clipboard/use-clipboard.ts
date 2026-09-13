/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use clipboard 相关实现。

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
  const service = useMachine(clipboardMachine, () => ({ ...props, ...callbacks }))
  const api = computed(() => connectClipboard(service, vueNormalize))
  return { api }
}
