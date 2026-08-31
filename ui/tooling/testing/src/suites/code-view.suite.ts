import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { codeViewAnatomy, codeViewKeyboard } from '@xihan-ui/headless'

// 出处：可滚动内容须有键盘通路。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

const PRE = '[data-scope="code-view"][data-part="pre"]'

/** 逐个按键核对组件没有拦截，滚动按键全部交给浏览器。 */
function expectKeysNotSwallowed({ doc }: RawStepContext): void {
  const el = doc.querySelector<HTMLElement>(PRE)
  if (!el)
    throw new Error('找不到 code-view 的 pre 部件')
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'PageDown']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    el.dispatchEvent(event)
    if (event.defaultPrevented)
      throw new Error(`code-view 把 ${key} 吞掉了：键盘用户再也横滚不了溢出的代码`)
  }
}

/** 逐行结构由适配器铺，两侧都不由作者写；fixture 只声明作者那几件。 */
export const codeViewSuite: ConformanceSuite = {
  component: 'code-view',
  anatomy: codeViewAnatomy,
  keyboard: codeViewKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'header', children: [{ part: 'filename' }, { part: 'lang-label' }] },
      // 用 pre 与 code 保留代码里的空白与换行
      { part: 'pre', tag: 'pre', children: [{ part: 'code', tag: 'code' }] },
      { part: 'fold-trigger', tag: 'button' },
    ],
  },
  cases: [
    {
      name: '默认：语言落到 plaintext，pre 占一个 Tab 位并按行数撑高，语言角标对读屏隐藏',
      spec: { apg: WCAG },
      props: { code: 'a\nb\nc' },
      initial: {
        counts: { 'root': 1, 'header': 1, 'pre': 1, 'code': 1, 'line': 3, 'line-content': 3 },
        parts: {
          'root': {
            'data-lang': 'plaintext',
            // 未标闭合时 data-complete 属性缺席
            'data-complete': null,
            'data-digits': '1',
            // 没开行号
            'data-line-numbers': null,
          },
          // 语言角标是纯装饰，对读屏隐藏
          'lang-label': { 'aria-hidden': 'true' },
          'pre': {
            // 让键盘用户能聚焦并滚动溢出的代码
            'tabindex': '0',
            'data-complete': null,
          },
          'code': { 'data-lang': 'plaintext' },
          // 没开行号就不建那个节点
          'fold-trigger': { hidden: '' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '没开行号就不建行号节点，正文逐行铺开',
      spec: { apg: WCAG },
      props: { code: 'a\nb' },
      initial: {
        counts: { 'line': 2, 'line-number': 0, 'line-content': 2 },
        parts: {
          line: [{ 'data-line-number': '1' }, { 'data-line-number': '2' }],
        },
      },
    },
    {
      name: '开了行号：逐行一个行号槽，对读屏隐藏，行号从 startLine 起',
      spec: { apg: WCAG },
      props: { code: 'a\nb', lineNumbers: true, startLine: 7 },
      initial: {
        counts: { 'line': 2, 'line-number': 2 },
        parts: {
          'root': { 'data-line-numbers': '', 'data-digits': '1' },
          // 行号是画上去的：复制代码不带它，读屏也不逐行念数字
          'line-number': [
            { 'aria-hidden': 'true', 'data-line-number': '7' },
            { 'aria-hidden': 'true', 'data-line-number': '8' },
          ],
        },
      },
    },
    {
      name: '高亮行按行号点亮，不是按下标',
      spec: { apg: WCAG },
      props: { code: 'a\nb\nc', startLine: 10, highlightLines: '11' },
      initial: {
        parts: {
          line: [
            { 'data-highlighted': null },
            { 'data-highlighted': '' },
            { 'data-highlighted': null },
          ],
        },
      },
    },
    {
      name: '作者渲了文件名节点：pre 的可访问名指过去，不再另发 aria-label',
      spec: { apg: WCAG },
      props: { code: 'a', filename: 'main.ts' },
      initial: {
        parts: {
          pre: { 'aria-label': null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '要核对的是 aria-labelledby 与 filename 节点的 id 相等，两个值都由实例级 scope 派生，写不成固定期望',
          run: ({ doc }: RawStepContext) => {
            const pre = doc.querySelector<HTMLElement>(PRE)
            const filename = doc.querySelector<HTMLElement>('[data-scope="code-view"][data-part="filename"]')
            if (!pre || !filename)
              throw new Error('找不到 code-view 的 pre 或 filename 部件')
            const labelledby = pre.getAttribute('aria-labelledby')
            if (!labelledby || labelledby !== filename.id)
              throw new Error(`pre 的 aria-labelledby 应指向 filename 的 id，实际 ${labelledby} ≠ ${filename.id}`)
          },
        },
      ],
    },
    {
      name: '标出语言与闭合：data-lang 跟着走，data-complete 在 root 与 pre 上同时立起来',
      spec: { apg: WCAG },
      props: { code: 'a', lang: 'ts', complete: true },
      initial: {
        parts: {
          root: { 'data-lang': 'ts', 'data-complete': '' },
          pre: { 'tabindex': '0', 'data-complete': '' },
          code: { 'data-lang': 'ts' },
        },
      },
    },
    {
      name: '可折叠时按钮露出来，aria-expanded 与 aria-controls 成对',
      spec: { apg: WCAG },
      props: { code: 'a\nb\nc\nd', clamp: 2 },
      initial: {
        parts: {
          'root': { 'data-foldable': '', 'data-clamped': null },
          'fold-trigger': { 'hidden': null, 'aria-expanded': 'true', 'data-state': 'open' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'aria-controls 指向的 pre id 由实例级 scope 派生，写不成固定期望',
          run: ({ doc }: RawStepContext) => {
            const trigger = doc.querySelector<HTMLElement>('[data-scope="code-view"][data-part="fold-trigger"]')
            const pre = doc.querySelector<HTMLElement>(PRE)
            if (!trigger || !pre)
              throw new Error('找不到 code-view 的 fold-trigger 或 pre 部件')
            if (trigger.getAttribute('aria-controls') !== pre.id)
              throw new Error('fold-trigger 的 aria-controls 没指向 pre')
          },
        },
      ],
    },
    {
      name: '折叠是纯受控：点按钮只发意图，自己不落态',
      spec: { apg: WCAG },
      covers: ['code-view.kbd.fold'],
      props: { code: 'a\nb\nc\nd', clamp: 2 },
      steps: [
        {
          kind: 'click',
          part: 'fold-trigger',
          expect: {
            events: [{ type: 'clamp-toggle', detail: { clamped: true } }],
            parts: { 'root': { 'data-clamped': null }, 'fold-trigger': { 'aria-expanded': 'true' } },
          },
        },
      ],
    },
    {
      name: '宿主写回折叠态：按钮翻面，pre 的高度被夹到阈值行',
      spec: { apg: WCAG },
      props: { code: 'a\nb\nc\nd', clamp: 2, clamped: true },
      initial: {
        parts: {
          'root': { 'data-clamped': '' },
          'fold-trigger': { 'aria-expanded': 'false', 'data-state': 'closed' },
        },
      },
    },
    {
      name: 'pre 可聚焦且不吞任何按键：横滚交给浏览器',
      spec: { apg: WCAG },
      covers: ['code-view.kbd.pre-focus'],
      props: { code: 'a\nb' },
      steps: [
        { kind: 'focus', part: 'pre', expect: { activeElement: { part: 'pre', exact: true } } },
        {
          kind: 'raw',
          why: '要断言的是「没有 preventDefault」，只有拿到事件对象本身才看得见',
          run: expectKeysNotSwallowed,
        },
      ],
    },
  ],
}
