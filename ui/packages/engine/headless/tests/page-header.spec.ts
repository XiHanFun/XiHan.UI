import type { PageHeaderProps } from '../src/page-header'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectPageHeader, pageHeaderAnatomy } from '../src/page-header'

const parts = pageHeaderAnatomy.build()

function api(props: PageHeaderProps = {}) {
  return connectPageHeader(props, normalizeProps)
}

describe('connectPageHeader 根', () => {
  it('缺省：尺寸不写就不发，形态落 ghost，分隔线不开就不落；也不替作者写 banner 地标', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject(parts.root.attrs)
    expect(root['data-size']).toBeUndefined()
    expect(root['data-variant']).toBe('ghost')
    expect(root['data-split']).toBeUndefined()
    expect(root.role).toBeUndefined()
  })

  it('尺寸、形态与分隔线只落在根上', () => {
    expect(api({ size: 'lg', variant: 'outline', split: true }).getRootProps()).toMatchObject({
      'data-size': 'lg',
      'data-variant': 'outline',
      'data-split': '',
    })
    expect((api({ variant: 'subtle' }).getRootProps() as Record<string, unknown>)['data-variant']).toBe('subtle')
  })
})

describe('connectPageHeader 各段', () => {
  it('七个子部件只拿身份：标签、type、可及名字与标题层级全归作者', () => {
    const a = api()
    expect(a.getBreadcrumbProps()).toEqual(parts.breadcrumb.attrs)
    expect(a.getBackTriggerProps()).toEqual(parts['back-trigger'].attrs)
    expect(a.getMediaProps()).toEqual(parts.media.attrs)
    expect(a.getTitleProps()).toEqual(parts.title.attrs)
    expect(a.getDescriptionProps()).toEqual(parts.description.attrs)
    expect(a.getExtraProps()).toEqual(parts.extra.attrs)
    expect(a.getFooterProps()).toEqual(parts.footer.attrs)
    // 标题不占文档大纲的层级
    expect((a.getTitleProps() as Record<string, unknown>).role).toBeUndefined()
    expect((a.getTitleProps() as Record<string, unknown>)['aria-level']).toBeUndefined()
  })
})
