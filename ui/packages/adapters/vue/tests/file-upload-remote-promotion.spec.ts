// @vitest-environment jsdom
// upload 返回 id：传完的文件从本地列表转成远程附件，列表里那一行换成远程记录，事件依次是完成、远程列表、本地列表。
import type { FileUploadFile, FileUploadRemoteFile } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { XhFileUploadItem, XhFileUploadItemName, XhFileUploadList, XhFileUploadRoot } from '../src'

interface Scope {
  acceptedFiles: File[]
  remoteFiles: FileUploadRemoteFile[]
  allFiles: FileUploadFile[]
  addFiles: (files: File[]) => void
}

let cleanup: (() => void) | null = null

afterEach(() => {
  cleanup?.()
  cleanup = null
  document.body.innerHTML = ''
})

describe('file-upload 上传返回 id 转入远程附件', () => {
  it('非受控：传完即转入，行里显示远程记录的名字，本地列表清空', async () => {
    const log: string[] = []
    let scope: Scope | null = null
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      setup: () => () => h(XhFileUploadRoot, {
        'maxFiles': 5,
        'upload': () => Promise.resolve({ id: 'r1', url: '/files/r1' }),
        'onUpload-complete': (details: { id?: string }) => log.push(`complete:${details.id}`),
        'onRemote-files-change': (details: { files: FileUploadRemoteFile[] }) => log.push(`remote:${details.files.map(f => f.id).join(',')}`),
        'onFiles-change': (details: { files: File[] }) => log.push(`files:${details.files.map(f => f.name).join(',')}`),
      }, {
        default: (slot: Scope) => {
          scope = slot
          return [h(XhFileUploadList, null, () => slot.allFiles.map((file, i) =>
            h(XhFileUploadItem, { key: i, file }, () => [h(XhFileUploadItemName)])))]
        },
      }),
    })
    app.mount(host)
    cleanup = () => app.unmount()

    scope!.addFiles([new File(['abc'], 'a.txt', { type: 'text/plain' })])
    await vi.waitFor(() => expect(scope!.remoteFiles).toHaveLength(1))
    expect(scope!.acceptedFiles).toEqual([])
    expect(scope!.remoteFiles).toEqual([{ id: 'r1', name: 'a.txt', size: 3, type: 'text/plain', url: '/files/r1' }])
    expect(log).toEqual(['files:a.txt', 'complete:r1', 'remote:r1', 'files:'])
    await vi.waitFor(() => expect([...host.querySelectorAll('[data-part="item-name"]')].map(el => el.textContent)).toEqual(['a.txt']))
  })
})
