import type { StepWithExpect } from '../../conformance/types'

/**
 * 「禁用后点不动」这条断言不能靠 `click` 步骤：它走的是 `el.click()`，
 * 而 jsdom 与浏览器对禁用的表单控件都会在激活行为里直接短路——事件压根不派发。
 * 于是无论 connect 里有没有那道禁用守卫，用例都恒绿：删掉守卫照样全过。
 *
 * 改为直接 dispatchEvent：程序化派发不走激活行为的短路，监听器真会跑到，
 * 守卫这才被验到。这同时也是真实存在的一路——作者可能把 props 摊到非按钮节点上
 * （那时原生 disabled 根本不生效），或者代码里直接派发合成事件。
 */
export function dispatchClickOnDisabled(scope: string, part: string, expect: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '禁用控件上 el.click() 会被激活行为短路、事件不派发，断言恒成立；必须直接派发才验得到守卫',
    run: ({ doc }) => {
      const el = doc.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
      if (!el)
        throw new Error(`找不到 ${scope} 的 ${part} 部件`)
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    },
    expect,
  }
}
