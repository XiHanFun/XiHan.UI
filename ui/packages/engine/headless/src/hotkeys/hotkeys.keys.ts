// 快捷键的纯函数：把作者写的一组键翻成当前平台的写法，并判定一次按键有没有命中这组组合。
//
// 翻写与判定全程不读 navigator：服务端渲染时没有它，读了会炸；平台由适配器挂载后
// 调 detectHotkeysPlatform 测出来往下传。
import { isHTMLElement } from '@xihan-ui/kernel'

/** 平台写法。'auto' 表示还没测出来，由适配器挂载后换成实测值。 */
export type HotkeysPlatform = 'auto' | 'mac' | 'other'

/** 落定后的平台写法，只有两种。 */
export type HotkeysResolvedPlatform = 'mac' | 'other'

/** 归一化后的修饰键名，与 KeyboardEvent 上那四个开关一一对应。 */
type HotkeyModifier = 'Alt' | 'Control' | 'Meta' | 'Shift'

/** 一枚键翻好的几种写法。 */
export interface HotkeySegment {
  /** keys 里原样写的那个词；键帽部件按它认领自己是哪一枚。 */
  readonly source: string
  /** 归一化键名：修饰键是 Meta / Control / Alt / Shift，主键是 KeyboardEvent.key 的写法。 */
  readonly key: string
  /** 键帽上显示的字。 */
  readonly label: string
  /** 读屏念的名字，内建英文。 */
  readonly name: string
  /** 是不是修饰键。 */
  readonly modifier: boolean
}

/** 作者可以写的修饰键别名 → 归一化键名；'Mod' 留到定平台时再决定。 */
const MODIFIER_ALIAS: Record<string, HotkeyModifier | 'Mod'> = {
  alt: 'Alt',
  cmd: 'Meta',
  command: 'Meta',
  control: 'Control',
  ctrl: 'Control',
  meta: 'Meta',
  mod: 'Mod',
  opt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
  super: 'Meta',
  win: 'Meta',
}

/** 修饰键的键帽写法。 */
const MODIFIER_LABEL: Record<HotkeyModifier, Record<HotkeysResolvedPlatform, string>> = {
  Alt: { mac: '⌥', other: 'Alt' },
  Control: { mac: '⌃', other: 'Ctrl' },
  Meta: { mac: '⌘', other: 'Win' },
  Shift: { mac: '⇧', other: 'Shift' },
}

/** 修饰键读屏念的名字：同一枚键在两个平台上的叫法不一样。 */
const MODIFIER_NAME: Record<HotkeyModifier, Record<HotkeysResolvedPlatform, string>> = {
  Alt: { mac: 'Option', other: 'Alt' },
  Control: { mac: 'Control', other: 'Control' },
  Meta: { mac: 'Command', other: 'Windows' },
  Shift: { mac: 'Shift', other: 'Shift' },
}

/** 主键别名 → KeyboardEvent.key 的写法。 */
const KEY_ALIAS: Record<string, string> = {
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  arrowup: 'ArrowUp',
  backspace: 'Backspace',
  del: 'Delete',
  delete: 'Delete',
  down: 'ArrowDown',
  enter: 'Enter',
  esc: 'Escape',
  escape: 'Escape',
  left: 'ArrowLeft',
  return: 'Enter',
  right: 'ArrowRight',
  space: ' ',
  tab: 'Tab',
  up: 'ArrowUp',
}

/** 主键的键帽写法；表里没有的键（字母、数字、标点）直接用大写形式。 */
const KEY_LABEL: Record<string, Record<HotkeysResolvedPlatform, string>> = {
  ' ': { mac: 'Space', other: 'Space' },
  'ArrowDown': { mac: '↓', other: '↓' },
  'ArrowLeft': { mac: '←', other: '←' },
  'ArrowRight': { mac: '→', other: '→' },
  'ArrowUp': { mac: '↑', other: '↑' },
  'Backspace': { mac: '⌫', other: 'Backspace' },
  'Delete': { mac: '⌦', other: 'Del' },
  'Enter': { mac: '⏎', other: 'Enter' },
  'Escape': { mac: '⎋', other: 'Esc' },
  'Tab': { mac: '⇥', other: 'Tab' },
}

/** 主键读屏念的名字；表里没有的键用大写形式，单个字母正好读成字母本身。 */
const KEY_NAME: Record<string, string> = {
  ' ': 'Space',
  'ArrowDown': 'Arrow Down',
  'ArrowLeft': 'Arrow Left',
  'ArrowRight': 'Arrow Right',
  'ArrowUp': 'Arrow Up',
  'Backspace': 'Backspace',
  'Delete': 'Delete',
  'Enter': 'Enter',
  'Escape': 'Escape',
  'Tab': 'Tab',
}

/** 不接受打字的输入类型：这些控件按键盘不产生文字，单键组合落在它们身上不算打字。 */
const NON_TYPING_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/**
 * 查一张别名表。
 * 只认表上自己写的那些键：`constructor`、`__proto__` 这类名字在任何对象字面量上都取得到值，
 * 直查会把 Object.prototype 上的成员当成一枚键，后面按它取写法就崩了。
 */
function lookup<T>(table: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined
}

/**
 * 测一次当前平台。
 *
 * 只在浏览器里、组件挂载之后调用：服务端渲染那一帧没有 navigator。两个适配器共用这一份，
 * 各自拷一份会漂移成「同一组合在 Vue 页面和 WC 页面上显示不同的修饰键」。
 */
export function detectHotkeysPlatform(): HotkeysResolvedPlatform {
  const nav = globalThis.navigator as (Navigator & { userAgentData?: { platform?: string } }) | undefined
  const raw = nav?.userAgentData?.platform ?? nav?.platform ?? ''
  return /mac|iphone|ipad|ipod/i.test(raw) ? 'mac' : 'other'
}

/**
 * 定下按哪个平台的写法出。
 * 'auto' 是「还没测出来」而不是一种平台，未落定前一律按非 Mac 出：符号写法只有 Mac 认得。
 */
export function resolveHotkeysPlatform(platform: HotkeysPlatform | undefined): HotkeysResolvedPlatform {
  return platform === 'mac' ? 'mac' : 'other'
}

/** 'Mod' 落到本平台的那一枚修饰键：Mac 上是 ⌘，其余平台是 Ctrl。 */
function resolveMod(platform: HotkeysResolvedPlatform): HotkeyModifier {
  return platform === 'mac' ? 'Meta' : 'Control'
}

/** 单个词翻成一枚键。 */
function toSegment(source: string, platform: HotkeysResolvedPlatform): HotkeySegment {
  const alias = lookup(MODIFIER_ALIAS, source.toLowerCase())
  if (alias) {
    const key = alias === 'Mod' ? resolveMod(platform) : alias
    return {
      source,
      key,
      label: MODIFIER_LABEL[key][platform],
      name: MODIFIER_NAME[key][platform],
      modifier: true,
    }
  }
  const key = lookup(KEY_ALIAS, source.toLowerCase()) ?? source
  return {
    source,
    key,
    label: lookup(KEY_LABEL, key)?.[platform] ?? key.toUpperCase(),
    name: lookup(KEY_NAME, key) ?? key.toUpperCase(),
    modifier: false,
  }
}

/**
 * 把一组键翻成当前平台的写法，顺序与 keys 一致。
 *
 * @example
 * // Mac 上出 ⌘ 与 S 两枚键帽
 * formatHotkey(['Mod', 's'], 'mac')
 * // 其余平台上同一组出 Ctrl 与 S
 * formatHotkey(['Mod', 's'], 'other')
 */
export function formatHotkey(
  keys: readonly string[] | undefined,
  platform?: HotkeysPlatform,
): readonly HotkeySegment[] {
  const resolved = resolveHotkeysPlatform(platform)
  // 空串翻不出任何键，留着会铺出一枚没有字的键帽
  return (keys ?? []).filter(key => typeof key === 'string' && key !== '').map(key => toSegment(key, resolved))
}

/**
 * 主键是否被按下。
 *
 * 先比 event.key，再回退到物理键位：Mac 上按住 ⌥ 会改写 event.key（⌥S 出的是 ß），
 * 只比 key 的话带 Alt 的组合在 Mac 上永远命中不了。
 */
function hitsMainKey(event: KeyboardEvent, key: string): boolean {
  if (event.key.toLowerCase() === key.toLowerCase())
    return true
  if (/^[a-z]$/i.test(key))
    return event.code === `Key${key.toUpperCase()}`
  if (/^\d$/.test(key))
    return event.code === `Digit${key}`
  return false
}

/**
 * 这次按键是不是恰好命中这组组合。
 *
 * 四个修饰键逐个全等比，不是「至少按了」：那样 Ctrl+Shift+S 会同时命中 Ctrl+S，
 * 两条快捷键就分不开了。组合里没有主键（只写了修饰键）或有两个主键时一律不命中——那种组合按不出来。
 */
export function matchesHotkey(
  event: KeyboardEvent,
  keys: readonly string[] | undefined,
  platform?: HotkeysPlatform,
): boolean {
  const segments = formatHotkey(keys, platform)
  const mains = segments.filter(segment => !segment.modifier)
  if (mains.length !== 1)
    return false
  const modifiers = new Set(segments.filter(segment => segment.modifier).map(segment => segment.key))
  if (event.metaKey !== modifiers.has('Meta'))
    return false
  if (event.ctrlKey !== modifiers.has('Control'))
    return false
  if (event.altKey !== modifiers.has('Alt'))
    return false
  if (event.shiftKey !== modifiers.has('Shift'))
    return false
  return hitsMainKey(event, mains[0]!.key)
}

/**
 * 按键落点是不是正在打字的地方（输入框、文本域、下拉、可编辑区）。
 *
 * 只在事件处理器里调用，那时节点确实在场。复选框、单选、按钮这类输入不算：
 * 它们按键盘不产生文字。
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!isHTMLElement(target))
    return false
  if (target.isContentEditable)
    return true
  const tag = target.tagName.toLowerCase()
  if (tag === 'textarea' || tag === 'select')
    return true
  if (tag !== 'input')
    return false
  return !NON_TYPING_INPUT_TYPES.has((target as HTMLInputElement).type)
}
