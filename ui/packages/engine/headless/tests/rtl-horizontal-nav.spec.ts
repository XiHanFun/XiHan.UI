// @vitest-environment jsdom
// 分段控件的横向导航要跟着视觉顺序走：整页切成 rtl 后年月日、时分秒、验证码格子
// 的视觉次序整体翻转，此时 ArrowRight 该走向序号更小的那一段。
import { navIntentFromKey, readDirection } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'

function elementIn(direction: 'ltr' | 'rtl'): HTMLElement {
  const host = document.createElement('div')
  host.setAttribute('dir', direction)
  const child = document.createElement('input')
  host.append(child)
  document.body.append(host)
  return child
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('从计算样式现读书写方向', () => {
  it('祖先声明 rtl 时子元素读到 rtl', () => {
    expect(readDirection(elementIn('rtl'))).toBe('rtl')
  })

  it('缺省读到 ltr', () => {
    expect(readDirection(elementIn('ltr'))).toBe('ltr')
  })

  it('节点不在文档里也不炸，按 ltr 处理', () => {
    expect(readDirection(null)).toBe('ltr')
    expect(readDirection(document.createElement('div'))).toBe('ltr')
  })
})

describe('横向导航的左右键随方向翻转', () => {
  it('ltr 下 ArrowRight 前进、ArrowLeft 后退', () => {
    const dir = readDirection(elementIn('ltr'))
    expect(navIntentFromKey('ArrowRight', { axis: 'horizontal', dir })).toBe('next')
    expect(navIntentFromKey('ArrowLeft', { axis: 'horizontal', dir })).toBe('prev')
  })

  it('rtl 下两者对调', () => {
    const dir = readDirection(elementIn('rtl'))
    expect(navIntentFromKey('ArrowRight', { axis: 'horizontal', dir })).toBe('prev')
    expect(navIntentFromKey('ArrowLeft', { axis: 'horizontal', dir })).toBe('next')
  })

  it('home/End 不随方向翻转：它们指的是序列两端，不是屏幕两侧', () => {
    const rtl = readDirection(elementIn('rtl'))
    expect(navIntentFromKey('Home', { axis: 'horizontal', dir: rtl })).toBe('first')
    expect(navIntentFromKey('End', { axis: 'horizontal', dir: rtl })).toBe('last')
  })
})
