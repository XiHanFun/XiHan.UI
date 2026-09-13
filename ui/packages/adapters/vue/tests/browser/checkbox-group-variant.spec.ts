import type { CheckboxVariant } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCheckbox,
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mountPair(checked: boolean, variant?: CheckboxVariant): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h('div', [
      h(XhCheckbox, { checked, variant, 'aria-label': '独立复选框' }),
      h(XhCheckboxGroupRoot, { value: checked ? ['mail'] : [], variant }, () => [
        h(XhCheckboxGroupItem, { value: 'mail' }, () => [
          h(XhCheckboxGroupIndicator),
          h(XhCheckboxGroupItemText, null, () => '邮件'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function getPart(scope: string, part: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${scope}.${part}`)
  return el
}

function controlBoxStyle(el: HTMLElement): Record<string, string> {
  const style = getComputedStyle(el)
  return {
    width: style.width,
    height: style.height,
    borderColor: style.borderColor,
    borderRadius: style.borderRadius,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage,
    boxShadow: style.boxShadow,
  }
}

describe('checkboxGroup 视觉变体', () => {
  for (const checked of [false, true]) {
    it(`${checked ? '选中' : '未选中'}时与独立 Checkbox 使用同一控制盒`, async () => {
      await mountPair(checked)
      expect(controlBoxStyle(getPart('checkbox-group', 'indicator')))
        .toEqual(controlBoxStyle(getPart('checkbox', 'root')))
    })
  }

  it('secondary 同时移除独立与组内控制盒阴影', async () => {
    await mountPair(true, 'secondary')
    expect(getComputedStyle(getPart('checkbox-group', 'indicator')).boxShadow).toBe('none')
    expect(getComputedStyle(getPart('checkbox', 'root')).boxShadow).toBe('none')
  })
})
