// @vitest-environment jsdom
//
// 同一份 fixture 在 Vue 与 React 里渲出来的标签名逐个部件比对。
//
// runParity 比不到这一层：DomSnapshot 只记 data-part、属性、文档序、焦点与事件，不记标签名。
// 两家都是「组件自己渲染部件」的模型，标签名是这一层自己定的，选错既不改属性也不改顺序——
// 逐帧对拍全绿，而 <span> 写成 <div> 会让内联部件变成块级、原生语义（<button> / <label> /
// <input>）写错则读屏与表单行为整个不同。WC 那一侧的部件标签由作者手写，不在此列。
import type { ConformanceSuite } from '../src'
import { describe, expect, it } from 'vitest'
import { createReactHarness } from '../../../packages/adapters/react/tests/harness'
import { createVueHarness } from '../../../packages/adapters/vue/tests/harness'
import { dialogSuite, switchSuite } from '../src'

/** 部件名 → 标签名，同名部件多份时按文档序排成数组。 */
function tagsByPart(root: HTMLElement): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const node of root.querySelectorAll<HTMLElement>('[data-part]')) {
    const part = node.dataset.part!
    ;(out[part] ??= []).push(node.tagName.toLowerCase())
  }
  return out
}

const SUITES: ConformanceSuite[] = [dialogSuite, switchSuite]

describe('标签名对拍（vue vs react）', () => {
  for (const suite of SUITES) {
    it(`${suite.component}：每个部件两边是同一个标签`, async () => {
      const fixture = { component: suite.component, props: {}, tree: suite.fixture }
      const vue = createVueHarness()
      const react = createReactHarness()
      try {
        const { root: vueRoot } = await vue.mount(fixture)
        const { root: reactRoot } = await react.mount(fixture)
        expect(tagsByPart(reactRoot)).toEqual(tagsByPart(vueRoot))
      }
      finally {
        await vue.unmount()
        await react.unmount()
      }
    })
  }
})
