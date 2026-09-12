import type { HotkeysPlatform } from '@xihan-ui/headless'
import type { Ref } from 'vue'
import { detectHotkeysPlatform } from '@xihan-ui/headless'
import { onMounted, ref } from 'vue'

/** 浏览器平台侦测只属于适配器；Headless 仍只接显式平台事实。 */
export function useKbdPlatform(): Ref<HotkeysPlatform> {
  const detected = ref<HotkeysPlatform>('auto')
  onMounted(() => {
    detected.value = detectHotkeysPlatform()
  })
  return detected
}
