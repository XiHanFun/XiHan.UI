// 披露内容的首帧：挂载时已经展开或收起的内容直接呈现，不播展开、收起动画；第一次开合起才按动效走。
// 动画是否在播只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhCollapsibleContent,
  XhCollapsibleIndicator,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhReasoningContent,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallLabel,
  XhToolCallRoot,
  XhToolCallTrigger,
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

/** 部件上正在播的 CSS 动画名（不含过渡）。 */
function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => a.animationName)
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
    // 行高不可合成，展开期间也不挂 will-change
    expect(getComputedStyle(contents[1]!).willChange).toBe('auto')
  })

  it('收起首帧就展开的那一项：播收起动画', async () => {
    const { contents, triggers } = mountAccordion(['one'])
    await settle()
    triggers[0]!.click()
    await nextTick()
    expect(running(contents[0]!)).toEqual(['xh-disclosure-collapse'])
  })
})

function mountCollapsible(defaultOpen: boolean): { content: HTMLElement, trigger: HTMLElement } {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCollapsibleRoot, { defaultOpen }, () => [
      h(XhCollapsibleTrigger, () => ['详情', h(XhCollapsibleIndicator)]),
      h(XhCollapsibleContent, () => '正文'),
    ]),
  })
  app.mount(host)
  return {
    content: host.querySelector<HTMLElement>('[data-scope="collapsible"][data-part="content"]')!,
    trigger: host.querySelector<HTMLElement>('[data-scope="collapsible"][data-part="trigger"]')!,
  }
}

describe('collapsible 首帧不播开合', () => {
  it.each([true, false])('挂载时 defaultOpen=%s：内容没有在播的动画', async (defaultOpen) => {
    const { content } = mountCollapsible(defaultOpen)
    await settle()
    expect(running(content)).toEqual([])
  })

  it('第一次开合起按动效走：点开播展开，再点收起播收起', async () => {
    const { content, trigger } = mountCollapsible(false)
    await settle()
    trigger.click()
    await nextTick()
    expect(running(content)).toEqual(['xh-disclosure-expand'])
    await settle()
    trigger.click()
    await nextTick()
    expect(running(content)).toEqual(['xh-disclosure-collapse'])
  })
})

describe('tool-call 首帧不播开合', () => {
  it('在跑时挂载即自动展开：内容没有在播的展开动画；跑完自动收起时播收起', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const phase = ref<'input-streaming' | 'output-available'>('input-streaming')
    app = createApp({
      render: () => h(XhToolCallRoot, { phase: phase.value }, () => [
        h(XhToolCallTrigger, () => [h(XhToolCallLabel, () => '搜索'), h(XhToolCallIndicator)]),
        h(XhToolCallContent, () => '入参与结果'),
      ]),
    })
    app.mount(host)
    await settle()
    const content = host.querySelector<HTMLElement>('[data-scope="tool-call"][data-part="content"]')!
    expect(content.getAttribute('data-state')).toBe('open')
    expect(running(content)).toEqual([])

    phase.value = 'output-available'
    await nextTick()
    expect(running(content)).toEqual(['xh-disclosure-collapse'])
  })
})

describe('reasoning 首帧不播', () => {
  it('挂载时已经想完：标签不播整句替换的淡入；挂载后想完那一下才播', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const streaming = ref(false)
    app = createApp({
      render: () => h(XhReasoningRoot, { streaming: streaming.value }, () => [
        h(XhReasoningTrigger, () => [h(XhReasoningLabel)]),
        h(XhReasoningContent, () => '推理过程'),
      ]),
    })
    app.mount(host)
    await settle()
    const label = host.querySelector<HTMLElement>('[data-scope="reasoning"][data-part="label"]')!
    expect(running(label)).toEqual([])

    streaming.value = true
    await settle()
    streaming.value = false
    await nextTick()
    expect(running(label)).toEqual(['xh-fade-in'])
  })
})
