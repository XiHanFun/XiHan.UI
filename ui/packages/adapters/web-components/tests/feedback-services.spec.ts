// @vitest-environment jsdom
// 命令式反馈服务：不在文档树的某一处、模块作用域直接调用，是这几个服务存在的意义，
// 所有用例都不预先写任何标签。
import { afterEach, describe, expect, it } from 'vitest'
import {
  createDialogService,
  createLoadingBarService,
  createNotificationService,
  createToastService,
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

describe('createToastService', () => {
  it('模块作用域一行调用即渲染出条子', async () => {
    const toast = createToastService()
    toast.success('已保存')
    await tick()
    expect(document.body.textContent).toContain('已保存')
    expect(partOf('toast', 'root')?.getAttribute('data-severity')).toBe('success')
    toast.dispose()
  })

  it('落位是整个服务的口径，一个服务只有一摞', async () => {
    const toast = createToastService({ placement: 'bottom-end' })
    toast.info('一条')
    toast.info('两条')
    await tick()
    const groups = [...document.querySelectorAll('[data-scope="toast"][data-part="group"]')]
    expect(groups.length).toBe(1)
    expect(groups[0]!.getAttribute('data-placement')).toBe('bottom-end')
    expect(groups[0]!.getAttribute('data-count')).toBe('2')
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
    expect(document.body.textContent ?? '').not.toContain('上传中')
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

  it('不写 max 缺省留 5 条：连发 20 条只剩最新的五条', async () => {
    const toast = createToastService()
    for (let i = 1; i <= 20; i++)
      toast.info(`第 ${i} 条`, { duration: 0 })
    await tick()
    const titles = [...document.querySelectorAll('[data-scope="toast"][data-part="title"]')].map(el => el.textContent)
    expect(titles).toEqual(['第 16 条', '第 17 条', '第 18 条', '第 19 条', '第 20 条'])
    expect(document.querySelector('[data-scope="toast"][data-part="group"]')?.getAttribute('data-count')).toBe('5')
    toast.dispose()
  })

  it('到点自己走的不出叉，走不掉的反过来出叉', async () => {
    const toast = createToastService()
    toast.success('已保存')
    await tick()
    expect(partOf('toast', 'close-trigger')).toBeNull()
    toast.dismissAll()
    await wait(400)

    toast.error('导出失败', { duration: 0 })
    await tick()
    expect(partOf('toast', 'close-trigger')).not.toBeNull()
    toast.dispose()
  })

  it('行内动作：给了文案才出那颗钮，按下去查回调表', async () => {
    const toast = createToastService()
    let pressed = 0
    toast.info('已删除', { duration: 0, actionLabel: '撤销', onAction: () => void (pressed += 1) })
    await tick()
    const action = partOf('toast', 'action-trigger')
    expect(action?.textContent).toBe('撤销')
    action!.click()
    await tick()
    expect(pressed).toBe(1)
    toast.dispose()
  })

  it('dispose 撤掉宿主容器', async () => {
    const toast = createToastService()
    toast.success('一条')
    await tick()
    toast.dispose()
    expect(document.querySelectorAll('[data-scope="toast"]').length).toBe(0)
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
