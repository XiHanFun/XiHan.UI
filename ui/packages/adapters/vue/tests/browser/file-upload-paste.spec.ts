// 文件上传的粘贴：真实浏览器的 ClipboardEvent 带的是 DataTransfer，文件在它的 FileList 里。
// jsdom 没有 DataTransfer 与 ClipboardEvent 构造器，一致性套件只能拿桩对象模拟，
// 真实的剪贴板载荷能不能被读出来、拦不拦默认行为，要在 Chromium 里看。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemName,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SCOPE = `[data-scope='file-upload']`

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(): Promise<{ trigger: HTMLButtonElement, names: () => string[] }> {
  host = document.createElement('div')
  document.body.prepend(host)
  app = createApp({
    render: () => h(XhFileUploadRoot, { maxFiles: 5, accept: 'image/*' }, {
      default: ({ acceptedFiles }: { acceptedFiles: File[] }) => [
        h(XhFileUploadDropzone, null, () => '拖到这里'),
        h(XhFileUploadTrigger, null, () => '选择文件'),
        h(XhFileUploadHiddenInput),
        h(XhFileUploadList, null, () => acceptedFiles.map(file =>
          h(XhFileUploadItem, { key: file.name, file }, () => [h(XhFileUploadItemName)]))),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  return {
    trigger: host.querySelector<HTMLButtonElement>(`${SCOPE}[data-part='trigger']`)!,
    names: () => [...host!.querySelectorAll(`${SCOPE}[data-part='item']`)].map(el => el.getAttribute('data-file-name') ?? ''),
  }
}

function clipboard(files: File[], text?: string): ClipboardEvent {
  const data = new DataTransfer()
  for (const file of files)
    data.items.add(file)
  if (text != null)
    data.setData('text/plain', text)
  return new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true })
}

describe('file-upload 粘贴（Chromium）', () => {
  it('焦点在选择钮上粘贴截图：从真实的 DataTransfer 里读出文件、过 accept 校验并拦下默认行为', async () => {
    const { trigger, names } = await mount()
    trigger.focus()
    const event = clipboard([
      new File(['png'], 'shot.png', { type: 'image/png' }),
      new File(['txt'], 'note.txt', { type: 'text/plain' }),
    ])
    trigger.dispatchEvent(event)
    await nextTick()
    expect(event.defaultPrevented).toBe(true)
    expect(names()).toEqual(['shot.png'])
  })

  it('剪贴板里只有文字时放行：默认行为不拦、列表不动', async () => {
    const { trigger, names } = await mount()
    trigger.focus()
    const event = clipboard([], '一段文字')
    trigger.dispatchEvent(event)
    await nextTick()
    expect(event.defaultPrevented).toBe(false)
    expect(names()).toEqual([])
  })
})
