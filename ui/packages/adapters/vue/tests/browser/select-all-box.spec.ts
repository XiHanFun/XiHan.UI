// 全选格的方框与字形是两层，勾中之后方框还在不在。
//
// 只有真实浏览器量得出来：方框与字形都画在伪元素上，jsdom 的 getComputedStyle 不解析
// 伪元素上的 var()，量出来恒是空串。两层压在同一个伪元素上时，mask 会把方框的描边与
// 底色一并裁成字形轮廓——页面上不报错，只是方框消失、盒从指示符尺寸塌成字形尺寸。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupRoot,
  XhCheckboxGroupTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const TOPPINGS = [
  { value: 'cheese', label: '芝士' },
  { value: 'bacon', label: '培根' },
]

let app: App | null = null
let host: HTMLElement | null = null

function teardown() {
  app?.unmount()
  host?.remove()
  app = null
  host = null
}

afterEach(() => teardown())

/** value 给全选或半选，全选格分别落到 checked / indeterminate */
async function mountGroup(value: string[]) {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhCheckboxGroupRoot, {
      value,
      // 全集由这条声明，全选格才答得出 checked 与 indeterminate 的区别
      itemValues: TOPPINGS.map(node => node.value),
      name: 'topping',
    }, () => [
      h(XhCheckboxGroupTrigger, null, () => '全选'),
      ...TOPPINGS.map(node =>
        h(XhCheckboxGroupItem, { key: node.value, value: node.value }, () => [
          h(XhCheckboxGroupIndicator),
          h(XhCheckboxGroupItemText, null, () => node.label),
        ]),
      ),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='checkbox-group'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${name}`)
  return el
}

const px = (value: string) => Number.parseFloat(value)

describe('全选格：方框与字形分两层', () => {
  for (const [state, value] of [['checked', ['cheese', 'bacon']], ['indeterminate', ['cheese']]] as const) {
    it(`${state} 时方框还是方框`, async () => {
      await mountGroup([...value])
      const trigger = part('trigger')
      expect(trigger.dataset.state).toBe(state)

      const box = getComputedStyle(trigger, '::before')
      const glyph = getComputedStyle(trigger, '::after')

      // 方框那一层不许带 mask：带了就等于把自己裁没
      expect(box.maskImage, '方框那层不该有 mask').toBe('none')
      // 字形落在另一层
      expect(glyph.maskImage, '字形那层该有 mask').not.toBe('none')

      // 方框仍是指示符尺寸，且与条目那侧的方框一样大
      const itemBox = getComputedStyle(part('indicator'))
      expect(px(box.width)).toBe(px(itemBox.width))
      expect(px(box.height)).toBe(px(itemBox.height))
      expect(px(box.width)).toBeGreaterThan(0)

      // 描边与品牌底都还在（被裁掉时 border-width 会归 0 或底色被 currentColor 顶掉）
      expect(px(box.borderTopWidth), '方框描边被裁掉了').toBeGreaterThan(0)
      expect(box.backgroundColor).toBe(getComputedStyle(part('indicator')).backgroundColor)

      // 字形比方框小：它是画在方框里的标记，不是方框本身
      expect(px(glyph.width)).toBeLessThan(px(box.width))
    })
  }

  it('没有值时不画字形', async () => {
    await mountGroup([])
    const trigger = part('trigger')
    expect(trigger.dataset.state).toBe('unchecked')
    expect(getComputedStyle(trigger, '::after').content).toBe('none')
  })
})
