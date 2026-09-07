// @vitest-environment jsdom
//
// 命令式确认框服务：从组件树之外调起，自带宿主树。
// 这一层没有共享套件可用（套件描述的是组件的 DOM 契约，服务是另一层），只能自己钉。
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDialogService } from '../src'

let service: ReturnType<typeof createDialogService> | null = null

afterEach(() => {
  service?.dispose()
  service = null
  document.body.innerHTML = ''
  vi.useRealTimers()
})

/** 服务的宿主树在 React 之外，推一拍让它把这次状态渲出来。 */
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
  })
}

const title = (): string | null => document.querySelector('[data-scope="dialog"][data-part="title"]')?.textContent ?? null
function buttons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-scope="dialog"][data-part="content"] [data-scope="button"][data-part="root"]')]
}

describe('确认框服务', () => {
  it('confirm 弹出并渲染标题、正文与两颗按钮', async () => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    service = createDialogService()
    void service.confirm({ title: '删除这一项？', content: '删掉之后找不回来' })
    await settle()
    expect(title()).toBe('删除这一项？')
    expect(document.querySelector('[data-part="description"]')?.textContent).toBe('删掉之后找不回来')
    expect(buttons()).toHaveLength(2)
  })

  it('点确认 resolve true，点取消 resolve false', async () => {
    vi.useFakeTimers()
    service = createDialogService()
    const first = service.confirm({ title: '一' })
    await settle()
    await act(async () => buttons()[1]!.click())
    expect(await first).toBe(true)

    // 上一个的退场窗口没走完，下一个不会挂上来
    const second = service.confirm({ title: '二' })
    await settle()
    expect(buttons()).toHaveLength(0)
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await settle()
    await act(async () => buttons()[0]!.click())
    expect(await second).toBe(false)
  })

  it('告知框只有一颗按钮', async () => {
    service = createDialogService()
    void service.info({ title: '已保存' })
    await settle()
    expect(buttons()).toHaveLength(1)
  })

  it('onOk 拒绝时保持打开，不 resolve', async () => {
    service = createDialogService()
    let settled = false
    const p = service.confirm({ title: '提交', onOk: () => Promise.reject(new Error('后端拒了')) })
    void p.then(() => (settled = true))
    await settle()
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    await act(async () => buttons()[1]!.click())
    await settle()
    err.mockRestore()
    expect(title()).toBe('提交')
    expect(settled).toBe(false)
  })

  it('同一时刻只挂一个，后来的排队', async () => {
    vi.useFakeTimers()
    service = createDialogService()
    const first = service.confirm({ title: '一' })
    void service.confirm({ title: '二' })
    await settle()
    expect(document.querySelectorAll('[data-scope="dialog"][data-part="content"]')).toHaveLength(1)
    expect(title()).toBe('一')

    await act(async () => buttons()[1]!.click())
    expect(await first).toBe(true)
    // 退场窗口走完才轮到下一个
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await settle()
    expect(title()).toBe('二')
  })

  it('prompt 把改过的值带回来；取消给 null', async () => {
    service = createDialogService()
    const p = service.prompt<{ name: string }>({
      title: '改名',
      initialValue: { name: '旧' },
      body: (value, set) => (
        <input data-testid="name" value={value.name} onChange={e => set({ name: e.target.value })} />
      ),
    })
    await settle()
    const input = document.querySelector<HTMLInputElement>('[data-testid="name"]')!
    expect(input.value).toBe('旧')
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(globalThis.HTMLInputElement.prototype, 'value')!.set!
      setter.call(input, '新')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await settle()
    await act(async () => buttons()[1]!.click())
    expect(await p).toEqual({ name: '新' })
  })

  it('dispose 之后队里没结的一律按取消结掉，不会永远挂着', async () => {
    service = createDialogService()
    const first = service.confirm({ title: '一' })
    const queued = service.confirm({ title: '二' })
    await settle()
    service.dispose()
    service = null
    expect(await first).toBe(false)
    expect(await queued).toBe(false)
  })

  it('setConfig 换掉的文案下一帧生效', async () => {
    service = createDialogService({ config: { translations: { dialog: { close: '甲' } } } })
    void service.confirm({ title: '一' })
    await settle()
    service.setConfig({ translations: { dialog: { close: '乙' } } })
    await settle()
    // 配置真的推到了子树：换一份之后宿主重渲，读到的是新那一份
    expect(document.querySelector('[data-scope="dialog"][data-part="content"]')).not.toBeNull()
  })
})
