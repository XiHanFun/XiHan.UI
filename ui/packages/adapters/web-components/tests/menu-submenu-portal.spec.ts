// @vitest-environment jsdom
// WC 子菜单的逻辑父子接线与 Portal 所有权：父 item 身份、外部部件发现、精确归位。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface MenuElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

const MARKUP = `
  <xh-menu>
    <button data-xh-part="trigger">文件操作</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="open">打开</div>
        <xh-menu submenu>
          <div data-xh-part="trigger" value="share">发送到…</div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="item" value="email">邮件</div>
              <div data-xh-part="item" value="sms">短信</div>
            </div>
          </div>
        </xh-menu>
      </div>
    </div>
  </xh-menu>
`

async function settle(doc: Document = document): Promise<void> {
  for (let round = 0; round < 6; round++) {
    await Promise.resolve()
    for (const menu of doc.querySelectorAll<MenuElement>('xh-menu'))
      await menu.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
  for (const menu of doc.querySelectorAll<MenuElement>('xh-menu'))
    await menu.updateComplete
}

function mount(): {
  stage: HTMLElement
  root: MenuElement
  sub: MenuElement
  trigger: HTMLElement
  positioner: HTMLElement
  content: HTMLElement
} {
  const stage = document.createElement('section')
  stage.dataset.theme = 'dark'
  stage.dataset.density = 'compact'
  stage.innerHTML = MARKUP
  document.body.appendChild(stage)
  const [root, sub] = [...stage.querySelectorAll<MenuElement>('xh-menu')]
  if (!root || !sub)
    throw new Error('菜单结构未建立')
  const trigger = sub.querySelector<HTMLElement>('[data-xh-part="trigger"]')!
  const positioner = sub.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
  const content = positioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
  return { stage, root, sub, trigger, positioner, content }
}

async function openSubmenu(handles: ReturnType<typeof mount>): Promise<void> {
  handles.root.querySelector<HTMLElement>(':scope > [data-xh-part="trigger"]')!.click()
  const doc = handles.stage.ownerDocument
  await settle(doc)
  handles.trigger.click()
  await settle(doc)
  expect(handles.trigger.getAttribute('aria-expanded')).toBe('true')
}

afterEach(async () => {
  for (const menu of [...document.querySelectorAll<MenuElement>('xh-menu')].reverse()) {
    menu.open = false
    await menu.updateComplete
  }
  document.body.innerHTML = ''
})

describe('web Components Menu 子菜单 Portal', () => {
  it('触发条目同时取得父 item 与子 trigger 身份，父级 roving focus 会更新它', async () => {
    const handles = mount()
    await settle()
    handles.root.querySelector<HTMLElement>(':scope > [data-xh-part="trigger"]')!.click()
    await settle()

    expect(handles.trigger.getAttribute('role')).toBe('menuitem')
    expect(handles.trigger.getAttribute('tabindex')).toBe('-1')
    expect(handles.trigger.getAttribute('aria-haspopup')).toBe('menu')
    handles.trigger.focus()
    handles.trigger.dispatchEvent(new FocusEvent('focus'))
    await settle()
    expect(handles.trigger.getAttribute('tabindex')).toBe('0')
    expect(handles.trigger.getAttribute('data-highlighted')).toBe('')
  })

  it('展开时搬到同 Document 的独占无盒壳并桥接视觉轴，关闭后回到原精确位置', async () => {
    const handles = mount()
    const originalParent = handles.positioner.parentNode
    const originalPrevious = handles.positioner.previousSibling
    await settle()
    await openSubmenu(handles)

    const shell = handles.positioner.parentElement
    expect(shell?.dataset.xhPortalShell).toBe('')
    expect(shell?.parentElement?.id).toBe('xh-portal-root')
    expect(shell?.getAttribute('data-theme')).toBe('dark')
    expect(shell?.getAttribute('data-density')).toBe('compact')
    expect(handles.sub.contains(handles.positioner)).toBe(false)

    handles.trigger.click()
    await settle()
    expect(handles.positioner.parentNode).toBe(originalParent)
    expect(handles.positioner.previousSibling).toBe(originalPrevious)
    expect(shell?.isConnected).toBe(false)
  })

  it('positioner 在 Portal 中时新增角色节点仍由原宿主接线', async () => {
    const handles = mount()
    await settle()
    await openSubmenu(handles)
    const late = document.createElement('div')
    late.dataset.xhPart = 'item'
    late.setAttribute('value', 'late')
    late.textContent = '稍后处理'
    handles.content.appendChild(late)
    await settle()

    expect(late.getAttribute('data-scope')).toBe('menu')
    expect(late.getAttribute('data-part')).toBe('item')
    expect(late.getAttribute('role')).toBe('menuitem')
  })

  it('展开期间 trigger 换代会重建视觉来源与父 item 接线，不沿用旧节点', async () => {
    const handles = mount()
    await settle()
    await openSubmenu(handles)
    const oldShell = handles.positioner.parentElement!
    const next = document.createElement('div')
    next.dataset.xhPart = 'trigger'
    next.setAttribute('value', 'share-next')
    next.textContent = '发送到新位置…'
    handles.trigger.replaceWith(next)
    await settle()

    expect(next.getAttribute('role')).toBe('menuitem')
    expect(next.getAttribute('aria-haspopup')).toBe('menu')
    expect(handles.positioner.parentElement?.dataset.xhPortalShell).toBe('')
    expect(handles.positioner.parentElement).not.toBe(oldShell)
    expect(oldShell.isConnected).toBe(false)
    next.click()
    await settle()
    expect(handles.sub.contains(handles.positioner)).toBe(true)
  })

  it('叶项选择经逻辑所有权只向根上报一次，并按叶到根关闭', async () => {
    const handles = mount()
    const select = vi.fn()
    handles.root.addEventListener('select', select)
    await settle()
    await openSubmenu(handles)
    handles.content.querySelector<HTMLElement>('[value="sms"]')!.click()
    await settle()

    expect(select).toHaveBeenCalledTimes(1)
    expect((select.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ value: 'sms' })
    expect(handles.trigger.getAttribute('aria-expanded')).toBe('false')
    expect(handles.root.querySelector<HTMLElement>(':scope > [data-xh-part="trigger"]')!.getAttribute('aria-expanded')).toBe('false')
  })

  it('展开期间宿主断开会恢复作者节点并移除 Portal 壳', async () => {
    const handles = mount()
    const originalParent = handles.positioner.parentNode
    await settle()
    await openSubmenu(handles)
    const shell = handles.positioner.parentElement!

    handles.sub.remove()
    await settle()
    expect(handles.positioner.parentNode).toBe(originalParent)
    expect(shell.isConnected).toBe(false)
  })

  it('adopt 到 iframe 后只使用新所属 Document 的 Portal 与视觉环境', async () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameDoc = frame.contentDocument!
    const handles = mount()
    handles.stage.remove()
    frameDoc.adoptNode(handles.stage)
    frameDoc.body.appendChild(handles.stage)
    await settle(frameDoc)
    await openSubmenu(handles)

    const shell = handles.positioner.parentElement!
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(document.getElementById('xh-portal-root')).toBeNull()
    handles.trigger.click()
    await settle(frameDoc)
    frame.remove()
  })
})
