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

/** 读一枚令牌在文档上解析出的值。 */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** 颜色的 alpha 通道（0 – 255）：经 canvas 铺一像素读回，不同序列化的透明色都归到同一个数。 */
function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

/** 颜色令牌按浏览器序列化后的写法取，与 getComputedStyle 的颜色值可直接对拍。 */
function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** 纯图标按钮：field-inset 档的正方视觉盒、inset 圆角，符号由兜底字形画。 */
function expectIconButton(name: string, size: number): void {
  const button = part(name)
  const rect = button.getBoundingClientRect()
  expect(button.textContent).toBe('')
  expect(button.getAttribute('aria-label')).not.toBeNull()
  expect(rect.width).toBe(size)
  expect(rect.height).toBe(size)
  expect(getComputedStyle(button).borderRadius).toBe(token('--xh-shape-inset'))
  const mark = getComputedStyle(button, '::before')
  expect(mark.content).toBe('""')
  expect(mark.maskImage).not.toBe('none')
}

/** 一体式盒：描边只在 control 上，盒内分段无边无影；盒不裁剪，家族热区伪元素才伸得出去。 */
function expectUnifiedControl(...partNames: string[]): void {
  const control = part('control')
  const controlRect = control.getBoundingClientRect()
  const controlStyle = getComputedStyle(control)
  expect(controlStyle.borderTopWidth).not.toBe('0px')
  expect(controlStyle.boxShadow).toBe('none')
  expect(controlStyle.overflow).toBe('visible')
  expect(controlStyle.gap).toBe('0px')

  for (const name of partNames) {
    const element = part(name)
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    expect(rect.left).toBeGreaterThanOrEqual(controlRect.left)
    expect(rect.right).toBeLessThanOrEqual(controlRect.right)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.boxShadow).toBe('none')
  }
}

/** 动作组第一颗钮与内容段之间的分隔线画在背景层，::after 留给家族热区。 */
function expectDivider(name: string, rtl = false): void {
  const style = getComputedStyle(part(name))
  const separator = token('--xh-material-soft-separator')
  expect(style.backgroundImage).toBe(`linear-gradient(${separator}, ${separator})`)
  expect(style.backgroundSize).toBe('1px 50%')
  expect(style.backgroundPosition).toBe(rtl ? '100% 50%' : '0px 50%')
  expect(style.backgroundRepeat).toBe('no-repeat')
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
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
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
    // md 档：field-inset 视觉盒取 --xh-control-h-sm（32px），控件本体 --xh-control-h-md（36px）
    expectIconButton('edit-trigger', 32)
    expect(part('control').getBoundingClientRect().height).toBe(36)
    expectUnifiedControl('preview', 'edit-trigger')
    expectDivider('edit-trigger')
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
    expectIconButton('submit-trigger', 32)
    expectIconButton('cancel-trigger', 32)
    expectUnifiedControl('input', 'submit-trigger', 'cancel-trigger')
    expectDivider('submit-trigger')
    // 取消钮没有线：它的背景层只有家族那条透明的顶光渐变；两颗钮静息都不填底
    // （一支是 transparent 关键字、一支是兑成 0% 的 color-mix，序列化不同、都是全透明）
    expect(getComputedStyle(part('cancel-trigger')).backgroundSize).toBe('auto')
    expect(alpha(getComputedStyle(part('submit-trigger')).backgroundColor)).toBe(0)
    expect(alpha(getComputedStyle(part('cancel-trigger')).backgroundColor)).toBe(0)
  })

  it('三颗钮常态透明，悬停浮出白底承载的 100 档，焦点环由 control 画在外框上', async () => {
    await mountEditable()
    await userEvent.click(part('edit-trigger'))
    await nextTick()
    const submit = part('submit-trigger')
    expect(getComputedStyle(submit).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.hover(submit)
    // 底色带 120ms 过渡，等过渡走完再对账
    await expect.poll(() => getComputedStyle(submit).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(part('control')).outlineStyle).toBe('solid')
    expect(getComputedStyle(part('input')).outlineStyle).toBe('none')
  })

  it.each([
    { density: 'comfortable', control: 36, trigger: 32 },
    { density: 'compact', control: 32, trigger: 28 },
  ] as const)('$density 粗指针：视觉盒不放大，右侧图标按钮各自由家族伪元素外扩到 44px 命中区', async ({ density, control: controlH, trigger }) => {
    await emulatePointer('coarse')
    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    await mountEditable(density)
    await userEvent.click(part('edit-trigger'))
    await nextTick()

    const input = part('input').getBoundingClientRect()
    const submit = part('submit-trigger').getBoundingClientRect()
    const cancel = part('cancel-trigger').getBoundingClientRect()
    expect(submit.width).toBe(trigger)
    expect(submit.height).toBe(trigger)
    expect(cancel.width).toBe(trigger)
    expect(cancel.height).toBe(trigger)
    expect(part('control').getBoundingClientRect().height).toBe(controlH)
    expect(input.right).toBeLessThanOrEqual(submit.left)
    expect(submit.right).toBeLessThanOrEqual(cancel.left)
    for (const name of ['submit-trigger', 'cancel-trigger']) {
      const target = getComputedStyle(part(name), '::after')
      expect(target.content).toBe('""')
      expect(Number.parseFloat(target.minInlineSize)).toBeGreaterThanOrEqual(44)
      expect(Number.parseFloat(target.minBlockSize)).toBeGreaterThanOrEqual(44)
    }
    expectUnifiedControl('input', 'submit-trigger', 'cancel-trigger')
  })

  it('从右到左（RTL）：动作组跟随逻辑末端镜像，分隔线换到物理右侧，内容与按钮仍不重叠', async () => {
    document.documentElement.dir = 'rtl'
    await mountEditable()
    expect(part('edit-trigger').getBoundingClientRect().right)
      .toBeLessThanOrEqual(part('preview').getBoundingClientRect().left)
    expectDivider('edit-trigger', true)

    await userEvent.click(part('edit-trigger'))
    await nextTick()
    const input = part('input').getBoundingClientRect()
    const submit = part('submit-trigger').getBoundingClientRect()
    const cancel = part('cancel-trigger').getBoundingClientRect()
    expect(cancel.right).toBeLessThanOrEqual(submit.left)
    expect(submit.right).toBeLessThanOrEqual(input.left)
  })
})
