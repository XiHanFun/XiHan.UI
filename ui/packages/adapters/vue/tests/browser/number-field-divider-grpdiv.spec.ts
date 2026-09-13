/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数字字段盒内那道分隔线：把加减钮与输入分成两块，线占满控件高度并贴在两段边界。
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

/** 控件高与线长：线长恒为控件全高，三档各自比一次。 */
const TIERS = [
  { size: 'sm', controlH: 32 },
  { size: 'md', controlH: 36 },
  { size: 'lg', controlH: 40 },
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
  it.each(TIERS)('$size 档：分隔线占满控件高度', async ({ size, controlH }) => {
    mountBoxed({ size })
    await settle()

    expect(part('control').getBoundingClientRect().height).toBe(controlH)
    for (const name of ['decrement-trigger', 'increment-trigger']) {
      const line = divider(name)
      // 线在场
      expect(line.content).toBe('""')
      expect(px(line.height)).toBe(controlH)
      expect(px(line.top)).toBe(0)
    }
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

  it('线落在钮与输入的边界，两侧钮各朝输入的一边', async () => {
    mountBoxed()
    await settle()
    const dec = part('decrement-trigger').getBoundingClientRect()
    const inc = part('increment-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()

    expect(lineCenter('decrement-trigger')).toBeCloseTo(dec.right - 0.5, 5)
    expect(dec.right).toBe(input.left)
    expect(lineCenter('increment-trigger')).toBeCloseTo(inc.left + 0.5, 5)
    expect(inc.left).toBe(input.right)
  })

  it('右起排版：线跟着换边，仍在钮朝向输入的那一侧', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    mountBoxed()
    await settle()
    const dec = part('decrement-trigger').getBoundingClientRect()
    const inc = part('increment-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()

    // 右起时减钮在输入右边：线要落到减钮的左侧那道间隙里
    expect(dec.left).toBe(input.right)
    expect(lineCenter('decrement-trigger')).toBeCloseTo(dec.left + 0.5, 5)
    // 加钮在输入左边：线换到加钮的右侧
    expect(inc.right).toBe(input.left)
    expect(lineCenter('increment-trigger')).toBeCloseTo(inc.right - 0.5, 5)
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
