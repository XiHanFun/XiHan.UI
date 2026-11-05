// 面板里的可折叠分组在真实布局下：箭头排在分组标题前面，标题紧贴箭头、不被推到行尾；
// 分组正文是控件，不是阅读文字，不取手风琴正文那档弱字色。
import type { XhDesignerPaletteElement, XhDesignerPropertiesElement } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let panel: HTMLElement | undefined

afterEach(() => {
  panel?.remove()
  panel = undefined
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

async function mountPalette(): Promise<XhDesignerPaletteElement> {
  const element = document.createElement('xh-designer-palette')
  element.style.cssText = 'display:block;width:280px'
  element.collapsible = true
  element.groups = [{ id: 'g', label: '元素', items: [{ id: 'text', label: '文本' }] }]
  document.body.append(element)
  panel = element
  await element.updateComplete
  return element
}

async function mountProperties(): Promise<XhDesignerPropertiesElement> {
  const element = document.createElement('xh-designer-properties')
  element.style.cssText = 'display:block;width:280px'
  element.collapsible = true
  element.targets = [{
    kind: 'task',
    id: 't1',
    value: { label: '审批' },
    descriptors: [{ path: ['label'], control: { kind: 'text' }, group: 'basic', label: '名称' }],
  }]
  document.body.append(element)
  panel = element
  await element.updateComplete
  return element
}

describe.each([
  ['物料面板', mountPalette],
  ['属性面板', mountProperties],
])('%s的可折叠分组', (_name, mount) => {
  it('箭头排在分组标题前面，标题紧贴箭头，余量落在标题之后', async () => {
    const element = await mount()
    const trigger = element.querySelector<HTMLElement>('[data-scope="accordion"][data-part="trigger"]')!
    const indicator = trigger.querySelector<HTMLElement>('[data-part="indicator"]')!
    const label = trigger.querySelector<HTMLElement>('[data-part="group-label"]')!

    expect(trigger.firstElementChild).toBe(indicator)
    expect(trigger.lastElementChild).toBe(label)
    // offset 系不计旋转：转过的盒子外接矩形比它自己宽
    const gap = label.offsetLeft - (indicator.offsetLeft + indicator.offsetWidth)
    expect(gap).toBeGreaterThan(0)
    expect(gap).toBeLessThan(10)
    expect(trigger.getBoundingClientRect().right - label.getBoundingClientRect().right).toBeGreaterThan(100)
  })

  it('分组正文取正文字色，不跟手风琴正文变弱', async () => {
    const element = await mount()
    const content = element.querySelector<HTMLElement>('[data-scope="accordion"][data-part="content"]')!
    expect(getComputedStyle(content).color).toBe(tokenColor('--xh-fg-default'))
  })
})
