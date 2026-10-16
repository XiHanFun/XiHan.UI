// 零件宿主各自带 display，宿主写上 hidden 时要真的收起，不被零件自己的样式顶掉。
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell, DESIGNER_SHELL_ELEMENTS } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

const hosts: HTMLElement[] = []

afterEach(() => {
  for (const host of hosts.splice(0))
    host.remove()
})

describe('零件宿主的 hidden（Chromium）', () => {
  it.each(Object.keys(DESIGNER_SHELL_ELEMENTS))('%s 写上 hidden 即不占位', async (tag) => {
    const host = document.createElement(tag)
    if (tag === 'xh-designer-minimap')
      Object.assign(host, { shapes: [{ kind: 'rect', rect: { x: 0, y: 0, width: 10, height: 10 } }] })
    hosts.push(host)
    document.body.append(host)
    await (host as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete
    expect(getComputedStyle(host).display).not.toBe('none')
    host.hidden = true
    expect(getComputedStyle(host).display).toBe('none')
  })
})
