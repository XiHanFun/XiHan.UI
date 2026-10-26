// @vitest-environment jsdom
// 对话框与抽屉的标准结构：不给 children 时照 dialogStructure / drawerStructure 铺。
// trigger、title、description、body、footer 几段内容给了哪段铺哪段，与手写全套部件同一棵树；
// 页脚的确定与取消走确认门：同步确认即收起，返回 thenable 挂起（转圈、Escape 关不掉），
// 拒绝留在原地并报 onConfirmError，取消调 onCancelPress 并收起。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
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

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

/** 机器的效应与 Promise 的兑现各排一拍，多催几轮让 DOM 落定。 */
async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
  }
}

async function render(node: ReactNode): Promise<void> {
  act(() => root?.unmount())
  document.body.innerHTML = ''
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
  await tick()
}

function part(scope: string, name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

async function click(el: HTMLElement): Promise<void> {
  await act(async () => {
    el.click()
  })
  await tick()
}

/** 文档序里的部件名与文字：遮罩与定位层由 content 组件自己装配，一并列出。 */
function skeleton(scope: string): string[] {
  return Array.from(document.querySelectorAll(`[data-scope="${scope}"][data-part]`), el => `${el.localName}|${el.getAttribute('data-part')}|${el.children.length === 0 ? el.textContent : ''}`)
}

describe('对话框的标准结构', () => {
  it('三个 prop 写出确认对话框：与手写全套部件同一棵树', async () => {
    await render(<XhDialogRoot defaultOpen trigger="删除" title="删除文件？" description="删除后无法恢复。" />)
    const auto = skeleton('dialog')
    await render(
      <XhDialogRoot defaultOpen>
        <XhDialogTrigger>删除</XhDialogTrigger>
        <XhDialogContent>
          <XhDialogHeader>
            <XhDialogTitle>删除文件？</XhDialogTitle>
            <XhDialogDescription>删除后无法恢复。</XhDialogDescription>
          </XhDialogHeader>
          <XhDialogFooter>
            <XhDialogCancelTrigger>Cancel</XhDialogCancelTrigger>
            <XhDialogConfirmTrigger>OK</XhDialogConfirmTrigger>
          </XhDialogFooter>
          <XhDialogCloseTrigger />
        </XhDialogContent>
      </XhDialogRoot>,
    )
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
  })

  it('actions：alert 只铺确定，none 不铺页脚；footer 整段接管；按钮文字可改', async () => {
    await render(<XhDialogRoot defaultOpen title="已保存" actions="alert" confirmText="知道了" />)
    expect(part('dialog', 'cancel-trigger')).toBeNull()
    expect(part('dialog', 'confirm-trigger')!.textContent).toBe('知道了')
    expect(part('dialog', 'trigger')).toBeNull()

    await render(<XhDialogRoot defaultOpen title="只看" actions="none" body="正文" />)
    expect(part('dialog', 'footer')).toBeNull()
    expect(part('dialog', 'body')!.textContent).toBe('正文')

    await render(<XhDialogRoot defaultOpen title={<strong>自定标题</strong>} footer={<button type="button">自定按钮</button>} />)
    expect(part('dialog', 'title')!.innerHTML).toBe('<strong>自定标题</strong>')
    expect(part('dialog', 'footer')!.textContent).toBe('自定按钮')
    expect(part('dialog', 'confirm-trigger')).toBeNull()
  })

  it('确定：同步回调即收起；取消调 onCancelPress 并收起', async () => {
    const onConfirm = vi.fn()
    const onCancelPress = vi.fn()
    const onOpenChange = vi.fn()
    await render(<XhDialogRoot trigger="打开" title="确认" onConfirm={onConfirm} onCancelPress={onCancelPress} onOpenChange={onOpenChange} />)
    await click(part('dialog', 'trigger')!)
    await click(part('dialog', 'confirm-trigger')!)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))

    await click(part('dialog', 'trigger')!)
    await click(part('dialog', 'cancel-trigger')!)
    expect(onCancelPress).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })

  it('确定返回 thenable：挂起时转圈、Escape 关不掉，兑现才收起；拒绝留在原地并报 onConfirmError', async () => {
    let settle: { resolve: () => void, reject: (cause: unknown) => void } | undefined
    const onConfirm = (): Promise<void> => new Promise((resolve, reject) => {
      settle = { resolve, reject }
    })
    const onConfirmError = vi.fn()
    const onOpenChange = vi.fn()
    const escape = async (): Promise<void> => {
      await act(async () => {
        part('dialog', 'content')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      })
      await tick()
    }

    // 没挂起时 Escape 照常收起：下面「挂起时关不掉」才有意义
    await render(<XhDialogRoot defaultOpen title="提交" onOpenChange={onOpenChange} />)
    await escape()
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
    onOpenChange.mockClear()

    await render(<XhDialogRoot defaultOpen title="提交" onConfirm={onConfirm} onConfirmError={onConfirmError} onOpenChange={onOpenChange} />)
    await click(part('dialog', 'confirm-trigger')!)
    expect(part('dialog', 'confirm-trigger')!.hasAttribute('data-loading')).toBe(true)
    expect(part('dialog', 'confirm-trigger')!.getAttribute('aria-busy')).toBe('true')
    await escape()
    expect(onOpenChange).not.toHaveBeenCalled()

    await act(async () => {
      settle!.reject(new Error('网络错误'))
    })
    await tick()
    expect(onConfirmError).toHaveBeenCalledWith({ cause: new Error('网络错误') })
    expect(part('dialog', 'confirm-trigger')!.hasAttribute('data-loading')).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()

    await click(part('dialog', 'confirm-trigger')!)
    await act(async () => {
      settle!.resolve()
    })
    await tick()
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })
})

describe('抽屉的标准结构', () => {
  it('部件铺在 root 里，与对话框同一份面板结构；开了改尺时 content 末尾是改尺把手；title 不再是根上的原生属性', async () => {
    await render(<XhDrawerRoot defaultOpen trigger="筛选" title="筛选条件" body="条件表单" resizable />)
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
    expect(part('drawer', 'root')!.hasAttribute('title')).toBe(false)
  })

  it('确定与取消照对话框的确认门走', async () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    await render(<XhDrawerRoot defaultOpen title="筛选" confirmText="应用" onConfirm={onConfirm} onOpenChange={onOpenChange} />)
    expect(part('drawer', 'confirm-trigger')!.textContent).toBe('应用')
    await click(part('drawer', 'confirm-trigger')!)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })
})
