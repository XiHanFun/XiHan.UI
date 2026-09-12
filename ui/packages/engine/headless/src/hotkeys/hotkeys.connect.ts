import type { HotkeysApi, HotkeysProps } from './hotkeys.types'
import { isComposingEvent } from '@xihan-ui/core'
import { formatHotkey, isTypingTarget, matchesHotkey, resolveHotkeysPlatform } from '../shared/hotkey'

/**
 * Hotkeys 无状态机，也不产生 DOM：命中不命中全由 props 算出来。
 *
 * 监听装在哪儿由适配器决定（headless 不碰 document），但要不要接这次按键、
 * 拦不拦默认动作、回调谁，全部收在 handleKeyDown 里，两个适配器不各判一遍。
 *
 * @example connectHotkeys({ keys: ['Mod', 'S'], platform: 'mac' })
 */
export function connectHotkeys(props: HotkeysProps): HotkeysApi {
  const keys = props.keys
  if (!Array.isArray(keys) || keys.length === 0 || keys.some(key => typeof key !== 'string' || key === ''))
    throw new TypeError('[xh] Hotkeys keys 必须是非空且每项均为非空字符串的组合')
  const platform = resolveHotkeysPlatform(props.platform)
  const segments = formatHotkey(keys, platform)
  if (segments.filter(segment => !segment.modifier).length !== 1)
    throw new TypeError('[xh] Hotkeys keys 必须且只能包含一枚主键')
  const enabled = props.enabled ?? true
  const preventDefault = props.preventDefault ?? true
  const target = props.target ?? 'document'
  if (target !== 'document' && typeof target !== 'function')
    throw new TypeError('[xh] Hotkeys target 只能是 \'document\' 或返回 EventTarget 的函数')
  // 组合里除 Shift 外还有别的修饰键：这类组合与打字撞不上，输入框里也照样接
  const hasCommandModifier = segments.some(segment => segment.modifier && segment.key !== 'Shift')

  const matches = (event: KeyboardEvent): boolean => {
    // 输入法组合期的按键是给候选框用的，一律不接
    if (isComposingEvent(event))
      return false
    // 没有 Ctrl / Meta / Alt 参与的组合与打字撞车，落在输入区里就让给输入
    if (!hasCommandModifier && isTypingTarget(event.target))
      return false
    return matchesHotkey(event, keys, props.platform)
  }

  const resolveTarget = (documentTarget: EventTarget | null): EventTarget | null => {
    const resolved = target === 'document' ? documentTarget : target()
    if (resolved == null)
      return null
    const candidate = resolved as unknown as { addEventListener?: unknown, removeEventListener?: unknown }
    if (typeof candidate.addEventListener !== 'function' || typeof candidate.removeEventListener !== 'function')
      throw new TypeError('[xh] Hotkeys target resolver 必须返回可监听 keydown 的 EventTarget 或 null')
    return resolved
  }

  return {
    platform,
    enabled,
    target,
    resolveTarget,
    matches,

    handleKeyDown: (event) => {
      if (!enabled || !matches(event))
        return
      if (preventDefault)
        event.preventDefault()
      props.onHotKey?.({ keys: [...keys], event })
    },
  }
}
