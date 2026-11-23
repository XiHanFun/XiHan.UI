// 树的 multiple 档换成行首勾选框：点行是勾上这一项，而不是换掉已选的那一项。
// 方框排在展开箭头之后、文字之前（标准结构把标记写在行尾，皮肤照样排到前面），同一层的叶子与分支方框对齐；
// 静息 strong 描边透明底，勾上与半选填品牌实心面；单选与 extended 档仍是行尾对号。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTreeRoot } from '../../src'
import { tokenLength, tokenValue } from './design-token'
import { shownMask } from './glyph-mask'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'index', label: 'index.ts', description: '入口' },
      { value: 'app', label: 'app.vue' },
    ],
  },
  { value: 'readme', label: 'README.md' },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mountTree(props: Record<string, unknown>, dir: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  host.style.inlineSize = '280px'
  document.body.append(host)
  app = createApp({ render: () => h(XhTreeRoot, { collection, defaultExpandedValue: ['src'], ...props }) })
  app.mount(host)
  await nextTick()
  for (const el of host.querySelectorAll<HTMLElement>(`[data-part='item'], [data-part='branch-control'], [data-part='item-indicator']`))
    el.style.transition = 'none'
}

function row(value: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='tree'][data-part='item'][data-value='${value}']`)
    ?? host?.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch'][data-value='${value}'] > [data-scope='tree'][data-part='branch-control']`)
  if (!el)
    throw new Error(`找不到 ${value}`)
  return el
}

function child(el: HTMLElement, part: string): HTMLElement {
  const found = el.querySelector<HTMLElement>(`:scope > [data-part='${part}']`)
  if (!found)
    throw new Error(`找不到 ${part}`)
  return found
}

describe('树 multiple 档的行首勾选框', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    it(`${dir}：方框排在箭头与文字之间，同层叶子与分支对齐，说明与文字同一起点`, async () => {
      await mountTree({ selectionMode: 'multiple', cascade: true, defaultSelection: ['index'] }, dir)
      const src = row('src')
      const box = child(src, 'item-indicator').getBoundingClientRect()
      const arrow = child(src, 'branch-trigger').getBoundingClientRect()
      const text = child(src, 'branch-text').getBoundingClientRect()
      if (dir === 'ltr') {
        expect(box.left).toBeGreaterThanOrEqual(arrow.right)
        expect(box.right).toBeLessThanOrEqual(text.left)
      }
      else {
        expect(box.right).toBeLessThanOrEqual(arrow.left)
        expect(box.left).toBeGreaterThanOrEqual(text.right)
      }
      // 同层的叶子：方框与分支的方框对齐，文字也对齐
      const readme = row('readme')
      expect(Math.abs(child(readme, 'item-indicator').getBoundingClientRect().left - box.left)).toBeLessThan(0.5)
      expect(Math.abs(child(readme, 'item-text').getBoundingClientRect().left - text.left)).toBeLessThan(0.5)
      // 带说明的叶子：说明行从文字的起点开始，不缩回方框底下
      const index = row('index')
      const indexText = child(index, 'item-text').getBoundingClientRect()
      const description = child(index, 'item-description')
      const start = dir === 'ltr'
        ? description.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(description).paddingInlineStart)
        : description.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(description).paddingInlineStart)
      expect(Math.abs(start - (dir === 'ltr' ? indexText.left : indexText.right))).toBeLessThan(0.5)
    })
  }

  it('静息 strong 描边透明底，勾上与半选填品牌实心面；点行即勾上，半选换成勾', async () => {
    await mountTree({ selectionMode: 'multiple', cascade: true, defaultSelection: ['index'] })
    const index = child(row('index'), 'item-indicator')
    const app = child(row('app'), 'item-indicator')
    const src = child(row('src'), 'item-indicator')

    expect(Number.parseFloat(getComputedStyle(app).borderTopWidth)).toBe(tokenLength('--xh-stroke-thin', app))
    expect(getComputedStyle(app).borderTopColor).toBe(tokenValue('border-top-color', '--xh-border-strong', app))
    expect(getComputedStyle(app).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(app).opacity).toBe('1')
    const brand = tokenValue('background-color', '--xh-bg-brand', index)
    expect(getComputedStyle(index).backgroundColor).toBe(brand)
    // 子树只勾一半：分支的方框同样填色，里面是横杠
    expect(src.getAttribute('data-xh-check-mark')).toBe('indeterminate')
    expect(getComputedStyle(src).backgroundColor).toBe(brand)
    const mixed = shownMask(src, '::before')
    expect(shownMask(index, '::before')).not.toBe(mixed)

    await userEvent.click(row('app'))
    await nextTick()
    for (const animation of document.getAnimations())
      animation.finish()
    expect(app.getAttribute('data-xh-check-mark')).toBe('checked')
    expect(getComputedStyle(app).backgroundColor).toBe(brand)
    // 两个孩子都勾上：分支的横杠换成勾
    expect(src.getAttribute('data-xh-check-mark')).toBe('checked')
    expect(shownMask(src, '::before')).toBe(shownMask(index, '::before'))
  })

  for (const selectionMode of ['single', 'extended'] as const) {
    it(`${selectionMode} 档仍是行尾对号，不画方框`, async () => {
      await mountTree({ selectionMode, defaultSelection: ['readme'] })
      const readme = row('readme')
      const mark = child(readme, 'item-indicator')
      expect(mark.hasAttribute('data-xh-check-mark')).toBe(false)
      expect(Number.parseFloat(getComputedStyle(mark).borderTopWidth)).toBe(0)
      expect(mark.getBoundingClientRect().left).toBeGreaterThanOrEqual(child(readme, 'item-text').getBoundingClientRect().right)
    })
  }
})
