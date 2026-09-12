import type { HotkeysPlatform, HotkeysResolvedPlatform } from '../shared/hotkey'

/**
 * 监听装在哪儿。缺省 document；局部作用域由作者显式返回真实 EventTarget。
 *
 * Hotkeys 不再渲染宿主节点，因此不存在可供适配器猜测的“组件父节点”。
 */
export type HotkeysTarget = 'document' | (() => EventTarget | null)

/** 组合被按出来时带出的信息。 */
export interface HotkeysTriggerDetails {
  /** 命中的组合，即 keys 原样。 */
  keys: string[]
  /** 命中的那次按键；作者据它再判断，或自行 stopPropagation。 */
  event: KeyboardEvent
}

export interface HotkeysProps {
  /**
   * 组合里的各枚键，如 `['Mod', 'S']`。
   * 'Mod' 在 Mac 上是 ⌘、其余平台是 Ctrl；'Shift' / 'Alt' / 'Ctrl' / 'Meta' 各自对应那一枚。
   * 除修饰键外必须且只能有一枚主键；空组合、空键或多主键声明直接报错。
   */
  keys: string[]
  /**
   * 按哪个平台解析匹配。
   * 缺省 'auto'：读 navigator 会在服务端渲染时炸，所以 headless 只认显式值，
   * 由适配器挂载后测出来传进来；未落定前按非 Mac 出。
   */
  platform?: HotkeysPlatform
  /** 监听装在哪儿，缺省 'document'；局部监听传返回 EventTarget 的函数。 */
  target?: HotkeysTarget
  /** 命中后拦下浏览器的默认动作，缺省开启（注册 Mod+S 就是为了不让浏览器弹保存）。 */
  preventDefault?: boolean
  /** 监听是否生效，缺省开启；关掉后组合不再触发。 */
  enabled?: boolean
  /** 组合被按出来时的回调。 */
  onHotKey?: (details: HotkeysTriggerDetails) => void
}

export interface HotkeysApi {
  /** 实际采用的平台写法。 */
  platform: HotkeysResolvedPlatform
  /** 监听当前是否生效。 */
  enabled: boolean
  /** 监听该装在哪儿，适配器据此挑节点。 */
  target: HotkeysTarget
  /** 解析并校验真实监听目标；适配器只负责提供所属 Document，不各自复制判断。 */
  resolveTarget: (documentTarget: EventTarget | null) => EventTarget | null
  /** 这次按键是否命中本组合（含输入法组合期与打字落点的排除）。 */
  matches: (event: KeyboardEvent) => boolean
  /** 适配器把它挂到监听节点的 keydown 上：命中即按 preventDefault 决定拦不拦，并回调 onHotKey。 */
  handleKeyDown: (event: KeyboardEvent) => void
}
