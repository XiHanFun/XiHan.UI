// 步骤条的只读展示：trigger 只排版，版面与可操作形态一样大，标题与说明不置灰，悬停不给圆点换面，
// 点了不切步、Tab 进不来。计算样式与焦点只有真实 Chromium 算得出，jsdom 不算数。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhStepsDescription, XhStepsIndicator, XhStepsItem, XhStepsList, XhStepsRoot, XhStepsSeparator, XhStepsTitle, XhStepsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function mount(readOnly: boolean) {
  const value = ref(1)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhStepsRoot, {
      'count': 3,
      readOnly,
      'value': value.value,
      'collection': [{}, { disabled: true }, {}],
      'onUpdate:value': (next: number) => { value.value = next },
    }, () => h(XhStepsList, null, () => [0, 1, 2].map(index => h(XhStepsItem, { key: index, value: String(index) }, () => [
      h(XhStepsTrigger, null, () => [
        h(XhStepsIndicator, null, () => String(index + 1)),
        h(XhStepsTitle, null, () => `步骤 ${index + 1}`),
        h(XhStepsDescription, null, () => '步骤说明'),
      ]),
      h(XhStepsSeparator),
    ])))),
  })
  app.mount(host)
  await nextTick()
  return {
    value,
    triggers: [...host.querySelectorAll<HTMLElement>('[data-scope="steps"][data-part="trigger"]')],
    titles: [...host.querySelectorAll<HTMLElement>('[data-scope="steps"][data-part="title"]')],
    indicators: [...host.querySelectorAll<HTMLElement>('[data-scope="steps"][data-part="indicator"]')],
  }
}

function token(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  host!.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

describe('steps 只读展示', () => {
  it('trigger 渲成 div，版面与可操作形态一样大', async () => {
    const interactive = await mount(false)
    const size = interactive.triggers.map(el => el.getBoundingClientRect()).map(r => [Math.round(r.width), Math.round(r.height)])
    app?.unmount()
    host?.remove()
    const readOnly = await mount(true)
    expect(readOnly.triggers.every(el => el.tagName === 'DIV')).toBe(true)
    expect(readOnly.triggers.map(el => el.getBoundingClientRect()).map(r => [Math.round(r.width), Math.round(r.height)])).toEqual(size)
  })

  it('标题不置灰：collection 里标了 disabled 的那一步也按状态着色', async () => {
    const steps = await mount(true)
    expect(getComputedStyle(steps.titles[1]!).color).not.toBe(token('--xh-fg-disabled'))
    expect(getComputedStyle(steps.titles[1]!).color).toBe(getComputedStyle(steps.titles[0]!).color)
  })

  it('悬停不给圆点换面，点了不切步，Tab 进不来', async () => {
    const steps = await mount(true)
    const before = getComputedStyle(steps.indicators[2]!).backgroundColor
    await userEvent.hover(steps.triggers[2]!)
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(getComputedStyle(steps.indicators[2]!).backgroundColor).toBe(before)

    steps.triggers[2]!.click()
    await nextTick()
    expect(steps.value.value).toBe(1)

    steps.triggers[0]!.focus()
    expect(document.activeElement).not.toBe(steps.triggers[0])
    expect(host!.querySelector('[tabindex="0"]')).toBeNull()
  })
})
