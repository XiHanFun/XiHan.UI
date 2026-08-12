// @vitest-environment jsdom
// 表单排布：layout 落 data-layout、labelAlign 落 data-label-align、
// labelWidth 写成根上的 --xh-form-label-w 变量（number 视作 px）。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFormRoot } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

async function mountForm(props: Record<string, unknown>): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => () => h(XhFormRoot, props, () => []) })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  await tick()
  const root = document.querySelector<HTMLElement>('[data-scope="form"][data-part="root"]')
  if (!root)
    throw new Error('找不到表单根')
  return root
}

describe('form 排布', () => {
  it('horizontal + labelWidth + labelAlign 三件全落到根上', async () => {
    const root = await mountForm({ layout: 'horizontal', labelWidth: 96, labelAlign: 'start' })
    expect(root.getAttribute('data-layout')).toBe('horizontal')
    expect(root.getAttribute('data-label-align')).toBe('start')
    expect(root.style.getPropertyValue('--xh-form-label-w')).toBe('96px')
  })

  it('labelWidth 收 CSS 长度字符串', async () => {
    const root = await mountForm({ layout: 'horizontal', labelWidth: '8rem' })
    expect(root.style.getPropertyValue('--xh-form-label-w')).toBe('8rem')
  })

  it('缺省竖排：不产出排布属性', async () => {
    const root = await mountForm({})
    expect(root.hasAttribute('data-layout')).toBe(false)
    expect(root.hasAttribute('data-label-align')).toBe(false)
    expect(root.style.getPropertyValue('--xh-form-label-w')).toBe('')
  })

  it('inline 落 data-layout', async () => {
    const root = await mountForm({ layout: 'inline' })
    expect(root.getAttribute('data-layout')).toBe('inline')
  })
})
