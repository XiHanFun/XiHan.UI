// @vitest-environment jsdom
// 对话框与抽屉的标准结构：不写默认插槽时照 dialogStructure / drawerStructure 铺。
// 几个 props 或插槽给出标题、说明、正文与页脚，与手写全套部件同一棵树；页脚的确定与取消走确认门：
// 同步确认即收起，返回 thenable 挂起（转圈、Escape 关不掉），拒绝留在原地并报 confirm-error，取消发 cancel-press 并收起。
import type { Component, VNode } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDialogBody,
  XhDialogCancelTrigger,
  XhDialogCloseTrigger,
  XhDialogConfirmTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
  XhDrawerRoot,
} from '../src'

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

function mountVNode(render: () => VNode): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function part(scope: string, name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

/** 文档序里的部件名与文字：遮罩与定位层由 content 组件自己装配，一并列出。 */
function skeleton(scope: string): string[] {
  return Array.from(document.querySelectorAll(`[data-scope="${scope}"][data-part]`), node => `${node.localName}|${node.getAttribute('data-part')}|${node.children.length === 0 ? node.textContent : ''}`)
}

describe('对话框的标准结构', () => {
  it('三个 prop 写出确认对话框：与手写全套部件同一棵树', async () => {
    mountVNode(() => h(XhDialogRoot, { defaultOpen: true, triggerText: '删除', title: '删除文件？', description: '删除后无法恢复。' }))
    await tick()
    const auto = skeleton('dialog')
    cleanup.forEach(fn => fn())
    cleanup = []
    document.body.innerHTML = ''

    mountVNode(() => h(XhDialogRoot, { defaultOpen: true }, () => [
      h(XhDialogTrigger, () => '删除'),
      h(XhDialogContent, null, () => [
        h(XhDialogHeader, null, () => [h(XhDialogTitle, () => '删除文件？'), h(XhDialogDescription, () => '删除后无法恢复。')]),
        h(XhDialogFooter, null, () => [h(XhDialogCancelTrigger, () => 'Cancel'), h(XhDialogConfirmTrigger, () => 'OK')]),
        h(XhDialogCloseTrigger),
      ]),
    ]))
    await tick()
    expect(auto).toEqual(skeleton('dialog'))
    expect(auto.map(row => row.split('|')[1])).toEqual([
      'trigger',
      'backdrop',
      'positioner',
      'content',
      'header',
      'title',
      'description',
      'footer',
      'cancel-trigger',
      'confirm-trigger',
      'close-trigger',
    ])
    expect(part('dialog', 'content')!.getAttribute('aria-labelledby')).toBe(part('dialog', 'title')!.id)
    expect(part('dialog', 'content')!.getAttribute('aria-describedby')).toBe(part('dialog', 'description')!.id)
  })

  it('actions：alert 只铺确定，none 不铺页脚；footer 插槽整段接管；按钮文字可改', async () => {
    mountVNode(() => h(XhDialogRoot, { defaultOpen: true, title: '已保存', actions: 'alert', confirmText: '知道了' }))
    await tick()
    expect(part('dialog', 'cancel-trigger')).toBeNull()
    expect(part('dialog', 'confirm-trigger')!.textContent).toBe('知道了')
    expect(part('dialog', 'trigger')).toBeNull()
    cleanup.forEach(fn => fn())
    cleanup = []

    mountVNode(() => h(XhDialogRoot, { defaultOpen: true, title: '只看', actions: 'none' }, { body: () => '正文' }))
    await tick()
    expect(part('dialog', 'footer')).toBeNull()
    expect(part('dialog', 'body')!.textContent).toBe('正文')
    cleanup.forEach(fn => fn())
    cleanup = []

    mountVNode(() => h(XhDialogRoot, { defaultOpen: true }, { title: () => h('strong', '自定标题'), footer: () => h('button', { type: 'button' }, '自定按钮') }))
    await tick()
    expect(part('dialog', 'title')!.innerHTML).toBe('<strong>自定标题</strong>')
    expect(part('dialog', 'footer')!.textContent).toBe('自定按钮')
    expect(part('dialog', 'confirm-trigger')).toBeNull()
  })

  it('确定：同步回调即收起；取消发 cancel-press 并收起', async () => {
    const onConfirm = vi.fn()
    const onCancelPress = vi.fn()
    const onOpenChange = vi.fn()
    mountVNode(() => h(XhDialogRoot, { triggerText: '打开', title: '确认', onConfirm, onCancelPress, onOpenChange }))
    await tick()
    part('dialog', 'trigger')!.click()
    await tick()
    part('dialog', 'confirm-trigger')!.click()
    await tick()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))

    part('dialog', 'trigger')!.click()
    await tick()
    part('dialog', 'cancel-trigger')!.click()
    await tick()
    expect(onCancelPress).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })

  it('确定返回 thenable：挂起时转圈、Escape 关不掉，兑现才收起；拒绝留在原地并报 confirm-error', async () => {
    let settle: { resolve: () => void, reject: (cause: unknown) => void } | undefined
    const onConfirm = (): Promise<void> => new Promise((resolve, reject) => {
      settle = { resolve, reject }
    })
    const onConfirmError = vi.fn()
    const onOpenChange = vi.fn()
    mountVNode(() => h(XhDialogRoot, { defaultOpen: true, title: '提交', onConfirm, onConfirmError, onOpenChange }))
    await tick()
    // 没挂起时 Escape 照常收起：下面「挂起时关不掉」才有意义
    part('dialog', 'content')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await tick()
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
    onOpenChange.mockClear()
    cleanup.forEach(fn => fn())
    cleanup = []
    mountVNode(() => h(XhDialogRoot, { defaultOpen: true, title: '提交', onConfirm, onConfirmError, onOpenChange }))
    await tick()

    part('dialog', 'confirm-trigger')!.click()
    await tick()
    expect(part('dialog', 'confirm-trigger')!.hasAttribute('data-loading')).toBe(true)
    expect(part('dialog', 'confirm-trigger')!.getAttribute('aria-busy')).toBe('true')
    part('dialog', 'content')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await tick()
    expect(onOpenChange).not.toHaveBeenCalled()

    settle!.reject(new Error('网络错误'))
    await tick()
    expect(onConfirmError).toHaveBeenCalledWith({ cause: new Error('网络错误') })
    expect(part('dialog', 'confirm-trigger')!.hasAttribute('data-loading')).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()

    part('dialog', 'confirm-trigger')!.click()
    await tick()
    settle!.resolve()
    await tick()
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })

  it('写了默认插槽即组合写法：结构 props 不起作用', async () => {
    mountVNode(() => h(XhDialogRoot as Component, { defaultOpen: true, title: '不会出现' }, () => [
      h(XhDialogContent, null, () => [h(XhDialogBody, null, () => '手写正文')]),
    ]))
    await tick()
    expect(part('dialog', 'title')).toBeNull()
    expect(part('dialog', 'footer')).toBeNull()
    expect(part('dialog', 'body')!.textContent).toBe('手写正文')
  })
})

describe('抽屉的标准结构', () => {
  it('部件铺在 root 里，与对话框同一份面板结构；开了改尺时 content 末尾是改尺把手', async () => {
    mountVNode(() => h(XhDrawerRoot, { defaultOpen: true, triggerText: '筛选', title: '筛选条件', resizable: true }, { body: () => '条件表单' }))
    await tick()
    expect(skeleton('drawer').map(row => row.split('|')[1])).toEqual([
      'root',
      'trigger',
      'backdrop',
      'positioner',
      'content',
      'header',
      'title',
      'body',
      'footer',
      'cancel-trigger',
      'confirm-trigger',
      'close-trigger',
      'resize-trigger',
    ])
    expect(part('drawer', 'root')!.contains(part('drawer', 'trigger'))).toBe(true)
  })

  it('确定与取消照对话框的确认门走', async () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    mountVNode(() => h(XhDrawerRoot, { defaultOpen: true, title: '筛选', confirmText: '应用', onConfirm, onOpenChange }))
    await tick()
    expect(part('drawer', 'confirm-trigger')!.textContent).toBe('应用')
    part('drawer', 'confirm-trigger')!.click()
    await tick()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })
})
