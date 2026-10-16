// 库内控件放进 <xh-field>：焦点所在的输入框与触发钮念得出字段标题，描述链指向真实存在的说明与错误文案。
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function mount(label: string, control: string): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-field invalid required>
      <div data-xh-part="root">
        <label data-xh-part="label">${label}</label>
        ${control}
        <p data-xh-part="description">填工作用的那一个</p>
        <p data-xh-part="error-text">这一项必填</p>
      </div>
    </xh-field>`
  document.body.append(host)
  return host
}

/** 名字链的第一个 id 是字段标题；控件自己那段指向它没渲染的 label 部件，按 accname 规则悬空的跳过。 */
function firstName(el: Element): string | undefined {
  const first = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/)[0]!
  return document.getElementById(first)?.textContent?.trim()
}

/** 描述链上每个 id 都指向文档里真实存在的节点，读出来的文字依次是这些。 */
function descriptions(el: Element): string[] {
  return (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean).map((id) => {
    const target = document.getElementById(id)
    expect(target, `aria-describedby 指向的 ${id} 不存在`).not.toBeNull()
    return target!.textContent!.trim()
  })
}

describe('库内控件放进字段的无障碍接线', () => {
  it('文本框：input 念字段标题，描述链念说明与错误文案，axe 无违规', async () => {
    const root = mount('邮箱', `
      <xh-text-field data-xh-part="control">
        <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>
      </xh-text-field>`)
    await settle()
    const input = root.querySelector('input')!
    expect(firstName(input)).toBe('邮箱')
    expect(descriptions(input)).toEqual(['填工作用的那一个', '这一项必填'])
    await expectNoAxeViolations(root)
  })

  it('下拉：触发钮念字段标题，描述链念说明与错误文案，axe 无违规', async () => {
    const root = mount('部门', `
      <xh-select data-xh-part="control">
        <div data-xh-part="root">
          <button data-xh-part="trigger"><span data-xh-part="value-text"></span></button>
          <select data-xh-part="hidden-select"></select>
          <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list"></div></div></div>
        </div>
      </xh-select>`)
    await settle()
    const trigger = root.querySelector('button')!
    expect(firstName(trigger)).toBe('部门')
    expect(descriptions(trigger)).toEqual(['填工作用的那一个', '这一项必填'])
    await expectNoAxeViolations(root)
  })
})
