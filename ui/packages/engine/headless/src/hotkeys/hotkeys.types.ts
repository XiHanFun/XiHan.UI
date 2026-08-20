import type { PropTypes, Size } from '@xihan-ui/kernel'
import type { HotkeySegment, HotkeysPlatform, HotkeysResolvedPlatform } from './hotkeys.keys'

/** 监听装在哪儿：整篇文档，还是只在组件所在的那一层父节点里。 */
export type HotkeysTarget = 'document' | 'parent'

/** 组合被按出来时带出的信息。 */
export interface HotkeysTriggerDetails {
  /** 命中的组合，即 keys 原样。 */
  keys: string[]
  /** 命中的那次按键；作者据它再判断，或自行 stopPropagation。 */
  event: KeyboardEvent
}

/** 一枚键帽自报家门：值就是它在 keys 里原样写的那个词。 */
export interface HotkeysKeyProps {
  value: string
}

export interface HotkeysProps {
  /**
   * 组合里的各枚键，如 `['Mod', 'S']`。
   * 'Mod' 在 Mac 上是 ⌘、其余平台是 Ctrl；'Shift' / 'Alt' / 'Ctrl' / 'Meta' 各自对应那一枚。
   * 除修饰键外只能有一枚主键，多写的组合按不出来，也就永远不会命中。
   */
  keys?: string[]
  /**
   * 按哪个平台的写法显示与解析。
   * 缺省 'auto'：读 navigator 会在服务端渲染时炸，所以 headless 只认显式值，
   * 由适配器挂载后测出来传进来；未落定前按非 Mac 出。
   */
  platform?: HotkeysPlatform
  /** 监听装在哪儿，缺省 'document'。 */
  target?: HotkeysTarget
  /** 命中后拦下浏览器的默认动作，缺省开启（注册 Mod+S 就是为了不让浏览器弹保存）。 */
  preventDefault?: boolean
  /** 监听是否生效，缺省开启；关掉后组合不再触发，键帽也转成不可用的样子。 */
  enabled?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  /** 读屏文案覆盖。 */
  translations?: Partial<HotkeysTranslations>
  /** 组合被按出来时的回调。 */
  onHotKey?: (details: HotkeysTriggerDetails) => void
}

export interface HotkeysApi<T extends PropTypes = PropTypes> {
  /** 翻好的各枚键，顺序与 keys 一致；适配器照着它铺键帽。 */
  segments: readonly HotkeySegment[]
  /** 实际采用的平台写法。 */
  platform: HotkeysResolvedPlatform
  /** 监听当前是否生效。 */
  enabled: boolean
  /** 监听该装在哪儿，适配器据此挑节点。 */
  target: HotkeysTarget
  /** 两枚键帽之间的连接符；Mac 的写法里键帽直接连排，此时是空串。 */
  separator: string
  /** 按 keys 里原样写的那个词取回这枚键；没有这枚键时为 null。 */
  segmentOf: (value: string) => HotkeySegment | null
  /** 这次按键是否命中本组合（含输入法组合期与打字落点的排除）。 */
  matches: (event: KeyboardEvent) => boolean
  /** 适配器把它挂到监听节点的 keydown 上：命中即按 preventDefault 决定拦不拦，并回调 onHotKey。 */
  handleKeyDown: (event: KeyboardEvent) => void
  getRootProps: () => T['element']
  getKeyProps: (props: HotkeysKeyProps) => T['element']
  getSeparatorProps: () => T['element']
}

/** 读屏用的文案，默认英文。 */
export interface HotkeysTranslations {
  /** 每一枚键读屏念什么：键帽上是 ⌘ ⇧ 这类符号，读屏念不出它们。传入的是归一化后的键名。 */
  keyName: (key: string) => string
  /** 整组组合的读法：把各枚键的名字拼成一句，落在 root 的 aria-label 上。 */
  hotkey: (names: readonly string[]) => string
}
