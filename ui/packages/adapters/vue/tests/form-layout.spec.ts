// @vitest-environment jsdom
// 表单排布：layout 落 data-layout、labelAlign 落 data-label-align、
// labelWidth 写成根上的 --xh-form-label-w 变量（number 视作 px）、
// columns 逐档落 data-columns 与 data-columns-<档>，字段容器自报的跨列落 data-span。
import type { FormFieldSpan } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFormFieldGroup, XhFormRoot } from '../src'

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

  it('grid + 整数列数：只落 base 那一档', async () => {
    const root = await mountForm({ layout: 'grid', columns: 2 })
    expect(root.getAttribute('data-layout')).toBe('grid')
    expect(root.getAttribute('data-columns')).toBe('2')
    for (const at of ['sm', 'md', 'lg', 'xl'])
      expect(root.hasAttribute(`data-columns-${at}`)).toBe(false)
  })

  it('grid + 断点对象：写了哪档就落哪档', async () => {
    const root = await mountForm({ layout: 'grid', columns: { base: 1, md: 2 } })
    expect(root.getAttribute('data-columns')).toBe('1')
    expect(root.getAttribute('data-columns-md')).toBe('2')
    expect(root.hasAttribute('data-columns-sm')).toBe(false)
    expect(root.hasAttribute('data-columns-lg')).toBe(false)
  })

  it('范围外的列数按没写算', async () => {
    const root = await mountForm({ layout: 'grid', columns: { base: 0, sm: 5, md: 2.5, lg: 3 } })
    expect(root.hasAttribute('data-columns')).toBe(false)
    expect(root.hasAttribute('data-columns-sm')).toBe(false)
    expect(root.hasAttribute('data-columns-md')).toBe(false)
    expect(root.getAttribute('data-columns-lg')).toBe('3')
  })

  it('不给列数就不产出列数属性', async () => {
    const root = await mountForm({ layout: 'grid' })
    expect(root.hasAttribute('data-columns')).toBe(false)
  })
})

describe('form 网格里的跨列', () => {
  async function mountGroup(span: FormFieldSpan | undefined): Promise<HTMLElement> {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () => h(
        XhFormRoot,
        { layout: 'grid', columns: 2 },
        () => [h(XhFormFieldGroup, { value: 'name', span }, () => [])],
      ),
    })
    app.mount(host)
    cleanup.push(() => {
      app.unmount()
      host.remove()
    })
    await tick()
    const group = document.querySelector<HTMLElement>('[data-scope="form"][data-part="field-group"]')
    if (!group)
      throw new Error('找不到字段容器')
    return group
  }

  it('数字跨列落成 data-span', async () => {
    expect((await mountGroup(2)).getAttribute('data-span')).toBe('2')
  })

  it('full 原样落下', async () => {
    expect((await mountGroup('full')).getAttribute('data-span')).toBe('full')
  })

  it('不写跨列就不产出属性', async () => {
    expect((await mountGroup(undefined)).hasAttribute('data-span')).toBe(false)
  })

  it('范围外的跨列按没写算', async () => {
    // 类型只管得住 TypeScript 那一路，运行期照样收得下 9
    expect((await mountGroup(9 as FormFieldSpan)).hasAttribute('data-span')).toBe(false)
  })
})
