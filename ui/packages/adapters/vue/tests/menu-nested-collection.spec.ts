// @vitest-environment jsdom
// 数据驱动的多级菜单：节点带 children 即为子菜单入口，默认树按 children 递归铺出下一层，深度不限；
// 叶子的选中经菜单树汇到根上。路由菜单这类深度不定、按数据生成的场景不必再手写 Sub 部件。
import type { ContextMenuNode, MenubarNode, MenuNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhContextMenuRoot, XhMenubarRoot, XhMenuRoot } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mount(render: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function item(scope: string, value: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="item"][data-value="${value}"]`)
  if (!hit)
    throw new Error(`找不到 ${scope} 条目 ${value}`)
  return hit
}

const ROUTES: MenuNode[] = [
  { value: 'home', label: '首页' },
  {
    value: 'system',
    label: '系统管理',
    children: [
      { value: 'users', label: '用户' },
      {
        value: 'perm',
        label: '权限',
        children: [
          { value: 'roles', label: '角色' },
          { value: 'menus', label: '菜单', disabled: true },
        ],
      },
    ],
  },
]

describe('menu 的 children', () => {
  it('带 children 的节点铺成子菜单入口，逐层展开到第三层，叶子选中汇到根并整链收起', async () => {
    const select = vi.fn()
    mount(() => h(XhMenuRoot, { collection: ROUTES, onSelect: select }, { trigger: () => '导航' }))
    document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!.click()
    await tick()

    const system = item('menu', 'system')
    expect(system.getAttribute('aria-haspopup')).toBe('menu')
    expect(system.textContent).toBe('系统管理')
    system.click()
    await tick()
    const perm = item('menu', 'perm')
    expect(perm.getAttribute('aria-haspopup')).toBe('menu')
    perm.click()
    await tick()
    // 第三层的禁用照样从数据里取
    expect(item('menu', 'menus').getAttribute('aria-disabled')).toBe('true')

    item('menu', 'roles').click()
    await tick()
    expect(select).toHaveBeenCalledWith({ value: 'roles' })
    expect(system.getAttribute('aria-expanded')).toBe('false')
  })

  it('勾选与单选条目不能当子菜单入口：带 children 时直接报错', () => {
    const bad: MenuNode[] = [{ value: 'x', kind: 'checkbox', children: [{ value: 'y' }] }]
    expect(() => mount(() => h(XhMenuRoot, { collection: bad, defaultOpen: true }, { trigger: () => '菜单' }))).toThrow(/children/)
  })
})

describe('menubar 条目的 children', () => {
  it('菜单栏里的条目带 children 时铺成子菜单，下一层再带 children 继续往下', async () => {
    const select = vi.fn()
    const menus: MenubarNode[] = [
      {
        value: 'file',
        label: '文件',
        items: [
          { value: 'open', label: '打开' },
          { value: 'export', label: '导出为', children: [{ value: 'pdf', label: 'PDF' }, { value: 'img', label: '图片', children: [{ value: 'png', label: 'PNG' }] }] },
        ],
      },
    ]
    mount(() => h(XhMenubarRoot, { collection: menus, onSelect: select }))
    document.querySelector<HTMLElement>('[data-scope="menubar"][data-part="trigger"][data-value="file"]')!.click()
    await tick()
    const exporter = item('menubar', 'export')
    expect(exporter.getAttribute('aria-haspopup')).toBe('menu')
    exporter.click()
    await tick()
    item('menu', 'img').click()
    await tick()
    item('menu', 'png').click()
    await tick()
    expect(select).toHaveBeenCalledWith(expect.objectContaining({ value: 'png' }))
  })
})

describe('context-menu 的 children', () => {
  it('右键菜单的节点带 children 时铺成子菜单，子层跑的是 menu 机器，叶子选中汇到右键菜单上', async () => {
    const select = vi.fn()
    const nodes: ContextMenuNode[] = [
      { value: 'copy', label: '复制' },
      { value: 'share', label: '发送到', children: [{ value: 'email', label: '邮件' }, { value: 'im', label: '消息' }] },
    ]
    mount(() => h(XhContextMenuRoot, { collection: nodes, onSelect: select }, { trigger: () => [h('span', '右键这块区域')] }))
    const trigger = document.querySelector<HTMLElement>('[data-scope="context-menu"][data-part="trigger"]')!
    trigger.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 40 }))
    await tick()
    const share = item('context-menu', 'share')
    expect(share.getAttribute('aria-haspopup')).toBe('menu')
    share.click()
    await tick()
    item('menu', 'email').click()
    await tick()
    expect(select).toHaveBeenCalledWith(expect.objectContaining({ value: 'email' }))
  })
})
