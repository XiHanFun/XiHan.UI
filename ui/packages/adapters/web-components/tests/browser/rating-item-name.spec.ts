// 评分星的可及名：星里放了作者自己的内容（文字或带名字的节点）时以内容为名、不写 aria-label；没放内容时写语言包的缺省名。
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

const ICON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1z"/></svg>'

async function mount(stars: string[], translations?: Record<string, unknown>, itemAttrs: (value: number) => string = () => ''): Promise<HTMLElement[]> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-rating default-value="3">
      <div data-xh-part="root">
        <span data-xh-part="label">服务评价</span>
        <div data-xh-part="control">
          ${stars.map((content, i) => `<span data-xh-part="item" value="${i + 1}" ${itemAttrs(i + 1)}>${content}</span>`).join('')}
        </div>
      </div>
    </xh-rating>`
  document.body.append(host)
  if (translations)
    (host.querySelector('xh-rating') as unknown as Record<string, unknown>).translations = translations
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return [...host.querySelectorAll<HTMLElement>('[data-scope="rating"][data-part="item"]')]
}

async function nameViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(root)
  return violations.filter(v => ['aria-toggle-field-name', 'aria-valid-attr-value'].includes(v.id)).map(v => v.id)
}

describe('评分星的可及名', () => {
  it('星里没放内容（空星、对读屏隐藏的图标与字符）：每颗星带缺省名', async () => {
    const items = await mount(['', '<span aria-hidden="true">★</span>', ICON, ICON, ''])
    expect(items.map(el => el.getAttribute('aria-label'))).toEqual(['1 of 5 stars', '2 of 5 stars', '3 of 5 stars', '4 of 5 stars', '5 of 5 stars'])
    expect(await nameViolations(host!)).toEqual([])
  })

  it('星里放了作者的文字或带名字的节点：不写 aria-label，以作者内容为名', async () => {
    const items = await mount([
      '很差',
      '<span>较差</span>',
      `<svg role="img" aria-label="一般" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>`,
      '<img alt="满意" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">',
      `${ICON}<span>很好</span>`,
    ])
    for (const el of items)
      expect(el.hasAttribute('aria-label')).toBe(false)
    expect(items.map(el => el.getAttribute('role'))).toEqual(['radio', 'radio', 'radio', 'radio', 'radio'])
    expect(await nameViolations(host!)).toEqual([])
  })

  it('作者给了 translations.item：没放内容的星用它，放了内容的星照样不写', async () => {
    const items = await mount(['', '较差', ICON, '', '很好'], { item: (value: number, count: number) => `${count} 分里的 ${value} 分` })
    expect(items.map(el => el.getAttribute('aria-label'))).toEqual(['5 分里的 1 分', null, '5 分里的 3 分', '5 分里的 4 分', null])
    expect(await nameViolations(host!)).toEqual([])
  })

  it('作者直接在星节点上写了 aria-label：保留作者的，不被缺省名或 translations.item 盖掉', async () => {
    const items = await mount(['', '', ICON, '', ''], { item: (value: number, count: number) => `${count} 分里的 ${value} 分` }, value => `aria-label="${value} 颗星"`)
    expect(items.map(el => el.getAttribute('aria-label'))).toEqual(['1 颗星', '2 颗星', '3 颗星', '4 颗星', '5 颗星'])
    expect(await nameViolations(host!)).toEqual([])
  })
})
