import type { App, Ref } from 'vue'
import { getLayerRegistry, overlayKit } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 本文件不预取浮层按需块（见 tests/browser/setup.ts）：量的是第一次打开时按需块还没到的那条路径。
// 按需块一页只到一次，所以整条路径写在一条用例里：开两个对话框，其中一个在等的时候关掉。
;

(globalThis as { __xhColdOverlay?: boolean }).__xhColdOverlay = true

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function frames(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

/** 标题为 title 的那个对话框的内容：还没露过时不挂载，返回 null。 */
function content(title: string): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="dialog"][data-part="content"]')]
    .find(el => el.textContent?.includes(title)) ?? null
}

function shown(title: string): boolean {
  const el = content(title)
  return el != null && !el.hidden
}

describe('对话框第一次打开时按需块还没到', () => {
  it('内容等按需块到了才露出；等的时候关掉的不露、不入层、不抢焦点；到了之后焦点进去、滚动锁上', async () => {
    const outside = document.createElement('button')
    outside.textContent = '页面按钮'
    document.body.append(outside)
    outside.focus()

    const kept = ref(false)
    const dropped = ref(false)
    const dialog = (open: Ref<boolean>, title: string): ReturnType<typeof h> => {
      const sync = (next: boolean): void => {
        open.value = next
      }
      return h(XhDialogRoot, { 'open': open.value, 'onUpdate:open': sync }, () =>
        h(XhDialogContent, null, () => [h(XhDialogTitle, null, () => title), h('button', `${title}的按钮`)]))
    }
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => [dialog(kept, '保留'), dialog(dropped, '中途关掉')] })
    app.mount(host)
    await frames(2)
    expect(overlayKit()).toBeNull()

    kept.value = true
    dropped.value = true
    await nextTick()

    // 按需块要走一趟网络，微任务里到不了：此刻看到的正是「展开了、资源还没到」
    expect(overlayKit()).toBeNull()
    expect(shown('保留')).toBe(false)
    expect(shown('中途关掉')).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')

    dropped.value = false
    await nextTick()

    await vi.waitFor(() => expect(overlayKit()).not.toBeNull())
    await frames(3)

    expect(shown('保留')).toBe(true)
    expect(shown('中途关掉')).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    await expect.poll(() => content('保留')!.contains(document.activeElement)).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await frames(2)
    expect(kept.value).toBe(false)
  })
})
