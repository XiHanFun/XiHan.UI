// 文件上传的标准结构：点标题只把焦点交给投放区、不弹选择框；投放区是唯一的打开入口，axe 不报重复入口与嵌套交互；
// 删掉中间那一行时替身留在原处淡出；禁用时投放区退出 Tab 序列，只读时留在序列里，两者都不收拖放、都报不可用；
// 只读时已有附件照样能 Tab 走到、读得出，删除钮报不可用，作者写在行里的链接照常可用。
// 焦点去处、Tab 顺序、替身的落位与 axe 只有真实浏览器量得出。
import type { FileUploadRemoteFile } from '@xihan-ui/headless'
import type { XhFileUploadElement } from '../../src/elements/file-upload'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let wrap: HTMLElement | undefined
let host: XhFileUploadElement | undefined

const ITEM = `[data-scope='file-upload'][data-part='item']`

afterEach(() => {
  wrap?.remove()
  wrap = undefined
  host = undefined
})

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve()
    await host?.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

async function mount(props: Partial<XhFileUploadElement>): Promise<void> {
  wrap = document.createElement('div')
  wrap.style.inlineSize = '360px'
  wrap.innerHTML = '<button id="before" type="button">之前</button><xh-file-upload></xh-file-upload><button id="after" type="button">之后</button>'
  host = wrap.querySelector<XhFileUploadElement>('xh-file-upload')!
  Object.assign(host, { label: '附件', maxFiles: 5, ...props })
  document.body.append(wrap)
  await settle()
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='file-upload'][data-part='${name}']`)!
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
    wrap!.querySelector<HTMLElement>('#before')!.focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(part('dropzone'))
    expect(part('dropzone').textContent).toBe('Drag files here or click to browse')
    const { violations } = await runAxe(wrap!)
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
    await mount({ disabled: true, defaultRemoteFiles: [{ id: 'r1', name: '合同.pdf', url: '/files/r1' }] })
    wrap!.querySelector<HTMLElement>('#before')!.focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(wrap!.querySelector('#after'))
    expect(part('dropzone').getAttribute('aria-disabled')).toBe('true')
    expect([part('item-link').getAttribute('tabindex'), part('item-link').getAttribute('aria-disabled')]).toEqual(['-1', 'true'])
    expect(dragOver(part('dropzone'))).toBe(false)
    wrap!.remove()

    await mount({ readOnly: true })
    let opened = 0
    part('hidden-input').addEventListener('click', () => opened++)
    wrap!.querySelector<HTMLElement>('#before')!.focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(part('dropzone'))
    expect(part('dropzone').getAttribute('aria-disabled')).toBe('true')
    await userEvent.keyboard('{Enter}')
    expect(opened).toBe(0)
    expect(dragOver(part('dropzone'))).toBe(false)
    expect(part('root').hasAttribute('data-dragging')).toBe(false)
  })

  it('只读时已有附件照样能 Tab 走到、读得出：文件名与大小在场，删除钮报不可用、点了不删；作者写在行里的链接照常可用', async () => {
    const remote: FileUploadRemoteFile[] = [
      { id: 'r1', name: '合同.pdf', size: 2048, url: '/files/r1' },
      { id: 'r2', name: '报价.pdf', size: 4096 },
      { id: 'r3', name: '坏.pdf', size: 1024, url: 'javascript:alert(1)' },
    ]
    await mount({ readOnly: true, linkTarget: '_blank', defaultRemoteFiles: remote })
    const rows = [...host!.querySelectorAll<HTMLElement>(ITEM)]
    expect(rows.map(row => row.querySelector(`[data-part='item-name']`)!.textContent)).toEqual(['合同.pdf', '报价.pdf', '坏.pdf'])
    expect(rows.map(row => row.querySelector(`[data-part='item-size-text']`)!.textContent)).toEqual(['2 KB', '4 KB', '1 KB'])
    // 带安全地址的那份文件名就是链接，新窗口打开；地址不安全的那份不铺链接，文件名是纯文字
    const link = rows[0]!.querySelector<HTMLAnchorElement>(`[data-part='item-link']`)!
    expect([link.getAttribute('href'), link.target, link.rel, link.textContent]).toEqual(['/files/r1', '_blank', 'noopener noreferrer', '合同.pdf'])
    expect([rows[1]!.querySelector('a'), rows[2]!.querySelector('a')]).toEqual([null, null])
    const deletes = rows.map(row => row.querySelector<HTMLElement>(`[data-part='item-delete-trigger']`)!)
    expect(deletes.map(el => [el.getAttribute('aria-disabled'), el.getAttribute('aria-label')])).toEqual([['true', 'Delete 合同.pdf'], ['true', 'Delete 报价.pdf'], ['true', 'Delete 坏.pdf']])
    wrap!.querySelector<HTMLElement>('#before')!.focus()
    const stops: (Element | null)[] = []
    for (let i = 0; i < 6; i++) {
      await userEvent.keyboard('{Tab}')
      stops.push(document.activeElement)
    }
    // 只读时链接照常在 Tab 序列里，排在它那一行的删除钮之前
    expect(stops).toEqual([part('dropzone'), link, deletes[0], deletes[1], deletes[2], wrap!.querySelector('#after')])
    // 报不可用的按钮 Playwright 不肯点，直接派一次点击
    deletes[0]!.click()
    await settle()
    expect(host!.querySelectorAll(ITEM)).toHaveLength(3)
    wrap!.remove()

    wrap = document.createElement('div')
    wrap.innerHTML = `
      <xh-file-upload read-only>
        <div data-xh-part="root">
          <div data-xh-part="list">
            <div data-xh-part="item"><span data-xh-part="item-name"></span><a id="link-0" href="/files/r1">打开</a><button data-xh-part="item-delete-trigger"></button></div>
            <div data-xh-part="item"><span data-xh-part="item-name"></span><button data-xh-part="item-delete-trigger"></button></div>
          </div>
          <input data-xh-part="hidden-input">
        </div>
      </xh-file-upload>`
    host = wrap.querySelector<XhFileUploadElement>('xh-file-upload')!
    host.defaultRemoteFiles = remote
    document.body.append(wrap)
    await settle()
    const authored = wrap.querySelector<HTMLAnchorElement>('#link-0')!
    authored.focus()
    expect(document.activeElement).toBe(authored)
    expect(authored.getAttribute('href')).toBe('/files/r1')
    expect(authored.closest('[inert]')).toBeNull()
  })
})
