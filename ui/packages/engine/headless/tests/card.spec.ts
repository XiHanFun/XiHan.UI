import type { CardProps } from '../src/card'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { cardAnatomy, connectCard } from '../src/card'

const parts = cardAnatomy.build()

function api(props: CardProps = {}) {
  return connectCard(props, normalizeProps)
}

describe('connectCard', () => {
  it('形态恒有值、缺省 default；根上不写 role，地标与可及名归作者', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject({ ...parts.root.attrs, 'data-variant': 'default' })
    expect(root.role).toBeUndefined()
    expect(api({ variant: 'transparent' }).getRootProps()).toMatchObject({ 'data-variant': 'transparent' })
  })

  it('五个子部件只拿身份', () => {
    const a = api()
    expect(a.getHeaderProps()).toEqual(parts.header.attrs)
    expect(a.getTitleProps()).toEqual(parts.title.attrs)
    expect(a.getDescriptionProps()).toEqual(parts.description.attrs)
    expect(a.getContentProps()).toEqual(parts.content.attrs)
    expect(a.getFooterProps()).toEqual(parts.footer.attrs)
  })
})
