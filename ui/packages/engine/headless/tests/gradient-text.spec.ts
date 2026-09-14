import type { GradientTextProps } from '../src/gradient-text'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectGradientText, gradientTextAnatomy } from '../src/gradient-text'

function root(props: GradientTextProps = {}): Record<string, unknown> {
  return connectGradientText(props, normalizeProps).getRootProps() as Record<string, unknown>
}

describe('connectGradientText 缺省', () => {
  it('走向恒有值、缺省向右；不给颜色就不写内联 style，配色交给皮肤', () => {
    const props = root()
    expect(props).toMatchObject({ ...gradientTextAnatomy.build().root.attrs, 'data-direction': 'to-right' })
    expect(props.style).toBeUndefined()
    expect(props['data-tone']).toBeUndefined()
  })

  it('走向与语气逐个落到根上', () => {
    expect(root({ direction: 'to-bottom-left', tone: 'success' })).toMatchObject({
      'data-direction': 'to-bottom-left',
      'data-tone': 'success',
    })
  })
})

describe('connectGradientText 两端颜色', () => {
  it('两端颜色写成两个自定义属性拼进一条 style；只给一端就只写一条', () => {
    expect(root({ from: '#f00', to: 'rgb(0 0 255)' }).style).toBe('--xh-gradient-text-from: #f00; --xh-gradient-text-to: rgb(0 0 255)')
    expect(root({ to: 'gold' }).style).toBe('--xh-gradient-text-to: gold')
  })

  it('首尾空白剪掉；空串等于没给', () => {
    expect(root({ from: '  #f00  ' }).style).toBe('--xh-gradient-text-from: #f00')
    expect(root({ from: '   ', to: '' }).style).toBeUndefined()
  })

  it('能提前收尾声明、往同一条 style 里塞第二条的值一律丢弃，退回皮肤缺省', () => {
    for (const bad of ['red; color: blue', 'red}', 'red{', '<b>', 'a\\b', 'red/*x*/', '*/'])
      expect(root({ from: bad, to: 'gold' }).style).toBe('--xh-gradient-text-to: gold')
  })
})
