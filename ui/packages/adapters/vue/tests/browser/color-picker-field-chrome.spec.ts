// 取色器的盒接字段外壳：与同族的下拉选择同一套静息 / 悬停面，静息无影，variant 三档照样生效。
// 计算样式只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhColorPickerControl,
  XhColorPickerRoot,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
  XhSelectControl,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../../src'
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

function look(el: HTMLElement): string[] {
  const style = getComputedStyle(el)
  return [style.boxShadow, style.borderTopColor, style.backgroundColor, style.blockSize, style.borderTopLeftRadius]
}

async function settled(el: HTMLElement): Promise<void> {
  await Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => undefined)))
}

describe('color-picker 字段外壳', () => {
  it('盒与下拉选择的盒同一套面：静息无影、悬停同一档淡底与描边；subtle 形态同样一致', async () => {
    host = document.createElement('div')
    host.style.cssText = 'display: grid; gap: 16px; margin-block-start: 200px'
    document.body.append(host)
    const variants = ['outline', 'subtle'] as const
    app = createApp({
      render: () => variants.flatMap(variant => [
        h(XhColorPickerRoot, { 'variant': variant, 'data-testid': `color-${variant}` }, () => h(XhColorPickerControl, null, () =>
          h(XhColorPickerTrigger, null, () => [h(XhColorPickerSwatch), h(XhColorPickerValueText)]))),
        h(XhSelectRoot, { 'variant': variant, 'data-testid': `select-${variant}`, 'collection': [{ value: 'a', label: 'A' }] }, () =>
          h(XhSelectControl, null, () => h(XhSelectTrigger, null, () => h(XhSelectValueText)))),
      ]),
    })
    app.mount(host)
    await nextTick()
    for (const variant of variants) {
      const color = host.querySelector<HTMLElement>(`[data-testid='color-${variant}'] [data-scope='color-picker'][data-part='control']`)!
      const select = host.querySelector<HTMLElement>(`[data-testid='select-${variant}'] [data-scope='select'][data-part='control']`)!
      expect(color.hasAttribute('data-xh-field-chrome')).toBe(true)
      expect(getComputedStyle(color).boxShadow).toBe('none')
      expect(look(color)).toEqual(look(select))

      await userEvent.hover(color)
      await settled(color)
      const hoverColor = look(color)
      await userEvent.hover(select)
      await settled(select)
      expect(hoverColor).toEqual(look(select))
    }
  })
})
