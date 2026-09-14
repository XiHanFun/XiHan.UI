// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
}

/**
 * 条目文本与 value 一字不差。
 *
 * 文本若与值不同（Apple/apple），机器首帧查不到条目就把文本退回值本身，下一拍再结算成真文本——
 * 这一次文本变动会顺带把表单影子的选项整批重建，表单出口于是「侥幸自愈」，测不出退化。
 * 文本等于值时两拍结果相同、不会重建，隐藏 select 首帧写成什么样就是什么样。
 */
const ITEMS = ['apple', 'banana', 'cherry'] as const

const MARKUP = `
  <div data-xh-part="root">
    <span data-xh-part="label">水果</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator"></span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        ${ITEMS.map(v => `<div data-xh-part="item" value="${v}"><span data-xh-part="item-text">${v}</span><span data-xh-part="item-indicator"></span></div>`).join('')}
      </div>
    </div>
    <select data-xh-part="hidden-select"></select>
  </div>
`

interface MountOptions {
  multiple?: boolean
  required?: boolean
  name?: string
  defaultValue?: string | string[]
  /** 挂进真表单，好用 FormData 断言提交出口 */
  inForm?: boolean
}

function mount(options: MountOptions = {}): Updatable {
  const el = document.createElement('xh-select') as Updatable & { defaultValue?: string | string[] }
  el.innerHTML = MARKUP
  if (options.multiple)
    el.toggleAttribute('multiple', true)
  if (options.required)
    el.toggleAttribute('required', true)
  if (options.name != null)
    el.setAttribute('name', options.name)
  // 多选集合递不进属性，只能走 property
  if (options.defaultValue !== undefined)
    el.defaultValue = options.defaultValue
  const parent = document.createElement(options.inForm ? 'form' : 'div')
  parent.appendChild(el)
  document.body.appendChild(parent)
  return el
}

function hidden(el: HTMLElement): HTMLSelectElement {
  return el.querySelector<HTMLSelectElement>('[data-xh-part="hidden-select"]')!
}

function selectedValues(el: HTMLElement): string[] {
  return Array.from(hidden(el).selectedOptions, o => o.value)
}

function optionValues(el: HTMLElement): string[] {
  return Array.from(hidden(el).options, o => o.value)
}

/**
 * 表单影子是 select 唯一的提交出口，也是 required 唯一的判据。
 * 它在首帧就得写对：作者不点、不敲，直接提交表单是完全正当的用法。
 */
describe('多选的表单影子', () => {
  it('首帧就把两个初始值都写成选中项', async () => {
    const el = mount({ multiple: true, name: 'fruit', defaultValue: ['apple', 'cherry'] })
    await settle(el)

    expect(hidden(el).multiple, '原生 multiple 必须开着，否则 select 表达不了集合').toBe(true)
    expect(selectedValues(el)).toEqual(['apple', 'cherry'])
  })

  it('无选中时 required 判得出「没选」，且空串选项不算一个选中项', async () => {
    const el = mount({ multiple: true, required: true, name: 'fruit' })
    await settle(el)

    expect(selectedValues(el), '多选下空串选项不该被顶成选中项').toEqual([])
    expect(hidden(el).checkValidity()).toBe(false)
    expect(hidden(el).validity.valueMissing).toBe(true)
  })

  it('选满之后 required 通过', async () => {
    const el = mount({ multiple: true, required: true, name: 'fruit', defaultValue: ['banana'] })
    await settle(el)

    expect(selectedValues(el)).toEqual(['banana'])
    expect(hidden(el).checkValidity()).toBe(true)
  })
})

/** 单选是对照组：多选那一路改完，这一路的既有不变量一条都不能松。 */
describe('单选的表单影子', () => {
  it('有选中：select.value 即那一项，required 通过', async () => {
    const el = mount({ required: true, name: 'fruit', defaultValue: 'cherry' })
    await settle(el)

    expect(hidden(el).multiple).toBe(false)
    expect(hidden(el).value).toBe('cherry')
    expect(selectedValues(el)).toEqual(['cherry'])
    expect(hidden(el).checkValidity()).toBe(true)
  })

  it('无选中：落在空串选项上，required 判得出「没选」', async () => {
    const el = mount({ required: true, name: 'fruit' })
    await settle(el)

    expect(hidden(el).value).toBe('')
    expect(hidden(el).checkValidity()).toBe(false)
    expect(hidden(el).validity.valueMissing).toBe(true)
  })
})

/**
 * 同一批选项不重建是为了别每帧刷 DOM，键要认得出「这一批不一样」。
 * multiple 不算进键里的话，运行期翻转多选而值本身没动时选项不重建，
 * 选中态就停在上一个模式的形状上。
 */
describe('运行期翻转 multiple', () => {
  it('由多选翻成单选：选项重建、原生 multiple 摘掉、选中态落到单选不变量上', async () => {
    const el = mount({ multiple: true, name: 'fruit', defaultValue: ['apple', 'cherry'] })
    await settle(el)
    expect(selectedValues(el)).toEqual(['apple', 'cherry'])
    const before = Array.from(hidden(el).options)

    el.toggleAttribute('multiple', false)
    await settle(el)

    expect(hidden(el).multiple, '原生 multiple 必须摘掉').toBe(false)
    expect(hidden(el).hasAttribute('multiple')).toBe(false)
    // 单选恒为一项：集合被收口成首项，表单影子跟着只留这一项
    expect(optionValues(el)).toEqual(['', 'apple'])
    expect(selectedValues(el)).toEqual(['apple'])
    expect(hidden(el).value).toBe('apple')
    // 选项确实换了一批新节点，不是留着上一模式的旧节点
    expect(Array.from(hidden(el).options).some(o => before.includes(o)), '选项应当整批重建').toBe(false)
  })

  it('由单选翻成多选：原生 multiple 挂上，选中项照旧', async () => {
    const el = mount({ name: 'fruit', defaultValue: 'banana' })
    await settle(el)
    expect(hidden(el).multiple).toBe(false)

    el.toggleAttribute('multiple', true)
    await settle(el)

    expect(hidden(el).multiple).toBe(true)
    expect(selectedValues(el)).toEqual(['banana'])
  })

  /**
   * 无选中着翻成多选：值与文本两头都是空的，键里没有 multiple 就认不出这一批变了。
   * 不重建的话，空串选项还挂着单选态下被原生顶上去的那份选中，
   * 于是 required 判成「选过了」——什么都没选却提交得出去。
   */
  it('无选中着由单选翻成多选：空串选项不该留着单选态顶上去的选中', async () => {
    const el = mount({ required: true, name: 'fruit' })
    await settle(el)
    expect(selectedValues(el), '单选无选中时空串选项就是落点').toEqual([''])

    el.toggleAttribute('multiple', true)
    await settle(el)

    expect(selectedValues(el)).toEqual([])
    expect(hidden(el).checkValidity(), 'required 必须仍判「没选」').toBe(false)
    expect(hidden(el).validity.valueMissing).toBe(true)
  })
})

/**
 * 提交出口的终局断言：不看属性，看 FormData 真正带出去什么。
 * 多值以重复的 name=v 对带出，是原生多选 select 的既有形状。
 */
describe('真正提交表单', () => {
  it('多选把每个值各带出一对 name=v', async () => {
    const el = mount({ multiple: true, name: 'fruit', defaultValue: ['apple', 'cherry'], inForm: true })
    await settle(el)

    const form = el.closest('form')!
    expect(new FormData(form).getAll('fruit')).toEqual(['apple', 'cherry'])
  })

  it('多选空集合不产出该字段', async () => {
    const el = mount({ multiple: true, name: 'fruit', inForm: true })
    await settle(el)

    const form = el.closest('form')!
    expect(new FormData(form).getAll('fruit')).toEqual([])
    expect(new FormData(form).has('fruit')).toBe(false)
  })

  it('缺 name 时表单影子整个不参与提交', async () => {
    const el = mount({ multiple: true, defaultValue: ['apple'], inForm: true })
    await settle(el)

    const form = el.closest('form')!
    expect([...new FormData(form).keys()]).toEqual([])
  })
})
