// @vitest-environment jsdom
// 命令式服务在业务组件的 effect 里首次被调用（服务此刻才懒建）。
//
// 从 effect 里调用时正处在 React 的提交阶段，mount-host 的 flushSync 只能把宿主树排队，
// 靠宿主渲染体接端口就会把第一条命令当成「宿主没挂」丢掉。所以机器改由服务自持：
// 工厂里建好即 mount 并接上端口，createToastService() 返回时命令就能按序到达，宿主只负责渲染。
// 这条钉的正是这个契约：Vue 侧宿主的 mounted 会被追加到调用方 post-flush 队列的队尾，
// 三端要在「首次调用在挂载回调里」这一型上同构。
import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDialogService, createLoadingBarService, createNotificationService, createToastService } from '../src'

const disposers: Array<() => void> = []

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  while (disposers.length)
    disposers.pop()!()
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
    await new Promise(r => setTimeout(r, 0))
  })
}

/** 挂一个业务页面，在它的 useEffect 里同步跑 fn；fn 抛出的异常原样交回。 */
async function mountPageWhoseEffectRuns(fn: () => void): Promise<void> {
  const holder = document.createElement('div')
  document.body.append(holder)
  let failure: unknown = null
  function OauthCallbackPage(): React.ReactNode {
    useEffect(() => {
      try {
        fn()
      }
      catch (error) {
        failure = error
      }
    }, [])
    return <main>登录失败</main>
  }
  const root = createRoot(holder)
  disposers.push(() => act(() => root.unmount()))
  await act(async () => {
    root.render(<OauthCallbackPage />)
  })
  if (failure)
    throw failure
}

describe('业务组件 effect 里首次调用命令式服务', () => {
  it('toast：不抛 SEND_BEFORE_MOUNT，提示最终渲染出来', async () => {
    await mountPageWhoseEffectRuns(() => {
      const toast = createToastService()
      disposers.push(() => toast.dispose())
      toast.danger('授权被拒绝')
    })
    await settle()
    expect(document.body.textContent).toContain('授权被拒绝')
  })

  it('notification：不抛 SEND_BEFORE_MOUNT，通知最终渲染出来', async () => {
    await mountPageWhoseEffectRuns(() => {
      const notification = createNotificationService()
      disposers.push(() => notification.dispose())
      notification.danger('授权被拒绝')
    })
    await settle()
    expect(document.body.textContent).toContain('授权被拒绝')
  })

  it('loading-bar：start 立即生效，条子进入加载态', async () => {
    await mountPageWhoseEffectRuns(() => {
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
    await mountPageWhoseEffectRuns(() => {
      const dialog = createDialogService()
      disposers.push(() => dialog.dispose())
      void dialog.confirm({ title: '重新授权？', content: '本次授权被拒绝' })
    })
    await settle()
    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull()
    expect(document.body.textContent).toContain('重新授权？')
  })
})
