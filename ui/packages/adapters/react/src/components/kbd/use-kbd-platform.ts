import type { HotkeysPlatform } from '@xihan-ui/headless'
import { detectHotkeysPlatform } from '@xihan-ui/headless'
import { useEffect, useState } from 'react'

/** 浏览器平台侦测只属于适配器；Headless 仍只接显式平台事实。 */
export function useKbdPlatform(platform: HotkeysPlatform | undefined): HotkeysPlatform {
  const [detected, setDetected] = useState<HotkeysPlatform>('auto')
  useEffect(() => setDetected(detectHotkeysPlatform()), [])
  return platform && platform !== 'auto' ? platform : detected
}
