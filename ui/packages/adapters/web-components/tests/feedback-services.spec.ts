// @vitest-environment jsdom
// 命令式反馈服务：不在文档树的某一处、模块作用域直接调用，是这几个服务存在的意义，
// 所有用例都不预先写任何标签。
import { afterEach, describe, expect, it } from 'vitest'
import {
  createDialogService,
  createLoadingBarService,
  createNotificationService,
} from '../src/services'

/** 元素的更新是异步批处理的，让出几拍等它落定。 */
async function tick(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await new Promise(r => setTimeout(r, 0))
}

async function wait(ms: number): Promise<void> {
  await new Promise(r => setTimeout(r, ms))
  await tick()
}

function partOf(scope: string, name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createNotificationService 的轻提示预设', () => {
  it('模块作用域一行调用即渲染出轻提示', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    toast.success('已保存')
    await tick()
    expect(document.body.textContent).toContain('已保存')
    expect(partOf('notification', 'item')?.getAttribute('data-tone')).toBe('success')
    toast.dispose()
  })

  it('没写逐条落位时整摞落在服务的 placement，一个位置一摞', async () => {
    const toast = createNotificationService({ preset: 'toast', placement: 'bottom-end' })
    toast.info('一条')
    toast.info('两条')
    await tick()
    const groups = [...document.querySelectorAll('[data-scope="notification"][data-part="group"]')]
    expect(groups.length).toBe(1)
    expect(groups[0]!.getAttribute('data-placement')).toBe('bottom-end')
    expect(groups[0]!.getAttribute('data-count')).toBe('2')
    toast.dispose()
  })

  it('loading 转 success 就地改写同一条', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    const id = toast.loading('上传中')
    await tick()
    expect(document.body.textContent).toContain('上传中')
    toast.update(id, { loading: false, tone: 'success', title: '上传完成' })
    await tick()
    expect(document.body.textContent).toContain('上传完成')
    expect(document.body.textContent ?? '').not.toContain('上传中')
    toast.dispose()
  })

  it('max：超出上限挤掉最旧的那条', async () => {
    const toast = createNotificationService({ preset: 'toast', max: 2 })
    toast.info('第一条')
    toast.info('第二条')
    toast.info('第三条')
    await tick()
    expect(document.body.textContent ?? '').not.toContain('第一条')
    expect(document.body.textContent).toContain('第三条')
    toast.dispose()
  })

  it('不写 max 缺省留 3 条：连发 20 条只剩最新的三条', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    for (let i = 1; i <= 20; i++)
      toast.info(`第 ${i} 条`, { duration: 0 })
    await tick()
    const titles = [...document.querySelectorAll('[data-scope="notification"][data-part="item-title"]')].map(el => el.textContent)
    expect(titles).toEqual(['第 18 条', '第 19 条', '第 20 条'])
    expect(document.querySelector('[data-scope="notification"][data-part="group"]')?.getAttribute('data-count')).toBe('3')
    toast.dispose()
  })

  it('默认出叉，closable=false 显式去掉关闭入口', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    toast.success('已保存')
    await tick()
    expect(partOf('notification', 'item-close-trigger')).not.toBeNull()
    toast.dismissAll()
    await wait(400)

    toast.danger('导出失败', { duration: 0, closable: false })
    await tick()
    expect(partOf('notification', 'item-close-trigger')).toBeNull()
    toast.dispose()
  })

  it('行内动作：给了文案才出那颗钮，按下去查回调表', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    let pressed = 0
    toast.info('已删除', { duration: 0, actionLabel: '撤销', onAction: () => void (pressed += 1) })
    await tick()
    const action = partOf('notification', 'item-action-trigger')
    expect(action?.textContent).toBe('撤销')
    action!.click()
    await tick()
    expect(pressed).toBe(1)
    toast.dispose()
  })

  it('dispose 撤掉宿主容器', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    toast.success('一条')
    await tick()
    toast.dispose()
    expect(document.querySelectorAll('[data-scope="notification"]').length).toBe(0)
    expect(() => toast.success('再来')).toThrow('已卸载')
  })
})

describe('createNotificationService', () => {
  it('标题与正文两层都渲染出来', async () => {
    const notify = createNotificationService()
    notify.info('有新的审批', { description: '张三提交了一份请假单' })
    await tick()
    expect(partOf('notification', 'item-title')?.textContent).toBe('有新的审批')
    expect(partOf('notification', 'item-description')?.textContent).toBe('张三提交了一份请假单')
    notify.dispose()
  })

  it('逐条落位：单条写了 placement 就自己去那一摞', async () => {
    const notify = createNotificationService({ placement: 'bottom-end' })
    notify.info('默认位')
    notify.info('覆盖位', { placement: 'top' })
    await tick()
    const placements = [...document.querySelectorAll('[data-scope="notification"][data-part="group"]')]
      .filter(group => !(group as HTMLElement).hidden)
      .map(group => group.getAttribute('data-placement'))
    expect(placements).toContain('bottom-end')
    expect(placements).toContain('top')
    notify.dispose()
  })

  it('loading 以加载态弹出一条并返回 id，之后用 update 收尾', async () => {
    const notify = createNotificationService()
    const id = notify.loading('正在导出', { description: '共 3 个文件' })
    await tick()
    expect(partOf('notification', 'item')?.hasAttribute('data-loading')).toBe(true)
    notify.update(id, { loading: false, tone: 'success', title: '导出完成' })
    await tick()
    expect(partOf('notification', 'item')?.hasAttribute('data-loading')).toBe(false)
    expect(partOf('notification', 'item')?.getAttribute('data-tone')).toBe('success')
    expect(partOf('notification', 'item-description')?.textContent).toBe('共 3 个文件')
    notify.dispose()
  })

  it('promise 兑现后就地改写成成功，说明三态共用，结果原样透传', async () => {
    const notify = createNotificationService()
    let resolve!: (value: number) => void
    const running = notify.promise(new Promise<number>((r) => {
      resolve = r
    }), { loading: '正在同步', success: v => `已同步 ${v} 条`, error: '同步失败', description: '通讯录' })
    await tick()
    expect(partOf('notification', 'item')?.hasAttribute('data-loading')).toBe(true)
    resolve(12)
    await expect(running).resolves.toBe(12)
    await tick()
    expect(document.querySelectorAll('[data-scope="notification"][data-part="item"]')).toHaveLength(1)
    expect(partOf('notification', 'item')?.hasAttribute('data-loading')).toBe(false)
    expect(partOf('notification', 'item')?.getAttribute('data-tone')).toBe('success')
    expect(partOf('notification', 'item-title')?.textContent).toBe('已同步 12 条')
    expect(partOf('notification', 'item-description')?.textContent).toBe('通讯录')
    notify.dispose()
  })

  it('promise 拒绝时改写成失败，并把 reason 继续抛出去；传函数时当场调用', async () => {
    const notify = createNotificationService()
    const boom = new Error('断网')
    await expect(notify.promise(() => Promise.reject(boom), {
      loading: '正在同步',
      success: '已同步',
      error: r => `同步失败：${(r as Error).message}`,
    })).rejects.toBe(boom)
    await tick()
    expect(partOf('notification', 'item')?.getAttribute('data-tone')).toBe('danger')
    expect(partOf('notification', 'item')?.hasAttribute('data-loading')).toBe(false)
    expect(partOf('notification', 'item-title')?.textContent).toBe('同步失败：断网')
    notify.dispose()
  })

  it('dispose 撤掉宿主容器', async () => {
    const notify = createNotificationService()
    notify.info('一条')
    await tick()
    notify.dispose()
    expect(document.querySelectorAll('[data-scope="notification"]').length).toBe(0)
    expect(() => notify.info('再来')).toThrow('已卸载')
  })
})

describe('createDialogService', () => {
  function buttonWith(text: string): HTMLButtonElement {
    const target = [...document.querySelectorAll<HTMLButtonElement>('button')]
      .find(node => node.textContent!.includes(text))
    if (!target)
      throw new Error(`找不到「${text}」按钮`)
    return target
  }

  it('confirm 点确定 resolve true', async () => {
    const modal = createDialogService()
    const answer = modal.confirm({ title: '删除工作区', content: '删除后 30 天内还能恢复。' })
    await tick()
    expect(document.body.textContent).toContain('删除工作区')
    buttonWith('OK').click()
    await tick()
    await expect(answer).resolves.toBe(true)
    modal.dispose()
  })

  it('confirm 点取消 resolve false', async () => {
    const modal = createDialogService()
    const answer = modal.confirm({ title: '导出数据' })
    await tick()
    buttonWith('Cancel').click()
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
    buttonWith('OK').click()
    await tick()
    expect(document.body.textContent).toContain('第二问')
    buttonWith('Cancel').click()
    await tick()
    await expect(first).resolves.toBe(true)
    await expect(second).resolves.toBe(false)
    modal.dispose()
  })

  it('error 预设是单按钮', async () => {
    const modal = createDialogService()
    const done = modal.error({ title: '同步失败', content: '稍后重试。' })
    await tick()
    expect([...document.querySelectorAll('button')].some(node => node.textContent!.includes('Cancel') && !(node.closest('xh-button') as HTMLElement).hidden)).toBe(false)
    buttonWith('OK').click()
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
  it('建出来即挂上三层部件', async () => {
    const loading = createLoadingBarService()
    await tick()
    expect(partOf('loading-bar', 'root')).not.toBeNull()
    expect(partOf('loading-bar', 'track')).not.toBeNull()
    expect(partOf('loading-bar', 'range')).not.toBeNull()
    loading.dispose()
  })

  it('在途计数：两笔只收一笔时条子不收', async () => {
    const loading = createLoadingBarService()
    await tick()
    expect(partOf('loading-bar', 'root')!.getAttribute('data-state')).toBe('idle')

    loading.start()
    loading.start()
    await tick()
    expect(partOf('loading-bar', 'root')!.getAttribute('data-state')).not.toBe('idle')

    loading.finish()
    await tick()
    expect(partOf('loading-bar', 'root')!.getAttribute('data-state')).not.toBe('idle')

    loading.finishAll()
    await wait(400)
    expect(partOf('loading-bar', 'root')!.getAttribute('data-state')).toBe('idle')
    loading.dispose()
  })
})
