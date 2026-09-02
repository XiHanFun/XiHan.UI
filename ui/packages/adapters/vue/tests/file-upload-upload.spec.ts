// @vitest-environment jsdom
// file-upload 的上传生命周期与远程附件形态：进度/成败/重试/中止、回显与名额共享。
import type { FileUploadFile, FileUploadRemoteFile, FileUploadRequest, FileUploadResult, FileUploadSnapshot } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFileUploadItem, XhFileUploadItemGroup, XhFileUploadItemName, XhFileUploadRoot } from '../src'

interface UploadScope {
  acceptedFiles: File[]
  remoteFiles: FileUploadRemoteFile[]
  allFiles: FileUploadFile[]
  uploadOf: (file: FileUploadFile) => FileUploadSnapshot | null
  startUpload: (file: File) => void
  addFiles: (files: File[]) => void
  deleteFile: (file: FileUploadFile) => void
  clear: () => void
}

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

interface MountOptions {
  upload?: (request: FileUploadRequest) => Promise<FileUploadResult | void>
  autoUpload?: boolean
  maxFiles?: number
  defaultRemoteFiles?: FileUploadRemoteFile[]
  onRemoteFilesChange?: (details: { files: FileUploadRemoteFile[] }) => void
  onUploadComplete?: (details: { file: File, url?: string }) => void
  onUploadError?: (details: { file: File, error: unknown }) => void
  onFileReject?: (details: { files: { file: File, reasons: string[] }[] }) => void
}

function mountUpload(opts: MountOptions = {}): { scope: () => UploadScope } {
  let captured: UploadScope | null = null
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhFileUploadRoot, {
        'maxFiles': opts.maxFiles ?? Number.POSITIVE_INFINITY,
        'upload': opts.upload,
        'autoUpload': opts.autoUpload,
        'defaultRemoteFiles': opts.defaultRemoteFiles,
        'onRemote-files-change': opts.onRemoteFilesChange,
        'onUpload-complete': opts.onUploadComplete,
        'onUpload-error': opts.onUploadError,
        'onFile-reject': opts.onFileReject,
      }, {
        default: (scope: UploadScope) => {
          captured = scope
          return [
            h(XhFileUploadItemGroup, null, () => scope.allFiles.map((file, i) =>
              h(XhFileUploadItem, { key: i, file }, () => [h(XhFileUploadItemName)]))),
          ]
        },
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return {
    scope: () => {
      if (!captured)
        throw new Error('插槽作用域未就绪')
      return captured
    },
  }
}

function makeFile(name = 'a.txt'): File {
  return new File(['abc'], name, { type: 'text/plain' })
}

/** 可手动推进的 upload 实现。 */
function deferredUpload(): {
  upload: (request: FileUploadRequest) => Promise<FileUploadResult | void>
  progress: (n: number) => void
  resolve: (result?: FileUploadResult) => void
  reject: (error: unknown) => void
  lastSignal: () => AbortSignal
} {
  let onProgress: ((n: number) => void) | null = null
  let resolveFn: ((r?: FileUploadResult) => void) | null = null
  let rejectFn: ((e: unknown) => void) | null = null
  let signal: AbortSignal | null = null
  return {
    upload: (request) => {
      onProgress = request.onProgress
      signal = request.signal
      return new Promise<FileUploadResult | undefined>((res, rej) => {
        resolveFn = res as (r?: FileUploadResult) => void
        rejectFn = rej
      })
    },
    progress: n => onProgress?.(n),
    resolve: r => resolveFn?.(r),
    reject: e => rejectFn?.(e),
    lastSignal: () => {
      if (!signal)
        throw new Error('upload 还没被调用')
      return signal
    },
  }
}

describe('file-upload 上传生命周期', () => {
  it('自动开传：进度、完成、地址与 upload-complete', async () => {
    const engine = deferredUpload()
    const complete = vi.fn()
    const t = mountUpload({ upload: engine.upload, onUploadComplete: complete })
    const file = makeFile()
    t.scope().addFiles([file])
    await tick()
    expect(t.scope().uploadOf(file)?.status).toBe('uploading')
    expect(document.querySelector('[data-part="item"]')?.getAttribute('data-state')).toBe('uploading')

    engine.progress(40)
    await tick()
    expect(t.scope().uploadOf(file)?.progress).toBe(40)

    engine.resolve({ url: 'https://cdn/a.txt' })
    await tick()
    expect(t.scope().uploadOf(file)?.status).toBe('done')
    expect(t.scope().uploadOf(file)?.url).toBe('https://cdn/a.txt')
    expect(complete).toHaveBeenCalledWith({ file, url: 'https://cdn/a.txt' })
    expect(document.querySelector('[data-part="item"]')?.getAttribute('data-state')).toBe('done')
  })

  it('失败进 error 并可 startUpload 重试', async () => {
    const engine = deferredUpload()
    const failed = vi.fn()
    const t = mountUpload({ upload: engine.upload, onUploadError: failed })
    const file = makeFile()
    t.scope().addFiles([file])
    await tick()
    engine.reject(new Error('后端 500'))
    await tick()
    expect(t.scope().uploadOf(file)?.status).toBe('error')
    expect(failed).toHaveBeenCalled()

    t.scope().startUpload(file)
    await tick()
    expect(t.scope().uploadOf(file)?.status).toBe('uploading')
    engine.resolve({})
    await tick()
    expect(t.scope().uploadOf(file)?.status).toBe('done')
  })

  it('autoUpload=false 时收下不动，startUpload 才开', async () => {
    const engine = deferredUpload()
    const t = mountUpload({ upload: engine.upload, autoUpload: false })
    const file = makeFile()
    t.scope().addFiles([file])
    await tick()
    expect(t.scope().uploadOf(file)?.status).toBe('idle')
    t.scope().startUpload(file)
    await tick()
    expect(t.scope().uploadOf(file)?.status).toBe('uploading')
  })

  it('传输中删除即中止，不算失败', async () => {
    const engine = deferredUpload()
    const failed = vi.fn()
    const t = mountUpload({ upload: engine.upload, onUploadError: failed })
    const file = makeFile()
    t.scope().addFiles([file])
    await tick()
    expect(engine.lastSignal().aborted).toBe(false)
    t.scope().deleteFile(file)
    await tick()
    expect(engine.lastSignal().aborted).toBe(true)
    engine.reject(new Error('aborted'))
    await tick()
    expect(failed).not.toHaveBeenCalled()
  })

  it('没配 upload 就是纯选择器：uploadOf 为 null、条目不带 data-state', async () => {
    const t = mountUpload()
    const file = makeFile()
    t.scope().addFiles([file])
    await tick()
    expect(t.scope().uploadOf(file)).toBeNull()
    expect(document.querySelector('[data-part="item"]')?.hasAttribute('data-state')).toBe(false)
  })
})

describe('file-upload 远程附件', () => {
  const REMOTE: FileUploadRemoteFile = { id: 'r1', name: '合同.pdf', size: 2048, type: 'application/pdf', url: 'https://cdn/r1.pdf' }

  it('回显：进列表、data-remote、快照恒 done', async () => {
    const t = mountUpload({ defaultRemoteFiles: [REMOTE] })
    await tick()
    expect(t.scope().allFiles).toHaveLength(1)
    const item = document.querySelector('[data-part="item"]')
    expect(item?.hasAttribute('data-remote')).toBe(true)
    expect(item?.getAttribute('data-file-name')).toBe('合同.pdf')
    expect(t.scope().uploadOf(REMOTE)).toMatchObject({ status: 'done', url: 'https://cdn/r1.pdf' })
  })

  it('删除远程附件走 remote-files-change，不碰本地列表', async () => {
    const changed = vi.fn()
    const t = mountUpload({ defaultRemoteFiles: [REMOTE], onRemoteFilesChange: changed })
    const local = makeFile()
    t.scope().addFiles([local])
    await tick()
    t.scope().deleteFile(REMOTE)
    await tick()
    expect(changed).toHaveBeenCalledWith({ files: [] })
    expect(t.scope().acceptedFiles).toEqual([local])
  })

  it('远程附件占 maxFiles 名额', async () => {
    const rejected = vi.fn()
    const t = mountUpload({ defaultRemoteFiles: [REMOTE], maxFiles: 2, onFileReject: rejected })
    t.scope().addFiles([makeFile('b.txt'), makeFile('c.txt')])
    await tick()
    expect(t.scope().acceptedFiles).toHaveLength(1)
    expect(rejected).toHaveBeenCalled()
    expect(rejected.mock.calls[0]![0].files[0].reasons).toContain('too-many-files')
  })

  it('clear 连远程一起清', async () => {
    const t = mountUpload({ defaultRemoteFiles: [REMOTE] })
    t.scope().addFiles([makeFile()])
    await tick()
    t.scope().clear()
    await tick()
    expect(t.scope().allFiles).toHaveLength(0)
  })
})
