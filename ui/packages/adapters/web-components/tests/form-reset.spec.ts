// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

/**
 * 机器层的重置行为由两个适配器共用，这里只验 WC 这一端独有的那一段：
 * MachineController 那座桥挂没挂上、断连时撤没撤、重连时重不重建。
 */

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

function mount(html: string): HTMLFormElement {
  document.body.innerHTML = html
  return document.body.querySelector('form') as HTMLFormElement
}

describe('xh-radio-group 在表单里', () => {
  it('改过之后重置，回到 defaultValue', async () => {
    const form = mount(`
      <form>
        <xh-radio-group name="plan" default-value="a">
          <div data-xh-part="item" value="a">甲</div>
          <div data-xh-part="item" value="b">乙</div>
        </xh-radio-group>
      </form>
    `)
    await tick()
    const 选中 = (): string | null =>
      [...form.querySelectorAll('[data-part="item"]')]
        .find(e => e.getAttribute('aria-checked') === 'true')
        ?.getAttribute('data-value') ?? null

    expect(选中()).toBe('a')
    form.querySelector<HTMLElement>('[data-part="item"][data-value="b"]')?.click()
    await tick()
    expect(选中()).toBe('b')

    form.reset()
    await tick()
    expect(选中()).toBe('a')
  })

  it('重置被拦下时不动', async () => {
    const form = mount(`
      <form>
        <xh-radio-group name="plan" default-value="a">
          <div data-xh-part="item" value="a">甲</div>
          <div data-xh-part="item" value="b">乙</div>
        </xh-radio-group>
      </form>
    `)
    await tick()
    form.querySelector<HTMLElement>('[data-part="item"][data-value="b"]')?.click()
    await tick()
    form.addEventListener('reset', e => e.preventDefault())
    form.reset()
    await tick()

    const 选中 = [...form.querySelectorAll('[data-part="item"]')]
      .find(e => e.getAttribute('aria-checked') === 'true')
      ?.getAttribute('data-value')
    expect(选中).toBe('b')
  })

  it('不在表单里：重置别人的表单与我无关', async () => {
    document.body.innerHTML = `
      <form id="别人"></form>
      <xh-radio-group name="plan" default-value="a">
        <div data-xh-part="item" value="a">甲</div>
        <div data-xh-part="item" value="b">乙</div>
      </xh-radio-group>
    `
    await tick()
    document.querySelector<HTMLElement>('[data-part="item"][data-value="b"]')?.click()
    await tick()

    ;(document.querySelector('#别人') as HTMLFormElement).reset()
    await tick()

    const 选中 = [...document.querySelectorAll('[data-part="item"]')]
      .find(e => e.getAttribute('aria-checked') === 'true')
      ?.getAttribute('data-value')
    expect(选中).toBe('b')
  })

  it('搬出表单再搬回来：桥跟着重建，仍然认这一份表单的重置', async () => {
    document.body.innerHTML = `
      <form></form>
      <div id="外面"></div>
    `
    const form = document.querySelector('form') as HTMLFormElement
    const 外面 = document.querySelector('#外面') as HTMLElement
    const el = document.createElement('xh-radio-group')
    el.setAttribute('name', 'plan')
    el.setAttribute('default-value', 'a')
    el.innerHTML = `
      <div data-xh-part="item" value="a">甲</div>
      <div data-xh-part="item" value="b">乙</div>
    `
    form.append(el)
    await tick()

    // 搬出去（断连 → 桥撤掉），再搬回来（重连 → 桥重建）
    外面.append(el)
    await tick()
    form.append(el)
    await tick()

    el.querySelector<HTMLElement>('[data-part="item"][data-value="b"]')?.click()
    await tick()
    form.reset()
    await tick()

    const 选中 = [...el.querySelectorAll('[data-part="item"]')]
      .find(e => e.getAttribute('aria-checked') === 'true')
      ?.getAttribute('data-value')
    expect(选中).toBe('a')
  })
})
