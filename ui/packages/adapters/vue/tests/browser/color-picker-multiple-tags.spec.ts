// 多选的颜色选择器：浮层里调出的工作色是草稿，按「添加」收进值；选中的颜色在输入行里排成带色点的标签，
// 值文字让位、触发钮只留色块做键盘入口；标签不截短、放不下就折行，表单一值一份隐藏输入。
// 显隐、色点的计算色、折行与真实点击只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhColorPickerAreaThumb,
  XhColorPickerConfirmTrigger,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHiddenInput,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchPicker,
  XhColorPickerTagList,
  XhColorPickerTrigger,
  XhColorPickerValueText,
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

const SWATCHES = ['#ff0000', '#00ff00', '#0000ff']

interface Mounted { changes: string[][] }

async function mount(props: Record<string, unknown>): Promise<Mounted> {
  host = document.createElement('div')
  document.body.append(host)
  const changes: string[][] = []
  app = createApp({
    render: () => h(XhColorPickerRoot, {
      'name': 'palette',
      'selectionMode': 'multiple',
      'swatches': SWATCHES,
      ...props,
      'onValue-change': (details: { value: string[] }) => changes.push(details.value),
    }, () => [
      h(XhColorPickerControl, null, () => [
        h(XhColorPickerTagList),
        h(XhColorPickerTrigger, null, () => [h(XhColorPickerSwatch), h(XhColorPickerValueText)]),
      ]),
      h(XhColorPickerHiddenInput),
      h(XhColorPickerPositioner, null, () => [
        h(XhColorPickerContent, null, () => [
          h(XhColorPickerSaturationArea, null, () => [h(XhColorPickerAreaThumb)]),
          h(XhColorPickerSwatchPicker),
          h(XhColorPickerConfirmTrigger, null, () => '添加'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return { changes }
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='color-picker'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 color-picker 的 ${name}`)
  return el
}

function swatchItem(value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='color-swatch-picker'][data-part='item'][data-value='${value}']`)
  if (!el)
    throw new Error(`找不到色板的 ${value}`)
  return el
}

/** 在场的标签；摘掉的那枚会在原处留一个替身播完退场，带 data-state=closed，不算。 */
function tags(): HTMLElement[] {
  return [...part('tag-list').querySelectorAll<HTMLElement>(`[data-scope='tag'][data-part='root'][data-value]:not([data-state='closed'])`)]
}

describe('color-picker 多选成标签', () => {
  it('按「添加」把工作色收进值并排成标签，浮层不收；选过的颜色再按不下去', async () => {
    const { changes } = await mount({ defaultOpen: true })
    expect(getComputedStyle(part('value-text')).display).toBe('none')
    const add = part('confirm-trigger') as HTMLButtonElement
    expect(getComputedStyle(add).display).not.toBe('none')
    expect(add.disabled).toBe(false)
    add.click()
    await nextTick()
    expect(changes.at(-1)).toEqual(['#000000'])
    expect(tags().map(tag => tag.textContent?.trim())).toEqual(['#000000'])
    expect(add.disabled).toBe(true)
    expect(part('content').hidden).toBe(false)
  })

  it('预设色板点一下切换选中，格子不标选中', async () => {
    const { changes } = await mount({ defaultOpen: true, defaultValue: ['#ff0000'] })
    swatchItem('#00ff00').click()
    await nextTick()
    expect(changes.at(-1)).toEqual(['#ff0000', '#00ff00'])
    swatchItem('#ff0000').click()
    await nextTick()
    expect(changes.at(-1)).toEqual(['#00ff00'])
    expect(swatchItem('#ff0000').getAttribute('aria-checked')).toBe('false')
    expect(part('content').hidden).toBe(false)
  })

  it('每枚标签前一个该颜色的色点，+N 那一枚不画', async () => {
    await mount({ maxTagCount: 2, defaultValue: ['#ff0000', '#00ff00', '#0000ff'] })
    const [red, green] = tags()
    expect(getComputedStyle(red!, '::before').backgroundColor).toBe('rgb(255, 0, 0)')
    expect(getComputedStyle(green!, '::before').backgroundColor).toBe('rgb(0, 255, 0)')
    expect(Number.parseFloat(getComputedStyle(red!, '::before').inlineSize)).toBeGreaterThan(0)
    const overflow = part('tag-list').querySelector<HTMLElement>(`[data-scope='tag'][data-part='root'][data-count]`)!
    expect(overflow.hidden).toBe(false)
    expect(getComputedStyle(overflow, '::before').content).toBe('none')
  })

  it('在触发钮上退格摘掉最后一个，焦点不动', async () => {
    const { changes } = await mount({ defaultValue: ['#ff0000', '#00ff00'] })
    part('trigger').focus()
    part('trigger').dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
    await nextTick()
    expect(changes.at(-1)).toEqual(['#ff0000'])
    expect(document.activeElement).toBe(part('trigger'))
  })

  it('标签放不下就折到下一行，文字不截短；触发钮留在首行', async () => {
    await mount({ maxTagCount: 8, defaultValue: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'] })
    for (const tag of tags()) {
      const label = tag.querySelector<HTMLElement>(`[data-scope='tag'][data-part='label']`)!
      expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1)
    }
    const rows = tags().map(tag => Math.round(tag.getBoundingClientRect().top))
    expect(new Set(rows).size).toBeGreaterThan(1)
    expect(part('trigger').getBoundingClientRect().top).toBeLessThan(Math.max(...rows))
  })

  it('表单出口：一个选中值一份同名隐藏输入', async () => {
    await mount({ defaultValue: ['#ff0000', '#00ff00'] })
    const inputs = [...host!.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="palette"]')]
    expect(inputs.map(input => input.value)).toEqual(['#ff0000', '#00ff00'])
  })
})
