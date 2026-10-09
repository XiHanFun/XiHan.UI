// FileUpload 的三颗钮接 Action Control：选择文件是 text 档 outline（静息描边、悬停白底承载 100、按下 200、
// 不再悬停抬 raised 影），逐条删除是 icon 档 ghost xs，清空是 text 档 ghost sm。三颗都按 0.97 按压、换底走家族。
// 判据是计算样式与过渡结果，jsdom 不给这些。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhFileUploadClearTrigger,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from '../../src'
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

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px; background: var(--xh-bg-surface)'
  document.body.append(host)
  const file = new File(['xh'], '报告.pdf', { type: 'application/pdf' })
  app = createApp({
    render: () => h(XhFileUploadRoot, { defaultFiles: [file] }, {
      default: ({ acceptedFiles: files }: { acceptedFiles: File[] }) => [
        h(XhFileUploadHiddenInput),
        h(XhFileUploadTrigger, null, () => '选择文件'),
        h(XhFileUploadList, null, () => files.map(f => h(XhFileUploadItem, { key: f.name, file: f }, () => [
          h(XhFileUploadItemName),
          h(XhFileUploadItemDeleteTrigger),
        ]))),
        h(XhFileUploadClearTrigger, null, () => '清空'),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='file-upload'][data-part='${name}']`)!
}

function resolved(on: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  on.parentElement!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('file-upload 的三颗钮接 Action Control', () => {
  it.each([
    ['trigger', 'text', 'outline', 'md'],
    ['item-delete-trigger', 'icon', 'ghost', 'xs'],
    ['clear-trigger', 'text', 'ghost', 'sm'],
  ] as const)('%s 投影 %s 档 %s、%s', async (name, profile, variant, size) => {
    await mount()
    const el = part(name)
    expect(el.hasAttribute('data-xh-action-control')).toBe(true)
    expect(el.getAttribute('data-xh-action-profile')).toBe(profile)
    expect(el.getAttribute('data-xh-action-variant')).toBe(variant)
    expect(el.getAttribute('data-xh-action-size')).toBe(size)
  })

  it('选择文件：悬停取白底承载 100、不抬 raised 影', async () => {
    await mount()
    const trigger = part('trigger')
    await userEvent.hover(trigger)
    await expect.poll(() => getComputedStyle(trigger).backgroundColor)
      .toBe(resolved(trigger, 'background-color', 'var(--xh-bg-subtle)'))
    expect(getComputedStyle(trigger).boxShadow).toBe('none')
  })

  it('逐条删除：坐在淡底文件行上，悬停取淡底承载 200、字换危险色', async () => {
    await mount()
    const remove = part('item-delete-trigger')
    await userEvent.hover(remove)
    await expect.poll(() => getComputedStyle(remove).backgroundColor)
      .toBe(resolved(remove, 'background-color', 'var(--xh-bg-subtle-hover)'))
    await expect.poll(() => getComputedStyle(remove).color)
      .toBe(resolved(remove, 'color', 'var(--xh-fg-danger-hover)'))
  })
})
