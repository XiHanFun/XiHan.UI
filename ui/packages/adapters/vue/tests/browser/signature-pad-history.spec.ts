// 签名板的回显与撤销：回显的笔迹按存下的坐标系铺满真实画布，撤到头之后焦点仍留在撤销钮上。
// 前者要真实的 SVG 排版才量得出笔迹落在画布哪里；后者要真实浏览器的焦点规则——原生 disabled 的按钮
// 会把焦点丢回 body，jsdom 不做这一步。
import type { SignaturePadValue } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhSignaturePadControl,
  XhSignaturePadPath,
  XhSignaturePadRedoTrigger,
  XhSignaturePadRoot,
  XhSignaturePadUndoTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SCOPE = `[data-scope='signature-pad']`

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(defaultValue?: SignaturePadValue): Promise<{ control: SVGSVGElement, path: SVGPathElement, undo: HTMLButtonElement, redo: HTMLButtonElement }> {
  host = document.createElement('div')
  document.body.prepend(host)
  app = createApp({
    render: () => h(XhSignaturePadRoot, { defaultValue, style: { inlineSize: '300px' } }, () => [
      h(XhSignaturePadControl, null, () => [h(XhSignaturePadPath)]),
      h(XhSignaturePadUndoTrigger, null, () => '撤销'),
      h(XhSignaturePadRedoTrigger, null, () => '重做'),
    ]),
  })
  app.mount(host)
  await nextTick()
  return {
    control: host.querySelector<SVGSVGElement>(`${SCOPE}[data-part='control']`)!,
    path: host.querySelector<SVGPathElement>(`${SCOPE}[data-part='path']`)!,
    undo: host.querySelector<HTMLButtonElement>(`${SCOPE}[data-part='undo-trigger']`)!,
    redo: host.querySelector<HTMLButtonElement>(`${SCOPE}[data-part='redo-trigger']`)!,
  }
}

/** 测试文档里的坐标换算成外层页面（CDP 坐标系）的坐标：vitest 把文档装在按比例缩放的 iframe 里。 */
function toPage(x: number, y: number): { x: number, y: number } {
  const frame = window.frameElement?.getBoundingClientRect()
  if (!frame)
    return { x, y }
  return { x: frame.left + x * (frame.width / window.innerWidth), y: frame.top + y * (frame.height / window.innerHeight) }
}

/** 用真实鼠标在画布上画一笔：按下、依次移动、抬起。坐标相对画布左上角。 */
async function drawStroke(control: Element, points: ReadonlyArray<[number, number]>): Promise<void> {
  const rect = control.getBoundingClientRect()
  const at = ([x, y]: readonly [number, number]): { x: number, y: number } => toPage(rect.left + x, rect.top + y)
  const [first, ...rest] = points
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(first!) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', ...at(first!), button: 'left', buttons: 1, clickCount: 1 })
  for (const point of rest)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(point), button: 'left', buttons: 1 })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...at(points[points.length - 1]!), button: 'left', buttons: 0, clickCount: 1 })
  await nextTick()
}

/** 令牌在当前主题下解析成的颜色。 */
function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('signature-pad 回显与撤销（真实浏览器）', () => {
  it('回显：存下的笔迹按存下时的坐标系铺满此刻的画布，画布窄了一半笔迹也跟着缩一半', async () => {
    // 存下时画布 600 宽；一笔横线从 60 到 540，笔宽 4
    const { control, path } = await mount({
      strokes: [{ points: [{ x: 60, y: 120, pressure: 0.5 }, { x: 540, y: 120, pressure: 0.5 }] }],
      surface: { width: 600, height: 240 },
    })
    const box = control.getBoundingClientRect()
    const style = getComputedStyle(control)
    const left = box.left + Number.parseFloat(style.borderLeftWidth)
    const contentWidth = box.width - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)
    const scale = contentWidth / 600
    const ink = path.getBoundingClientRect()
    // 两端各多出半个笔宽的笔帽
    expect(ink.left).toBeCloseTo(left + (60 - 2) * scale, 0)
    expect(ink.right).toBeCloseTo(left + (540 + 2) * scale, 0)
    expect(ink.height).toBeCloseTo(4 * scale, 0)
  })

  it('键盘撤到头：撤销钮换成置灰面但焦点仍留在它身上，没有掉回 body；重做钮随之可按', async () => {
    const { control, path, undo, redo } = await mount()
    await drawStroke(control, [[40, 40], [120, 70], [200, 50]])
    expect(path.getAttribute('d')).not.toBe('')
    expect(undo.getAttribute('aria-disabled')).toBeNull()

    undo.focus()
    await userEvent.keyboard('{Enter}')
    await nextTick()

    expect(path.getAttribute('d')).toBe('')
    expect(document.activeElement).toBe(undo)
    expect(undo.getAttribute('aria-disabled')).toBe('true')
    expect(undo.hasAttribute('disabled')).toBe(false)
    await expect.poll(() => getComputedStyle(undo).color).toBe(tokenColor('--xh-fg-disabled'))
    expect(getComputedStyle(undo).cursor).toBe('not-allowed')
    expect(redo.getAttribute('aria-disabled')).toBeNull()

    // 置灰的那颗再按一次是空操作
    await userEvent.keyboard('{Enter}')
    await nextTick()
    expect(path.getAttribute('d')).toBe('')
    expect(document.activeElement).toBe(undo)
  })
})
