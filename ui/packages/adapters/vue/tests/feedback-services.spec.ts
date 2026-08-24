// @vitest-environment jsdom
// 命令式反馈服务：不在组件树内、模块作用域直接调用，是这几个服务存在的意义，
// 所有用例都不挂宿主组件。
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createDialogService, createLoadingBarService, createToastService } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

async function wait(ms: number): Promise<void> {
  await new Promise(r => setTimeout(r, ms))
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createToastService', () => {
  it('模块作用域一行调用即渲染出通知', async () => {
    const toast = createToastService()
    toast.success('已保存')
    await tick()
    expect(document.body.textContent).toContain('已保存')
    toast.dispose()
  })

  it('loading 转 success 就地改写同一条', async () => {
    const toast = createToastService()
    const id = toast.loading('上传中')
    await tick()
    expect(document.body.textContent).toContain('上传中')
    toast.update(id, { type: 'success', title: '上传完成' })
    await tick()
    expect(document.body.textContent).toContain('上传完成')
    expect(document.body.textContent).not.toContain('上传中')
    toast.dispose()
  })

  it('description 与 dismissAll', async () => {
    const toast = createToastService()
    toast.create({ title: '同步失败', description: '网络中断，稍后自动重试', type: 'error' })
    toast.info('另一条')
    await tick()
    expect(document.body.textContent).toContain('网络中断，稍后自动重试')
    toast.dismissAll()
    await wait(600)
    expect(document.body.textContent ?? '').not.toContain('同步失败')
    toast.dispose()
  })

  it('落位可配且单条可覆盖', async () => {
    const toast = createToastService({ placement: 'bottom-end' })
    toast.create({ title: '默认位', type: 'info' })
    toast.create({ title: '覆盖位', type: 'info', placement: 'top' })
    await tick()
    const groups = [...document.querySelectorAll('[data-scope="toaster"][data-part="group"]')]
    const placements = groups.map(g => g.getAttribute('data-placement'))
    expect(placements).toContain('bottom-end')
    expect(placements).toContain('top')
    toast.dispose()
  })

  it('dispose 移除宿主容器', async () => {
    const toast = createToastService()
    toast.success('一条')
    await tick()
    toast.dispose()
    expect(document.querySelectorAll('[data-scope="toaster"]').length).toBe(0)
    expect(() => toast.success('再来')).toThrow('已卸载')
  })
})

describe('createDialogService', () => {
  function okButton(): HTMLButtonElement {
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-scope="dialog"] ~ * button, body button')]
    const target = buttons.find(b => b.textContent!.includes('OK'))
    if (!target)
      throw new Error('找不到确认钮')
    return target
  }

  function cancelButton(): HTMLButtonElement {
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('body button')]
    const target = buttons.find(b => b.textContent!.includes('Cancel'))
    if (!target)
      throw new Error('找不到取消钮')
    return target
  }

  it('confirm 点确定 resolve true', async () => {
    const modal = createDialogService()
    const answer = modal.confirm({ title: '删除工作区', content: '删除后 30 天内还能恢复。' })
    await tick()
    expect(document.body.textContent).toContain('删除工作区')
    okButton().click()
    await tick()
    await expect(answer).resolves.toBe(true)
    modal.dispose()
  })

  it('confirm 点取消 resolve false', async () => {
    const modal = createDialogService()
    const answer = modal.confirm({ title: '导出数据' })
    await tick()
    cancelButton().click()
    await tick()
    await expect(answer).resolves.toBe(false)
    modal.dispose()
  })

  it('onOk 返回 Promise 时确认钮进入 pending，settle 后才关', async () => {
    const modal = createDialogService()
    let release: () => void = () => {}
    const gate = new Promise<void>((r) => {
      release = r
    })
    const answer = modal.confirm({ title: '提交', onOk: () => gate })
    await tick()
    okButton().click()
    await tick()
    expect(okButton().getAttribute('data-loading')).not.toBeNull()
    release()
    await tick()
    await expect(answer).resolves.toBe(true)
    modal.dispose()
  })

  it('onOk 拒绝时保持打开，可取消收场', async () => {
    const modal = createDialogService()
    const answer = modal.confirm({ title: '提交', onOk: () => Promise.reject(new Error('后端 500')) })
    await tick()
    okButton().click()
    await tick()
    await wait(10)
    expect(document.body.textContent).toContain('提交')
    cancelButton().click()
    await tick()
    await expect(answer).resolves.toBe(false)
    modal.dispose()
  })

  it('多个 confirm 排队顺次弹出', async () => {
    const modal = createDialogService()
    const first = modal.confirm({ title: '第一问' })
    const second = modal.confirm({ title: '第二问' })
    await tick()
    expect(document.body.textContent).toContain('第一问')
    expect(document.body.textContent).not.toContain('第二问')
    okButton().click()
    await wait(350)
    expect(document.body.textContent).toContain('第二问')
    cancelButton().click()
    await tick()
    await expect(first).resolves.toBe(true)
    await expect(second).resolves.toBe(false)
    modal.dispose()
  })

  it('error 预设是单按钮，resolve 即可', async () => {
    const modal = createDialogService()
    const done = modal.error({ title: '同步失败', content: '稍后重试。' })
    await tick()
    expect([...document.querySelectorAll('body button')].some(b => b.textContent!.includes('Cancel'))).toBe(false)
    okButton().click()
    await tick()
    await expect(done).resolves.toBeUndefined()
    modal.dispose()
  })

  it('dispose 把在场与排队的一并按取消结掉', async () => {
    const modal = createDialogService()
    const a = modal.confirm({ title: 'A' })
    const b = modal.confirm({ title: 'B' })
    await tick()
    modal.dispose()
    await expect(a).resolves.toBe(false)
    await expect(b).resolves.toBe(false)
  })
})

describe('createLoadingBarService', () => {
  function bar(): HTMLElement | null {
    return document.querySelector('[data-scope="loading-bar"][data-part="root"]')
  }

  it('建出来即挂上三层部件', async () => {
    const loading = createLoadingBarService()
    await tick()
    expect(bar()).not.toBeNull()
    expect(document.querySelector('[data-scope="loading-bar"][data-part="track"]')).not.toBeNull()
    expect(document.querySelector('[data-scope="loading-bar"][data-part="range"]')).not.toBeNull()
    loading.dispose()
  })

  it('在途计数：两笔只收一笔时条子不收', async () => {
    const loading = createLoadingBarService()
    await tick()
    expect(bar()!.getAttribute('data-state')).toBe('idle')

    loading.start()
    loading.start()
    await tick()
    expect(bar()!.getAttribute('data-state')).toBe('loading')

    // 收掉一笔还剩一笔在途：仍是 loading，不能提前进收尾
    loading.finish()
    await tick()
    expect(bar()!.getAttribute('data-state')).toBe('loading')

    // 归零才收尾
    loading.finish()
    await tick()
    expect(bar()!.getAttribute('data-state')).not.toBe('loading')
    loading.dispose()
  })

  it('finishAll 不管还剩几笔一律收掉', async () => {
    const loading = createLoadingBarService()
    loading.start()
    loading.start()
    loading.start()
    await tick()
    loading.finishAll()
    await tick()
    expect(bar()!.getAttribute('data-state')).not.toBe('loading')
    loading.dispose()
  })

  it('error 换成危险语气收尾，与正常收尾分得开', async () => {
    const loading = createLoadingBarService()
    loading.start()
    await tick()
    expect(bar()!.getAttribute('data-tone')).toBe('brand')

    loading.error()
    await tick()
    expect(bar()!.getAttribute('data-tone')).toBe('danger')
    loading.dispose()
  })

  it('dispose 清场', async () => {
    const loading = createLoadingBarService()
    loading.start()
    await tick()
    loading.dispose()
    expect(document.querySelectorAll('[data-scope="loading-bar"]').length).toBe(0)
  })
})
