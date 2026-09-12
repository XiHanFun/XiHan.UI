import type { HotkeysPlatform, HotkeysProps, HotkeysTarget } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { useHotkeys } from './use-hotkeys'

export interface XhHotkeysProps {
  keys: string[]
  platform?: HotkeysPlatform
  target?: HotkeysTarget
  preventDefault?: boolean
  enabled?: boolean
  onHotKey?: HotkeysProps['onHotKey']
}

/**
 * 只注册一组快捷键，不渲染 DOM。需要可见提示时另行组合 XhKbdGroup。
 */
export function XhHotkeys(props: XhHotkeysProps): ReactNode {
  useHotkeys(props)
  return null
}

XhHotkeys.xhEvents = ['hot-key'] as const
