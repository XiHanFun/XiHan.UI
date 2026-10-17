// 给了 ariaLabel 的控件放进字段：名字归字段标签，ariaLabel 不进名字；名字链里为取自身 aria-label 写的自引用也一并去掉。
import type { Component, VNode } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCheckbox,
  XhFieldLabel,
  XhFieldRoot,
  XhRadioGroupRoot,
  XhSelectRoot,
  XhSliderControl,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhTextFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const NAME = '自定名字'
const FIELD = '报销类别'
const ITEMS = [{ value: 'travel', label: '差旅' }, { value: 'meal', label: '餐饮' }]

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.innerHTML = ''
})

async function mount(control: () => VNode, inField = true): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ render: () => inField ? h(XhFieldRoot, null, () => [h(XhFieldLabel, () => FIELD), control()]) : control() })
  app.mount(host)
  unmount = () => app.unmount()
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
  return host
}

const CASES: ReadonlyArray<readonly [name: string, target: string, control: () => VNode]> = [
  ['text-field', '[data-scope="text-field"][data-part="input"]', () => h(XhTextFieldRoot as Component, { ariaLabel: NAME })],
  ['select', '[data-scope="select"][data-part="trigger"]', () => h(XhSelectRoot as Component, { ariaLabel: NAME, collection: ITEMS, defaultValue: ['travel'] })],
  ['radio-group', '[data-scope="radio-group"][data-part="root"]', () => h(XhRadioGroupRoot as Component, { ariaLabel: NAME, collection: ITEMS })],
  ['checkbox', '[data-scope="checkbox"][data-part="root"]', () => h(XhCheckbox as Component, { ariaLabel: NAME })],
  ['slider', '[data-scope="slider"][data-part="thumb"]', () => h(XhSliderRoot as Component, { ariaLabel: NAME }, () => h(XhSliderControl, () => [h(XhSliderTrack), h(XhSliderThumb, { index: 0 })]))],
]

describe('给了 ariaLabel 的控件放进字段', () => {
  for (const [name, selector, control] of CASES) {
    it(`${name}：名字归字段标签，ariaLabel 不进名字，axe 不报命名类问题`, async () => {
      const host = await mount(control)
      const el = document.querySelector<HTMLElement>(selector)!
      const locator = page.elementLocator(el)
      await expect.element(locator).toHaveAccessibleName(new RegExp(`^${FIELD}`))
      await expect.element(locator).not.toHaveAccessibleName(new RegExp(NAME))
      const { violations } = await runAxe(host)
      expect(violations.filter(v => /name|label|aria-(?:allowed|prohibited|valid)-attr/.test(v.id)).map(v => v.id)).toEqual([])
    })
  }

  it('select：名字是字段标签接当前值，名字链里不再引触发钮自己', async () => {
    await mount(CASES[1]![2])
    const trigger = document.querySelector<HTMLElement>(CASES[1]![1])!
    expect((trigger.getAttribute('aria-labelledby') ?? '').split(/\s+/)).not.toContain(trigger.id)
    await expect.element(page.elementLocator(trigger)).toHaveAccessibleName(`${FIELD} 差旅`)
  })
  it('select 不在字段里：名字是 ariaLabel 接当前值', async () => {
    await mount(CASES[1]![2], false)
    await expect.element(page.elementLocator(document.querySelector<HTMLElement>(CASES[1]![1])!)).toHaveAccessibleName(`${NAME} 差旅`)
  })
})
