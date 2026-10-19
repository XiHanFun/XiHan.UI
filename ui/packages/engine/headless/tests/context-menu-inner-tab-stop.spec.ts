// @vitest-environment jsdom
// 触发区里作者内容自带的 Tab 位：原生可聚焦或 tabindex ≥ 0 才算，禁用的、hidden 与 inert 子树里的、
// 菜单自己的浮层不算；观察器先报一次，之后只在结果变了时报。
import { afterEach, describe, expect, it } from 'vitest'
import { hasInnerTabStop, watchInnerTabStop } from '../src/context-menu/context-menu.inner-tab-stop'

const OWN = '[data-own]'

afterEach(() => {
  document.body.replaceChildren()
})

function trigger(html: string): HTMLElement {
  const el = document.createElement('div')
  el.innerHTML = html
  document.body.appendChild(el)
  return el
}

const flushed = (): Promise<void> => Promise.resolve()

describe('hasInnerTabStop', () => {
  it.each([
    ['按钮', '<button>改</button>'],
    ['输入框', '<input>'],
    ['多行文本', '<textarea></textarea>'],
    ['下拉', '<select><option>一</option></select>'],
    ['带 href 的链接', '<a href="#x">链接</a>'],
    ['tabindex=0 的块', '<div><div tabindex="0">画布</div></div>'],
    ['tabindex 为正的块', '<span tabindex="2">块</span>'],
  ])('%s算 Tab 位', (_, html) => {
    expect(hasInnerTabStop(trigger(html), OWN)).toBe(true)
  })

  it.each([
    ['纯文字', '<p>右键这块区域</p>'],
    ['tabindex=-1 的块', '<div tabindex="-1">画布</div>'],
    ['禁用的按钮', '<button disabled>改</button>'],
    ['禁用的 fieldset 里的输入框', '<fieldset disabled><input></fieldset>'],
    ['隐藏输入框', '<input type="hidden">'],
    ['没有 href 的链接', '<a>链接</a>'],
    ['hidden 子树里的按钮', '<div hidden><button>改</button></div>'],
    ['inert 子树里的按钮', '<div inert><button>改</button></div>'],
    ['菜单自己的浮层里的条目', '<div data-own><div role="menuitem" tabindex="0">复制</div></div>'],
  ])('%s不算', (_, html) => {
    expect(hasInnerTabStop(trigger(html), OWN)).toBe(false)
  })

  it('触发区自己的 tabindex 不算', () => {
    const el = trigger('<p>文字</p>')
    el.setAttribute('tabindex', '0')
    expect(hasInnerTabStop(el, OWN)).toBe(false)
  })
})

describe('watchInnerTabStop', () => {
  it('先报一次当前结果，之后只在结果变了时报；停止后不再报', async () => {
    const el = trigger('<p>文字</p>')
    const reports: boolean[] = []
    const stop = watchInnerTabStop(el, OWN, value => reports.push(value))
    expect(reports).toEqual([false])

    const canvas = document.createElement('div')
    canvas.setAttribute('tabindex', '0')
    el.appendChild(canvas)
    await flushed()
    expect(reports).toEqual([false, true])

    // 结果没变：再插一个按钮不报
    el.appendChild(document.createElement('button'))
    await flushed()
    expect(reports).toEqual([false, true])

    canvas.setAttribute('tabindex', '-1')
    el.querySelector('button')!.setAttribute('disabled', '')
    await flushed()
    expect(reports).toEqual([false, true, false])

    canvas.setAttribute('tabindex', '0')
    await flushed()
    expect(reports).toEqual([false, true, false, true])

    canvas.setAttribute('hidden', '')
    await flushed()
    expect(reports).toEqual([false, true, false, true, false])

    stop()
    canvas.removeAttribute('hidden')
    await flushed()
    expect(reports).toEqual([false, true, false, true, false])
  })
})
