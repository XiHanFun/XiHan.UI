import type { PropTypes, Size } from '@xihan-ui/core'
import type { KbdTranslations } from '../kbd/kbd.types'
import type { HotkeySegment, HotkeysPlatform, HotkeysResolvedPlatform } from '../shared/hotkey'

export interface KbdGroupKeyProps {
  /** keys 中原样声明的那一枚键。 */
  value: string
}

export interface KbdGroupProps {
  /** 组合里的各枚键，例如 ['Mod', 'Shift', 'P']。 */
  keys: string[]
  /** 平台写法；auto 在适配器测出平台前按 other。 */
  platform?: HotkeysPlatform
  /** 尺寸：sm / md / lg。 */
  size?: Size
  /** 整组是否正在被真实动作激活；纯展示默认静止。 */
  pressed?: boolean
  /** 组合所提示的动作是否不可用。 */
  disabled?: boolean
  /** 读屏文案覆盖。 */
  translations?: Partial<KbdGroupTranslations>
}

export interface KbdGroupApi<T extends PropTypes = PropTypes> {
  /** 翻好的各枚键，顺序与 keys 一致。 */
  segments: readonly HotkeySegment[]
  /** 实际采用的平台写法。 */
  platform: HotkeysResolvedPlatform
  /** Mac 为空串，其余平台为 +。 */
  separator: string
  /** 按原始声明取回一枚键。 */
  segmentOf: (value: string) => HotkeySegment | null
  getRootProps: () => T['element']
  getKeyProps: (props: KbdGroupKeyProps) => T['element']
  getSeparatorProps: () => T['element']
}

export interface KbdGroupTranslations extends KbdTranslations {
  /** 整组快捷键的读法。 */
  hotkey: (names: readonly string[]) => string
}
