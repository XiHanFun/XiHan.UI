// @vitest-environment jsdom
import type { DescriptionsProps } from '../src/descriptions'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectDescriptions } from '../src/descriptions'

type Props = Record<string, unknown>

function api(props: DescriptionsProps = {}) {
  return connectDescriptions(props, normalizeProps)
}

describe('connectDescriptions 的跨列', () => {
  it('不写 span 即不产出 style，旧的零参调用照样成立', () => {
    expect((api({ columns: 3 }).getItemProps() as Props).style).toBeUndefined()
    expect((api({ columns: 3 }).getItemProps({}) as Props).style).toBeUndefined()
  })

  it('span 落成网格轨道数', () => {
    expect((api({ columns: 3 }).getItemProps({ span: 2 }) as Props).style).toEqual({ gridColumn: 'span 2' })
  })

  it('超过列数按列数算：跨出网格的格子会另起一行', () => {
    expect((api({ columns: 2 }).getItemProps({ span: 5 }) as Props).style).toEqual({ gridColumn: 'span 2' })
  })

  it('不写 columns 即只有一列，跨列钳到 1', () => {
    expect((api().getItemProps({ span: 4 }) as Props).style).toEqual({ gridColumn: 'span 1' })
  })

  it('小于 1 与带小数的值取整后钳到 1', () => {
    expect((api({ columns: 4 }).getItemProps({ span: 0 }) as Props).style).toEqual({ gridColumn: 'span 1' })
    expect((api({ columns: 4 }).getItemProps({ span: 2.7 }) as Props).style).toEqual({ gridColumn: 'span 2' })
  })
})
