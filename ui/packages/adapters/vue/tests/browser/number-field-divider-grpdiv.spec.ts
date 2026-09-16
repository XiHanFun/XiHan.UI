// 数字字段盒内那道分隔线：把加减钮与输入分成两块，线取钮的半高、居中贴在两段边界。
// 线画在减钮的 background-image 上（::before 是兜底字形，::after 是家族的粗指针热区），
// 渐变的尺寸、贴哪一边、以及选择器在别的结构下命不命中，只有真实浏览器量得出。
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

/** 控件高、钮高（field-inset 档）与线长：线长恒为钮的半高，三档各自比一次。 */
const TIERS = [
  { size: 'sm', controlH: 32, triggerH: 24, dividerH: 12 },
  { size: 'md', controlH: 36, triggerH: 32, dividerH: 16 },
  { size: 'lg', controlH: 40, triggerH: 36, dividerH: 18 },
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

/** 线的几何全在钮自己的背景层上。 */
function divider(name: string): CSSStyleDeclaration {
  return getComputedStyle(part(name))
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
  it.each(TIERS)('$size 档：分隔线取钮的半高并垂直居中', async ({ size, controlH, triggerH, dividerH }) => {
    mountBoxed({ size })
    await settle()

    expect(part('control').getBoundingClientRect().height).toBe(controlH)
    expect(part('decrement-trigger').getBoundingClientRect().height).toBe(triggerH)
    const line = divider('decrement-trigger')
    // 计算值保留百分比：线长是钮高的一半，钮高已在上面钉住
    expect(line.backgroundSize).toBe('1px 50%')
    expect(triggerH / 2).toBe(dividerH)
    expect(line.backgroundPosition).toBe('0px 50%')
    expect(line.backgroundRepeat).toBe('no-repeat')
    // 加钮没有线：它的背景层只有家族那条透明的顶光渐变
    expect(divider('increment-trigger').backgroundSize).toBe('auto')
  })

  it('线是一根发丝宽的分隔色，不是自造的灰；底色换态时它仍叠在上层', async () => {
    mountBoxed()
    await settle()
    const line = divider('decrement-trigger')
    const separator = tokenColor('--xh-material-soft-separator')
    expect(line.backgroundImage).toBe(`linear-gradient(${separator}, ${separator})`)
    expect(divider('increment-trigger').backgroundImage).not.toContain(separator)
  })

  it('减、加两颗钮同在右侧，分隔线只落在输入与动作组之间', async () => {
    mountBoxed()
    await settle()
    const dec = part('decrement-trigger').getBoundingClientRect()
    const inc = part('increment-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()

    expect(input.right).toBe(dec.left)
    expect(dec.right).toBe(inc.left)
    expect(divider('decrement-trigger').backgroundPosition).toBe('0px 50%')
    expect(divider('increment-trigger').backgroundSize).toBe('auto')
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
    expect(divider('decrement-trigger').backgroundPosition).toBe('100% 50%')
    expect(divider('increment-trigger').backgroundSize).toBe('auto')
  })

  it('贴住 min 的钮画着线：线是盒的分区，不是钮的状态', async () => {
    mountBoxed({ min: 5 })
    await settle()
    const dec = part('decrement-trigger') as HTMLButtonElement
    expect(dec.disabled).toBe(true)
    expect(divider('decrement-trigger').backgroundSize).toBe('1px 50%')
    expect(divider('increment-trigger').backgroundSize).toBe('auto')
  })

  it('盒里没有输入的结构不画线：线分的是「控制」与「输入」，没有输入就没有要分的两块', async () => {
    mount({}, () => [
      h(XhNumberFieldControl, null, () => [
        h(XhNumberFieldDecrementTrigger),
        h(XhNumberFieldIncrementTrigger),
      ]),
    ])
    await settle()
    expect(divider('decrement-trigger').backgroundSize).toBe('auto')
    expect(divider('increment-trigger').backgroundSize).toBe('auto')
  })
})
