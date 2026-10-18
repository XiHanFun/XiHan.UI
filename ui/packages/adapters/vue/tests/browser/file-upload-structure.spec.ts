// 文件上传的标准结构：点标题只把焦点交给投放区、不弹选择框；投放区是唯一的打开入口，axe 不报重复入口与嵌套交互；
// 删掉中间那一行时替身留在原处淡出；禁用时投放区退出 Tab 序列，只读时留在序列里，两者都不收拖放、都报不可用；
// 只读时已有附件照样能 Tab 走到、读得出，删除钮报不可用，作者写在行里的链接照常可用。
// 焦点去处、Tab 顺序、替身的落位与 axe 只有真实浏览器量得出。
import type { FileUploadFile, FileUploadRemoteFile } from '@xihan-ui/headless'
import type { App } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhFileUploadItem, XhFileUploadItemDeleteTrigger, XhFileUploadItemName, XhFileUploadList, XhFileUploadRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const ITEM = `[data-scope='file-upload'][data-part='item']`

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='file-upload'][data-part='${name}']`)!
}

async function mount(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  app = createApp({
    render: () => h('div', [
      h('button', { id: 'before' }, '之前'),
      h(XhFileUploadRoot, { label: '附件', maxFiles: 5, ...props }),
      h('button', { id: 'after' }, '之后'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 派一次 dragover，返回投放区收没收（收的话会拦下默认行为）。 */
function dragOver(el: HTMLElement): boolean {
  const event = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })
  el.dispatchEvent(event)
  return event.defaultPrevented
}

describe('文件上传的标准结构', () => {
  it('点标题只把焦点交给投放区，选择框没有被打开', async () => {
    await mount({})
    let opened = 0
    part('hidden-input').addEventListener('click', () => opened++)
    await userEvent.click(part('label'))
    expect(document.activeElement).toBe(part('dropzone'))
    expect(opened).toBe(0)
  })

  it('投放区是唯一的打开入口：Tab 一次就越过整个组件，axe 不报问题', async () => {
    await mount({ clearable: true })
    expect(host!.querySelector(`[data-scope='file-upload'][data-part='trigger']`)).toBeNull()
    host!.querySelector<HTMLElement>('#before')!.focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(part('dropzone'))
    expect(part('dropzone').textContent).toBe('Drag files here or click to browse')
    const { violations } = await runAxe(host!)
    expect(violations.map(v => v.id)).toEqual([])
  })

  it('删掉中间那一行：替身留在那一行原处淡出，前后两行照旧', async () => {
    const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt'), new File(['c'], 'c.txt')]
    await mount({ defaultFiles: files })
    const rows = [...host!.querySelectorAll<HTMLElement>(ITEM)]
    const middle = rows[1]!.getBoundingClientRect()
    await userEvent.click(rows[1]!.querySelector<HTMLElement>(`[data-part='item-delete-trigger']`)!)
    await expect.poll(() => host!.querySelector(`${ITEM}[data-state='closed']`) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLElement>(`${ITEM}[data-state='closed']`)!
    expect(ghost.querySelector(`[data-part='item-name']`)!.textContent).toBe('b.txt')
    expect(Math.abs(ghost.getBoundingClientRect().top - middle.top)).toBeLessThan(1)
    const live = [...host!.querySelectorAll<HTMLElement>(`${ITEM}:not([data-state='closed'])`)]
    expect(live.map(row => row.querySelector(`[data-part='item-name']`)!.textContent)).toEqual(['a.txt', 'c.txt'])
  })

  it('禁用时投放区退出 Tab 序列、报禁用、不收拖放；只读时留在 Tab 序列、报不可用、不收拖放，按 Enter 不弹选择框', async () => {
    await mount({ disabled: true })
    host!.querySelector<HTMLElement>('#before')!.focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(host!.querySelector('#after'))
    expect(part('dropzone').getAttribute('aria-disabled')).toBe('true')
    expect(dragOver(part('dropzone'))).toBe(false)
    app!.unmount()
    host!.remove()

    await mount({ readOnly: true })
    let opened = 0
    part('hidden-input').addEventListener('click', () => opened++)
    host!.querySelector<HTMLElement>('#before')!.focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(part('dropzone'))
    expect(part('dropzone').getAttribute('aria-disabled')).toBe('true')
    await userEvent.keyboard('{Enter}')
    expect(opened).toBe(0)
    expect(dragOver(part('dropzone'))).toBe(false)
    expect(part('root').hasAttribute('data-dragging')).toBe(false)
  })

  it('只读时已有附件照样能 Tab 走到、读得出：文件名与大小在场，删除钮报不可用、点了不删；作者写在行里的链接照常可用', async () => {
    const remote: FileUploadRemoteFile[] = [{ id: 'r1', name: '合同.pdf', size: 2048, url: '/files/r1' }, { id: 'r2', name: '报价.pdf', size: 4096 }]
    await mount({ readOnly: true, defaultRemoteFiles: remote })
    const rows = [...host!.querySelectorAll<HTMLElement>(ITEM)]
    expect(rows.map(row => row.querySelector(`[data-part='item-name']`)!.textContent)).toEqual(['合同.pdf', '报价.pdf'])
    expect(rows.map(row => row.querySelector(`[data-part='item-size-text']`)!.textContent)).toEqual(['2 KB', '4 KB'])
    const deletes = rows.map(row => row.querySelector<HTMLElement>(`[data-part='item-delete-trigger']`)!)
    expect(deletes.map(el => [el.getAttribute('aria-disabled'), el.getAttribute('aria-label')])).toEqual([['true', 'Delete 合同.pdf'], ['true', 'Delete 报价.pdf']])
    host!.querySelector<HTMLElement>('#before')!.focus()
    const stops: (Element | null)[] = []
    for (let i = 0; i < 4; i++) {
      await userEvent.keyboard('{Tab}')
      stops.push(document.activeElement)
    }
    expect(stops).toEqual([part('dropzone'), deletes[0], deletes[1], host!.querySelector('#after')])
    // 报不可用的按钮 Playwright 不肯点，直接派一次点击
    deletes[0]!.click()
    await nextTick()
    expect(host!.querySelectorAll(ITEM)).toHaveLength(2)
    app!.unmount()
    host!.remove()

    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhFileUploadRoot, { readOnly: true, defaultRemoteFiles: remote }, {
        default: ({ allFiles }: { allFiles: FileUploadFile[] }) => [h(XhFileUploadList, () => allFiles.map((file, index) =>
          h(XhFileUploadItem, { key: index, file }, () => [
            h(XhFileUploadItemName),
            'url' in file && file.url ? h('a', { href: file.url, id: `link-${index}` }, '打开') : null,
            h(XhFileUploadItemDeleteTrigger),
          ]),
        ))],
      }),
    })
    app.mount(host)
    await nextTick()
    const link = host.querySelector<HTMLAnchorElement>('#link-0')!
    link.focus()
    expect(document.activeElement).toBe(link)
    expect(link.getAttribute('href')).toBe('/files/r1')
    expect(link.closest('[inert]')).toBeNull()
  })
})
