// 引用编号展开预览时的「打开中」面：与悬停同档的中性面，不用品牌淡底（品牌淡底只表达选中 / 当前）；
// 禁用时前景降级，不只靠透明度。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhCitationPreview, XhCitationRoot, XhCitationText, XhCitationTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

const sources = [{ type: 'source-url', sourceId: 'report', title: '报告', url: 'https://example.com/report' }] as const

async function mount(disabled = false): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCitationRoot, { sources, disabled }, () => [
      h(XhCitationText, null, () => ['正文', h(XhCitationTrigger, { sourceId: 'report', citationId: 'c1' }, () => '1')]),
      h(XhCitationPreview, { sourceId: 'report' }),
    ]),
  })
  app.mount(host)
  await nextTick()
  const trigger = host.querySelector<HTMLElement>(`[data-scope='citation'][data-part='trigger']`)!
  trigger.style.transition = 'none'
  return trigger
}

function resolveColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

describe('citation 打开中', () => {
  it('打开态取与悬停同档的中性面，不用品牌淡底', async () => {
    const trigger = await mount()
    await userEvent.click(trigger)
    await nextTick()
    // 指针移开，只看打开态本身
    await userEvent.hover(document.body)
    expect(trigger.getAttribute('data-state')).toBe('open')
    const bg = getComputedStyle(trigger).backgroundColor
    expect(bg).not.toBe(resolveColor('--xh-bg-brand-subtle'))
    expect(bg).toBe(resolveColor('--xh-bg-subtle-hover'))
  })

  it('禁用时正文前景降级，不只靠透明度', async () => {
    await mount(true)
    const root = host!.querySelector<HTMLElement>(`[data-scope='citation'][data-part='root']`)!
    const text = host!.querySelector<HTMLElement>(`[data-scope='citation'][data-part='text']`)!
    expect(getComputedStyle(root).opacity).toBe('1')
    const probe = document.createElement('span')
    probe.style.color = 'var(--xh-fg-disabled)'
    host!.append(probe)
    expect(getComputedStyle(text).color).toBe(getComputedStyle(probe).color)
  })
})
