// 快捷键：键数组按平台归一与写法、按键是否恰好命中，以及键名表的查法。
import type { HotkeyEvent } from '../src/hotkey'
import { describe, expect, it } from 'vitest'
import { detectKbdPlatform, formatHotkey, HOTKEY_TEXT_EN_US, keyText, matchesHotkey, resolveKbdPlatform } from '../src/hotkey'

function press(key: string, init: Partial<HotkeyEvent> = {}): HotkeyEvent {
  return { key, code: '', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, ...init }
}

describe('平台与写法', () => {
  it('auto 与缺省在探测前按非 Mac 输出', () => {
    expect(resolveKbdPlatform('auto')).toBe('other')
    expect(resolveKbdPlatform(undefined)).toBe('other')
    expect(['mac', 'other']).toContain(detectKbdPlatform())
  })

  it('mod 随平台变化，主键别名仍映射为标准键名', () => {
    expect(formatHotkey(['Mod', 'Esc'], 'mac')).toMatchObject([
      { key: 'Meta', label: '⌘', name: 'Command', modifier: true },
      { key: 'Escape', label: '⎋', name: 'Escape', modifier: false },
    ])
    expect(formatHotkey(['Mod', 'Esc'], 'other')).toMatchObject([
      { key: 'Control', label: 'Ctrl', name: 'Control', modifier: true },
      { key: 'Escape', label: 'Esc', name: 'Escape', modifier: false },
    ])
  })

  it('未知键保留作者值并以大写形式显示，空串不出键帽', () => {
    expect(formatHotkey(['constructor', ''], 'other')).toMatchObject([{
      source: 'constructor',
      key: 'constructor',
      label: 'CONSTRUCTOR',
      modifier: false,
    }])
  })

  it('键名与键帽字可以换一张表', () => {
    const text = { keyName: (key: string) => `键${key}`, keyLabel: (key: string) => key.toLowerCase() }
    expect(formatHotkey(['Shift', 'K'], 'other', text).map(segment => [segment.label, segment.name])).toEqual([['shift', '键Shift'], ['k', '键K']])
  })

  it('查表：两平台叫法不同时按平台取，表里没有的用大写形式', () => {
    const table = { Alt: { mac: 'Option', other: 'Alt' }, Tab: 'Tab' }
    expect([keyText(table, 'Alt', 'mac'), keyText(table, 'Alt', 'other'), keyText(table, 'Tab', 'mac'), keyText(table, 'q', 'mac')]).toEqual(['Option', 'Alt', 'Tab', 'Q'])
    expect(HOTKEY_TEXT_EN_US.keyLabel('Meta', 'mac')).toBe('⌘')
  })
})

describe('命中', () => {
  it('修饰键要求精确一致，并能回退物理键位', () => {
    expect(matchesHotkey(press('s', { ctrlKey: true }), ['Mod', 'S'], 'other')).toBe(true)
    expect(matchesHotkey(press('S', { ctrlKey: true, shiftKey: true }), ['Mod', 'S'], 'other')).toBe(false)
    expect(matchesHotkey(press('s', { ctrlKey: true }), ['Mod', 'S'], 'mac')).toBe(false)
    expect(matchesHotkey(press('ß', { altKey: true, code: 'KeyS' }), ['Alt', 'S'], 'mac')).toBe(true)
    expect(matchesHotkey(press('!', { shiftKey: true, code: 'Digit1' }), ['Shift', '1'], 'other')).toBe(true)
  })

  it('只有修饰键或有两个主键的组合不命中', () => {
    expect(matchesHotkey(press('Control', { ctrlKey: true }), ['Ctrl'], 'other')).toBe(false)
    expect(matchesHotkey(press('a'), ['A', 'B'], 'other')).toBe(false)
  })
})
