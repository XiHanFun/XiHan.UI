// 浏览器态的地基自检：证明 React 宿主在真实 Chromium 里挂得起来，且皮肤与令牌真的被加载进了文档。
// 断言全部取自级联算完的最终值——jsdom 不解析 var()/calc()，也不做布局，这几条在那边一条都给不出。
// 后面的皮肤、退场、定位、无障碍判据都以「样式在场」为前提，这一条不绿，那些判据的绿没有意义。
import { switchSuite } from '@xihan-ui/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { createReactHarness } from '../harness'
// 皮肤与令牌一起加载：只加载令牌采到的是浏览器默认样式，只加载皮肤取不到任何令牌值。
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const harness = createReactHarness()

afterEach(async () => {
  await harness.unmount()
})

describe('浏览器态地基', () => {
  it('switch 挂进真实浏览器：轨道的几何由令牌与皮肤算出来', async () => {
    const { root } = await harness.mount({ component: 'switch', props: {}, tree: switchSuite.fixture })
    await harness.flush()

    const track = root.querySelector<HTMLElement>('[data-scope="switch"][data-part="root"]')
    if (!track)
      throw new Error('switch 的 root 部件没渲出来')

    const style = getComputedStyle(track)

    // 皮肤在场的标记：switch.css 给整个 scope 灌的那个私有槽
    expect(style.getPropertyValue('--xh-switch-skin').trim()).toBe('1')

    // 内衬 = --xh-space-0_5。皮肤缺席时这里是 UA 给按钮的 1px，两者不同值，量到的不是浏览器默认值
    expect(style.paddingTop).toBe('2px')
    expect(style.paddingLeft).toBe('2px')

    // 圆角 = --xh-shape-pill → --xh-radius-full
    expect(style.borderTopLeftRadius).toBe('9999px')

    // 可见盒子：轨道高 = --xh-switch-track-h-md，轨道宽 = 两倍轨道高 − 两条内衬
    const rect = track.getBoundingClientRect()
    expect(rect.height).toBe(22)
    expect(rect.width).toBe(40)

    // 滑块边长 = 轨道高 − 两条内衬，行程因此正好等于自身边长
    const thumb = root.querySelector<HTMLElement>('[data-scope="switch"][data-part="thumb"]')
    if (!thumb)
      throw new Error('switch 的 thumb 部件没渲出来')
    const thumbRect = thumb.getBoundingClientRect()
    expect(thumbRect.height).toBe(18)
    expect(thumbRect.width).toBe(18)
  })
})
