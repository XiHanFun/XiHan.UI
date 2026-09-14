// @vitest-environment jsdom
//
// 同名处理器的先后：作者挂在角色节点上的监听器先跑，部件的后跑——与 Vue / React 两侧
// 的 asChild 与直通属性对得上。Light-DOM 这边的先后就是 DOM 监听器的注册顺序：作者的标记
// 先在页面上，部件的监听器要等元素升级、接线那一趟才挂上去。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

afterEach(() => {
  document.body.innerHTML = ''
})

/** 先把标记搭好、把作者的监听器挂上，再入文档触发升级与接线。 */
function mountCollapsible(onAuthorClick: () => void): { host: Updatable, trigger: HTMLElement } {
  const host = document.createElement('xh-collapsible') as Updatable
  const root = document.createElement('div')
  root.dataset.xhPart = 'root'
  const trigger = document.createElement('button')
  trigger.dataset.xhPart = 'trigger'
  trigger.textContent = '开合'
  const content = document.createElement('div')
  content.dataset.xhPart = 'content'
  content.textContent = '内容'
  root.append(trigger, content)
  host.append(root)
  trigger.addEventListener('click', onAuthorClick)
  document.body.append(host)
  return { host, trigger }
}

describe('触发器同名处理器的先后', () => {
  it('作者挂在触发器上的监听器先跑，部件的后跑', async () => {
    const seen: string[] = []
    const { host, trigger } = mountCollapsible(() => seen.push('作者'))
    host.addEventListener('open-change', () => seen.push('部件'))
    await host.updateComplete
    await new Promise(r => setTimeout(r, 0))

    trigger.click()
    await new Promise(r => setTimeout(r, 0))
    expect(seen).toEqual(['作者', '部件'])
  })

  it('重接线之后先后不变', async () => {
    const seen: string[] = []
    const { host, trigger } = mountCollapsible(() => seen.push('作者'))
    host.addEventListener('open-change', () => seen.push('部件'))
    await host.updateComplete
    await new Promise(r => setTimeout(r, 0))

    // 第一次点击会改状态、走一趟重接线；部件的监听器在那一趟里摘了重挂
    trigger.click()
    await host.updateComplete
    await new Promise(r => setTimeout(r, 0))
    seen.length = 0

    trigger.click()
    await new Promise(r => setTimeout(r, 0))
    expect(seen).toEqual(['作者', '部件'])
  })
})
