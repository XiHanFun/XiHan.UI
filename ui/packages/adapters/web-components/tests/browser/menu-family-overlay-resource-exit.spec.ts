import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Family = 'context-menu' | 'menu' | 'menubar'

defineXhElements()

let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(family: Family): HTMLElement {
  host = document.createElement('div')
  if (family === 'context-menu') {
    host.innerHTML = `<xh-context-menu open><div data-xh-part="trigger">区域</div><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="a">甲</div></div></div></xh-context-menu>`
  }
  else if (family === 'menubar') {
    host.innerHTML = `<xh-menubar value="file"><div data-xh-part="root"><button data-xh-part="trigger" value="file">文件</button><div data-xh-part="positioner" value="file"><div data-xh-part="content" value="file"><div data-xh-part="item" value="a">甲</div></div></div></div></xh-menubar>`
  }
  else {
    host.innerHTML = `<xh-menu open><button data-xh-part="trigger">菜单</button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="a">甲</div></div></div></xh-menu>`
  }
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

function setOpen(element: HTMLElement, family: Family, open: boolean): void {
  if (family === 'menubar') {
    ;(element as HTMLElement & { value: string | null }).value = open ? 'file' : null
    return
  }
  element.setAttribute('open', String(open))
}

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe.each(['context-menu', 'menu', 'menubar'] as const)('wc %s 真实退场资源', (scope) => {
  it('退场完成前保留 Layer，重开取消旧退出，最终完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-menu-family-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-menu-family-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const element = mount(scope)
    await settle()
    const original = getLayerRegistry(document).list()[0]
    expect(original).toBeDefined()

    setOpen(element, scope, false)
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    const firstExit = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-menu-family-exit')
    expect(firstExit).toBeDefined()
    expect(getLayerRegistry(document).list()).toEqual([original])

    setOpen(element, scope, true)
    await settle()
    expect(getLayerRegistry(document).list()).toEqual([original])
    firstExit!.cancel()
    setOpen(element, scope, false)
    await settle()
    const finalExit = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-menu-family-exit')
    expect(finalExit).toBeDefined()
    finalExit!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
