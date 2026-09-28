import type { CardProps } from '../src/card'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { cardAnatomy, connectCard } from '../src/card'

const parts = cardAnatomy.build()

function api(props: CardProps = {}) {
  return connectCard(props, normalizeProps)
}

describe('connectCard', () => {
  it('形态恒有值、缺省 outline；根上不写 role，地标与可及名归作者', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject({ ...parts.root.attrs, 'data-variant': 'outline' })
    expect(root.role).toBeUndefined()
    expect(api({ variant: 'ghost' }).getRootProps()).toMatchObject({ 'data-variant': 'ghost' })
  })

  it('缺省不可交互，根上不写 data-interactive；interactive 时写上，根仍不拿焦点也不写 role', () => {
    expect((api().getRootProps() as Record<string, unknown>)['data-interactive']).toBeUndefined()
    const root = api({ interactive: true }).getRootProps() as Record<string, unknown>
    expect(root['data-interactive']).toBe('')
    expect(root.role).toBeUndefined()
    expect(root.tabIndex ?? root.tabindex).toBeUndefined()
  })

  it('子部件只拿身份', () => {
    const a = api()
    expect(a.getHeaderProps()).toEqual(parts.header.attrs)
    expect(a.getTitleProps()).toEqual(parts.title.attrs)
    expect(a.getTriggerProps()).toEqual(parts.trigger.attrs)
    expect(a.getDescriptionProps()).toEqual(parts.description.attrs)
    expect(a.getContentProps()).toEqual(parts.content.attrs)
    expect(a.getFooterProps()).toEqual(parts.footer.attrs)
  })
})
