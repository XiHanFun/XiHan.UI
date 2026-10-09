import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTreeSelectRoot } from '../../src'
import { tokenValue } from './design-token'
import { shownMask } from './glyph-mask'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
const collection = [
  { value: 'group', label: '团队', children: [{ value: 'one', label: '设计' }, { value: 'two', label: '研发' }] },
  { value: 'three', label: '外部', disabled: true },
]

function row(value: string, part = 'item'): HTMLElement {
  const selector = part === 'branch-control'
    ? `[data-scope='tree-select'][data-part='branch'][data-value='${value}'] > [data-part='branch-control']`
    : `[data-scope='tree-select'][data-part='${part}'][data-value='${value}']`
  const el = document.querySelector<HTMLElement>(selector)
  if (!el)
    throw new Error(`找不到 ${value}/${part}`)
  return el
}

function mark(el: HTMLElement): HTMLElement {
  const result = el.querySelector<HTMLElement>(`[data-part='item-indicator']`)
  if (!result)
    throw new Error('叶子和分支都应提供选择标记')
  return result
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('树选择分支与叶子的统一选择反馈', () => {
  for (const multiple of [false, true]) {
    for (const [theme, dir] of [['light', 'ltr'], ['dark', 'rtl']] as const) {
      it(`${multiple ? '多选' : '单选'}/${theme}/${dir}：对号与展开分离，级联半选使用横线`, async () => {
        host = document.createElement('div')
        host.dataset.theme = theme
        host.dir = dir
        document.body.append(host)
        app = createApp({ render: () => h(XhTreeSelectRoot, {
          collection,
          multiple,
          cascade: multiple,
          dir,
          open: true,
          defaultValue: ['one'],
          defaultExpandedValue: ['group'],
        }) })
        app.mount(host)
        await nextTick()
        await nextTick()
        const branch = row('group', 'branch-control')
        const one = row('one')
        const two = row('two')
        for (const el of [branch, one, two])
          el.style.transition = 'none'
        await userEvent.hover(two)
        two.focus()
        await nextTick()
        expect(getComputedStyle(one).backgroundColor).toBe('rgba(0, 0, 0, 0)')
        expect(getComputedStyle(one).color).toBe(getComputedStyle(two).color)
        expect(getComputedStyle(one).fontWeight).toBe(tokenValue('font-weight', '--xh-font-weight-medium', one))
        expect(getComputedStyle(two).fontWeight).toBe(tokenValue('font-weight', '--xh-font-weight-regular', two))
        expect(getComputedStyle(mark(one)).opacity).toBe('1')
        expect(getComputedStyle(mark(branch)).opacity).toBe(multiple ? '1' : '0')
        const mixedGlyph = shownMask(mark(branch), '::before')
        if (multiple)
          expect(mark(branch).hasAttribute('data-indeterminate')).toBe(true)
        const text = branch.querySelector<HTMLElement>(`[data-part='branch-text']`)!.getBoundingClientRect()
        const box = mark(branch).getBoundingClientRect()
        expect(dir === 'ltr' ? box.left >= text.right : box.right <= text.left).toBe(true)
        await userEvent.click(branch)
        await nextTick()
        // 对号按选中态淡变：读终值前把这一段过渡走完
        for (const animation of document.getAnimations())
          animation.finish()
        expect(branch.hasAttribute('data-selected')).toBe(true)
        expect(getComputedStyle(mark(branch)).opacity).toBe('1')
        if (multiple) {
          expect(mark(branch).hasAttribute('data-indeterminate')).toBe(false)
          expect(shownMask(mark(branch), '::before')).not.toBe(mixedGlyph)
          expect(two.hasAttribute('data-selected')).toBe(true)
        }
        const trigger = branch.querySelector<HTMLElement>(`[data-part='branch-trigger']`)!
        await userEvent.click(trigger)
        await nextTick()
        expect(row('group', 'branch').getAttribute('aria-expanded')).toBe('false')
        expect(branch.hasAttribute('data-selected')).toBe(true)
        expect(getComputedStyle(mark(branch)).opacity).toBe('1')
      })
    }
  }
})
