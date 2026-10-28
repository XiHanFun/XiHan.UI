// 语气边界：有语气轴的组件没写 tone 时用自己的缺省语气，不接外层容器的。
// 语气槽声明在 [data-tone] 上、靠继承流到部件，这条继承曾经越过组件边界：没写 tone 的按钮放进 danger 的
// Alert 被染成 danger，没写 tone 的 Tooltip 从 danger 容器里打开也被视觉桥带成 danger。
// 组给子组件的语气由连接层显式写到子组件上（ButtonGroup 的段），没有语气轴的组件夹在组与条目之间不挡继承。
// 颜色要经完整级联才算得出来，只在真实浏览器里量。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAlertRoot,
  XhButton,
  XhButtonGroup,
  XhCheckbox,
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupRoot,
  XhFlex,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function mount(render: () => VNode | VNode[]): Promise<void> {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function byTestId(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!el)
    throw new Error(`缺少节点：${id}`)
  return el
}

function background(id: string, pseudo?: string): string {
  return getComputedStyle(byTestId(id), pseudo).backgroundColor
}

function danger(children: () => VNode[]): VNode {
  return h('div', { 'data-tone': 'danger' }, children())
}

describe('语气边界', () => {
  it('没写 tone 的按钮与复选框不接外层容器的语气，与独立摆放时同色', async () => {
    await mount(() => [
      h(XhButton, { 'data-testid': 'button-alone' }, () => '独立'),
      h(XhButton, { 'data-testid': 'button-danger', 'tone': 'danger' }, () => '写了 danger'),
      danger(() => [h(XhButton, { 'data-testid': 'button-in-div' }, () => '容器里')]),
      h(XhAlertRoot, { tone: 'danger' }, () => [h(XhButton, { 'data-testid': 'button-in-alert' }, () => 'Alert 里')]),
      h(XhCheckbox, { 'data-testid': 'checkbox-alone', 'defaultChecked': true, 'ariaLabel': '独立' }),
      danger(() => [h(XhCheckbox, { 'data-testid': 'checkbox-in-div', 'defaultChecked': true, 'ariaLabel': '容器里' })]),
    ])
    expect(background('button-alone')).not.toBe(background('button-danger'))
    expect(background('button-in-div')).toBe(background('button-alone'))
    expect(background('button-in-alert')).toBe(background('button-alone'))
    expect(background('checkbox-in-div')).toBe(background('checkbox-alone'))
  })

  it('自己写了 tone 的照旧用自己的，外层容器压不过', async () => {
    await mount(() => [
      h(XhButton, { 'data-testid': 'success-alone', 'tone': 'success' }, () => '独立'),
      danger(() => [h(XhButton, { 'data-testid': 'success-in-div', 'tone': 'success' }, () => '容器里')]),
    ])
    expect(background('success-in-div')).toBe(background('success-alone'))
  })

  it('组显式下发的语气照旧到段上：没写 tone 的段随组', async () => {
    await mount(() => [
      h(XhButton, { 'data-testid': 'danger-alone', 'tone': 'danger' }, () => '独立'),
      h(XhButtonGroup, { 'tone': 'danger', 'variant': 'solid', 'aria-label': '组' }, () => [
        h(XhButton, { 'data-testid': 'segment' }, () => '段'),
      ]),
    ])
    expect(byTestId('segment').getAttribute('data-tone')).toBe('danger')
    expect(background('segment')).toBe(background('danger-alone'))
  })

  it('没有语气轴的组件夹在组与条目之间不挡继承', async () => {
    const group = (wrapped: boolean): VNode => h(XhCheckboxGroupRoot, { 'tone': 'danger', 'defaultValue': ['a'], 'aria-label': '组' }, () => {
      const item = h(XhCheckboxGroupItem, { value: 'a' }, () => [
        h(XhCheckboxGroupIndicator, { 'data-testid': wrapped ? 'indicator-wrapped' : 'indicator-direct' }),
        '甲',
      ])
      return [wrapped ? h(XhFlex, null, () => [item]) : item]
    })
    await mount(() => [group(false), group(true)])
    expect(byTestId('indicator-wrapped').closest('[data-scope="flex"][data-part="root"]')).not.toBeNull()
    expect(background('indicator-wrapped')).toBe(background('indicator-direct'))
  })

  it('浮层不带语气：没写 tone 的 Tooltip 从 danger 容器里打开，仍是缺省的浮层面', async () => {
    const tooltip = (id: string, tone?: 'danger'): VNode => h(XhTooltipRoot, { open: true, tone }, () => [
      h(XhTooltipTrigger, null, () => '触发'),
      h(XhTooltipPositioner, null, () => [h(XhTooltipContent, { 'data-testid': id }, () => '提示')]),
    ])
    await mount(() => [
      tooltip('tooltip-alone'),
      tooltip('tooltip-danger', 'danger'),
      danger(() => [tooltip('tooltip-in-div')]),
    ])
    const shell = byTestId('tooltip-in-div').closest<HTMLElement>('[data-xh-portal-shell]')
    expect(shell).not.toBeNull()
    expect(shell!.hasAttribute('data-tone')).toBe(false)
    expect(background('tooltip-alone', '::before')).not.toBe(background('tooltip-danger', '::before'))
    expect(background('tooltip-in-div', '::before')).toBe(background('tooltip-alone', '::before'))
  })
})
