import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='editable'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 editable/${name}`)
  return element
}

async function mountEditable(density: 'comfortable' | 'compact' = 'comfortable'): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  if (density === 'compact')
    host.dataset.density = 'compact'
  document.body.append(host)
  app = createApp({
    render: () => h(XhEditableRoot, { defaultValue: '曦寒' }, () => [
      h(XhEditableLabel, null, () => '昵称'),
      h(XhEditableControl, null, () => [
        h(XhEditablePreview),
        h(XhEditableInput),
        h(XhEditableEditTrigger, { 'aria-label': '编辑' }),
        h(XhEditableSubmitTrigger, { 'aria-label': '确认' }),
        h(XhEditableCancelTrigger, { 'aria-label': '取消' }),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function expectIconButton(name: string): void {
  const button = part(name)
  const rect = button.getBoundingClientRect()
  expect(button.textContent).toBe('')
  expect(button.getAttribute('aria-label')).not.toBeNull()
  expect(rect.width).toBe(rect.height)
  const mark = getComputedStyle(button, '::before')
  expect(mark.content).toBe('""')
  expect(mark.maskImage).not.toBe('none')
}

function expectUnifiedControl(...partNames: string[]): void {
  const control = part('control')
  const controlRect = control.getBoundingClientRect()
  const controlStyle = getComputedStyle(control)
  expect(controlStyle.borderTopWidth).not.toBe('0px')
  expect(controlStyle.overflow).toBe('hidden')
  expect(controlStyle.gap).toBe('0px')

  for (const name of partNames) {
    const element = part(name)
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    expect(rect.left).toBeGreaterThanOrEqual(controlRect.left)
    expect(rect.right).toBeLessThanOrEqual(controlRect.right)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.borderRadius).toBe('0px')
    expect(style.boxShadow).toBe('none')
  }
}

async function emulatePointer(value?: 'coarse'): Promise<void> {
  await cdp().send('Emulation.setTouchEmulationEnabled', {
    enabled: value === 'coarse',
    maxTouchPoints: value === 'coarse' ? 5 : 1,
  })
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  document.documentElement.removeAttribute('dir')
  await emulatePointer()
})

describe('就地编辑的左内容右动作布局', () => {
  it('预览态只显示右侧编辑图标，标题与控件按字段结构上下排列', async () => {
    await mountEditable()
    const preview = part('preview').getBoundingClientRect()
    const edit = part('edit-trigger')

    expect(getComputedStyle(part('root')).flexDirection).toBe('column')
    expect(edit.hidden).toBe(false)
    expect(part('submit-trigger').hidden).toBe(true)
    expect(part('cancel-trigger').hidden).toBe(true)
    expect(preview.right).toBeLessThanOrEqual(edit.getBoundingClientRect().left)
    expectIconButton('edit-trigger')
    expectUnifiedControl('preview', 'edit-trigger')
    expect(getComputedStyle(edit, '::after').borderInlineStartWidth).not.toBe('0px')
  })

  it('编辑态切成左侧输入与右侧确认、取消图标，三个动作不同时出现', async () => {
    await mountEditable()
    await userEvent.click(part('edit-trigger'))
    await nextTick()

    const input = part('input').getBoundingClientRect()
    const submit = part('submit-trigger').getBoundingClientRect()
    const cancel = part('cancel-trigger').getBoundingClientRect()
    expect(part('edit-trigger').hidden).toBe(true)
    expect(part('submit-trigger').hidden).toBe(false)
    expect(part('cancel-trigger').hidden).toBe(false)
    expect(input.right).toBeLessThanOrEqual(submit.left)
    expect(submit.right).toBeLessThanOrEqual(cancel.left)
    expectIconButton('submit-trigger')
    expectIconButton('cancel-trigger')
    expectUnifiedControl('input', 'submit-trigger', 'cancel-trigger')
    expect(getComputedStyle(part('submit-trigger'), '::after').borderInlineStartWidth).not.toBe('0px')
    expect(getComputedStyle(part('submit-trigger')).backgroundColor)
      .toBe(getComputedStyle(part('cancel-trigger')).backgroundColor)
  })

  it.each([
    { density: 'comfortable', target: 48 },
    { density: 'compact', target: 44 },
  ] as const)('$density 粗指针：右侧图标按钮采用 $target px 真实命中盒', async ({ density, target }) => {
    await emulatePointer('coarse')
    await mountEditable(density)
    await userEvent.click(part('edit-trigger'))
    await nextTick()

    const input = part('input').getBoundingClientRect()
    const submit = part('submit-trigger').getBoundingClientRect()
    const cancel = part('cancel-trigger').getBoundingClientRect()
    expect(submit.width).toBe(target)
    expect(submit.height).toBe(target)
    expect(cancel.width).toBe(target)
    expect(cancel.height).toBe(target)
    expect(part('control').getBoundingClientRect().height).toBe(target)
    expect(input.right).toBeLessThanOrEqual(submit.left)
    expect(submit.right).toBeLessThanOrEqual(cancel.left)
    expectUnifiedControl('input', 'submit-trigger', 'cancel-trigger')
  })

  it('RTL：动作组跟随逻辑末端镜像，内容与按钮仍不重叠', async () => {
    document.documentElement.dir = 'rtl'
    await mountEditable()
    expect(part('edit-trigger').getBoundingClientRect().right)
      .toBeLessThanOrEqual(part('preview').getBoundingClientRect().left)

    await userEvent.click(part('edit-trigger'))
    await nextTick()
    const input = part('input').getBoundingClientRect()
    const submit = part('submit-trigger').getBoundingClientRect()
    const cancel = part('cancel-trigger').getBoundingClientRect()
    expect(cancel.right).toBeLessThanOrEqual(submit.left)
    expect(submit.right).toBeLessThanOrEqual(input.left)
  })
})
