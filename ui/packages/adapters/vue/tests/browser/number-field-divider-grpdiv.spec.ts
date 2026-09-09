// 数字输入盒内那道分隔线：把加减钮与输入分成两块，线比控件矮一截、落在两者之间那道间隙的正中。
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

/** 控件高与线长：线长恒为控件高的一半，三档各自比一次。 */
const TIERS = [
  { size: 'sm', controlH: 28, dividerH: 14 },
  { size: 'md', controlH: 32, dividerH: 16 },
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

/** 一体式：加减钮与输入同在 control 里，减在前、加在后。 */
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
  it.each(TIERS)('$size 档：线长是控件高的一半，上下各留白，不与控件等高', async ({ size, controlH, dividerH }) => {
    mountBoxed({ size })
    await settle()

    expect(part('control').getBoundingClientRect().height).toBe(controlH)
    for (const name of ['decrement-trigger', 'increment-trigger']) {
      const line = divider(name)
      // 线在场
      expect(line.content).toBe('""')
      expect(px(line.height)).toBe(dividerH)
      // 「不和组件等高」：线长严格短于控件高，且上下各留了一截
      expect(px(line.height)).toBeLessThan(controlH)
      const spare = controlH - px(line.height)
      expect(spare).toBeGreaterThanOrEqual(controlH / 4)
      // 纵向居中在钮里：钮高减线长后上下均分
      const triggerH = part(name).getBoundingClientRect().height
      expect(px(line.top)).toBeCloseTo((triggerH - px(line.height)) / 2, 5)
    }
  })

  it('线是一根发丝宽的边框色，不是自造的灰', async () => {
    mountBoxed()
    await settle()
    const line = divider('decrement-trigger')
    expect(px(line.width)).toBe(1)
    expect(px(line.borderInlineStartWidth)).toBe(1)
    expect(line.borderInlineStartColor).toBe(tokenColor('--xh-border-default'))
    // 底色通道不参与：高对比档会把底色换成面色，线得挂在边框那一档上
    expect(line.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('线落在钮与输入之间那道间隙的正中，两侧钮各朝输入的那一边', async () => {
    mountBoxed()
    await settle()
    const dec = part('decrement-trigger').getBoundingClientRect()
    const inc = part('increment-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()

    // 减钮排在输入之前：线落在减钮右边缘与输入左边缘之间的正中
    expect(lineCenter('decrement-trigger')).toBeCloseTo((dec.right + input.left) / 2, 5)
    // 加钮排在输入之后：线换到加钮的左侧，同样是那道间隙的正中
    expect(lineCenter('increment-trigger')).toBeCloseTo((input.right + inc.left) / 2, 5)
  })

  it('右起排版：线跟着换边，仍在钮朝向输入的那一侧', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    mountBoxed()
    await settle()
    const dec = part('decrement-trigger').getBoundingClientRect()
    const inc = part('increment-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()

    // 右起时减钮在输入右边：线要落到减钮的左侧那道间隙里
    expect(dec.left).toBeGreaterThan(input.right)
    expect(lineCenter('decrement-trigger')).toBeCloseTo((input.right + dec.left) / 2, 5)
    // 加钮在输入左边：线换到加钮的右侧
    expect(inc.right).toBeLessThan(input.left)
    expect(lineCenter('increment-trigger')).toBeCloseTo((inc.right + input.left) / 2, 5)
  })

  it('贴住 min 的钮画着线：线是盒的分区，不是钮的状态', async () => {
    mountBoxed({ min: 5 })
    await settle()
    const dec = part('decrement-trigger') as HTMLButtonElement
    expect(dec.disabled).toBe(true)
    expect(divider('decrement-trigger').content).toBe('""')
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

  it('不写 control 的三件并排那一档不画线：那时每件各有各的描边', async () => {
    mount({}, () => [
      h(XhNumberFieldDecrementTrigger),
      h(XhNumberFieldInput),
      h(XhNumberFieldIncrementTrigger),
    ])
    await settle()
    expect(divider('decrement-trigger').content).toBe('none')
    expect(divider('increment-trigger').content).toBe('none')
  })
})
