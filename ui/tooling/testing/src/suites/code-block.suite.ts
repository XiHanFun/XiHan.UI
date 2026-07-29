import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { codeBlockAnatomy, codeBlockKeyboard } from '@xihan-ui/headless'

// 代码块没有对应的 APG 模式：它不是控件，只是一块会横向溢出的静态内容。
// 能核对的规格是"内容滚得动就得有键盘通路"这条 WCAG 技术。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

const PRE = '[data-scope="code-block"][data-part="pre"]'

/**
 * 这块内容一个按键都不该被组件吃掉：`pre` 只提供落脚点，方向键的横向滚动、
 * Home/End 的行首行尾全归浏览器。谁哪天在 `pre` 上挂了 keydown 并 preventDefault，
 * 这里当场变红——横滚是键盘用户看到溢出代码的唯一路径，吞掉就等于看不见。
 */
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
 * 代码块没有状态机：语言、行数、闭合与否全由调用方逐帧递进来，用例守的就是
 * 这三样各自落成什么属性。
 *
 * 两侧的部件来源不同——Vue 版由组件自己渲染 root/lang-label/pre/code，压根不吃这棵
 * fixture 的子节点；WC 版要作者手写。但两边产出的 part 集合与文档序一致，故共用同一份。
 */
export const codeBlockSuite: ConformanceSuite = {
  component: 'code-block',
  anatomy: codeBlockAnatomy,
  keyboard: codeBlockKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'lang-label' },
      // <pre> / <code> 是硬要求：代码里的空白与换行只有它们会原样保留
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
            // 半截、空白、不认识的语言标注一律落到这里，下游拿到的永远是个非空串
            'data-lang': 'plaintext',
            // 没说闭合就是没闭合：属性缺席，皮肤据此显示还在吐字
            'data-complete': null,
          },
          // 语言名在代码里、在 data-lang 上都有，读屏再念一遍只是噪音
          'lang-label': { 'aria-hidden': 'true' },
          'pre': {
            // 溢出的代码只有指针够得着滚动条，键盘用户得先落得进来
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
          // 按键既没被吃掉，也不该把焦点挪走
          expect: { activeElement: { part: 'pre', exact: true }, events: [] },
        },
      ],
    },
  ],
}
