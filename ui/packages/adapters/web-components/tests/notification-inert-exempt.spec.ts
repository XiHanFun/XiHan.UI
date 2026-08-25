// @vitest-environment jsdom
//
// 通知画在模态遮罩之上，被背景失活的 inert 一并罩住就成了看得见点不动。
// 豁免标记由连接层产出，这里钉住 WC 侧确实把它打到了 root 与 group 上。
import { DATA_INERT_EXEMPT } from '@xihan-ui/kernel'
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

const MARKUP = `
  <div data-xh-part="root">
    <div data-xh-part="group"></div>
  </div>
`

function mount(): Updatable {
  const el = document.createElement('xh-notification') as Updatable
  el.innerHTML = MARKUP
  document.body.appendChild(el)
  return el
}

describe('xh-notification 的 inert 豁免标记', () => {
  it('root 与 group 都被打上', async () => {
    const el = mount()
    await settle(el)

    const root = el.querySelector<HTMLElement>('[data-xh-part="root"]')!
    const group = el.querySelector<HTMLElement>('[data-xh-part="group"]')!
    expect(root.hasAttribute(DATA_INERT_EXEMPT)).toBe(true)
    expect(group.hasAttribute(DATA_INERT_EXEMPT)).toBe(true)
  })
})
