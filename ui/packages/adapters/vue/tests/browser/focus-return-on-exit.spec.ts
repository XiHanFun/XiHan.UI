// 关闭那一刻焦点就回到触发器，不等退场动画播完。
//
// 退场期间仍保留资源的层（模态、遮罩、焦点域本身）在关闭同一拍给内容打 inert，焦点若还留在里面，
// 浏览器会在渲染更新末尾把它收到 body 上；归还要是排在退场之后，这一整段退场里焦点都停在 body，
// 读屏与键盘用户在这段时间里「不在任何地方」。退场时长放慢到 1 秒，好在退场中途量焦点位置。
import type { App, VNode } from 'vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCommandRoot,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

beforeEach(() => {
  document.documentElement.style.setProperty('--xh-motion-duration-exit', '1000ms')
})

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
  document.body.innerHTML = ''
  document.documentElement.style.removeProperty('--xh-motion-duration-exit')
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到部件 ${scope}/${name}`)
  return el
}

function frames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number): void => {
      if (left <= 0)
        resolve()
      else
        requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function until(check: () => boolean, label: string, timeout = 2000): Promise<void> {
  const started = performance.now()
  while (!check()) {
    if (performance.now() - started > timeout)
      throw new Error(`等待「${label}」超时`)
    await new Promise<void>(resolve => setTimeout(resolve, 10))
  }
}

/** 打开 → 焦点进入内容 → Escape → 退场中途量焦点：应已在触发器上，内容仍在退场。 */
async function expectFocusBackDuringExit(scope: string, contentPart = 'content'): Promise<void> {
  const trigger = part(scope, 'trigger')
  await userEvent.click(trigger)
  const content = part(scope, contentPart)
  await until(() => content.contains(document.activeElement), '焦点进入内容')

  await userEvent.keyboard('{Escape}')
  await frames(3)
  expect(getComputedStyle(content).animationName, '内容仍在播退场').toMatch(/-out$/)
  expect(document.activeElement, '退场中途焦点已回到触发器').toBe(trigger)
}

describe('关闭那一刻归还焦点', () => {
  it('dialog', async () => {
    await mount(() => h(XhDialogRoot, null, () => [
      h(XhDialogTrigger, null, () => '打开'),
      h(XhDialogContent, null, () => [
        h(XhDialogTitle, null, () => '标题'),
        h('button', { type: 'button' }, '确认'),
        h(XhDialogCloseTrigger),
      ]),
    ]))
    await expectFocusBackDuringExit('dialog')
  })

  it('popover', async () => {
    await mount(() => h(XhPopoverRoot, null, () => [
      h(XhPopoverTrigger, null, () => '打开'),
      h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => [
        h(XhPopoverTitle, null, () => '标题'),
        h('button', { type: 'button' }, '确认'),
      ])),
    ]))
    await expectFocusBackDuringExit('popover')
  })

  it('command', async () => {
    await mount(() => h(XhCommandRoot, { collection: [{ value: 'users', label: '用户管理' }] }, { trigger: () => '命令' }))
    await expectFocusBackDuringExit('command')
  })

  it('select', async () => {
    const collection = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]
    await mount(() => h(XhSelectRoot, { collection }, () => [
      h(XhSelectTrigger, null, () => '选择'),
      h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () => collection.map(item =>
        h(XhSelectItem, { value: item.value, key: item.value }, () => h(XhSelectItemText, null, () => item.label)),
      )))),
    ]))
    await expectFocusBackDuringExit('select')
  })
})
