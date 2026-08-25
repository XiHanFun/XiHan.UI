// @vitest-environment jsdom
// 命令式反馈服务：不在组件树内、模块作用域直接调用，是这几个服务存在的意义，
// 所有用例都不挂宿主组件。
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createDialogService, createLoadingBarService, createNotificationService, createToastService } from '../src'

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

  it('dismissAll 一次收走所有条目', async () => {
    const toast = createToastService()
    toast.error('同步失败')
    toast.info('另一条')
    await tick()
    expect(document.body.textContent).toContain('同步失败')
    expect(document.body.textContent).toContain('另一条')
    toast.dismissAll()
    await wait(600)
    expect(document.body.textContent ?? '').not.toContain('同步失败')
    expect(document.body.textContent ?? '').not.toContain('另一条')
    toast.dispose()
  })

  it('落位是整个服务的口径，不逐条各去一处', async () => {
    const toast = createToastService({ placement: 'bottom-end' })
    toast.info('一条')
    toast.info('两条')
    await tick()
    const groups = [...document.querySelectorAll('[data-scope="toast"][data-part="group"]')]
    // 一个服务只有一摞：条目落在哪儿由服务档一次定好
    expect(groups.length).toBe(1)
    expect(groups[0]!.getAttribute('data-placement')).toBe('bottom-end')
    expect(groups[0]!.getAttribute('data-count')).toBe('2')
    toast.dispose()
  })

  it('max：超出上限挤掉最旧的那条', async () => {
    const toast = createToastService({ max: 2 })
    toast.info('第一条')
    toast.info('第二条')
    toast.info('第三条')
    await tick()
    expect(document.body.textContent ?? '').not.toContain('第一条')
    expect(document.body.textContent).toContain('第三条')
    toast.dispose()
  })

  it('dispose 移除宿主容器', async () => {
    const toast = createToastService()
    toast.success('一条')
    await tick()
    toast.dispose()
    expect(document.querySelectorAll('[data-scope="toast"]').length).toBe(0)
    expect(() => toast.success('再来')).toThrow('已卸载')
  })
})

describe('createNotificationService', () => {
  it('模块作用域一行调用即渲染出通知，标题与正文两层都在', async () => {
    const notify = createNotificationService()
    notify.info('有新的审批', { description: '张三提交了一份请假单' })
    await tick()
    expect(document.body.textContent).toContain('有新的审批')
    expect(document.body.textContent).toContain('张三提交了一份请假单')
    notify.dispose()
  })

  it('逐条落位：单条写了 placement 就自己去那一摞', async () => {
    const notify = createNotificationService({ placement: 'bottom-end' })
    notify.info('默认位')
    notify.info('覆盖位', { placement: 'top' })
    await tick()
    const placements = [...document.querySelectorAll('[data-scope="notification"][data-part="group"]')]
      .map(g => g.getAttribute('data-placement'))
    expect(placements).toContain('bottom-end')
    expect(placements).toContain('top')
    notify.dispose()
  })

  it('同 id 就地改写：处理中转已完成不新弹一条', async () => {
    const notify = createNotificationService()
    const id = notify.info('导出中', { duration: 0 })
    await tick()
    notify.update(id, { type: 'success', title: '导出完成' })
    await tick()
    expect(document.body.textContent).toContain('导出完成')
    expect(document.body.textContent ?? '').not.toContain('导出中')
    notify.dispose()
  })

  it('dispose 移除宿主容器', async () => {
    const notify = createNotificationService()
    notify.info('一条')
    await tick()
    notify.dispose()
    expect(document.querySelectorAll('[data-scope="notification"]').length).toBe(0)
    expect(() => notify.info('再来')).toThrow('已卸载')
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
