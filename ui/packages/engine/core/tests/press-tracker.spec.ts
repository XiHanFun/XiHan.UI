import { describe, expect, it } from 'vitest'
import { createPressTracker } from '../src/behavior/press'

/** 真源在调用方：这里用一个布尔模拟机器 context，onChange 只记录翻转。 */
function tracker() {
  let pressed = false
  const changes: boolean[] = []
  const handlers = createPressTracker({
    isPressed: () => pressed,
    onChange: (next) => {
      pressed = next
      changes.push(next)
    },
  })
  return { handlers, changes, pressed: () => pressed }
}

function key(key: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return { key, repeat: false, isComposing: false, keyCode: 0, ...init } as KeyboardEvent
}

function pointer(pointerType: string): PointerEvent {
  return { pointerType } as PointerEvent
}

describe('createPressTracker 键盘', () => {
  it.each([' ', 'Enter'])('按下 %j 进入按住，抬起退出', (name) => {
    const t = tracker()
    t.handlers.onKeyDown(key(name))
    expect(t.pressed()).toBe(true)
    t.handlers.onKeyUp(key(name))
    expect(t.pressed()).toBe(false)
    expect(t.changes).toEqual([true, false])
  })

  it('长按的重复 keydown 不再报，只翻一次', () => {
    const t = tracker()
    t.handlers.onKeyDown(key(' '))
    t.handlers.onKeyDown(key(' ', { repeat: true }))
    t.handlers.onKeyDown(key(' ', { repeat: true }))
    expect(t.changes).toEqual([true])
  })

  it('别的键不算按压：方向键、Escape、字母', () => {
    const t = tracker()
    for (const name of ['ArrowDown', 'Escape', 'a', 'Tab'])
      t.handlers.onKeyDown(key(name))
    expect(t.changes).toEqual([])
    // 抬起别的键也不把已按住的 Space 松掉
    t.handlers.onKeyDown(key(' '))
    t.handlers.onKeyUp(key('Shift'))
    expect(t.pressed()).toBe(true)
  })

  it('输入法组合期间的 Enter 属于候选词框，不进入按住', () => {
    const t = tracker()
    t.handlers.onKeyDown(key('Enter', { isComposing: true }))
    t.handlers.onKeyDown(key('Enter', { keyCode: 229 }))
    expect(t.changes).toEqual([])
  })

  it('按住期间失焦即松开：不会再来 keyup', () => {
    const t = tracker()
    t.handlers.onKeyDown(key('Enter'))
    t.handlers.onBlur()
    expect(t.pressed()).toBe(false)
    // 松开之后的 keyup / blur 不重复报
    t.handlers.onKeyUp(key('Enter'))
    t.handlers.onBlur()
    expect(t.changes).toEqual([true, false])
  })
})

describe('createPressTracker 指针', () => {
  it('触屏按下进入按住，抬起退出', () => {
    const t = tracker()
    t.handlers.onPointerDown(pointer('touch'))
    expect(t.pressed()).toBe(true)
    t.handlers.onPointerUp()
    expect(t.pressed()).toBe(false)
  })

  it('鼠标与笔不走这一路：它们的按压由 :active 表出', () => {
    const t = tracker()
    t.handlers.onPointerDown(pointer('mouse'))
    t.handlers.onPointerDown(pointer('pen'))
    expect(t.changes).toEqual([])
  })

  it('滚动接管指针（pointercancel）即松开', () => {
    const t = tracker()
    t.handlers.onPointerDown(pointer('touch'))
    t.handlers.onPointerCancel()
    expect(t.pressed()).toBe(false)
    expect(t.changes).toEqual([true, false])
  })

  it('没按住时抬起不报：onChange 只在真变时调', () => {
    const t = tracker()
    t.handlers.onPointerUp()
    t.handlers.onPointerCancel()
    t.handlers.onKeyUp(key(' '))
    expect(t.changes).toEqual([])
  })

  it('真源在调用方：外部把按住态改掉后，跟踪器按外部的值判真变', () => {
    let pressed = false
    const changes: boolean[] = []
    const handlers = createPressTracker({ isPressed: () => pressed, onChange: next => changes.push(next) })
    handlers.onKeyDown(key(' '))
    expect(changes).toEqual([true])
    // 调用方（机器）没有接受这次按下——例如禁用守卫拦下了——再抬起就不该报一次多余的 false
    handlers.onKeyUp(key(' '))
    expect(changes).toEqual([true])
    pressed = true
    handlers.onKeyUp(key(' '))
    expect(changes).toEqual([true, false])
  })
})
