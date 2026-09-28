// 澄清问卷的两种说明：选项说明另起一行、与选项文字左缘对齐，字比文字小一档；
// 题目说明排在题干下面。选满上限时其余未选项走禁用面。位置与字号只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhQuestionFlowDescription,
  XhQuestionFlowGroup,
  XhQuestionFlowItem,
  XhQuestionFlowItemDescription,
  XhQuestionFlowItemIndicator,
  XhQuestionFlowItemText,
  XhQuestionFlowPrompt,
  XhQuestionFlowQuestion,
  XhQuestionFlowRoot,
  XhQuestionFlowTrack,
  XhQuestionFlowViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))
const OPTIONS = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python', description: '只用来写构建脚本' },
]

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhQuestionFlowRoot, {
      questions: [{ id: 'lang', prompt: '用哪些语言？', type: 'multiple', maxSelections: 1, options: OPTIONS }],
    }, () => h(XhQuestionFlowViewport, null, () => h(XhQuestionFlowTrack, null, () => h(XhQuestionFlowQuestion, { questionId: 'lang' }, () => [
      h(XhQuestionFlowPrompt, { questionId: 'lang' }, () => '用哪些语言？'),
      h(XhQuestionFlowDescription, { questionId: 'lang' }),
      h(XhQuestionFlowGroup, { questionId: 'lang' }, () => OPTIONS.map(option => h(XhQuestionFlowItem, { questionId: 'lang', optionValue: option.value, key: option.value }, () => [
        h(XhQuestionFlowItemIndicator, { questionId: 'lang', optionValue: option.value }),
        h(XhQuestionFlowItemText, { questionId: 'lang', optionValue: option.value }, () => option.label),
        option.description ? h(XhQuestionFlowItemDescription, { questionId: 'lang', optionValue: option.value }, () => option.description) : null,
      ]))),
    ])))),
  })
  app.mount(host)
  for (let i = 0; i < 3; i++) await frame()
  return host
}

describe('question-flow 说明', () => {
  it('选项说明另起一行，与选项文字左缘对齐，字比文字小', async () => {
    const root = await mount()
    const item = root.querySelectorAll<HTMLElement>('[data-part="item"]')[1]!
    const text = item.querySelector<HTMLElement>('[data-part="item-text"]')!.getBoundingClientRect()
    const descriptionEl = item.querySelector<HTMLElement>('[data-part="item-description"]')!
    const description = descriptionEl.getBoundingClientRect()
    expect(description.top).toBeGreaterThanOrEqual(text.bottom - 0.5)
    // 说明的盒从行首起，字从内衬之后起：比的是字的左缘
    const descriptionStart = description.left + Number.parseFloat(getComputedStyle(descriptionEl).paddingInlineStart)
    expect(Math.abs(descriptionStart - text.left)).toBeLessThan(1)
    const size = (el: Element): number => Number.parseFloat(getComputedStyle(el).fontSize)
    expect(size(descriptionEl)).toBeLessThan(size(item.querySelector('[data-part="item-text"]')!))
  })

  it('题目说明排在题干下面，写的是数量要求；选满上限后其余未选项走禁用面', async () => {
    const root = await mount()
    const prompt = root.querySelector<HTMLElement>('[data-part="prompt"]')!.getBoundingClientRect()
    const description = root.querySelector<HTMLElement>('[data-part="description"]')!
    expect(description.textContent).toBe('Choose 1')
    expect(description.getBoundingClientRect().top).toBeGreaterThanOrEqual(prompt.bottom - 0.5)
    const [first, second] = [...root.querySelectorAll<HTMLElement>('[data-part="item"]')]
    const before = getComputedStyle(second!).color
    first!.click()
    await nextTick()
    await Promise.all(document.getAnimations().map(animation => animation.finished))
    expect(second!.getAttribute('aria-disabled')).toBe('true')
    expect(getComputedStyle(second!).color).not.toBe(before)
  })
})
