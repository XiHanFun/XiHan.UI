import type { PropTypes, Size } from '@xihan-ui/core'
import type { HotkeySegment, HotkeysPlatform, HotkeysResolvedPlatform } from '../shared/hotkey'

export interface KbdProps {
  /** 一枚键的声明，例如 Mod、Shift、Esc 或 S。 */
  value: string
  /** 平台写法；auto 在适配器测出平台前按 other。 */
  platform?: HotkeysPlatform
  /** 尺寸：sm / md / lg。 */
  size?: Size
  /** 这枚键是否正在被真实动作激活；纯展示默认静止。 */
  pressed?: boolean
  /** 这枚键所提示的动作是否不可用。 */
  disabled?: boolean
  /** 读屏键名覆盖。 */
  translations?: Partial<KbdTranslations>
}

export interface KbdApi<T extends PropTypes = PropTypes> {
  /** 归一化后的键。 */
  segment: HotkeySegment
  /** 键帽可见文本。 */
  label: string
  /** 实际采用的平台写法。 */
  platform: HotkeysResolvedPlatform
  getRootProps: () => T['element']
}

export interface KbdTranslations {
  /** 读屏怎么念这枚归一化后的键。 */
  keyName: (key: string) => string
}
