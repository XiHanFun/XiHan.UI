// 评分星的可及名：星里放了作者自己的内容（文字或带名字的节点）时以内容为名、不写 aria-label；没放内容时写语言包的缺省名。
// 按挂载后渲染出的节点判断：服务端直出的首帧还读不到节点，一律写缺省名，挂载后有作者内容的星再撤掉。
import type { ReactNode } from 'react'
import { runAxe } from '@xihan-ui/testing/a11y'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhIcon, XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

const PATH = 'M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1z'
const icon = <XhIcon><path d={PATH} /></XhIcon>

async function mount(stars: ReactNode[], translations?: { item: (value: number, count: number) => string }, itemAttrs: (value: number) => Record<string, string> = () => ({})): Promise<HTMLElement[]> {
  host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(
      <XhRatingRoot defaultValue={3} translations={translations}>
        <XhRatingLabel>服务评价</XhRatingLabel>
        <XhRatingControl>
          {stars.map((star, i) => <XhRatingItem key={i} value={i + 1} {...itemAttrs(i + 1)}>{star}</XhRatingItem>)}
        </XhRatingControl>
      </XhRatingRoot>,
    )
  })
  unmount = () => act(() => root.unmount())
  for (let i = 0; i < 3; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return [...host.querySelectorAll<HTMLElement>('[data-scope="rating"][data-part="item"]')]
}

async function nameViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(root)
  return violations.filter(v => ['aria-toggle-field-name', 'aria-valid-attr-value'].includes(v.id)).map(v => v.id)
}

describe('评分星的可及名', () => {
  it('星里没放内容（空星、对读屏隐藏的图标与字符）：每颗星带缺省名', async () => {
    const items = await mount([null, <span key="2" aria-hidden="true">★</span>, icon, icon, null])
    expect(items.map(el => el.getAttribute('aria-label'))).toEqual(['1 of 5 stars', '2 of 5 stars', '3 of 5 stars', '4 of 5 stars', '5 of 5 stars'])
    expect(await nameViolations(host!)).toEqual([])
  })

  it('星里放了作者的文字或带名字的节点：不写 aria-label，以作者内容为名', async () => {
    const items = await mount([
      '很差',
      <span key="2">较差</span>,
      <XhIcon key="3" label="一般"><path d={PATH} /></XhIcon>,
      <img key="4" alt="满意" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />,
      <>
        {icon}
        <span>很好</span>
      </>,
    ])
    for (const el of items)
      expect(el.hasAttribute('aria-label')).toBe(false)
    expect(items.map(el => el.getAttribute('role'))).toEqual(['radio', 'radio', 'radio', 'radio', 'radio'])
    expect(await nameViolations(host!)).toEqual([])
  })

  it('作者给了 translations.item：没放内容的星用它，放了内容的星照样不写', async () => {
    const items = await mount([null, '较差', icon, null, '很好'], { item: (value, count) => `${count} 分里的 ${value} 分` })
    expect(items.map(el => el.getAttribute('aria-label'))).toEqual(['5 分里的 1 分', null, '5 分里的 3 分', '5 分里的 4 分', null])
    expect(await nameViolations(host!)).toEqual([])
  })

  it('作者直接在星节点上写了 aria-label：保留作者的，不被缺省名或 translations.item 盖掉', async () => {
    const items = await mount([null, null, icon, null, null], { item: (value, count) => `${count} 分里的 ${value} 分` }, value => ({ 'aria-label': `${value} 颗星` }))
    expect(items.map(el => el.getAttribute('aria-label'))).toEqual(['1 颗星', '2 颗星', '3 颗星', '4 颗星', '5 颗星'])
    expect(await nameViolations(host!)).toEqual([])
  })
})
