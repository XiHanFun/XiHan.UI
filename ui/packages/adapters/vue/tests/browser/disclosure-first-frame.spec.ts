// 披露内容的首帧：挂载时已经展开或收起的内容直接呈现，不播展开、收起动画；第一次开合起才按动效走。
// 动画是否在播只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

/** 部件上正在播的 CSS 动画名。 */
function running(el: Element): string[] {
  return el.getAnimations().map(a => (a as CSSAnimation).animationName)
}

function mountAccordion(defaultValue: string[]): { contents: HTMLElement[], triggers: HTMLElement[] } {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhAccordionRoot, { defaultValue, collapsible: true, multiple: true }, () => ['one', 'two'].map(value =>
      h(XhAccordionItem, { key: value, value }, () => [
        h(XhAccordionHeader, () => [h(XhAccordionTrigger, () => [value, h(XhAccordionIndicator)])]),
        h(XhAccordionContent, () => `${value} 的正文`),
      ]),
    )),
  })
  app.mount(host)
  return {
    contents: [...host.querySelectorAll<HTMLElement>('[data-scope="accordion"][data-part="content"]')],
    triggers: [...host.querySelectorAll<HTMLElement>('[data-scope="accordion"][data-part="trigger"]')],
  }
}

describe('accordion 首帧不播开合', () => {
  it('挂载时展开的与收起的内容都没有在播的动画', async () => {
    const { contents } = mountAccordion(['one'])
    await settle()
    expect(running(contents[0]!)).toEqual([])
    expect(running(contents[1]!)).toEqual([])
    // 收起的那一项直接落成收起，不经过一段收起动画
    expect(contents[1]!.style.display).toBe('none')
  })

  it('点开第二项：它播展开动画，已经展开的第一项不重播', async () => {
    const { contents, triggers } = mountAccordion(['one'])
    await settle()
    triggers[1]!.click()
    await nextTick()
    expect(running(contents[1]!)).toEqual(['xh-disclosure-expand'])
    expect(running(contents[0]!)).toEqual([])
  })

  it('收起首帧就展开的那一项：播收起动画', async () => {
    const { contents, triggers } = mountAccordion(['one'])
    await settle()
    triggers[0]!.click()
    await nextTick()
    expect(running(contents[0]!)).toEqual(['xh-disclosure-collapse'])
  })
})
