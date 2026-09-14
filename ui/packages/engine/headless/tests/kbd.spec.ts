/**
 * Kbd 同时负责键盘按键展示和显式开启后的快捷键注册。
 *
 * @vitest-environment jsdom
 */

import type { KbdProps, KbdTriggerDetails } from '../src/kbd'
import { normalizeProps } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import {
  connectKbd,
  detectKbdPlatform,
  formatHotkey,
  isTypingTarget,
  matchesHotkey,
  resolveKbdPlatform,
} from '../src/kbd'

afterEach(() => {
  document.body.innerHTML = ''
})

function api(props: KbdProps) {
  return connectKbd(props, normalizeProps)
}

function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

describe('kbd 平台格式化', () => {
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

  it('未知键保留作者值并以大写形式显示', () => {
    expect(formatHotkey(['constructor'], 'other')[0]).toMatchObject({
      source: 'constructor',
      key: 'constructor',
      label: 'CONSTRUCTOR',
      modifier: false,
    })
  })
})

describe('kbd 展示契约', () => {
  it('单键与组合键共用 root，整组只提供一个可读名称', () => {
    const current = api({ keys: ['Mod', 'S'], platform: 'other' })
    expect(current.segments.map(segment => segment.label)).toEqual(['Ctrl', 'S'])
    expect(current.getRootProps()).toMatchObject({
      'data-scope': 'kbd',
      'data-part': 'root',
      'data-platform': 'other',
      'data-variant': 'default',
      'aria-label': 'Control + S',
    })
    expect(current.getKeyProps({ value: 'Mod' })).toMatchObject({
      'data-scope': 'kbd',
      'data-part': 'key',
      'data-key': 'Control',
      'aria-hidden': true,
    })
  })

  it('单独的修饰键可以展示，但不能注册成永远无法命中的快捷键', () => {
    expect(api({ keys: ['Mod'], platform: 'mac' }).segments[0]?.label).toBe('⌘')
    expect(() => api({ keys: ['Mod'], register: true })).toThrow(/注册时必须且只能包含一枚主键/)
  })

  it('多个主键、空组合和空键名立即报错', () => {
    expect(() => api({ keys: [] })).toThrow(/非空/)
    expect(() => api({ keys: ['Mod', 'A', 'S'] })).toThrow(/最多包含一枚主键/)
    expect(() => api({ keys: [''] })).toThrow(/非空字符串/)
  })

  it('逐键和整组读屏文案由同一翻译入口生成', () => {
    expect(api({
      keys: ['Mod', 'S'],
      platform: 'other',
      translations: {
        keyName: key => key === 'Control' ? '控制' : key,
        hotkey: names => names.join('加'),
      },
    }).getRootProps()).toMatchObject({ 'aria-label': '控制加S' })
    expect(() => api({ keys: ['S'], translations: { hotkey: () => '' } })).toThrow(/不能为空/)
  })
})

describe('kbd 快捷键注册', () => {
  function registered(props: Omit<KbdProps, 'register'>) {
    const hits: KbdTriggerDetails[] = []
    return { hits, current: api({ ...props, register: true, onHotKey: details => hits.push(details) }) }
  }

  it('默认仅展示；register 开启后才解析监听目标并投影注册事实', () => {
    expect(api({ keys: ['Mod', 'S'] }).resolveTarget(document)).toBeNull()
    const current = api({ keys: ['Mod', 'S'], register: true })
    expect(current.resolveTarget(document)).toBe(document)
    expect(current.getRootProps()).toMatchObject({ 'data-register': '' })
  })

  it('命中时回调并默认阻止浏览器动作', () => {
    const { hits, current } = registered({ keys: ['Mod', 'S'], platform: 'other' })
    const event = press('s', { ctrlKey: true })
    current.handleKeyDown(event)
    expect(hits[0]?.keys).toEqual(['Mod', 'S'])
    expect(event.defaultPrevented).toBe(true)
  })

  it('preventDefault 与 enabled 分别控制默认动作和整条监听', () => {
    const allowed = registered({ keys: ['Mod', 'S'], platform: 'other', preventDefault: false })
    const event = press('s', { ctrlKey: true })
    allowed.current.handleKeyDown(event)
    expect(allowed.hits).toHaveLength(1)
    expect(event.defaultPrevented).toBe(false)

    const disabled = registered({ keys: ['Mod', 'S'], platform: 'other', enabled: false })
    disabled.current.handleKeyDown(press('s', { ctrlKey: true }))
    expect(disabled.hits).toHaveLength(0)
    expect(disabled.current.getRootProps()).toMatchObject({ 'data-disabled': '' })
  })

  it('局部 target 严格使用作者提供的 resolver', () => {
    const node = document.createElement('section')
    const current = api({ keys: ['S'], register: true, target: () => node })
    expect(current.resolveTarget(document)).toBe(node)
    expect(() => api({ keys: ['S'], register: true, target: () => ({}) as EventTarget }).resolveTarget(document)).toThrow(/EventTarget/)
  })

  it('输入法组合期不接管，无命令修饰键时让输入区优先', () => {
    const command = registered({ keys: ['Mod', 'S'], platform: 'other' })
    command.current.handleKeyDown(press('s', { ctrlKey: true, isComposing: true }))
    expect(command.hits).toHaveLength(0)

    const input = document.createElement('input')
    document.body.append(input)
    const plain = registered({ keys: ['S'], platform: 'other' })
    plain.current.handleKeyDown(press('s', {}, input))
    expect(plain.hits).toHaveLength(0)
    plain.current.handleKeyDown(press('s'))
    expect(plain.hits).toHaveLength(1)
  })

  it('组合判定要求修饰键精确一致，并能回退物理键位', () => {
    expect(matchesHotkey(press('s', { ctrlKey: true }), ['Mod', 'S'], 'other')).toBe(true)
    expect(matchesHotkey(press('S', { ctrlKey: true, shiftKey: true }), ['Mod', 'S'], 'other')).toBe(false)
    expect(matchesHotkey(press('ß', { altKey: true, code: 'KeyS' }), ['Alt', 'S'], 'mac')).toBe(true)
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true)
  })
})
