// 步骤条推进：连接线沿行向从这一步填到下一步（rtl 翻转、回退时反向收回），标题换色走淡变，
// 走过那一步的对号淡入；首帧就走过的直接呈现。过渡与动画在不在跑只有真实浏览器量得出来。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function frames(count = 1): Promise<void> {
  await nextTick()
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

function mount(initial: number, dir: 'ltr' | 'rtl' = 'ltr'): Ref<number> {
  const value = ref(initial)
  host = document.createElement('div')
  host.dir = dir
  host.style.inlineSize = '640px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhStepsRoot, { 'count': 3, 'value': value.value, 'onUpdate:value': (next: number) => (value.value = next) }, () =>
      h(XhStepsList, null, () => [0, 1, 2].map(index => h(XhStepsItem, { key: index, value: index }, () => [
        h(XhStepsTrigger, null, () => [
          h(XhStepsIndicator, null, () => (value.value > index ? '' : String(index + 1))),
          h(XhStepsTitle, null, () => `步骤 ${index + 1}`),
        ]),
        index < 2 ? h(XhStepsSeparator) : null,
      ])))),
  })
  app.mount(host)
  return value
}

function parts(name: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='steps'][data-part='${name}']`)]
}

/** 节点连同伪元素上正在跑的 CSS 过渡属性名与动画名。 */
function running(el: Element, pseudo?: string): string[] {
  return el.getAnimations({ subtree: true })
    .filter(a => (a.effect as KeyframeEffect | null)?.target === el && ((a.effect as KeyframeEffect).pseudoElement ?? undefined) === pseudo)
    .map(a => (a instanceof CSSTransition ? a.transitionProperty : (a as CSSAnimation).animationName))
}

/** 点亮层 clip-path: inset(…) 的上右下左四边，零值统一记作 '0'。 */
function insetOf(separator: Element): string[] {
  const sides = getComputedStyle(separator, '::after').clipPath.match(/inset\(([^)]*)\)/)?.[1] ?? ''
  return sides.split(' ').map(side => (Number.parseFloat(side) === 0 ? '0' : side))
}

describe('steps 推进', () => {
  it('连接线沿行向填充：没走过时把行尾那一侧整段裁掉，rtl 下裁的是左侧', async () => {
    mount(0)
    await frames(1)
    expect(insetOf(parts('separator')[0]!)).toEqual(['0', '100%', '0', '0'])
    app!.unmount()
    host!.remove()
    mount(0, 'rtl')
    await frames(1)
    expect(insetOf(parts('separator')[0]!)).toEqual(['0', '0', '0', '100%'])
  })

  it('走到下一步：连接线的填充走过渡，标题换色淡变，走过那一步的对号淡入', async () => {
    const value = mount(0)
    await frames(2)
    value.value = 1
    await frames(1)
    expect(running(parts('separator')[0]!, '::after'), '连接线填充').toContain('clip-path')
    // 走到的那一步标题由次要色换成强调色；走过的那一步与当前步同色，不换
    expect(running(parts('title')[1]!), '标题换色').toContain('color')
    expect(running(parts('indicator')[0]!, '::before'), '对号淡入').toContain('xh-fade-in')
  })

  it('首帧就走过的步直接呈现：对号不淡入', async () => {
    mount(2)
    await frames(1)
    for (const indicator of parts('indicator').slice(0, 2))
      expect(running(indicator, '::before')).toEqual([])
  })

  it('回退：连接线的填充反向收回', async () => {
    const value = mount(1)
    await frames(2)
    value.value = 0
    await frames(1)
    expect(running(parts('separator')[0]!, '::after')).toContain('clip-path')
    await Promise.all(parts('separator')[0]!.getAnimations({ subtree: true }).map(a => a.finished.catch(() => undefined)))
    expect(insetOf(parts('separator')[0]!)).toEqual(['0', '100%', '0', '0'])
  })
})
