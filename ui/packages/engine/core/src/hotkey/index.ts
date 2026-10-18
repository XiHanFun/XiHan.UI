/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/hotkey —— 快捷键：键数组的归一、按平台的写法、按键是否命中、与 aria-keyshortcuts 互转，以及键名表的查法。
//
// 翻写与判定全程不读 navigator：服务端渲染时没有它，读了会炸；平台由调用方挂载后
// 调 detectKbdPlatform 测出来往下传。

/** 平台键名：auto 表示还没测出来。 */
export type KbdPlatform = 'auto' | 'mac' | 'other'

/** 落定后的平台写法，只有两种。 */
export type KbdResolvedPlatform = 'mac' | 'other'

/** 一枚键翻好的几种写法。 */
export interface HotkeySegment {
  /** keys 里原样写的那个词；键帽部件按它认领自己是哪一枚。 */
  readonly source: string
  /** 归一化键名：修饰键是 Meta / Control / Alt / Shift，主键是 KeyboardEvent.key 的写法。 */
  readonly key: string
  /** 键帽上显示的字，取自 text。 */
  readonly label: string
  /** 读屏念的名字，取自 text。 */
  readonly name: string
  /** 是不是修饰键。 */
  readonly modifier: boolean
}

/** 键名与键帽字。key 是归一化键名：修饰键是 Meta / Control / Alt / Shift，主键是 KeyboardEvent.key 的写法。 */
export interface HotkeyText {
  /** 一枚键读屏念的名字；同一枚修饰键在两个平台上叫法不同，按 platform 取。 */
  readonly keyName: (key: string, platform: KbdResolvedPlatform) => string
  /** 一枚键帽上显示的字。 */
  readonly keyLabel: (key: string, platform: KbdResolvedPlatform) => string
}

/** 判定命中要看的按键字段；KeyboardEvent 天然满足。 */
export interface HotkeyEvent {
  readonly key: string
  readonly code: string
  readonly altKey: boolean
  readonly ctrlKey: boolean
  readonly metaKey: boolean
  readonly shiftKey: boolean
}

/** 一张键名表：同一枚键在两个平台上叫法不同时写成 { mac, other }。 */
export type KeyTextTable = Readonly<Record<string, string | { readonly mac: string, readonly other: string }>>

/** 按归一化键名查表；表里没有的键（字母、数字、标点）用大写形式，单个字母正好读成字母本身。 */
export function keyText(table: KeyTextTable, key: string, platform: KbdResolvedPlatform): string {
  const hit = Object.hasOwn(table, key) ? table[key] : undefined
  if (hit === undefined)
    return key.toUpperCase()
  return typeof hit === 'string' ? hit : hit[platform]
}

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME_EN_US: KeyTextTable = {
  'Alt': { mac: 'Option', other: 'Alt' },
  'Control': 'Control',
  'Meta': { mac: 'Command', other: 'Windows' },
  'Shift': 'Shift',
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

/** 键帽上写的字：Mac 用系统符号。 */
const KEY_LABEL_EN_US: KeyTextTable = {
  'Alt': { mac: '⌥', other: 'Alt' },
  'Control': { mac: '⌃', other: 'Ctrl' },
  'Meta': { mac: '⌘', other: 'Win' },
  'Shift': { mac: '⇧', other: 'Shift' },
  ' ': 'Space',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'ArrowUp': '↑',
  'Backspace': { mac: '⌫', other: 'Backspace' },
  'Delete': { mac: '⌦', other: 'Del' },
  'Enter': { mac: '⏎', other: 'Enter' },
  'Escape': { mac: '⎋', other: 'Esc' },
  'Tab': { mac: '⇥', other: 'Tab' },
}

/** 英文的键名与键帽字，formatHotkey 没给 text 时用它。 */
export const HOTKEY_TEXT_EN_US: HotkeyText = {
  keyName: (key, platform) => keyText(KEY_NAME_EN_US, key, platform),
  keyLabel: (key, platform) => keyText(KEY_LABEL_EN_US, key, platform),
}

/** 归一化后的修饰键名，与 KeyboardEvent 上那四个开关一一对应。 */
type HotkeyModifier = 'Alt' | 'Control' | 'Meta' | 'Shift'

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
 * 只在浏览器里、挂载之后调用：服务端渲染那一帧没有 navigator。各端共用这一份，
 * 各自拷一份会漂移成「同一组合在不同页面上显示不同的修饰键」。
 */
export function detectKbdPlatform(): KbdResolvedPlatform {
  const nav = globalThis.navigator as (Navigator & { userAgentData?: { platform?: string } }) | undefined
  const raw = nav?.userAgentData?.platform ?? nav?.platform ?? ''
  return /mac|iphone|ipad|ipod/i.test(raw) ? 'mac' : 'other'
}

/**
 * 定下按哪个平台的写法出。
 * 'auto' 是「还没测出来」而不是一种平台，未落定前一律按非 Mac 出：符号写法只有 Mac 认得。
 */
export function resolveKbdPlatform(platform: KbdPlatform | undefined): KbdResolvedPlatform {
  return platform === 'mac' ? 'mac' : 'other'
}

/** 'Mod' 落到本平台的那一枚修饰键：Mac 上是 ⌘，其余平台是 Ctrl。 */
function resolveMod(platform: KbdResolvedPlatform): HotkeyModifier {
  return platform === 'mac' ? 'Meta' : 'Control'
}

/** 单个词翻成一枚键。 */
function toSegment(source: string, platform: KbdResolvedPlatform, text: HotkeyText): HotkeySegment {
  const alias = lookup(MODIFIER_ALIAS, source.toLowerCase())
  if (alias) {
    const key = alias === 'Mod' ? resolveMod(platform) : alias
    return {
      source,
      key,
      label: text.keyLabel(key, platform),
      name: text.keyName(key, platform),
      modifier: true,
    }
  }
  const key = lookup(KEY_ALIAS, source.toLowerCase()) ?? source
  return {
    source,
    key,
    label: text.keyLabel(key, platform),
    name: text.keyName(key, platform),
    modifier: false,
  }
}

/**
 * 把一组键翻成当前平台的写法，顺序与 keys 一致。键名与键帽字取 text，缺省是英文。
 *
 * @example
 * // Mac 上出 ⌘ 与 S 两枚键帽
 * formatHotkey(['Mod', 's'], 'mac')
 * // 其余平台上同一组出 Ctrl 与 S
 * formatHotkey(['Mod', 's'], 'other')
 */
export function formatHotkey(
  keys: readonly string[] | undefined,
  platform?: KbdPlatform,
  text: HotkeyText = HOTKEY_TEXT_EN_US,
): readonly HotkeySegment[] {
  const resolved = resolveKbdPlatform(platform)
  // 空串翻不出任何键，留着会铺出一枚没有字的键帽
  return (keys ?? []).filter(key => typeof key === 'string' && key !== '').map(key => toSegment(key, resolved, text))
}

/**
 * 一组键在给定平台上显示成的一串字：Mac 上键帽字连写（⌘⇧Z），其余平台用 + 连（Ctrl+Shift+Z）。键帽字取 text，缺省是英文。
 */
export function formatHotkeyLabel(
  keys: readonly string[] | undefined,
  platform?: KbdPlatform,
  text: HotkeyText = HOTKEY_TEXT_EN_US,
): string {
  const resolved = resolveKbdPlatform(platform)
  return formatHotkey(keys, resolved, text).map(segment => segment.label).join(resolved === 'mac' ? '' : '+')
}

/** aria-keyshortcuts 认的四个修饰键名。 */
const ARIA_MODIFIERS = new Set<string>(['Alt', 'Control', 'Meta', 'Shift'])

/** 主键里在 aria-keyshortcuts 中另起名字的两枚：空格是条目分隔、加号是键名分隔。 */
const ARIA_KEY_NAME: Record<string, string> = { ' ': 'Space', '+': 'Plus' }
const ARIA_KEY_VALUE: Record<string, string> = { Space: ' ', Plus: '+' }

/**
 * 一组键写成 aria-keyshortcuts 的一条：修饰键写 Alt / Control / Meta / Shift 排在前面，
 * 'Mod' 按平台落成 Meta（Mac）或 Control（其余平台）；主键排在最后，单个字母写成大写，空格写 Space、加号写 Plus。
 * 组合里没有主键或不止一个主键时按不出来，返回 undefined。
 *
 * @example
 * ariaKeyshortcut(['Mod', 'Shift', 'z'], 'mac') // 'Meta+Shift+Z'
 * ariaKeyshortcut(['Mod', 'Shift', 'z'], 'other') // 'Control+Shift+Z'
 */
export function ariaKeyshortcut(keys: readonly string[] | undefined, platform?: KbdPlatform): string | undefined {
  const segments = formatHotkey(keys, platform)
  const mains = segments.filter(segment => !segment.modifier)
  if (mains.length !== 1)
    return undefined
  const modifiers = new Set(segments.filter(segment => segment.modifier).map(segment => segment.key))
  const main = mains[0]!.key
  return [...modifiers, lookup(ARIA_KEY_NAME, main) ?? (/^[a-z]$/.test(main) ? main.toUpperCase() : main)].join('+')
}

/**
 * 读 aria-keyshortcuts：空白分隔的每一条拆成一组键，键名是 formatHotkey 与 matchesHotkey 认得的写法（Space 还原成空格、Plus 还原成加号）。
 * 一条里修饰键只认 Alt / Control / Meta / Shift 且排在前面、最后恰好一个主键；不合这个写法的那条按不出来，不收。
 *
 * @example
 * parseAriaKeyshortcuts('Control+Shift+Z Meta+Z') // [['Control', 'Shift', 'Z'], ['Meta', 'Z']]
 */
export function parseAriaKeyshortcuts(value: string | null | undefined): readonly (readonly string[])[] {
  return (value ?? '').split(/\s+/).filter(Boolean).flatMap((shortcut) => {
    const keys = shortcut.split('+')
    const main = keys.at(-1)!
    const modifiers = keys.slice(0, -1)
    if (main === '' || ARIA_MODIFIERS.has(main) || !modifiers.every(key => ARIA_MODIFIERS.has(key)))
      return []
    return [[...modifiers, lookup(ARIA_KEY_VALUE, main) ?? main]]
  })
}

/**
 * 主键是否被按下。
 *
 * 先比 event.key，再回退到物理键位：Mac 上按住 ⌥ 会改写 event.key（⌥S 出的是 ß），
 * 只比 key 的话带 Alt 的组合在 Mac 上永远命中不了。
 */
function hitsMainKey(event: HotkeyEvent, key: string): boolean {
  if (event.key.toLowerCase() === key.toLowerCase())
    return true
  if (/^[a-z]$/i.test(key))
    return event.code === `Key${key.toUpperCase()}`
  if (/^\d$/.test(key))
    return event.code === `Digit${key}`
  return false
}

/** 符号键：单个可见字符，不是字母、数字与空格。 */
function isSymbolKey(key: string): boolean {
  return key.length === 1 && key !== ' ' && !/[a-z\d]/i.test(key)
}

/** 符号在美式键盘上所在的物理键（KeyboardEvent.code），本位与 Shift 位的字都列上。 */
const SYMBOL_CODE: Record<string, string> = {
  '`': 'Backquote',
  '~': 'Backquote',
  '-': 'Minus',
  '_': 'Minus',
  '=': 'Equal',
  '+': 'Equal',
  '[': 'BracketLeft',
  '{': 'BracketLeft',
  ']': 'BracketRight',
  '}': 'BracketRight',
  '\\': 'Backslash',
  '|': 'Backslash',
  ';': 'Semicolon',
  ':': 'Semicolon',
  '\'': 'Quote',
  '"': 'Quote',
  ',': 'Comma',
  '<': 'Comma',
  '.': 'Period',
  '>': 'Period',
  '/': 'Slash',
  '?': 'Slash',
  '!': 'Digit1',
  '@': 'Digit2',
  '#': 'Digit3',
  '$': 'Digit4',
  '%': 'Digit5',
  '^': 'Digit6',
  '&': 'Digit7',
  '*': 'Digit8',
  '(': 'Digit9',
  ')': 'Digit0',
}

/**
 * 符号键是否被按下。没写 Shift 时比 event.key，Shift 按没按下都算；写了 Shift 时要求按着 Shift，
 * 按物理键位比（表里没有的符号仍比 event.key），按出来的字是什么不管。
 */
function hitsSymbolKey(event: HotkeyEvent, key: string, shift: boolean): boolean {
  if (!shift)
    return event.key === key
  if (!event.shiftKey)
    return false
  const code = lookup(SYMBOL_CODE, key)
  return code === undefined ? event.key === key : event.code === code
}

/**
 * 这次按键是不是恰好命中这组组合。
 *
 * 修饰键逐个全等比，不是「至少按了」：那样 Ctrl+Shift+S 会同时命中 Ctrl+S，
 * 两条快捷键就分不开了。只有符号键的 Shift 另算，见 hitsSymbolKey。
 * 组合里没有主键（只写了修饰键）或有两个主键时一律不命中——那种组合按不出来。
 */
export function matchesHotkey(
  event: HotkeyEvent,
  keys: readonly string[] | undefined,
  platform?: KbdPlatform,
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
  const main = mains[0]!.key
  if (isSymbolKey(main))
    return hitsSymbolKey(event, main, modifiers.has('Shift'))
  if (event.shiftKey !== modifiers.has('Shift'))
    return false
  return hitsMainKey(event, main)
}
