// @vitest-environment jsdom
// menubar 的每张菜单各有一个 positioner，全都搬到默认那个 portal 落点。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from '../src'

// 运行时不写全局配置时的落点 id
const PORTAL_ROOT_ID = 'xh-portal-root'

const MENUS = ['file', 'edit', 'view']

let unmount: (() => void) | null = null

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

/** 挂一条三张菜单的菜单栏，返回作者那棵树的宿主节点。 */
async function mountMenubar(defaultValue?: string): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({
    setup: () => () => h(XhMenubarRoot, { defaultValue }, () => [
      ...MENUS.map(value => h(XhMenubarTrigger, { key: `trigger:${value}`, value }, () => value)),
      ...MENUS.map(value => h(XhMenubarPositioner, { key: `positioner:${value}`, value }, () => [
        h(XhMenubarContent, null, () => [
          h(XhMenubarItem, { value: `${value}-only` }, () => [h(XhMenubarItemText, null, () => value)]),
        ]),
      ])),
    ]),
  }))
  app.mount(host)
  unmount = () => {
    app.unmount()
    host.remove()
  }
  await nextTick()
  await nextTick()
  return host
}

function portalRoot(): HTMLElement | null {
  return document.getElementById(PORTAL_ROOT_ID)
}

function positioners(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="menubar"][data-part="positioner"]')]
}

describe('menubar 的 positioner 落在 portal 落点', () => {
  it('三张菜单各自的 positioner 都在落点里，且不在作者那棵树里', async () => {
    const host = await mountMenubar()
    const portal = portalRoot()
    expect(portal).not.toBeNull()

    const found = positioners()
    expect(found).toHaveLength(MENUS.length)
    for (const el of found) {
      expect(portal!.contains(el)).toBe(true)
      expect(host.contains(el)).toBe(false)
    }
    // 搬运不打乱声明序：文档序仍是 file / edit / view
    expect(found.map(el => el.getAttribute('data-value'))).toEqual(MENUS)
    // 入口留在作者树里，只有浮层搬走
    expect(host.querySelectorAll('[data-scope="menubar"][data-part="trigger"]')).toHaveLength(MENUS.length)
  })

  it('展开那一张的 content 与条目跟着 positioner 一起在落点里', async () => {
    await mountMenubar('edit')
    const portal = portalRoot()!
    const content = portal.querySelector<HTMLElement>('[data-scope="menubar"][data-part="content"][data-value="edit"]')
    expect(content).not.toBeNull()
    expect(content!.hasAttribute('hidden')).toBe(false)
    expect(portal.querySelectorAll('[data-scope="menubar"][data-part="item"]')).toHaveLength(MENUS.length)
  })

  it('卸载后落点里不留残骸', async () => {
    await mountMenubar()
    unmount?.()
    unmount = null
    await nextTick()
    expect(portalRoot()?.childElementCount).toBe(0)
    expect(positioners()).toHaveLength(0)
  })
})
