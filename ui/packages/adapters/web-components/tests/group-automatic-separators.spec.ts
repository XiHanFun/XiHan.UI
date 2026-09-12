// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface UpdatableGroup extends HTMLElement {
  separators?: boolean
  updateComplete: Promise<unknown>
}

async function settle(host: UpdatableGroup): Promise<void> {
  await host.updateComplete
  await host.updateComplete
}

function buttonGroup(): UpdatableGroup {
  const host = document.createElement('xh-button-group') as UpdatableGroup
  const root = document.createElement('div')
  root.dataset.xhPart = 'root'
  for (const label of ['日', '周', '月']) {
    const button = document.createElement('button')
    button.textContent = label
    root.append(button)
  }
  host.append(root)
  document.body.append(host)
  return host
}

function toggleGroup(): UpdatableGroup {
  const host = document.createElement('xh-toggle-group') as UpdatableGroup
  const root = document.createElement('div')
  root.dataset.xhPart = 'root'
  for (const value of ['bold', 'italic', 'underline']) {
    const item = document.createElement('button')
    item.dataset.xhPart = 'item'
    item.value = value
    item.textContent = value
    root.append(item)
  }
  host.append(root)
  document.body.append(host)
  return host
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('分组控件自动分隔线', () => {
  it.each([
    { name: 'ButtonGroup', mount: buttonGroup, selector: '[data-xh-button-group-separator]' },
    { name: 'ToggleGroup', mount: toggleGroup, selector: '[data-xh-toggle-group-separator]' },
  ])('$name 默认按相邻项生成，属性可关闭并恢复', async ({ mount, selector }) => {
    const host = mount()
    await settle(host)

    const generated = [...host.querySelectorAll<HTMLElement>(selector)]
    expect(generated).toHaveLength(2)
    expect(generated.every(node => node.localName === 'span')).toBe(true)
    expect(generated.every(node => node.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(generated.every(node => node.dataset.orientation === 'vertical')).toBe(true)
    expect(host.querySelector('[data-part="separator"]')).toBeNull()

    host.separators = false
    await settle(host)
    expect(host.querySelector(selector)).toBeNull()

    host.separators = true
    await settle(host)
    expect(host.querySelectorAll(selector)).toHaveLength(2)
  })

  it.each([
    { name: 'ButtonGroup', mount: buttonGroup, selector: '[data-xh-button-group-separator]' },
    { name: 'ToggleGroup', mount: toggleGroup, selector: '[data-xh-toggle-group-separator]' },
  ])('$name 在作者增加条目后重新生成分隔线', async ({ mount, selector }) => {
    const host = mount()
    await settle(host)
    const root = host.querySelector<HTMLElement>('[data-xh-part="root"]')!
    const item = document.createElement('button')
    if (host.localName === 'xh-toggle-group') {
      item.dataset.xhPart = 'item'
      item.value = 'strike'
    }
    item.textContent = '新增'
    root.append(item)
    await settle(host)

    expect(host.querySelectorAll(selector)).toHaveLength(3)
  })
})
