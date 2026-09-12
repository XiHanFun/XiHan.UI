import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { HotkeySegment } from '../shared/hotkey'
import type { KbdGroupApi, KbdGroupProps } from './kbd-group.types'
import { dataAttr } from '@xihan-ui/core'
import { formatHotkey, resolveHotkeysPlatform } from '../shared/hotkey'
import { kbdGroupAnatomy } from './kbd-group.anatomy'

const parts = kbdGroupAnatomy.build()

/** 完整组合的格式、连接符与组级唯一可访问名称。 */
export function connectKbdGroup<T extends PropTypes>(
  props: KbdGroupProps,
  normalize: NormalizeProps<T>,
): KbdGroupApi<T> {
  if (!Array.isArray(props.keys) || props.keys.length === 0 || props.keys.some(key => typeof key !== 'string' || key === ''))
    throw new TypeError('[xh] KbdGroup keys 必须是非空且每项均为非空字符串的组合')
  const platform = resolveHotkeysPlatform(props.platform)
  const segments = formatHotkey(props.keys, platform)
  const separator = platform === 'mac' ? '' : '+'
  const names = segments.map(segment => props.translations?.keyName?.(segment.key) ?? segment.name)
  const label = props.translations?.hotkey?.(names) ?? names.join(' + ')
  if (names.some(name => name.trim() === '') || label.trim() === '')
    throw new TypeError('[xh] KbdGroup 的逐键名称与整组可读名称不能为空')
  const segmentOf = (value: string): HotkeySegment | null =>
    segments.find(segment => segment.source === value) ?? null

  return {
    segments,
    platform,
    separator,
    segmentOf,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'img',
      'aria-label': label,
      'data-platform': platform,
      'data-size': props.size,
      'data-pressed': dataAttr(props.pressed),
      'data-disabled': dataAttr(props.disabled),
    }),
    // 子键帽与分隔符仅用于视觉；整组只由 root 的 aria-label 念一次。
    getKeyProps: (key) => {
      const segment = segmentOf(key.value)
      return normalize.element({
        ...parts.key.attrs,
        'aria-hidden': true,
        'data-modifier': dataAttr(!!segment?.modifier),
      })
    },
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': true,
      'hidden': separator === '' || undefined,
    }),
  }
}
