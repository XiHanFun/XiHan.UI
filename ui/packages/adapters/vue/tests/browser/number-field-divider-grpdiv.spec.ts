// 数字字段盒内那道分隔线：把加减钮与输入分成两块，线取控件半高、居中贴在两段边界。
// 伪元素的几何、逻辑侧解析成哪一边、以及选择器在别的结构下命不命中，只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 控件高与线长：线长恒为控件半高，三档各自比一次。 */
const TIERS = [
  { size: 'sm', controlH: 32, dividerH: 16 },
  { size: 'md', controlH: 36, dividerH: 18 },
  { size: 'lg', controlH: 40, dividerH: 20 },
] as const

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.removeAttribute('dir')
  document.body.innerHTML = ''
})

/** 一体式：DOM 顺序保持减、输入、加，皮肤把两颗动作一起排到逻辑末端。 */
function mountBoxed(props: Record<string, unknown> = {}): void {
  mount(props, () => [
    h(XhNumberFieldControl, null, () => [
      h(XhNumberFieldDecrementTrigger),
      h(XhNumberFieldInput),
      h(XhNumberFieldIncrementTrigger),
    ]),
  ])
}

function mount(props: Record<string, unknown>, children: () => unknown[]): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhNumberFieldRoot, { defaultValue: '5', ...props }, children as never),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="number-field"][data-part="${name}"]`)
  if (!el)
    throw new Error(`没有 ${name} 这个节点`)
  return el
}

function divider(name: string): CSSStyleDeclaration {
  return getComputedStyle(part(name), '::after')
}

function px(value: string): number {
  return Number.parseFloat(value)
}

/** 线在页面坐标里的横向中心：伪元素量不到盒，用钮的盒加上算好的偏移。 */
function lineCenter(name: string): number {
  const line = divider(name)
  return part(name).getBoundingClientRect().left + px(line.left) + px(line.width) / 2
}

/** 把令牌解析成这台浏览器上的最终颜色，用来与线的颜色对账。 */
function tokenColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('数字输入的加减钮分隔线', () => {
  it.each(TIERS)('$size 档：分隔线取控件半高并垂直居中', async ({ size, controlH, dividerH }) => {
    mountBoxed({ size })
    await settle()

    expect(part('control').getBoundingClientRect().height).toBe(controlH)
    const line = divider('decrement-trigger')
    expect(line.content).toBe('""')
    expect(px(line.height)).toBe(dividerH)
    expect(px(line.top)).toBe((controlH - dividerH) / 2)
    expect(divider('increment-trigger').content).toBe('none')
  })

  it('线是一根发丝宽的边框色，不是自造的灰', async () => {
    mountBoxed()
    await settle()
    const line = divider('decrement-trigger')
    expect(px(line.width)).toBe(1)
    expect(px(line.borderInlineStartWidth)).toBe(1)
    expect(line.borderInlineStartColor).toBe(tokenColor('--xh-material-soft-separator'))
    // 底色通道不参与：高对比档会把底色换成面色，线得挂在边框那一档上
    expect(line.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('减、加两颗钮同在右侧，分隔线只落在输入与动作组之间', async () => {
    mountBoxed()
    await settle()
    const dec = part('decrement-trigger').getBoundingClientRect()
    const inc = part('increment-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()

    expect(input.right).toBe(dec.left)
    expect(dec.right).toBe(inc.left)
    expect(lineCenter('decrement-trigger')).toBeCloseTo(dec.left + 0.5, 5)
    expect(divider('increment-trigger').content).toBe('none')
  })

  it('右起排版：动作组镜像到逻辑末端，线仍隔开输入与动作', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    mountBoxed()
    await settle()
    const dec = part('decrement-trigger').getBoundingClientRect()
    const inc = part('increment-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()

    expect(dec.right).toBe(input.left)
    expect(inc.right).toBe(dec.left)
    expect(lineCenter('decrement-trigger')).toBeCloseTo(dec.right - 0.5, 5)
    expect(divider('increment-trigger').content).toBe('none')
  })

  it('贴住 min 的钮画着线：线是盒的分区，不是钮的状态', async () => {
    mountBoxed({ min: 5 })
    await settle()
    const dec = part('decrement-trigger') as HTMLButtonElement
    expect(dec.disabled).toBe(true)
    expect(divider('decrement-trigger').content).toBe('""')
    expect(divider('increment-trigger').content).toBe('none')
  })

  it('盒里没有输入的结构不画线：线分的是「控制」与「输入」，没有输入就没有要分的两块', async () => {
    mount({}, () => [
      h(XhNumberFieldControl, null, () => [
        h(XhNumberFieldDecrementTrigger),
        h(XhNumberFieldIncrementTrigger),
      ]),
    ])
    await settle()
    expect(divider('decrement-trigger').content).toBe('none')
    expect(divider('increment-trigger').content).toBe('none')
  })
})
