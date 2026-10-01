// @vitest-environment jsdom
//
// 数据驱动的多级菜单：节点带 children 即为子菜单入口，默认树按 children 递归铺出下一层，深度不限；
// 叶子的选中经菜单树汇到根上。与 Vue 侧的 menu-nested-collection 同一组判据。
import type { MenubarNode, MenuNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhMenubarRoot, XhMenuRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => root!.render(node))
}

function item(scope: string, value: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="item"][data-value="${value}"]`)
  if (!hit)
    throw new Error(`找不到 ${scope} 条目 ${value}`)
  return hit
}

async function click(el: HTMLElement): Promise<void> {
  await act(async () => {
    el.click()
  })
}

const ROUTES: MenuNode[] = [
  { value: 'home', label: '首页' },
  {
    value: 'system',
    label: '系统管理',
    children: [
      { value: 'users', label: '用户' },
      { value: 'perm', label: '权限', children: [{ value: 'roles', label: '角色' }, { value: 'menus', label: '菜单', disabled: true }] },
    ],
  },
]

describe('menu 的 children', () => {
  it('带 children 的节点铺成子菜单入口，逐层展开到第三层，叶子选中汇到根', async () => {
    const onSelect = vi.fn()
    await mount(<XhMenuRoot collection={ROUTES} trigger="导航" onSelect={onSelect} />)
    await click(document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!)
    const system = item('menu', 'system')
    expect(system.getAttribute('aria-haspopup')).toBe('menu')
    await click(system)
    await click(item('menu', 'perm'))
    expect(item('menu', 'menus').getAttribute('aria-disabled')).toBe('true')
    await click(item('menu', 'roles'))
    expect(onSelect).toHaveBeenCalledWith({ value: 'roles' })
  })
})

describe('menubar 条目的 children', () => {
  it('菜单栏里的条目带 children 时铺成子菜单，下一层再带 children 继续往下', async () => {
    const onSelect = vi.fn()
    const menus: MenubarNode[] = [{
      value: 'file',
      label: '文件',
      items: [
        { value: 'open', label: '打开' },
        { value: 'export', label: '导出为', children: [{ value: 'pdf', label: 'PDF' }, { value: 'img', label: '图片', children: [{ value: 'png', label: 'PNG' }] }] },
      ],
    }]
    await mount(<XhMenubarRoot collection={menus} onSelect={onSelect} />)
    await click(document.querySelector<HTMLElement>('[data-scope="menubar"][data-part="trigger"][data-value="file"]')!)
    expect(item('menubar', 'export').getAttribute('aria-haspopup')).toBe('menu')
    await click(item('menubar', 'export'))
    await click(item('menu', 'img'))
    await click(item('menu', 'png'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'png' }))
  })
})
