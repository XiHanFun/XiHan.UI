// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type DialogElement = HTMLElement & {
  open?: boolean
  closeOnInteractOutside?: boolean
  readonly updateComplete: Promise<boolean>
}

async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

/** 挂一个非受控展开的对话框；attrs 原样写在宿主上。 */
async function mountDialog(attrs = ''): Promise<{ host: DialogElement, changes: boolean[] }> {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `<xh-dialog default-open ${attrs}>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">编辑资料</h2>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </xh-dialog>`
  document.body.append(wrapper)
  const host = wrapper.querySelector<DialogElement>('xh-dialog')!
  const changes: boolean[] = []
  host.addEventListener('open-change', event => changes.push((event as CustomEvent<{ open: boolean }>).detail.open))
  await host.updateComplete
  await tick()
  return { host, changes }
}

function pressOutside(): void {
  document.body.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', button: 0, bubbles: true, cancelable: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.cssText = ''
})

describe('xh-dialog 的 close-on-interact-outside', () => {
  it('不写时跟随 modal：模态对话框在层外按下即收起', async () => {
    const { changes } = await mountDialog()

    pressOutside()
    await tick()

    expect(changes).toEqual([false])
  })

  it('写 false 时层外按下不收起，Escape 照常', async () => {
    const { changes } = await mountDialog('close-on-interact-outside="false"')

    pressOutside()
    await tick()
    expect(changes).toEqual([])

    // 面板展开后被搬到 Portal 里，不在宿主底下
    document.querySelector('[data-scope="dialog"][data-part="content"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await tick()
    expect(changes).toEqual([false])
  })

  it('展开中途经 property 改也立刻生效', async () => {
    const { host, changes } = await mountDialog()
    host.closeOnInteractOutside = false
    await host.updateComplete

    pressOutside()
    await tick()

    expect(changes).toEqual([])
  })
})
