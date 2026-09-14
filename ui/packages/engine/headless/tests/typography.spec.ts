import type { TypographyProps } from '../src/typography'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectTypography, typographyAnatomy } from '../src/typography'

const parts = typographyAnatomy.build()

function api(props: TypographyProps = {}) {
  return connectTypography(props, normalizeProps)
}

function heading(level?: number | string): Record<string, unknown> {
  return api().getHeadingProps({ level: level as never }) as Record<string, unknown>
}

describe('connectTypography 根', () => {
  it('缺省只带身份，尺寸、对齐、字重不写就不落', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject(parts.root.attrs)
    expect(root['data-size']).toBeUndefined()
    expect(root['data-align']).toBeUndefined()
    expect(root['data-weight']).toBeUndefined()
  })

  it('尺寸、对齐与字重逐个落到根上', () => {
    expect(api({ size: 'lg', align: 'center', weight: 'semibold' }).getRootProps()).toMatchObject({
      'data-size': 'lg',
      'data-align': 'center',
      'data-weight': 'semibold',
    })
  })
})

describe('connectTypography 标题档位', () => {
  it('档位收进 1-6，数字与数字串都认；不写 role 与 aria-level，进不进大纲由标签决定', () => {
    expect(heading(2)['data-level']).toBe('2')
    expect(heading('4')['data-level']).toBe('4')
    expect(heading(0)['data-level']).toBe('1')
    expect(heading(9)['data-level']).toBe('6')
    expect(heading(2.7)['data-level']).toBe('2')
    expect(heading(2).role).toBeUndefined()
    expect(heading(2)['aria-level']).toBeUndefined()
  })

  it('给不出数字就不落属性，皮肤退回默认档', () => {
    expect(heading()['data-level']).toBeUndefined()
    expect(heading('')['data-level']).toBeUndefined()
    expect(heading('big')['data-level']).toBeUndefined()
    expect(heading(Number.NaN)['data-level']).toBeUndefined()
    expect(api().getHeadingProps()).toMatchObject(parts.heading.attrs)
  })
})

describe('connectTypography 各段', () => {
  it('行内文字的语气、形态、字重逐条落在自己身上，不写就不落', () => {
    const plain = api().getTextProps() as Record<string, unknown>
    expect(plain).toMatchObject(parts.text.attrs)
    expect(plain['data-tone']).toBeUndefined()
    expect(plain['data-variant']).toBeUndefined()
    expect(api().getTextProps({ tone: 'danger', variant: 'code', weight: 'bold' })).toMatchObject({
      'data-tone': 'danger',
      'data-variant': 'code',
      'data-weight': 'bold',
    })
  })

  it('段落、链接与富文本容器只拿身份：href、target 与内容标签全归作者', () => {
    expect(api().getParagraphProps()).toEqual(parts.paragraph.attrs)
    expect(api().getLinkProps()).toEqual(parts.link.attrs)
    expect(api().getProseProps()).toEqual(parts.prose.attrs)
  })
})
