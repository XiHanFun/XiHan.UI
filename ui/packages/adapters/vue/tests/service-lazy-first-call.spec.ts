// @vitest-environment jsdom
// 命令式服务在业务组件的 onMounted 里首次被调用（服务此刻才懒建）。
//
// 业务 onMounted 跑在 Vue 的 post-flush 队列里；这时再挂服务宿主，Vue 会把宿主自己的
// mounted 回调追加到当前队列的队尾——宿主的 setup 已经跑完、端口已经接上，
// 而机器要等调用方的 onMounted 返回后才 start。命令一发就是 SEND_BEFORE_MOUNT。
// 冷启动直接打开会弹错的页面（OAuth 回调失败页）正好落在这个窗口里；
// 先在别处弹过一次再进该页反而正常，因此单独守住「首次调用在 onMounted 里」这一型。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, onMounted } from 'vue'
import { createDialogService, createLoadingBarService, createNotificationService, createToastService } from '../src'

const disposers: Array<() => void> = []

afterEach(() => {
  while (disposers.length)
    disposers.pop()!()
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

/** 挂一个业务组件，在它的 onMounted 里同步跑 fn；fn 抛出的异常原样交回。 */
function mountPageWhoseMountedRuns(fn: () => void): void {
  const holder = document.createElement('div')
  document.body.append(holder)
  let failure: unknown = null
  const Page = defineComponent({
    name: 'OauthCallbackPage',
    setup() {
      onMounted(() => {
        try {
          fn()
        }
        catch (error) {
          failure = error
        }
      })
      return () => h('main', '登录失败')
    },
  })
  const app = createApp(Page)
  disposers.push(() => app.unmount())
  app.mount(holder)
  if (failure)
    throw failure
}

describe('业务组件 onMounted 里首次调用命令式服务', () => {
  it('toast：不抛 SEND_BEFORE_MOUNT，提示最终渲染出来', async () => {
    mountPageWhoseMountedRuns(() => {
      const toast = createToastService()
      disposers.push(() => toast.dispose())
      toast.danger('授权被拒绝')
    })
    await settle()
    expect(document.body.textContent).toContain('授权被拒绝')
  })

  it('notification：不抛 SEND_BEFORE_MOUNT，通知最终渲染出来', async () => {
    mountPageWhoseMountedRuns(() => {
      const notification = createNotificationService()
      disposers.push(() => notification.dispose())
      notification.danger('授权被拒绝')
    })
    await settle()
    expect(document.body.textContent).toContain('授权被拒绝')
  })

  it('loading-bar：start 立即生效，条子进入加载态', async () => {
    mountPageWhoseMountedRuns(() => {
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
    mountPageWhoseMountedRuns(() => {
      const dialog = createDialogService()
      disposers.push(() => dialog.dispose())
      void dialog.confirm({ title: '重新授权？', content: '本次授权被拒绝' })
    })
    await settle()
    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull()
    expect(document.body.textContent).toContain('重新授权？')
  })
})
