// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface FlexElement extends HTMLElement {
  updateComplete: Promise<boolean>
}

async function mount(markup: string): Promise<{ root: HTMLElement, host: HTMLElement }> {
  const host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  const element = host.firstElementChild as FlexElement
  await element.updateComplete
  return { root: element.querySelector<HTMLElement>('[data-xh-part="root"]')!, host }
}

describe('wc flex 输入归一接线', () => {
  it('特性上的 JSON 断点声明落成逐档属性，单值照旧', async () => {
    const { root, host } = await mount(`<xh-flex orientation='{"base":"vertical","md":"horizontal"}' gap='{"base":"xs","lg":"xl"}' justify="between">
      <div data-xh-part="root"><span>A</span><span>B</span></div>
    </xh-flex>`)
    expect(root.dataset.orientation).toBe('vertical')
    expect(root.dataset.orientationMd).toBe('horizontal')
    expect(root.dataset.gap).toBe('xs')
    expect(root.dataset.gapLg).toBe('xl')
    expect(root.dataset.justify).toBe('between')
    expect(root.dataset.justifySm).toBeUndefined()
    host.remove()
  })

  it('写坏的 JSON 当没写：方向退回缺省横排，不落半截的逐档属性', async () => {
    const { root, host } = await mount(`<xh-flex orientation='{"base":"vertical"'>
      <div data-xh-part="root"><span>A</span></div>
    </xh-flex>`)
    expect(root.dataset.orientation).toBe('horizontal')
    expect(root.dataset.orientationMd).toBeUndefined()
    host.remove()
  })
})
