// 行内文字的删除线、下划线与标记：线画没画、两条线能否并存、标记底色是否随语气换族，
// 这些都是计算样式上的事实，只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function mount(children: () => ReturnType<typeof h>[]): Promise<HTMLElement[]> {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhTypographyRoot, null, () => h(XhTypographyParagraph, null, children)) })
  app.mount(host)
  await nextTick()
  return [...document.querySelectorAll<HTMLElement>('[data-scope="typography"][data-part="text"]')]
}

/** 令牌在当前主题下解析出的颜色：放一个探针取计算值，不在测试里抄色值。 */
function resolvedBackground(token: string): string {
  const probe = document.createElement('span')
  probe.style.background = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).backgroundColor
  probe.remove()
  return color
}

describe('typography 删除线、下划线与标记（Chromium）', () => {
  it('删除线与下划线各画各的线，两个都开时两条并存；不开不画', async () => {
    const [strike, under, both, plain] = await mount(() => [
      h(XhTypographyText, { strikethrough: true }, () => '原价'),
      h(XhTypographyText, { underline: true }, () => '强调'),
      h(XhTypographyText, { strikethrough: true, underline: true }, () => '两条'),
      h(XhTypographyText, null, () => '普通'),
    ])
    expect(getComputedStyle(strike!).textDecorationLine).toBe('line-through')
    expect(getComputedStyle(under!).textDecorationLine).toBe('underline')
    expect(getComputedStyle(both!).textDecorationLine.split(' ').sort()).toEqual(['line-through', 'underline'])
    expect(getComputedStyle(plain!).textDecorationLine).toBe('none')
  })

  it('标记画淡底：缺省与文本高亮同一副底，写了语气换成该族；不写标记只换字色', async () => {
    const [mark, toned, toneOnly] = await mount(() => [
      h(XhTypographyText, { mark: true }, () => '命中'),
      h(XhTypographyText, { mark: true, tone: 'warning' }, () => '待核'),
      h(XhTypographyText, { tone: 'warning' }, () => '只换字色'),
    ])
    expect(getComputedStyle(mark!).backgroundColor).toBe(resolvedBackground('--xh-bg-brand-subtle'))
    const tonedBg = getComputedStyle(toned!).backgroundColor
    expect(tonedBg).not.toBe('rgba(0, 0, 0, 0)')
    expect(tonedBg).not.toBe(getComputedStyle(mark!).backgroundColor)
    expect(getComputedStyle(toneOnly!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    // 同族字色：标记与只写语气的那段是同一支
    expect(getComputedStyle(toned!).color).toBe(getComputedStyle(toneOnly!).color)
  })

  it('as 写成 del 与 mark 时由皮肤接管：mark 的浏览器默认黄底被换掉', async () => {
    const [del, mark] = await mount(() => [
      h(XhTypographyText, { as: 'del', strikethrough: true }, () => '已删除'),
      h(XhTypographyText, { as: 'mark', mark: true }, () => '标出'),
    ])
    expect(del!.tagName).toBe('DEL')
    expect(getComputedStyle(del!).textDecorationLine).toBe('line-through')
    expect(mark!.tagName).toBe('MARK')
    expect(getComputedStyle(mark!).backgroundColor).toBe(resolvedBackground('--xh-bg-brand-subtle'))
  })
})
