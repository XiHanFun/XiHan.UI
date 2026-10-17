/** @vitest-environment jsdom */
// upload 返回 id：传完的文件从 files 转入 remoteFiles；受控的 remoteFiles 写回之后才移出，不给 id 时行为不变。
import type { FileUploadRemoteFile, FileUploadResult, FileUploadSchema } from '../src/file-upload'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectFileUpload, fileUploadMachine } from '../src/file-upload'

type Props = FileUploadSchema['props']

function makeFile(name: string, type = 'text/plain', size = 8): File {
  return new File(['x'.repeat(size)], name, { type })
}

/** props 挂在 signal 上：受控用例要在机器活着的时候写回 remoteFiles。 */
function mount(initial: Props) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(fileUploadMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectFileUpload(service, normalizeProps),
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

/** 一个按调用顺序记下回调名的 upload 宿主，upload 照给定的结果兑现。 */
function host(result: FileUploadResult | undefined, extra: Partial<Props> = {}) {
  const log: string[] = []
  const props: Props = {
    maxFiles: 5,
    upload: () => Promise.resolve(result),
    onUploadComplete: details => log.push(`complete:${details.id ?? '-'}`),
    onRemoteFilesChange: details => log.push(`remote:${details.files.map(f => f.id).join(',')}`),
    onFilesChange: details => log.push(`files:${details.files.map(f => f.name).join(',')}`),
    ...extra,
  }
  return { log, props }
}

describe('file-upload 上传返回 id 转入 remoteFiles', () => {
  it('非受控：传完即转入，记录的 name / size / type 取自原文件，url 取自返回值；事件依次是完成、远程列表、本地列表', async () => {
    const file = makeFile('a.pdf', 'application/pdf', 12)
    const { log, props } = host({ id: 'r1', url: '/files/r1' })
    const m = mount(props)
    m.api().addFiles([file])
    await vi.waitFor(() => expect(m.api().acceptedFiles).toEqual([]))
    expect(m.api().remoteFiles).toEqual([{ id: 'r1', name: 'a.pdf', size: 12, type: 'application/pdf', url: '/files/r1' }])
    expect(log).toEqual(['files:a.pdf', 'complete:r1', 'remote:r1', 'files:'])
  })

  it('upload-complete 的 detail 带上 id；没有 type 的文件，记录里的 type 为 undefined', async () => {
    const file = makeFile('notes', '')
    const complete = vi.fn()
    const m = mount({ ...host({ id: 'r2' }).props, onUploadComplete: complete })
    m.api().addFiles([file])
    await vi.waitFor(() => expect(complete).toHaveBeenCalledTimes(1))
    expect(complete).toHaveBeenCalledWith({ file, url: undefined, id: 'r2' })
    expect(m.api().remoteFiles).toEqual([{ id: 'r2', name: 'notes', size: 8, type: undefined, url: undefined }])
  })

  it('不给 id 时行为不变：文件留在 files 里、状态 done，remoteFiles 不动，detail 里没有 id', async () => {
    const file = makeFile('a.txt')
    const complete = vi.fn()
    const { log, props } = host({ url: '/x' })
    const m = mount({ ...props, onUploadComplete: complete })
    m.api().addFiles([file])
    await vi.waitFor(() => expect(complete).toHaveBeenCalledTimes(1))
    expect(complete.mock.calls[0]![0]).not.toHaveProperty('id')
    expect(m.api().acceptedFiles).toEqual([file])
    expect(m.api().uploadOf(file)?.status).toBe('done')
    expect(m.api().remoteFiles).toEqual([])
    expect(log.filter(entry => entry.startsWith('remote:'))).toEqual([])
  })

  it('id 是空串时按没给处理', async () => {
    const file = makeFile('a.txt')
    const m = mount(host({ id: '' }).props)
    m.api().addFiles([file])
    await vi.waitFor(() => expect(m.api().uploadOf(file)?.status).toBe('done'))
    expect(m.api().acceptedFiles).toEqual([file])
    expect(m.api().remoteFiles).toEqual([])
  })

  it('remoteFiles 里已有同 id 的记录时不重复追加，文件照样从 files 移出', async () => {
    const file = makeFile('a.txt')
    const existing: FileUploadRemoteFile = { id: 'r1', name: 'old.txt' }
    const m = mount({ ...host({ id: 'r1' }).props, defaultRemoteFiles: [existing] })
    m.api().addFiles([file])
    await vi.waitFor(() => expect(m.api().acceptedFiles).toEqual([]))
    expect(m.api().remoteFiles).toEqual([existing])
  })

  it('受控 remoteFiles：只发远程列表的变化意图，文件留在 files 里、状态 done；宿主写回之后才移出', async () => {
    const file = makeFile('a.txt')
    const { log, props } = host({ id: 'r1', url: '/r1' }, { remoteFiles: [] })
    const m = mount(props)
    m.api().addFiles([file])
    await vi.waitFor(() => expect(log).toContain('remote:r1'))
    expect(m.api().acceptedFiles).toEqual([file])
    expect(m.api().uploadOf(file)?.status).toBe('done')
    expect(m.api().remoteFiles).toEqual([])

    m.setProps({ remoteFiles: [{ id: 'r1', name: 'a.txt', size: 8, type: 'text/plain', url: '/r1' }] })
    await vi.waitFor(() => expect(m.api().acceptedFiles).toEqual([]))
    expect(log.at(-1)).toBe('files:')
  })

  it('受控 remoteFiles：写回之前文件被删掉了，之后再写回也不再动 files', async () => {
    const file = makeFile('a.txt')
    const other = makeFile('b.txt')
    const { props } = host({ id: 'r1' }, { remoteFiles: [] })
    const m = mount(props)
    m.api().addFiles([file])
    await vi.waitFor(() => expect(m.api().uploadOf(file)?.status).toBe('done'))
    m.api().deleteFile(file)
    m.setProps({ upload: () => new Promise(() => {}) })
    m.api().addFiles([other])
    m.setProps({ remoteFiles: [{ id: 'r1', name: 'a.txt' }] })
    await Promise.resolve()
    expect(m.api().acceptedFiles).toEqual([other])
  })
})
