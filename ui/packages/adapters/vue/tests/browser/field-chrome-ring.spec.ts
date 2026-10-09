// 字段外壳聚焦不画环：焦点由描边换色与底色差标出，描边从控件边淡变到聚焦边。
// 强制色档里描边换色未必分得出来，同一选择器补回一圈 Highlight 环；外壳自己就是原生控件时
// （Field 的 control、分页跳页框）焦点直接落在外壳上，两档都要验。
// 过渡是否在播、强制色下的系统色只有真实浏览器看得见。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldControl,
  XhFieldRoot,
  XhPaginationJumper,
  XhPaginationRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
}

/** 颜色表达式在 scope 处的计算色；关掉强制着色，系统色关键字读出来才是它本身的值。 */
function resolveColor(expression: string, scope: Element): string {
  const probe = document.createElement('span')
  probe.style.cssText = `forced-color-adjust: none; color: ${expression}`
  scope.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('字段外壳聚焦', () => {
  it('键盘聚焦：不画环；描边从控件边淡变到聚焦边，底换承载面', async () => {
    await mount(() => h(XhTextFieldRoot, null, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput))))
    const control = host!.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='control']`)!
    const rest = resolveColor('var(--xh-border-control)', control)
    const focus = resolveColor('var(--xh-border-control-focus)', control)
    expect(focus).not.toBe(rest)

    await userEvent.tab()
    const transitions = control.getAnimations()
      .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
    const border = transitions.find(animation => animation.transitionProperty === 'border-top-color')
    expect(border, '描边换色在淡变').toBeDefined()
    expect(Number(border!.effect!.getTiming().duration)).toBeGreaterThan(0)
    // 起点是静息的控件边；终点读终值（关键帧按插值色空间序列化，与计算色写法不同）
    expect((border!.effect as KeyframeEffect).getKeyframes().at(0)?.borderTopColor).toBe(rest)

    await Promise.all(transitions.map(animation => animation.finished))
    const style = getComputedStyle(control)
    expect(style.borderTopColor).toBe(focus)
    expect(style.backgroundColor).toBe(resolveColor('var(--xh-bg-surface)', control))
    expect(style.outlineStyle).toBe('none')
  })
})

/** 外壳自己就是原生控件的两处：焦点直接落在外壳上，公共层那圈环也会找上它。 */
const NATIVE_SHELLS = {
  'Field 的 control': {
    render: () => h(XhFieldRoot, null, () => h(XhFieldControl, null, () => h('input'))),
    selector: `[data-scope='field'][data-part='control']`,
  },
  '分页跳页框': {
    render: () => h(XhPaginationRoot, { count: 196, defaultPageSize: 20 }, () => h(XhPaginationJumper)),
    selector: `[data-scope='pagination'][data-part='jumper']`,
  },
} as const

describe('原生控件即外壳的聚焦', () => {
  it.each(Object.keys(NATIVE_SHELLS) as Array<keyof typeof NATIVE_SHELLS>)('%s：常规档键盘聚焦不画环', async (name) => {
    const shell = NATIVE_SHELLS[name]
    await mount(shell.render)
    const control = host!.querySelector<HTMLElement>(shell.selector)!
    expect(control.hasAttribute('data-xh-field-chrome')).toBe(true)
    await userEvent.tab()
    expect(document.activeElement).toBe(control)
    expect(control.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(control).outlineStyle).toBe('none')
  })

  it.each(Object.keys(NATIVE_SHELLS) as Array<keyof typeof NATIVE_SHELLS>)('%s：强制色档键盘聚焦补一圈 Highlight 环', async (name) => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    const shell = NATIVE_SHELLS[name]
    await mount(shell.render)
    const control = host!.querySelector<HTMLElement>(shell.selector)!
    expect(getComputedStyle(control).outlineStyle).toBe('none')
    await userEvent.tab()
    expect(document.activeElement).toBe(control)
    const style = getComputedStyle(control)
    expect(style.outlineStyle).toBe('solid')
    expect(Number.parseFloat(style.outlineWidth)).toBe(tokenLength('--xh-ring-width', control.parentElement!))
    expect(style.outlineColor).toBe(resolveColor('Highlight', control.parentElement!))
  })
})
