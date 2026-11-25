import type { AspectRatioApi, AspectRatioProps } from '../src/aspect-ratio'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { aspectRatioAnatomy, aspectRatioKeyboard, aspectRatioMeta, connectAspectRatio } from '../src/aspect-ratio'
import { resolveAspectRatio } from '../src/aspect-ratio/aspect-ratio.connect'

type Dict = Record<string, unknown>

/** 用给定 props 调一次连接层，返回其 API。 */
function api(props: AspectRatioProps = {}): AspectRatioApi {
  return connectAspectRatio(props, normalizeProps)
}

/** root 上写给皮肤的那条私有槽。 */
function slotOf(props: AspectRatioProps = {}): unknown {
  const style = (api(props).getRootProps() as Dict).style as Dict
  return style['--xh-_aspect-ratio']
}

describe('resolveAspectRatio', () => {
  it('没给时取 1：正方形', () => {
    expect(resolveAspectRatio(undefined)).toBe(1)
  })

  it('大于 0 的有限数原样保留，不取整也不约分', () => {
    expect(resolveAspectRatio(16 / 9)).toBe(16 / 9)
    expect(resolveAspectRatio(0.75)).toBe(0.75)
    expect(resolveAspectRatio(1e-3)).toBe(1e-3)
  })

  it('0 与负数按 1：零高或倒置的盒子画不出来', () => {
    expect(resolveAspectRatio(0)).toBe(1)
    expect(resolveAspectRatio(-0)).toBe(1)
    expect(resolveAspectRatio(-16 / 9)).toBe(1)
  })

  it('读不出的数（NaN）与正负无穷按 1：除以 0 的比例也落到这里', () => {
    expect(resolveAspectRatio(Number.NaN)).toBe(1)
    expect(resolveAspectRatio(Number.POSITIVE_INFINITY)).toBe(1)
    expect(resolveAspectRatio(Number.NEGATIVE_INFINITY)).toBe(1)
  })
})

describe('connectAspectRatio', () => {
  it('ratio 给出归一后的值', () => {
    expect(api().ratio).toBe(1)
    expect(api({ ratio: 4 / 3 }).ratio).toBe(4 / 3)
    expect(api({ ratio: Number.NaN }).ratio).toBe(1)
  })

  it('比例写成私有槽交给皮肤，值是字符串', () => {
    expect(slotOf()).toBe('1')
    expect(slotOf({ ratio: 16 / 9 })).toBe(String(16 / 9))
    expect(slotOf({ ratio: 0.5 })).toBe('0.5')
  })

  it('非法值的私有槽同样落成 1，不把 NaN 写进样式', () => {
    expect(slotOf({ ratio: 0 })).toBe('1')
    expect(slotOf({ ratio: -2 })).toBe('1')
    expect(slotOf({ ratio: Number.POSITIVE_INFINITY })).toBe('1')
  })

  it('root 只带作用域、部件与私有槽，不写 role：语义由里面的内容给', () => {
    const root = api({ ratio: 2 }).getRootProps() as Dict
    expect(root['data-scope']).toBe('aspect-ratio')
    expect(root['data-part']).toBe('root')
    expect(root.role).toBeUndefined()
    expect(root.tabIndex).toBeUndefined()
    expect(Object.keys(root.style as Dict)).toEqual(['--xh-_aspect-ratio'])
  })
})

describe('契约', () => {
  it('解剖只有 root，也只要求 root', () => {
    expect(aspectRatioAnatomy.parts).toEqual(['root'])
    expect(aspectRatioMeta.requiredParts).toEqual(['root'])
  })

  it('键盘表是空的：盒子不可聚焦、不接按键', () => {
    expect(aspectRatioKeyboard.component).toBe('aspect-ratio')
    expect(aspectRatioKeyboard.rows).toEqual([])
  })
})
