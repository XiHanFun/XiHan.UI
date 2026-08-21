// @vitest-environment jsdom
// 元素自己铺行的那几件事：一致性套件只看铺出来的部件与属性，
// 铺行的过程（root 归谁、行元素复不复用、数据晚到还算不算数）只能在这里验。

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Viewer extends HTMLElement {
  value?: unknown
  size?: string
  updateComplete: Promise<unknown>
}

const ROOT_MARKUP = '<div data-xh-part="root"></div>'

function create(markup = ROOT_MARKUP): Viewer {
  const el = document.createElement('xh-json-viewer') as Viewer
  el.innerHTML = markup
  document.body.appendChild(el)
  return el
}

function part(el: HTMLElement, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="json-viewer"][data-part="${name}"]`)
}

function rowCount(el: HTMLElement): number {
  return el.querySelectorAll('[data-part="branch"],[data-part="item"]').length
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('xh-json-viewer', () => {
  it('root 的内容整份归元素接管，只留一个树容器', async () => {
    const el = create('<div data-xh-part="root"><span id="stale">占位</span></div>')
    el.value = { a: 1 }
    await el.updateComplete
    const root = part(el, 'root')!
    expect(root.querySelector('#stale')).toBeNull()
    expect(root.children).toHaveLength(1)
    expect(root.firstElementChild!.getAttribute('data-part')).toBe('tree')
  })

  it('重新铺一遍不动树容器与行元素：焦点留在原地', async () => {
    const el = create()
    el.value = { tags: ['a'] }
    await el.updateComplete
    const tree = part(el, 'tree')!
    const row = el.querySelector<HTMLElement>('[data-part="branch"]')!
    row.focus()
    el.size = 'sm'
    await el.updateComplete
    expect(part(el, 'tree')).toBe(tree)
    expect(document.activeElement).toBe(row)
  })

  it('不给 value 就是空视图：树容器在，一行也不摊', async () => {
    const el = create()
    await el.updateComplete
    expect(part(el, 'tree')).not.toBeNull()
    expect(rowCount(el)).toBe(0)
  })

  it('value 晚于升级才写进来时，default-expanded-depth 仍然算数', async () => {
    const one = create()
    one.setAttribute('default-expanded-depth', '1')
    const three = create()
    three.setAttribute('default-expanded-depth', '3')
    await one.updateComplete
    await three.updateComplete

    const payload = { server: { host: '127.0.0.1', tls: { enabled: false } } }
    one.value = payload
    three.value = payload
    await one.updateComplete
    await three.updateComplete

    // 一层：根行与 server 那一行
    expect(rowCount(one)).toBe(2)
    // 三层：再加 host、tls 与 enabled
    expect(rowCount(three)).toBe(5)
  })

  it('value 属性收的是一段 JSON 文本，解析不了就当一个字符串值', async () => {
    const ok = create()
    ok.setAttribute('value', '{"a":1}')
    await ok.updateComplete
    expect(ok.querySelector('[data-part="item-value"]')!.textContent).toBe('1')

    const bad = create()
    bad.setAttribute('value', '不是 JSON')
    await bad.updateComplete
    expect(bad.querySelector('[data-part="item-value"]')!.textContent).toBe('"不是 JSON"')
  })
})
