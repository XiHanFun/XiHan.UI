import { afterEach, describe, expect, it } from 'vitest'
import { createDialogService } from '../../src/services'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let service: ReturnType<typeof createDialogService> | null = null

function part(name: string): HTMLElement {
  const node = document.querySelector<HTMLElement>(`[data-scope='dialog'][data-part='${name}']`)
  if (!node)
    throw new Error(`缺少对话框部件：${name}`)
  return node
}

async function settle(): Promise<void> {
  for (let count = 0; count < 3; count++)
    await new Promise(resolve => setTimeout(resolve, 0))
  await expect.poll(() => part('content').getBoundingClientRect().height).toBeGreaterThan(0)
  part('content').getAnimations().forEach(animation => animation.finish())
}

afterEach(() => {
  service?.dispose()
  service = null
})

describe('命令对话框公共三段结构', () => {
  it('字符串正文、标题徽记与动作分别进入 Header/Body/Footer，保留读屏关联', async () => {
    service = createDialogService()
    void service.confirm({ title: '确认删除', content: '这项操作无法撤销', badge: 'warning' })
    await settle()
    expect([...part('content').children].map(node => (node as HTMLElement).dataset.part)).toEqual(['header', 'body', 'footer'])
    expect(part('header').contains(part('title'))).toBe(true)
    expect(part('header').contains(part('indicator'))).toBe(true)
    expect(part('body').contains(part('description'))).toBe(true)
    expect(part('footer').querySelectorAll('button')).toHaveLength(2)
    expect(part('content').getAttribute('aria-labelledby')).toBe(part('title').id)
    expect(part('content').getAttribute('aria-describedby')).toBe(part('description').id)
    expect(part('header').style.cssText).toBe('')
    expect(part('footer').style.cssText).toBe('')
  })

  it('函数长正文只滚 Body，Header/Footer 不随内容滚走', async () => {
    service = createDialogService()
    void service.confirm({ title: '长正文', content: (target) => {
      const content = document.createElement('div')
      content.style.height = '1800px'
      content.textContent = '完整记录'
      target.append(content)
    } })
    await settle()
    const body = part('body')
    const headerTop = part('header').getBoundingClientRect().top
    const footerTop = part('footer').getBoundingClientRect().top
    expect(getComputedStyle(part('content')).overflowY).toBe('hidden')
    expect(getComputedStyle(body).overflowY).toBe('auto')
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    body.scrollTop = 100
    expect(body.scrollTop).toBe(100)
    expect(part('header').getBoundingClientRect().top).toBe(headerTop)
    expect(part('footer').getBoundingClientRect().top).toBe(footerTop)
  })

  it('告知框只显示确认按钮；异步确认仍在同一 Footer 内反馈忙态', async () => {
    let complete: () => void = () => {}
    service = createDialogService()
    const result = service.info({ title: '处理中', onOk: () => new Promise<void>((resolve) => {
      complete = resolve
    }) })
    await settle()
    const buttons = [...part('footer').querySelectorAll<HTMLButtonElement>('button')]
    expect(buttons.filter(button => button.getBoundingClientRect().width > 0)).toHaveLength(1)
    buttons[1]!.click()
    await settle()
    expect(buttons[1]!.hasAttribute('data-loading')).toBe(true)
    expect(buttons[1]!.getAttribute('aria-disabled')).toBe('true')
    complete()
    await expect(result).resolves.toBeUndefined()
  })
})
