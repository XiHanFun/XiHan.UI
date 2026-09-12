/**
 * 打字落点的判定要真实的活 DOM：输入框是不是正在打字的地方，只有节点在场时才答得出来。
 *
 * @vitest-environment jsdom
 */

import type { HotkeysProps, HotkeysTriggerDetails } from '../src/hotkeys/index'
import { afterEach, describe, expect, it } from 'vitest'
import {
  connectHotkeys,
  detectHotkeysPlatform,
  formatHotkey,
  isTypingTarget,
  matchesHotkey,
  resolveHotkeysPlatform,
} from '../src/hotkeys/index'

afterEach(() => {
  document.body.innerHTML = ''
})

function api(props: HotkeysProps) {
  return connectHotkeys(props)
}

/** 造一次按键。target 不传即落在 body 上，那不是打字的地方。 */
function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

describe('hotkeys 平台落定', () => {
  it('auto 与缺省都按非 Mac 出：符号写法只有 Mac 认得，没测出来之前不能瞎猜', () => {
    expect(resolveHotkeysPlatform('auto')).toBe('other')
    expect(resolveHotkeysPlatform(undefined)).toBe('other')
  })

  it('显式值原样落定', () => {
    expect(resolveHotkeysPlatform('mac')).toBe('mac')
    expect(resolveHotkeysPlatform('other')).toBe('other')
  })

  it('实测只出落定后的两种之一，两个适配器共用这一份', () => {
    expect(['mac', 'other']).toContain(detectHotkeysPlatform())
  })
})

describe('formatHotkey 键位翻写', () => {
  it('mod 在 Mac 上是 ⌘、其余平台是 Ctrl，同一份 keys 两边都对', () => {
    expect(formatHotkey(['Mod'], 'mac')[0]).toMatchObject({ key: 'Meta', label: '⌘', name: 'Command', modifier: true })
    expect(formatHotkey(['Mod'], 'other')[0]).toMatchObject({ key: 'Control', label: 'Ctrl', name: 'Control', modifier: true })
  })

  it('修饰键的别名收敛到同一枚键，读屏名随平台走', () => {
    expect(formatHotkey(['Option'], 'mac')[0]).toMatchObject({ key: 'Alt', label: '⌥', name: 'Option' })
    expect(formatHotkey(['Alt'], 'other')[0]).toMatchObject({ key: 'Alt', label: 'Alt', name: 'Alt' })
    expect(formatHotkey(['Cmd'], 'mac')[0]!.key).toBe('Meta')
  })

  it('主键别名翻成 KeyboardEvent.key 的写法，键帽按平台出符号或单词', () => {
    expect(formatHotkey(['Esc'], 'mac')[0]).toMatchObject({ key: 'Escape', label: '⎋', name: 'Escape' })
    expect(formatHotkey(['Esc'], 'other')[0]).toMatchObject({ key: 'Escape', label: 'Esc' })
    expect(formatHotkey(['Space'], 'other')[0]).toMatchObject({ key: ' ', label: 'Space', name: 'Space' })
  })

  it('表里没有的键直接用大写形式，且原样记住作者写的那个词', () => {
    expect(formatHotkey(['s'], 'other')[0]).toMatchObject({ source: 's', key: 's', label: 'S', name: 'S', modifier: false })
  })

  it('空串与缺省丢掉：留着会铺出一枚没有字的键帽', () => {
    expect(formatHotkey(['', 'S'], 'other')).toHaveLength(1)
    expect(formatHotkey(undefined, 'other')).toHaveLength(0)
  })

  it('与 Object.prototype 同名的键当普通主键处理：keys 可能来自配置，一枚脏数据不许整块崩', () => {
    expect(formatHotkey(['constructor'], 'other')[0]).toMatchObject({
      key: 'constructor',
      label: 'CONSTRUCTOR',
      name: 'CONSTRUCTOR',
      modifier: false,
    })
    expect(formatHotkey(['__proto__'], 'mac')[0]).toMatchObject({ label: '__PROTO__', modifier: false })
    expect(formatHotkey(['toString', 'valueOf'], 'other')).toHaveLength(2)
  })
})

describe('matchesHotkey 组合判定', () => {
  it('修饰键逐个全等比：多按一个 Shift 就不算命中，两条组合才分得开', () => {
    expect(matchesHotkey(press('s', { ctrlKey: true }), ['Mod', 'S'], 'other')).toBe(true)
    expect(matchesHotkey(press('S', { ctrlKey: true, shiftKey: true }), ['Mod', 'S'], 'other')).toBe(false)
    expect(matchesHotkey(press('S', { ctrlKey: true, shiftKey: true }), ['Mod', 'Shift', 'S'], 'other')).toBe(true)
  })

  it('mod 在两个平台上认的是不同的那一枚修饰键', () => {
    expect(matchesHotkey(press('s', { metaKey: true }), ['Mod', 'S'], 'mac')).toBe(true)
    expect(matchesHotkey(press('s', { ctrlKey: true }), ['Mod', 'S'], 'mac')).toBe(false)
  })

  it('主键比 event.key 不成时回退到物理键位：Mac 上按住 ⌥ 会把 event.key 改写成别的字符', () => {
    expect(matchesHotkey(press('ß', { altKey: true, code: 'KeyS' }), ['Alt', 'S'], 'mac')).toBe(true)
  })

  it('没有主键或有两个主键的组合一律不命中：那种组合按不出来', () => {
    expect(matchesHotkey(press('Control', { ctrlKey: true }), ['Mod'], 'other')).toBe(false)
    expect(matchesHotkey(press('s', { ctrlKey: true }), ['Mod', 'A', 'S'], 'other')).toBe(false)
  })

  it('主键不分大小写：按住 Shift 时 event.key 是大写的', () => {
    expect(matchesHotkey(press('S', { shiftKey: true }), ['Shift', 's'], 'other')).toBe(true)
  })
})

describe('isTypingTarget 打字落点', () => {
  // 可编辑区那一支这里验不了：jsdom 不实现 isContentEditable，恒为 false
  it('输入框、文本域与下拉都算', () => {
    const input = document.createElement('input')
    const textarea = document.createElement('textarea')
    document.body.append(input, textarea)
    expect(isTypingTarget(input)).toBe(true)
    expect(isTypingTarget(textarea)).toBe(true)
    expect(isTypingTarget(document.createElement('select'))).toBe(true)
  })

  it('按键不产生文字的输入不算：复选框上按空格是勾选，不是打字', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    expect(isTypingTarget(checkbox)).toBe(false)
    expect(isTypingTarget(document.body)).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
  })
})

describe('connectHotkeys 行为投影', () => {
  it('只暴露监听事实，不再产生任何键帽或 DOM getter', () => {
    const current = api({ keys: ['Mod', 'S'], platform: 'mac', enabled: false })
    expect(current.platform).toBe('mac')
    expect(current.enabled).toBe(false)
    expect(current.target).toBe('document')
    expect(Object.keys(current).sort()).toEqual(['enabled', 'handleKeyDown', 'matches', 'platform', 'resolveTarget', 'target'])
  })

  it('局部 target 保留作者的显式 resolver，不猜组件父节点', () => {
    const node = document.createElement('section')
    const target = () => node
    expect(api({ keys: ['S'], target }).target).toBe(target)
    expect(api({ keys: ['S'], target }).resolveTarget(document)).toBe(node)
  })

  it('空组合与不可命中的多主键组合直接报错，不注册静默死监听', () => {
    expect(() => connectHotkeys({ keys: [] })).toThrow(/非空/)
    expect(() => connectHotkeys({ keys: ['Mod', 'A', 'S'] })).toThrow(/只能包含一枚主键/)
  })

  it('target 声明和 resolver 返回值都严格校验', () => {
    expect(() => connectHotkeys({ keys: ['S'], target: 'parent' as never })).toThrow(/target/)
    const current = connectHotkeys({ keys: ['S'], target: () => ({}) as EventTarget })
    expect(() => current.resolveTarget(document)).toThrow(/EventTarget/)
    expect(connectHotkeys({ keys: ['S'], target: () => null }).resolveTarget(document)).toBeNull()
  })
})

describe('connectHotkeys 接住按键', () => {
  function makeApi(props: HotkeysProps) {
    const hits: HotkeysTriggerDetails[] = []
    return { hits, current: api({ ...props, onHotKey: details => hits.push(details) }) }
  }

  it('命中即回调，并默认拦下浏览器的默认动作', () => {
    const { hits, current } = makeApi({ keys: ['Mod', 'S'], platform: 'other' })
    const event = press('s', { ctrlKey: true })
    current.handleKeyDown(event)
    expect(hits).toHaveLength(1)
    expect(hits[0]!.keys).toEqual(['Mod', 'S'])
    expect(event.defaultPrevented).toBe(true)
  })

  it('preventDefault 关掉后只回调不拦：浏览器的默认动作照走', () => {
    const { hits, current } = makeApi({ keys: ['Mod', 'S'], platform: 'other', preventDefault: false })
    const event = press('s', { ctrlKey: true })
    current.handleKeyDown(event)
    expect(hits).toHaveLength(1)
    expect(event.defaultPrevented).toBe(false)
  })

  it('enabled 关掉后既不回调也不拦', () => {
    const { hits, current } = makeApi({ keys: ['Mod', 'S'], platform: 'other', enabled: false })
    const event = press('s', { ctrlKey: true })
    current.handleKeyDown(event)
    expect(hits).toHaveLength(0)
    expect(event.defaultPrevented).toBe(false)
  })

  it('输入法组合期的按键一律不接：那段时间的按键是给候选框用的', () => {
    const { hits, current } = makeApi({ keys: ['Mod', 'S'], platform: 'other' })
    current.handleKeyDown(press('s', { ctrlKey: true, isComposing: true }))
    // 不上报 isComposing 的输入法在组合期统一给 229
    current.handleKeyDown(press('s', { ctrlKey: true, keyCode: 229 }))
    expect(hits).toHaveLength(0)
  })

  it('没有 Ctrl / Meta / Alt 参与的组合落在输入区里就让给输入', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    const { hits, current } = makeApi({ keys: ['S'], platform: 'other' })
    const inInput = press('s', {}, input)
    current.handleKeyDown(inInput)
    expect(hits).toHaveLength(0)
    expect(inInput.defaultPrevented).toBe(false)

    current.handleKeyDown(press('s'))
    expect(hits).toHaveLength(1)
  })

  it('带命令修饰键的组合在输入区里照接：它与打字撞不上', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    const { hits, current } = makeApi({ keys: ['Mod', 'S'], platform: 'other' })
    current.handleKeyDown(press('s', { ctrlKey: true }, input))
    expect(hits).toHaveLength(1)
  })

  it('只按了 Shift 的组合仍算与打字撞车：Shift+S 就是敲一个大写字母', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    const { hits, current } = makeApi({ keys: ['Shift', 'S'], platform: 'other' })
    current.handleKeyDown(press('S', { shiftKey: true }, input))
    expect(hits).toHaveLength(0)
  })
})
