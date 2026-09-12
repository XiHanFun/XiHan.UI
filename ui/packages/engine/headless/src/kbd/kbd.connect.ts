import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { KbdApi, KbdProps } from './kbd.types'
import { dataAttr } from '@xihan-ui/core'
import { formatHotkey, resolveHotkeysPlatform } from '../shared/hotkey'
import { kbdAnatomy } from './kbd.anatomy'

const parts = kbdAnatomy.build()

/** 单枚 Kbd 的文本、平台语义与状态属性都在 Headless 投影。 */
export function connectKbd<T extends PropTypes>(
  props: KbdProps,
  normalize: NormalizeProps<T>,
): KbdApi<T> {
  if (typeof props.value !== 'string' || props.value === '')
    throw new TypeError('[xh] Kbd value 必须是非空字符串')
  const platform = resolveHotkeysPlatform(props.platform)
  const segment = formatHotkey([props.value], platform)[0]!
  const accessibleName = props.translations?.keyName?.(segment.key) ?? segment.name
  if (accessibleName.trim() === '')
    throw new TypeError('[xh] Kbd 的可读键名不能为空')

  return {
    segment,
    label: segment.label,
    platform,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': accessibleName,
      'data-platform': platform,
      'data-modifier': dataAttr(segment.modifier),
      'data-size': props.size,
      'data-pressed': dataAttr(props.pressed),
      'data-disabled': dataAttr(props.disabled),
    }),
  }
}
