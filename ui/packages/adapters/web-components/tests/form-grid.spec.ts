// @vitest-environment jsdom
// 网格排布在 WC 这一端独有的那两段：columns 特性收整数与 JSON 对象两种写法，
// 字段容器自报的 span 特性读回来落成 data-span。
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

async function tick(): Promise<void> {
  await new Promise(r => setTimeout(r, 0))
  await new Promise(r => setTimeout(r, 0))
}

beforeAll(() => {
  defineXhElements()
})

afterEach(() => {
  document.body.innerHTML = ''
})

async function mount(hostAttrs: string, groupAttrs = ''): Promise<{ root: HTMLElement, group: HTMLElement }> {
  document.body.innerHTML = `
    <xh-form ${hostAttrs}>
      <form data-xh-part="root">
        <div data-xh-part="field-group" value="name" ${groupAttrs}></div>
      </form>
    </xh-form>
  `
  await tick()
  return {
    root: document.body.querySelector('[data-part="root"]') as HTMLElement,
    group: document.body.querySelector('[data-part="field-group"]') as HTMLElement,
  }
}

describe('xh-form 的网格排布', () => {
  it('整数列数只落 base 那一档', async () => {
    const { root } = await mount('layout="grid" columns="2"')
    expect(root.getAttribute('data-layout')).toBe('grid')
    expect(root.getAttribute('data-columns')).toBe('2')
    expect(root.hasAttribute('data-columns-md')).toBe(false)
  })

  it('json 对象逐档落', async () => {
    const { root } = await mount(`layout="grid" columns='{"base":1,"md":2}'`)
    expect(root.getAttribute('data-columns')).toBe('1')
    expect(root.getAttribute('data-columns-md')).toBe('2')
    expect(root.hasAttribute('data-columns-sm')).toBe(false)
  })

  it('解析不出对象时当没写', async () => {
    const { root } = await mount(`layout="grid" columns='{oops'`)
    expect(root.hasAttribute('data-columns')).toBe(false)
  })

  it('字段容器的 span 落成 data-span', async () => {
    const { group } = await mount('layout="grid" columns="2"', 'span="full"')
    expect(group.getAttribute('data-span')).toBe('full')
  })

  it('不写 span 就不产出属性', async () => {
    const { group } = await mount('layout="grid" columns="2"')
    expect(group.hasAttribute('data-span')).toBe(false)
  })
})
