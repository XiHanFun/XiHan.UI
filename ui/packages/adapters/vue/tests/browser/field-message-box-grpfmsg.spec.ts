// 一段错误文字不该改变字段的外框尺寸。
//
// 错误文案是流内的一块，出现时把字段撑高一行：整表跟着重排，限高的父级里控件被挤出去。
// 皮肤给辅助文字那一行留了固定的占位，报错时错误文案顶掉占位，外框高度前后一样。
//
// 判据全部量真实布局：外框高度、消息与控件的重叠、定高父级里消息的可见面积。
// 这些在 jsdom 里量出来全是 0，只有真浏览器才有值。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤算出来的布局
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

interface Case {
  invalid?: boolean
  /** 渲不渲染说明部件 */
  description?: boolean
  /** 渲不渲染错误文案部件 */
  errorText?: boolean
  /** 给父级定高并裁切，量消息会不会被裁掉 */
  parentHeight?: number
}

function mount(c: Case): void {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = `width: 320px; ${c.parentHeight ? `height:${c.parentHeight}px; overflow:hidden;` : ''}`
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhFieldRoot, { invalid: !!c.invalid }, () => [
      h(XhFieldLabel, () => '邮箱'),
      h(XhFieldControl, () => h('input', { value: '张三张三张三张三' })),
      ...(c.description ? [h(XhFieldDescription, () => '工作邮箱，登录用')] : []),
      ...(c.errorText === false ? [] : [h(XhFieldErrorText, () => '格式不对')]),
    ]),
  })
  app.mount(host)
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="field"][data-part="${name}"]`)
  if (!el)
    throw new Error(`没有 ${name} 部件`)
  return el
}

/** 挂一份用例，返回字段外框的高度 */
function boxHeight(c: Case): number {
  mount(c)
  return part('root').getBoundingClientRect().height
}

/** 两个矩形的重叠面积 */
function overlap(a: DOMRect, b: DOMRect): number {
  const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return Math.round(w * h)
}

const area = (r: DOMRect): number => Math.round(r.width * r.height)

describe('错误文案不改变字段的外框尺寸', () => {
  // 只有说明在场时两段共用一行，早先就不撑高；没有说明的字段是撑高的那一档，
  // 两档都量，改一档不能把另一档弄坏
  const SHAPES: [string, boolean][] = [
    ['不带说明', false],
    ['带说明', true],
  ]

  it.each(SHAPES)('%s 的字段，报错前后外框等高', (_, description) => {
    const normal = boxHeight({ description })
    const invalid = boxHeight({ description, invalid: true })
    expect(invalid).toBe(normal)
  })

  it('没渲染错误文案的字段不占这一行', () => {
    // 这种字段根本不会报错，外框就该只有标签加控件那么高
    const withSlot = boxHeight({})
    const withoutSlot = boxHeight({ errorText: false })
    expect(withoutSlot).toBeLessThan(withSlot)
    expect(withSlot - withoutSlot).toBeCloseTo(23.5, 1)
  })
})

describe('错误文案自己的位置', () => {
  it('不盖住控件：用户正在改的那个值仍然看得见', () => {
    mount({ invalid: true })
    expect(overlap(part('error-text').getBoundingClientRect(), part('control').getBoundingClientRect())).toBe(0)
  })

  it('不越出字段的外框：定高又裁切的父级里整段都还在', () => {
    // 父级高度掐在字段常态的高度上——报错时字段一点也没长，消息因此仍在父级里
    const normal = boxHeight({})
    mount({ invalid: true, parentHeight: Math.round(normal) })
    const msg = part('error-text').getBoundingClientRect()
    expect(area(msg)).toBeGreaterThan(0)
    expect(overlap(msg, host!.getBoundingClientRect())).toBe(area(msg))
  })
})

describe('横排表单里同样不改变高度', () => {
  function horizontal(invalid: boolean): { height: number, columnStart: string } {
    host?.remove()
    host = document.createElement('div')
    host.style.cssText = 'width: 520px'
    document.body.append(host)
    host.innerHTML = `<div data-scope="form" data-part="root" data-layout="horizontal" style="--xh-form-label-w:120px">
      <div data-scope="field" data-part="root"${invalid ? ' data-invalid' : ''}>
        <label data-scope="field" data-part="label">邮箱</label>
        <div data-scope="field" data-part="control"></div>
        <p data-scope="field" data-part="error-text"${invalid ? '' : ' hidden'}>格式不对</p>
      </div></div>`
    return {
      height: part('root').getBoundingClientRect().height,
      columnStart: getComputedStyle(part('root'), '::after').gridColumnStart,
    }
  }

  it('报错前后等高，占位落在控件那一列', () => {
    const normal = horizontal(false)
    // 占位块自己另起一行的话，标签列会被它撑开，高度就对不上了
    expect(horizontal(true).height).toBe(normal.height)
    expect(normal.columnStart).toBe('2')
  })
})

describe('读屏那一路没动', () => {
  it('常态下错误文案仍由 hidden 收起，没有被改成占位用的可见空块', () => {
    mount({})
    const el = part('error-text')
    expect(el.hasAttribute('hidden')).toBe(true)
    expect(getComputedStyle(el).display).toBe('none')
  })

  it('报错时说明与错误文案两段都在控件的描述链上', () => {
    mount({ invalid: true, description: true })
    const described = (part('control').getAttribute('aria-describedby') ?? '').split(' ')
    expect(described).toContain(part('description').id)
    expect(described).toContain(part('error-text').id)
  })
})
