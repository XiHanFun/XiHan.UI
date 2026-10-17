// @vitest-environment jsdom
// upload 返回 id：传完的文件从本地列表转成远程附件，事件依次是完成、远程列表、本地列表，远程列表的 detail 是那条附件记录。
import type { FileUploadRemoteFile } from '@xihan-ui/headless'
import type { XhFileUploadElement } from '../src/elements/file-upload'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

describe('file-upload 上传返回 id 转入远程附件', () => {
  it('非受控：传完即转入，upload-complete 带上 id，本地那一行撤下', async () => {
    document.body.innerHTML = `
      <xh-file-upload max-files="5">
        <div data-xh-part="root">
          <div data-xh-part="dropzone"><button data-xh-part="trigger">选择</button><input data-xh-part="hidden-input"></div>
          <div data-xh-part="list"><div data-xh-part="item"><span data-xh-part="item-name"></span></div></div>
        </div>
      </xh-file-upload>`
    const el = document.querySelector<XhFileUploadElement>('xh-file-upload')!
    const log: string[] = []
    let remote: FileUploadRemoteFile[] = []
    el.addEventListener('upload-complete', e => log.push(`complete:${(e as CustomEvent<{ id?: string }>).detail.id}`))
    el.addEventListener('remote-files-change', (e) => {
      remote = (e as CustomEvent<{ files: FileUploadRemoteFile[] }>).detail.files
      log.push(`remote:${remote.map(f => f.id).join(',')}`)
    })
    el.addEventListener('files-change', e => log.push(`files:${(e as CustomEvent<{ files: File[] }>).detail.files.map(f => f.name).join(',')}`))
    el.upload = () => Promise.resolve({ id: 'r1', url: '/files/r1' })
    await Promise.resolve()

    el.addFiles([new File(['abc'], 'a.txt', { type: 'text/plain' })])
    await vi.waitFor(() => expect(el.acceptedFiles).toEqual([]))
    expect(log).toEqual(['files:a.txt', 'complete:r1', 'remote:r1', 'files:'])
    expect(remote).toEqual([{ id: 'r1', name: 'a.txt', size: 3, type: 'text/plain', url: '/files/r1' }])
    await vi.waitFor(() => expect(el.querySelector<HTMLElement>('[data-xh-part="item"]')!.style.display).toBe('none'))
  })
})
