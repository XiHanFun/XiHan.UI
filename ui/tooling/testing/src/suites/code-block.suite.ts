import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { codeBlockAnatomy, codeBlockKeyboard } from '@xihan-ui/headless'

// 代码块不是控件而是可横向溢出的静态内容，出处指向「可滚动内容须有键盘通路」这条 WCAG 技术。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

const PRE = '[data-scope="code-block"][data-part="pre"]'

/** 逐个按键核对组件没有拦截：`pre` 只提供落脚点，滚动按键全部交给浏览器。 */
function expectKeysNotSwallowed({ doc }: RawStepContext): void {
  const el = doc.querySelector<HTMLElement>(PRE)
  if (!el)
    throw new Error('找不到 code-block 的 pre 部件')
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'PageDown']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    el.dispatchEvent(event)
    if (event.defaultPrevented)
      throw new Error(`code-block 把 ${key} 吞掉了：键盘用户再也横滚不了溢出的代码`)
  }
}

/**
 * code-block 的一致性套件：核对语言、行数与闭合标记各自落成什么属性。
 * Vue 版自行渲染四个部件，WC 版由作者手写，两边的 part 集合与文档序一致，故共用同一份 fixture。
 */
export const codeBlockSuite: ConformanceSuite = {
  component: 'code-block',
  anatomy: codeBlockAnatomy,
  keyboard: codeBlockKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'lang-label' },
      // 用 pre 与 code 保留代码里的空白与换行
      { part: 'pre', tag: 'pre', children: [{ part: 'code', tag: 'code', text: 'const a = 1' }] },
    ],
  },
  cases: [
    {
      name: '默认：语言落到 plaintext，pre 占一个 Tab 位，语言角标对读屏隐藏',
      spec: { apg: WCAG },
      props: { code: 'const a = 1' },
      initial: {
        order: ['root', 'lang-label', 'pre', 'code'],
        counts: { 'root': 1, 'lang-label': 1, 'pre': 1, 'code': 1 },
        parts: {
          'root': {
            // 空白或缺席的语言标注落到 plaintext
            'data-lang': 'plaintext',
            // 未标闭合时 data-complete 属性缺席
            'data-complete': null,
          },
          // 语言角标是纯装饰，对读屏隐藏
          'lang-label': { 'aria-hidden': 'true' },
          'pre': {
            // 让键盘用户能聚焦并滚动溢出的代码
            'tabindex': '0',
            'data-complete': null,
          },
          'code': { 'data-lang': 'plaintext' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '给了语言与闭合标记：data-lang 跟着走，data-complete 在 root 与 pre 上同时立起来',
      spec: { apg: WCAG },
      props: { code: 'const a = 1', lang: 'ts', complete: true },
      initial: {
        parts: {
          root: { 'data-lang': 'ts', 'data-complete': '' },
          pre: { 'tabindex': '0', 'data-complete': '' },
          code: { 'data-lang': 'ts' },
        },
      },
    },
    {
      name: 'pre 可聚焦且不吞任何按键：横滚交给浏览器',
      spec: { apg: WCAG },
      covers: ['code-block.kbd.pre-focus'],
      props: { code: 'const a = 1' },
      steps: [
        {
          kind: 'focus',
          part: 'pre',
          expect: { activeElement: { part: 'pre', exact: true }, events: [] },
        },
        {
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象',
          run: expectKeysNotSwallowed,
          // 按键未被拦截，焦点也未被挪走
          expect: { activeElement: { part: 'pre', exact: true }, events: [] },
        },
      ],
    },
  ],
}
