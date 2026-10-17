// @vitest-environment jsdom
// upload 返回 id：传完的文件从本地列表转成远程附件，列表里那一行换成远程记录，事件依次是完成、远程列表、本地列表。
import type { FileUploadRootSlotProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhFileUploadItem, XhFileUploadItemName, XhFileUploadList, XhFileUploadRoot } from '../src'

let unmount: (() => void) | null = null

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

describe('file-upload 上传返回 id 转入远程附件', () => {
  it('非受控：传完即转入，行里显示远程记录的名字，本地列表清空', async () => {
    const log: string[] = []
    let scope: FileUploadRootSlotProps | null = null
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(
        <XhFileUploadRoot
          maxFiles={5}
          upload={() => Promise.resolve({ id: 'r1', url: '/files/r1' })}
          onUploadComplete={details => log.push(`complete:${details.id}`)}
          onRemoteFilesChange={details => log.push(`remote:${details.files.map(f => f.id).join(',')}`)}
          onFilesChange={details => log.push(`files:${details.files.map(f => f.name).join(',')}`)}
        >
          {(slot) => {
            scope = slot
            return (
              <XhFileUploadList>
                {slot.allFiles.map((file, i) => <XhFileUploadItem key={i} file={file}><XhFileUploadItemName /></XhFileUploadItem>)}
              </XhFileUploadList>
            )
          }}
        </XhFileUploadRoot>,
      )
    })
    unmount = () => act(() => root.unmount())

    await act(async () => {
      scope!.addFiles([new File(['abc'], 'a.txt', { type: 'text/plain' })])
    })
    await vi.waitFor(() => expect(scope!.remoteFiles).toHaveLength(1))
    expect(scope!.acceptedFiles).toEqual([])
    expect(scope!.remoteFiles).toEqual([{ id: 'r1', name: 'a.txt', size: 3, type: 'text/plain', url: '/files/r1' }])
    expect(log).toEqual(['files:a.txt', 'complete:r1', 'remote:r1', 'files:'])
    const names = [...host.querySelectorAll('[data-part="item-name"]')].map(el => el.textContent)
    expect(names).toEqual(['a.txt'])
  })
})
