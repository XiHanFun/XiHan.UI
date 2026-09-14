// 提及的输入框是单行 <input>：候选浮层贴的是整个输入框，不跟着光标走，
// 换掉宿主标签之后落位仍然成立；框的几何与文本输入的单行档同一档。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhMentionRoot, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const COLLECTION = [
  { value: 'lilei', label: '李雷' },
  { value: 'hanmeimei', label: '韩梅梅' },
]

const INPUT = '[data-scope="mention"][data-part="input"]'
const POSITIONER = '[data-scope="mention"][data-part="positioner"]'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** 挂一件提及，返回它的输入框。offsetTop 把它推离视口顶边，好让浮层能落在上下两侧。 */
function mountMention(offsetTop = 200): HTMLInputElement {
  host = document.createElement('div')
  host.style.cssText = `position:absolute;left:40px;top:${offsetTop}px;width:320px`
  document.body.append(host)
  app = createApp({ render: () => h(XhMentionRoot, { collection: COLLECTION } as never) })
  app.mount(host)
  return document.querySelector<HTMLInputElement>(INPUT)!
}

/** 打字：写值、摆光标、派原生 input 事件——提及的入口就是这三件。 */
async function type(el: HTMLInputElement, text: string, caret = text.length): Promise<void> {
  el.focus()
  el.value = text
  el.setSelectionRange(caret, caret)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
  await nextTick()
}

/** 等定位引擎把坐标写完：落位之前 data-positioned 不在场，量到的是 (0,0)。 */
async function positioned(): Promise<HTMLElement> {
  for (let i = 0; i < 180; i += 1) {
    const el = document.querySelector<HTMLElement>(POSITIONER)
    if (el?.hasAttribute('data-positioned'))
      return el
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
  }
  throw new Error('浮层一直没落位')
}

describe('提及的输入宿主是单行 input', () => {
  it('三家共用的连接层渲出来的就是 <input type="text">', () => {
    const el = mountMention()
    expect(el.tagName).toBe('INPUT')
    expect(el.getAttribute('type')).toBe('text')
    // 单行宿主取 combobox 角色，开合经 aria-expanded 上报
    expect(el.getAttribute('role')).toBe('combobox')
    expect(el.getAttribute('aria-expanded')).toBe('false')
  })

  it('框高与文本输入的单行档一致，纵向内距归零', () => {
    const mention = mountMention()

    const tfHost = document.createElement('div')
    document.body.append(tfHost)
    const tfApp = createApp({
      render: () => h(XhTextFieldRoot, null, () => [
        h(XhTextFieldControl, null, () => [h(XhTextFieldInput)]),
      ]),
    })
    tfApp.mount(tfHost)
    const control = document.querySelector<HTMLElement>('[data-scope="text-field"][data-part="control"]')!

    const mentionStyle = getComputedStyle(mention)
    expect(mentionStyle.paddingTop).toBe('0px')
    expect(mentionStyle.paddingBottom).toBe('0px')
    // 多行时代这里是 resize: vertical，拖得动就把浮层与框的对齐拽歪
    expect(mentionStyle.resize).toBe('none')
    expect(mention.getBoundingClientRect().height)
      .toBeCloseTo(control.getBoundingClientRect().height, 1)

    tfApp.unmount()
    tfHost.remove()
  })
})

describe('单行输入框在表单里的三条路', () => {
  /** 挂一件带 name 的提及，外面裹一层 form；候选由调用方给，空数组即一条都选不了。 */
  function mountInForm(collection = COLLECTION): { input: HTMLInputElement, form: HTMLFormElement } {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h('form', null, [h(XhMentionRoot, { name: 'body', collection } as never)]),
    })
    app.mount(host)
    return {
      input: document.querySelector<HTMLInputElement>(INPUT)!,
      form: host.querySelector('form')!,
    }
  }

  it('name 落在真控件上，正文随表单一并交出去', async () => {
    const { input, form } = mountInForm()
    expect(input.getAttribute('name')).toBe('body')
    await type(input, '你好 @李雷')
    expect(new FormData(form).get('body')).toBe('你好 @李雷')
  })

  it('有候选可提交时吞掉回车，正文里不留这一发', async () => {
    const { input } = mountInForm()
    await type(input, '@li')
    await positioned()
    const commit = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    input.dispatchEvent(commit)
    await nextTick()
    expect(commit.defaultPrevented).toBe(true)
    expect(input.value).toBe('@李雷 ')
  })

  it('一条候选都提交不了时放行回车：单行输入框里这一发归表单', async () => {
    const { input } = mountInForm([])
    await type(input, '@zzz')
    await nextTick()
    const pass = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    input.dispatchEvent(pass)
    await nextTick()
    expect(pass.defaultPrevented).toBe(false)
    // 正文一字未动，只是浮层收起来了
    expect(input.value).toBe('@zzz')
  })
})

describe('输入法组合期不被抢键', () => {
  it('组合中按方向键：不拦、也不移高亮，那一发归输入法候选框', async () => {
    const el = mountMention()
    await type(el, '@li')
    await positioned()
    const items = [...document.querySelectorAll<HTMLElement>('[data-scope="mention"][data-part="item"]')]
    const before = items.findIndex(item => item.hasAttribute('data-highlighted'))
    expect(before).toBe(0)

    el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true, isComposing: true })
    el.dispatchEvent(event)
    await nextTick()
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    const after = items.findIndex(item => item.hasAttribute('data-highlighted'))
    expect(after).toBe(before)
    el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '李' }))
  })
})

describe('候选浮层贴的是整个输入框，不是插入符', () => {
  it('光标在正文哪一处都不改落点：左缘对齐框的左缘，顶边贴框的下缘', async () => {
    const el = mountMention()
    await type(el, '你好 @li')
    const first = await positioned()
    const box = el.getBoundingClientRect()
    const panel = first.getBoundingClientRect()

    // bottom-start：行内轴对齐框的起始缘，主轴落在框下方
    expect(panel.left).toBeCloseTo(box.left, 0)
    expect(panel.top).toBeGreaterThanOrEqual(box.bottom)
    // 间距是引擎那一档 offset，不该被框高之外的东西撑开
    expect(panel.top - box.bottom).toBeLessThan(16)
  })

  it('触发点在行首还是行尾都落在同一处：位置只由框决定', async () => {
    /** 挂一件、打一段带触发的正文、量浮层，然后拆掉。 */
    async function panelFor(text: string): Promise<DOMRect> {
      const el = mountMention()
      await type(el, text)
      const rect = (await positioned()).getBoundingClientRect()
      app!.unmount()
      app = null
      host!.remove()
      host = null
      return rect
    }

    // 两次的框在同一个位置，差别只在插入符：一次贴着行首，一次被前面那串字推到行尾
    const near = await panelFor('@li')
    const far = await panelFor('前面先垫一长串字好把插入符推到很右边 @li')

    // 按插入符落位的话这两次会差出一整行的宽度
    expect(far.left).toBeCloseTo(near.left, 0)
    expect(far.top).toBeCloseTo(near.top, 0)
  })
})
