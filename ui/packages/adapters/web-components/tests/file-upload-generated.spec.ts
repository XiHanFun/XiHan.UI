// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { FileUploadRemoteFile } from '@xihan-ui/headless'
import type { XhFileUploadElement } from '../src/elements/file-upload'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type FileUploadHost = XhFileUploadElement & { updateComplete: Promise<unknown> }

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: FileUploadHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<XhFileUploadElement>, inner = ''): FileUploadHost {
  const el = document.createElement('xh-file-upload') as FileUploadHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="file-upload"][data-part="${name}"]`)
}

/** 列表里在场的行（离场替身带 inert，不算）。 */
function rows(el: Element): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('[data-scope="file-upload"][data-part="item"]:not([inert])')]
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children)
    .filter(node => node.getAttribute('data-scope') === 'file-upload')
    .map(node => node.getAttribute('data-part') ?? '')
}

const file = (name: string, text = 'abc'): File => new File([text], name, { type: 'text/plain' })

describe('xh-file-upload 生成结构', () => {
  it('什么都不写：生成标题、投放区、表单影子与列表，投放区是唯一的打开入口，名字连着标题，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '附件', maxFiles: 5 })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['label', 'dropzone', 'hidden-input', 'list'])
    expect(part(el, 'trigger')).toBeNull()
    const label = part(el, 'label')!
    const dropzone = part(el, 'dropzone')!
    const input = part(el, 'hidden-input') as HTMLInputElement
    expect([label.localName, input.localName, input.type]).toEqual(['label', 'input', 'file'])
    expect(label.getAttribute('for')).toBe(input.id)
    expect([dropzone.getAttribute('role'), dropzone.tabIndex, dropzone.textContent]).toEqual(['button', 0, 'Drag files here or click to browse'])
    expect(dropzone.getAttribute('aria-labelledby')).toBe(`${label.id} ${dropzone.id}`)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('点标题只把焦点交给投放区，不点中隐藏输入、不弹选择框', async () => {
    const el = mount({ label: '附件' })
    await settle(el)
    let opened = 0
    part(el, 'hidden-input')!.addEventListener('click', () => opened++)

    part(el, 'label')!.click()
    expect(document.activeElement).toBe(part(el, 'dropzone'))
    expect(opened).toBe(0)
  })

  it('选了文件按 allFiles 一个文件一行（远程在前），行里依次是缩略图、文件名、大小、进度与删除钮，文件名与大小由元素填', async () => {
    const remote: FileUploadRemoteFile[] = [{ id: 'r1', name: '合同.pdf', size: 2048 }]
    const el = mount({ maxFiles: 5, defaultRemoteFiles: remote })
    await settle(el)
    el.addFiles([file('a.txt'), file('a.txt')])
    await settle(el)

    const items = rows(el)
    expect(items.map(item => item.getAttribute('index'))).toEqual(['0', '1', '2'])
    expect(partsOf(items[0]!)).toEqual(['item-preview', 'item-name', 'item-size-text', 'item-progress', 'item-delete-trigger'])
    expect(items.map(item => part(item, 'item-name')!.textContent)).toEqual(['合同.pdf', 'a.txt', 'a.txt'])
    expect(part(items[0]!, 'item-size-text')!.textContent).toBe('2 KB')
    expect(part(items[1]!, 'item-delete-trigger')!.getAttribute('aria-label')).toBe('Delete a.txt')
  })

  it('远程附件有安全的地址时文件名里铺一条链接，字由元素填；地址不安全时不铺链接，文件名退回纯文字', async () => {
    const el = mount({ maxFiles: 5, linkTarget: '_blank', defaultRemoteFiles: [
      { id: 'r1', name: '合同.pdf', url: '/files/r1' },
      { id: 'r2', name: '坏.pdf', url: 'javascript:alert(1)' },
      { id: 'r3', name: '备注.txt' },
    ] })
    await settle(el)
    const [safe, unsafe, plain] = rows(el)
    const link = part(safe!, 'item-link')! as HTMLAnchorElement
    expect([link.localName, link.textContent, link.getAttribute('href'), link.target, link.rel]).toEqual(['a', '合同.pdf', '/files/r1', '_blank', 'noopener noreferrer'])
    expect(link.parentElement).toBe(part(safe!, 'item-name'))
    expect(part(safe!, 'item-name')!.textContent).toBe('合同.pdf')
    for (const row of [unsafe!, plain!]) {
      expect(part(row, 'item-link')).toBeNull()
      expect(row.querySelector('a')).toBeNull()
    }
    expect([part(unsafe!, 'item-name')!.textContent, part(plain!, 'item-name')!.textContent]).toEqual(['坏.pdf', '备注.txt'])
  })

  it('删掉中间那一行：同名的两份文件各认各的行，留下的行节点原样复用，删掉的那一行不被别的文件顶替', async () => {
    const el = mount({ maxFiles: 5 })
    await settle(el)
    const [first, second, third] = [file('a.txt'), file('a.txt'), file('c.txt')]
    el.addFiles([first, second, third])
    await settle(el)
    const [row1, row2, row3] = rows(el)

    el.deleteFile(second)
    await settle(el)
    expect(rows(el)).toEqual([row1, row3])
    expect(rows(el).map(item => item.getAttribute('index'))).toEqual(['0', '1'])
    expect(row2!.isConnected === false || row2!.hasAttribute('inert')).toBe(true)
  })

  it('clearable 时列表之后带清空钮；slot 接管标题与投放区', async () => {
    const el = mount({ clearable: true }, '<b slot="label">附件</b><span slot="dropzone">拖进来</span>')
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'dropzone', 'hidden-input', 'list', 'clear-trigger'])
    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">附件</b>')
    expect(part(el, 'dropzone')!.innerHTML).toBe('<span slot="dropzone">拖进来</span>')
    expect(part(el, 'clear-trigger')!.getAttribute('aria-label')).toBe('Clear all files')
  })

  it('禁用时投放区退出 Tab 序列、报禁用，拖放不收；只读时留在 Tab 序列、报不可用，拖放同样不收', async () => {
    const drop = (el: HTMLElement): boolean => {
      const event = new Event('dragover', { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event.defaultPrevented
    }
    const disabled = mount({ disabled: true })
    await settle(disabled)
    const off = part(disabled, 'dropzone')!
    expect([off.tabIndex, off.getAttribute('aria-disabled'), drop(off)]).toEqual([-1, 'true', false])

    const readOnly = mount({ readOnly: true })
    await settle(readOnly)
    const ro = part(readOnly, 'dropzone')!
    expect([ro.tabIndex, ro.getAttribute('aria-disabled'), drop(ro)]).toEqual([0, 'true', false])
  })

  it('作者写了部件：全归作者，不生成任何节点', async () => {
    const el = mount({}, `
      <div data-xh-part="root">
        <button data-xh-part="trigger">选择</button>
        <input data-xh-part="hidden-input">
      </div>`)
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['trigger', 'hidden-input'])
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
  })
})
