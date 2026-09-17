import type { XhCommandElement } from '../../src/elements/command'
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()
let host: XhCommandElement | undefined

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await host?.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  host?.remove()
  host = undefined
  setDiagnosticsLevel('warn')
})

it('命令超过面板限高时列表内部滚动：自绘条挂在面板里、走 4px 档，原生条藏起', async () => {
  host = document.createElement('xh-command') as XhCommandElement
  host.open = true
  host.modal = false
  const items = Array.from({ length: 40 }, (_, i) => `<div data-xh-part="item" value="cmd-${i}"><span data-xh-part="item-text">命令 ${i}</span></div>`).join('')
  host.innerHTML = `<div data-xh-part="positioner"><div data-xh-part="content" style="max-block-size: 200px"><input data-xh-part="input"><div data-xh-part="list">${items}</div></div></div>`
  document.body.append(host)
  await settle()

  const content = document.querySelector<HTMLElement>('[data-scope="command"][data-part="content"]')!
  const list = document.querySelector<HTMLElement>('[data-scope="command"][data-part="list"]')!
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight)
  expect(list.hasAttribute('data-xh-scrollbar')).toBe(true)
  const bar = content.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')
  expect(bar).not.toBeNull()
  expect(bar!.getAttribute('data-size')).toBe('sm')
  expect(getComputedStyle(content).getPropertyValue('--xh-scrollbar-track-bg').trim()).toBe('transparent')
})
