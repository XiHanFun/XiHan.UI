// 宿主写了 aria-label 的控件放进 <xh-field>：名字归字段标签，宿主的 aria-label 不进名字；
// 名字链里为取自身 aria-label 写的自引用也一并去掉。不在字段里时宿主的 aria-label 转给承担名字的部件，改了跟着变。
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const NAME = '自定名字'
const FIELD = '报销类别'

afterEach(() => {
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

async function mount(markup: string, inField = true): Promise<HTMLElement> {
  const host = document.createElement('div')
  host.innerHTML = inField
    ? `<xh-field><div data-xh-part="root"><label data-xh-part="label">${FIELD}</label>${markup}</div></xh-field>`
    : markup
  document.body.append(host)
  await settle()
  return host
}

const SELECT = `
  <xh-select aria-label="${NAME}" default-value="travel">
    <div data-xh-part="root">
      <button data-xh-part="trigger"><span data-xh-part="value-text"></span></button>
      <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list">
        <div data-xh-part="item" value="travel"><span data-xh-part="item-text">差旅</span></div>
        <div data-xh-part="item" value="meal"><span data-xh-part="item-text">餐饮</span></div>
      </div></div></div>
    </div>
  </xh-select>`

const CASES: ReadonlyArray<readonly [name: string, target: string, markup: string]> = [
  ['text-field', '[data-scope="text-field"][data-part="input"]', `<xh-text-field aria-label="${NAME}"><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div></xh-text-field>`],
  ['select', '[data-scope="select"][data-part="trigger"]', SELECT],
  ['radio-group', '[data-scope="radio-group"][data-part="root"]', `<xh-radio-group aria-label="${NAME}"><div data-xh-part="root"><div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="item-text">甲</span></div></div></xh-radio-group>`],
  ['checkbox', '[data-scope="checkbox"][data-part="root"]', `<xh-checkbox aria-label="${NAME}"><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>`],
  ['slider', '[data-scope="slider"][data-part="thumb"]', `<xh-slider aria-label="${NAME}"><div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="track"></div><div data-xh-part="thumb" index="0"></div></div></div></xh-slider>`],
]

describe('宿主写了 aria-label 的控件放进字段', () => {
  for (const [name, selector, markup] of CASES) {
    it(`${name}：名字归字段标签，宿主的 aria-label 不进名字，axe 不报命名类问题`, async () => {
      const container = await mount(markup)
      const el = document.querySelector<HTMLElement>(selector)!
      const locator = page.elementLocator(el)
      await expect.element(locator).toHaveAccessibleName(new RegExp(`^${FIELD}`))
      await expect.element(locator).not.toHaveAccessibleName(new RegExp(NAME))
      const { violations } = await runAxe(container)
      expect(violations.filter(v => /name|label|aria-(?:allowed|prohibited|valid)-attr/.test(v.id)).map(v => v.id)).toEqual([])
    })
  }

  it('select：名字是字段标签接当前值，名字链里不再引触发钮自己', async () => {
    await mount(SELECT)
    const trigger = document.querySelector<HTMLElement>(CASES[1]![1])!
    expect((trigger.getAttribute('aria-labelledby') ?? '').split(/\s+/)).not.toContain(trigger.id)
    await expect.element(page.elementLocator(trigger)).toHaveAccessibleName(`${FIELD} 差旅`)
  })
})

describe('不在字段里：宿主的 aria-label 就是 ariaLabel', () => {
  it('写在宿主上即转给承担名字的部件；改了、撤了跟着变，经 ariaLabel 属性写也是同一条路', async () => {
    await mount(CASES[0]![2], false)
    const el = document.querySelector<HTMLElement>(CASES[0]![1])!
    // 定位器按当时的名字生成，名字改了要重新取
    const locator = () => page.elementLocator(el)
    await expect.element(locator()).toHaveAccessibleName(NAME)
    const control = document.querySelector('xh-text-field')!
    control.setAttribute('aria-label', '改过的名字')
    await settle()
    await expect.element(locator()).toHaveAccessibleName('改过的名字')
    control.ariaLabel = '属性写的名字'
    await settle()
    await expect.element(locator()).toHaveAccessibleName('属性写的名字')
    control.removeAttribute('aria-label')
    await settle()
    await expect.element(locator()).toHaveAccessibleName('')
  })
  it('select 不在字段里：名字是 ariaLabel 接当前值', async () => {
    await mount(SELECT, false)
    await expect.element(page.elementLocator(document.querySelector<HTMLElement>(CASES[1]![1])!)).toHaveAccessibleName(`${NAME} 差旅`)
  })
})
