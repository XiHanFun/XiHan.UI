// @vitest-environment jsdom

import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhButton,
  XhButtonGroup,
  XhDialogContent,
  XhDialogRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhToolbarItem,
  XhToolbarRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../src'
import { XhPortal } from '../src/runtime/portal'

let app: App | null = null
let host: HTMLElement | null = null

async function mount(render: () => VNode | VNode[]): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function shellOf(testId: string): HTMLElement {
  const shell = document.querySelector<HTMLElement>(`[data-testid='${testId}']`)?.closest<HTMLElement>('[data-xh-portal-shell]')
  if (!shell)
    throw new Error(`${testId} 不在 Portal 实例壳里`)
  return shell
}

async function settleMutations(): Promise<void> {
  await Promise.resolve()
  await nextTick()
}

function popover(testId: string): VNode {
  return h(XhPopoverRoot, { open: true }, () => [
    h(XhPopoverTrigger, null, () => '打开'),
    h(XhPopoverPositioner, null, () => [
      h(XhPopoverContent, null, () => h('span', { 'data-testid': testId }, '内容')),
    ]),
  ])
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  document.querySelectorAll('[data-testid="portal-target"]').forEach(node => node.remove())
  app = null
  host = null
})

describe('vue Portal 的局部视觉环境', () => {
  it('真实 Popover 逐项继承来源六轴，不复制尚未存在的透明度轴', async () => {
    await mount(() => h('section', {
      'data-theme': 'dark',
      'data-brand': 'acme',
      'data-density': 'compact',
      'data-contrast': 'more',
      'data-motion': 'reduce',
      'data-transparency': 'reduce',
      'dir': 'rtl',
    }, [popover('first')]))

    const shell = shellOf('first')
    expect(shell.getAttribute('data-theme')).toBe('dark')
    expect(shell.getAttribute('data-brand')).toBe('acme')
    expect(shell.getAttribute('data-density')).toBe('compact')
    expect(shell.getAttribute('data-contrast')).toBe('more')
    expect(shell.getAttribute('data-motion')).toBe('reduce')
    expect(shell.getAttribute('dir')).toBe('rtl')
    expect(shell.hasAttribute('data-transparency')).toBe(false)
  })

  it('popover 与 Dialog 都经过实例壳，两个局部主题互不串值', async () => {
    await mount(() => [
      h('section', { 'data-theme': 'dark' }, [popover('first')]),
      h('section', { 'data-theme': 'light' }, [
        h(XhDialogRoot, { open: true, modal: false }, () => [
          h(XhDialogContent, null, () => h('span', { 'data-testid': 'second' }, '对话框')),
        ]),
      ]),
    ])

    expect(shellOf('first')).not.toBe(shellOf('second'))
    expect(shellOf('first').getAttribute('data-theme')).toBe('dark')
    expect(shellOf('second').getAttribute('data-theme')).toBe('light')
  })

  it('来源祖先运行期改轴与移除声明后异步同步', async () => {
    const theme = ref<string | undefined>('dark')
    const density = ref<string | undefined>()
    await mount(() => h('section', { 'data-theme': theme.value, 'data-density': density.value }, [popover('first')]))

    theme.value = 'light'
    density.value = 'compact'
    await nextTick()
    await settleMutations()
    expect(shellOf('first').getAttribute('data-theme')).toBe('light')
    expect(shellOf('first').getAttribute('data-density')).toBe('compact')

    theme.value = undefined
    await nextTick()
    await settleMutations()
    expect(shellOf('first').hasAttribute('data-theme')).toBe(false)
  })

  it('来源未声明的轴留空，继续继承显式目标容器', async () => {
    const target = document.createElement('aside')
    target.dataset.testid = 'portal-target'
    target.setAttribute('data-theme', 'dark')
    document.body.append(target)
    await mount(() => h(XhPortal, { to: target }, () => h('span', { 'data-testid': 'first' }, '内容')))

    const shell = shellOf('first')
    expect(shell.parentElement).toBe(target)
    expect(shell.hasAttribute('data-theme')).toBe(false)
  })

  it('已有锚点的 Popover/Tooltip 不生成 marker，不改变 ButtonGroup 与 Toolbar 的直接子项', async () => {
    await mount(() => [
      h(XhButtonGroup, null, () => [
        h(XhButton, null, () => '前一项'),
        h(XhPopoverRoot, { open: true }, () => [
          h(XhPopoverTrigger, { asChild: true }, () => h(XhButton, null, () => '末项')),
          h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => '气泡')),
        ]),
      ]),
      h(XhToolbarRoot, null, () => [
        h(XhTooltipRoot, { open: true }, () => [
          h(XhTooltipTrigger, { asChild: true }, () => h(XhToolbarItem, { value: 'tip' }, () => '提示项')),
          h(XhTooltipPositioner, null, () => h(XhTooltipContent, null, () => '提示')),
        ]),
        h(XhToolbarItem, { value: 'plain' }, () => '普通项'),
      ]),
    ])

    const group = document.querySelector<HTMLElement>('[data-scope="button-group"][data-part="root"]')!
    expect([...group.children].map(node => node.getAttribute('data-scope'))).toEqual(['button', 'button'])
    expect(group.lastElementChild?.textContent).toBe('末项')
    const toolbar = document.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="root"]')!
    expect(toolbar.querySelector(':scope > template[data-xh-portal-source]')).toBeNull()
    expect(toolbar.querySelectorAll(':scope > [data-scope="toolbar"][data-part="item"]')).toHaveLength(2)
  })
})
