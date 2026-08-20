import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { HotkeySegment } from './hotkeys.keys'
import type { HotkeysApi, HotkeysProps } from './hotkeys.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { hotkeysAnatomy } from './hotkeys.anatomy'
import { formatHotkey, isTypingTarget, matchesHotkey, resolveHotkeysPlatform } from './hotkeys.keys'

const parts = hotkeysAnatomy.build()

/**
 * Hotkeys 无状态机：显示什么、命中不命中，全由 props 算出来。
 *
 * 监听装在哪儿由适配器决定（headless 不碰 document），但要不要接这次按键、
 * 拦不拦默认动作、回调谁，全部收在 handleKeyDown 里，两个适配器不各判一遍。
 *
 * @example
 * // Mac 上铺出 ⌘ 与 S 两枚键帽，其余平台铺出 Ctrl + S
 * connectHotkeys({ keys: ['Mod', 'S'], platform: 'mac' }, normalize)
 */
export function connectHotkeys<T extends PropTypes>(
  props: HotkeysProps,
  normalize: NormalizeProps<T>,
): HotkeysApi<T> {
  const keys = props.keys ?? []
  const platform = resolveHotkeysPlatform(props.platform)
  const segments = formatHotkey(keys, platform)
  const enabled = props.enabled ?? true
  const preventDefault = props.preventDefault ?? true
  const target = props.target ?? 'document'
  // Mac 的写法里键帽直接连排，不写连接符；其余平台用加号
  const separator = platform === 'mac' ? '' : '+'

  const translations = props.translations
  const names = segments.map(segment => translations?.keyName?.(segment.key) ?? segment.name)
  const label = translations?.hotkey?.(names) ?? names.join(' + ')

  // 组合里除 Shift 外还有别的修饰键：这类组合与打字撞不上，输入框里也照样接
  const hasCommandModifier = segments.some(segment => segment.modifier && segment.key !== 'Shift')

  const segmentOf = (value: string): HotkeySegment | null =>
    segments.find(segment => segment.source === value) ?? null

  const matches = (event: KeyboardEvent): boolean => {
    // 输入法组合期的按键是给候选框用的，一律不接
    if (isComposingEvent(event))
      return false
    // 没有 Ctrl / Meta / Alt 参与的组合与打字撞车，落在输入区里就让给输入
    if (!hasCommandModifier && isTypingTarget(event.target))
      return false
    return matchesHotkey(event, keys, props.platform)
  }

  return {
    segments,
    platform,
    enabled,
    target,
    separator,
    segmentOf,
    matches,

    handleKeyDown: (event) => {
      if (!enabled || !matches(event))
        return
      if (preventDefault)
        event.preventDefault()
      props.onHotKey?.({ keys: [...keys], event })
    },

    // 一串符号连起来才是一个意思，逐枚念出来没有用：整块当一张图对外，
    // 名字由 aria-label 给，键帽与连接符因此都不进无障碍树。
    // 一枚键都翻不出来时不出 role：那会留下一张没有名字的图，读屏只念得出「图像」
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': segments.length === 0 ? undefined : 'img',
      'aria-label': segments.length === 0 ? undefined : label,
      'data-platform': platform,
      // 监听关掉时组合按不出来，键帽转成不可用的样子
      'data-disabled': dataAttr(!enabled),
      'data-size': props.size,
    }),

    getKeyProps: (key) => {
      const segment = segmentOf(key.value)
      return normalize.element({
        ...parts.key.attrs,
        // 修饰键与主键在键帽宽度与字重上分开处理
        'data-modifier': dataAttr(!!segment?.modifier),
      })
    },

    // 连接符是排版符号：Mac 的写法里没有它，此时这一格收起来
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      hidden: separator === '' || undefined,
    }),
  }
}
