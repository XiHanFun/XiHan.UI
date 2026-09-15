/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use kbd platform 相关实现。

import type { KbdPlatform } from '@xihan-ui/headless'
import type { Ref } from 'vue'
import { detectKbdPlatform } from '@xihan-ui/headless'
import { onMounted, ref } from 'vue'

/** 浏览器平台侦测只属于适配器；Headless 仍只接收显式平台事实。 */
export function useKbdPlatform(): Ref<KbdPlatform> {
  const detected = ref<KbdPlatform>('auto')
  onMounted(() => {
    detected.value = detectKbdPlatform()
  })
  return detected
}
