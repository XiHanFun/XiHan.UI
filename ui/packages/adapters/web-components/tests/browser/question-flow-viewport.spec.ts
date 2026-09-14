// 视口高度与轨道位移是量出来的，只有真实浏览器验得了。
//
// jsdom 里所有盒子都是 0×0：机器照样跑、连接层照样产出两个私有槽，断言也照样绿，
// 但「当前题被推到视口里、卡片高度跟着这一题走」这件事一次都没被检验过。
// 这条把两件事各量一遍：换题之后视口高度等于新那一题的高度，且那一题的顶边与视口顶边重合。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const QUESTIONS = [
  { id: 'a', prompt: '短的一题', type: 'single' as const, options: [{ value: 'a1', label: '甲' }] },
  {
    id: 'b',
    prompt: '长一些的一题',
    type: 'single' as const,
    options: [{ value: 'b1', label: '甲' }, { value: 'b2', label: '乙' }, { value: 'b3', label: '丙' }],
  },
]

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function optionMarkup(questionId: string, value: string, label: string): string {
  return `
    <button data-xh-part="item" question-id="${questionId}" option-value="${value}">
      <span data-xh-part="item-indicator" question-id="${questionId}" option-value="${value}"></span>
      <span data-xh-part="item-text" question-id="${questionId}" option-value="${value}">${label}</span>
    </button>`
}

function questionMarkup(question: (typeof QUESTIONS)[number]): string {
  return `
    <div data-xh-part="question" question-id="${question.id}">
      <p data-xh-part="prompt" question-id="${question.id}">${question.prompt}</p>
      <div data-xh-part="group" question-id="${question.id}">
        ${question.options.map(o => optionMarkup(question.id, o.value, o.label)).join('')}
      </div>
    </div>`
}

/** 等一拍渲染，再等过渡跑完。 */
async function settle(el: HTMLElement & { updateComplete?: Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await el.updateComplete
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
  }
  await new Promise(resolve => setTimeout(resolve, 400))
}

interface Probe {
  flow: HTMLElement & { index?: number, questions?: unknown, updateComplete?: Promise<unknown> }
  viewport: HTMLElement
  questions: HTMLElement[]
}

async function mount(): Promise<Probe> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  host.innerHTML = `
    <xh-question-flow>
      <div data-xh-part="root">
        <div data-xh-part="viewport">
          <div data-xh-part="track">${QUESTIONS.map(questionMarkup).join('')}</div>
        </div>
        <div data-xh-part="footer">
          <button data-xh-part="submit-trigger">继续</button>
        </div>
      </div>
    </xh-question-flow>`
  document.body.append(host)
  const flow = host.querySelector('xh-question-flow') as Probe['flow']
  flow.questions = QUESTIONS
  await settle(flow)
  return {
    flow,
    viewport: host.querySelector<HTMLElement>('[data-xh-part="viewport"]')!,
    questions: [...host.querySelectorAll<HTMLElement>('[data-xh-part="question"]')],
  }
}

describe('question-flow：视口高度与轨道位移', () => {
  it('挂载即量：视口高度等于第一题的高度，第一题贴着视口顶边', async () => {
    const { viewport, questions } = await mount()
    const first = questions[0]!.getBoundingClientRect()
    expect(viewport.getBoundingClientRect().height).toBeCloseTo(first.height, 0)
    expect(first.top).toBeCloseTo(viewport.getBoundingClientRect().top, 0)
  })

  it('换题即重量：视口长到新那一题的高度，轨道把它推到顶边', async () => {
    const probe = await mount()
    const shortHeight = probe.questions[0]!.getBoundingClientRect().height
    probe.flow.index = 1
    await settle(probe.flow)
    const second = probe.questions[1]!.getBoundingClientRect()
    const viewport = probe.viewport.getBoundingClientRect()
    // 第二题多两个选项，必须比第一题高，否则这条用例什么都没验到
    expect(second.height).toBeGreaterThan(shortHeight)
    expect(viewport.height).toBeCloseTo(second.height, 0)
    expect(second.top).toBeCloseTo(viewport.top, 0)
  })
})
