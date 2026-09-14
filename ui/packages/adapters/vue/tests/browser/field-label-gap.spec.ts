// 竖排字段里标签与控件之间那一段距离由 --xh-field-label-gap-block 单独管，
// 描述与错误文案那两段仍归 --xh-field-gap。横排（标签左置）下这段补白清零，
// 那一档的间距是列间距，归 --xh-field-label-gap。
// 判据是级联算出来的几何：距离由容器 gap 与标签补白合成，只有真排一遍版才量得出来。
import type { FormLayout } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤算出来的取值
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

/** 挂一棵树，cssText 落在宿主上，槽由它往下继承。 */
function mount(render: () => unknown, cssText = ''): void {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = cssText
  document.body.append(host)
  app = createApp({ setup: () => () => render() as never })
  app.mount(host)
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="field"][data-part="${name}"]`)
  if (!el)
    throw new Error(`没有 field 的 ${name} 部件`)
  return el
}

/** 标签底缘到控件顶缘的距离。 */
function labelToControl(): number {
  return Math.round(part('control').getBoundingClientRect().top - part('label').getBoundingClientRect().bottom)
}

/** 控件底缘到说明文字顶缘的距离，用来对照「其余几段没被动过」。 */
function controlToDescription(): number {
  return Math.round(part('description').getBoundingClientRect().top - part('control').getBoundingClientRect().bottom)
}

function field(): unknown {
  return h(XhFieldRoot, null, () => [
    h(XhFieldLabel, null, () => '用户名'),
    h(XhFieldControl, null, () => h('input')),
    h(XhFieldDescription, null, () => '字母开头'),
  ])
}

function inForm(layout: FormLayout): unknown {
  return h(
    XhFormRoot,
    { layout, labelWidth: 96 },
    () => h(XhFormFieldGroup, { name: 'username' }, () => field()),
  )
}

describe('竖排字段的标签间距', () => {
  it('不设新槽时与字段内其余几段同宽', () => {
    mount(field)
    expect(labelToControl()).toBe(controlToDescription())
  })

  it('设了新槽只动标签那一段', () => {
    mount(field, '--xh-field-label-gap-block: 16px')
    expect(labelToControl()).toBe(16)
    expect(controlToDescription()).toBe(4)
  })

  it('表单竖排与横排一行流两档都跟着走', () => {
    for (const layout of ['vertical', 'inline'] as const) {
      mount(() => inForm(layout), '--xh-field-label-gap-block: 16px')
      expect(labelToControl(), layout).toBe(16)
    }
  })

  it('标签左置那一档不受它影响', () => {
    mount(() => inForm('horizontal'))
    const bareGap = Math.round(part('control').getBoundingClientRect().left - part('label').getBoundingClientRect().right)
    const bareHeight = Math.round(part('root').getBoundingClientRect().height)

    mount(() => inForm('horizontal'), '--xh-field-label-gap-block: 16px')
    const gap = Math.round(part('control').getBoundingClientRect().left - part('label').getBoundingClientRect().right)
    expect(gap).toBe(bareGap)
    expect(Math.round(part('root').getBoundingClientRect().height)).toBe(bareHeight)
  })
})
