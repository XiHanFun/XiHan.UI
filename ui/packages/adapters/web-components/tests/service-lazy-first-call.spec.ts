// @vitest-environment jsdom
// 命令式服务在业务元素的 connectedCallback 里首次被调用（服务此刻才懒建）。
//
// 这一端的队列机器由服务自己持有、建好即 start，端口随即接上，命令不会落进窗口期。
// Vue 侧宿主的 mounted 会被追加到调用方 post-flush 队列的队尾、React 侧 flushSync 在
// effect 里不能同步提交，三端要在「首次调用在挂载回调里」这一型上同构，这里把这一端钉住。
import { afterEach, describe, expect, it } from 'vitest'
import {
  createDialogService,
  createLoadingBarService,
  createNotificationService,
  createToastService,
} from '../src/services'

const disposers: Array<() => void> = []

afterEach(() => {
  while (disposers.length)
    disposers.pop()!()
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise(r => setTimeout(r, 0))
}

let pageSeq = 0

/** 定义并插入一个业务元素，在它的 connectedCallback 里同步跑 fn；fn 抛出的异常原样交回。 */
function connectPageWhoseCallbackRuns(fn: () => void): void {
  let failure: unknown = null
  const tag = `oauth-callback-page-${++pageSeq}`
  customElements.define(tag, class extends HTMLElement {
    connectedCallback(): void {
      this.textContent = '登录失败'
      try {
        fn()
      }
      catch (error) {
        failure = error
      }
    }
  })
  document.body.append(document.createElement(tag))
  if (failure)
    throw failure
}

describe('业务元素 connectedCallback 里首次调用命令式服务', () => {
  it('toast：不抛 SEND_BEFORE_MOUNT，提示最终渲染出来', async () => {
    connectPageWhoseCallbackRuns(() => {
      const toast = createToastService()
      disposers.push(() => toast.dispose())
      toast.danger('授权被拒绝')
    })
    await settle()
    expect(document.body.textContent).toContain('授权被拒绝')
  })

  it('notification：不抛 SEND_BEFORE_MOUNT，通知最终渲染出来', async () => {
    connectPageWhoseCallbackRuns(() => {
      const notification = createNotificationService()
      disposers.push(() => notification.dispose())
      notification.danger('授权被拒绝')
    })
    await settle()
    expect(document.body.textContent).toContain('授权被拒绝')
  })

  it('loading-bar：start 立即生效，条子进入加载态', async () => {
    connectPageWhoseCallbackRuns(() => {
      const loading = createLoadingBarService()
      disposers.push(() => loading.dispose())
      loading.start()
    })
    await settle()
    const root = document.querySelector<HTMLElement>('[data-scope="loading-bar"][data-part="root"]')
    expect(root).not.toBeNull()
    expect(root!.getAttribute('data-state')).toBe('loading')
  })

  it('dialog：confirm 立即弹出对话框', async () => {
    connectPageWhoseCallbackRuns(() => {
      const dialog = createDialogService()
      disposers.push(() => dialog.dispose())
      void dialog.confirm({ title: '重新授权？', content: '本次授权被拒绝' })
    })
    await settle()
    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull()
    expect(document.body.textContent).toContain('重新授权？')
  })
})
