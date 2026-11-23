// @vitest-environment jsdom
// 取值型弹窗：正文由调用方拼表单，确认时把那份值带回；取消带回 null。Vue 与 React 的服务早有 prompt，这里核 WC 的同一条契约。
import { afterEach, describe, expect, it } from 'vitest'
import { createDialogService } from '../src/services/dialog-service'

let service: ReturnType<typeof createDialogService> | null = null

async function flush(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
}
async function change(fn: () => unknown): Promise<void> {
  await fn()
  await flush()
}

afterEach(() => {
  service?.dispose()
  service = null
  document.body.innerHTML = ''
})

function buttons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-scope="dialog"][data-part="footer"] button')]
}

/** 正文里拼一个输入框，输入写回那份值；renders 记正文被拼了几次。 */
function nameForm(renders: { count: number }) {
  return (body: HTMLElement, value: { name: string }): void => {
    renders.count++
    const input = document.createElement('input')
    input.setAttribute('data-testid', 'name')
    input.value = value.name
    input.addEventListener('input', () => {
      value.name = input.value
    })
    body.append(input)
  }
}

function type(text: string): void {
  const input = document.querySelector<HTMLInputElement>('[data-testid="name"]')!
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('命令对话框的 prompt', () => {
  it('确认带回值的快照，改它不影响调用方给的初值', async () => {
    const initial = { name: '未命名' }
    const renders = { count: 0 }
    await change(() => {
      service = createDialogService()
    })
    let result!: Promise<{ name: string } | null>
    await change(() => {
      result = service!.prompt({ title: '重命名', initialValue: initial, body: nameForm(renders) })
    })
    expect(document.querySelector<HTMLInputElement>('[data-testid="name"]')!.value).toBe('未命名')

    type('季度报告')
    await change(() => buttons()[1]!.click())

    await expect(result).resolves.toEqual({ name: '季度报告' })
    expect(initial).toEqual({ name: '未命名' })
  })

  it('取消带回 null', async () => {
    await change(() => {
      service = createDialogService()
    })
    let result!: Promise<{ name: string } | null>
    await change(() => {
      result = service!.prompt({ title: '重命名', initialValue: { name: '' }, body: nameForm({ count: 0 }) })
    })
    type('写了一半')
    await change(() => buttons()[0]!.click())

    await expect(result).resolves.toBeNull()
  })

  it('onOk 拿到的是表单写过的那份值；返回 false 不放行，正文不重铺，输入还在', async () => {
    const renders = { count: 0 }
    const seen: string[] = []
    await change(() => {
      service = createDialogService()
    })
    let result!: Promise<{ name: string } | null>
    await change(() => {
      result = service!.prompt({
        title: '重命名',
        initialValue: { name: '' },
        body: nameForm(renders),
        onOk: (value) => {
          seen.push(value.name)
          return value.name !== ''
        },
      })
    })

    // 空着就确认：onOk 返回 false，弹窗留着
    await change(() => buttons()[1]!.click())
    expect(seen).toEqual([''])
    expect(renders.count).toBe(1)

    type('季度报告')
    await change(() => buttons()[1]!.click())

    expect(seen).toEqual(['', '季度报告'])
    // 忙闲切换与一次不放行都只是重画按钮，正文只拼过一次
    expect(renders.count).toBe(1)
    await expect(result).resolves.toEqual({ name: '季度报告' })
  })
})
