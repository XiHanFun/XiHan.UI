import type { VisuallyHiddenProps } from '../src/visually-hidden'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectVisuallyHidden, visuallyHiddenAnatomy, visuallyHiddenKeyboard, visuallyHiddenMeta } from '../src/visually-hidden'

const parts = visuallyHiddenAnatomy.build()

function root(props: VisuallyHiddenProps = {}): Record<string, unknown> {
  return connectVisuallyHidden(props, normalizeProps).getRootProps() as Record<string, unknown>
}

describe('connectVisuallyHidden', () => {
  it('缺省只带身份：藏法归皮肤，根上不写任何把内容从读屏或焦点序里摘掉的属性', () => {
    const props = root()
    expect(props).toEqual(parts.root.attrs)
    // 藏起来的内容读屏照读：写了 aria-hidden / hidden 就成了另一回事
    expect(props['aria-hidden']).toBeUndefined()
    expect(props.hidden).toBeUndefined()
    // 自身不进焦点序，也不压住里面元素的可聚焦性
    expect(props.tabIndex).toBeUndefined()
    expect(props.inert).toBeUndefined()
    expect(props.role).toBeUndefined()
  })

  it('focusable 落成省略式布尔 data-focusable，皮肤据它在焦点进来时撤掉隐藏', () => {
    expect(root({ focusable: true })['data-focusable']).toBe('')
  })

  it('focusable 为 false 与不写等价：属性不落', () => {
    expect(root({ focusable: false })).toEqual(parts.root.attrs)
    expect(root({ focusable: false })).toEqual(root())
  })

  it('解剖只有 root，键盘表为空：可聚焦的是作者放进来的元素，按键行为归它们', () => {
    expect(visuallyHiddenAnatomy.parts).toEqual(['root'])
    expect(visuallyHiddenMeta.requiredParts).toEqual(['root'])
    expect(visuallyHiddenKeyboard.rows).toEqual([])
  })
})
