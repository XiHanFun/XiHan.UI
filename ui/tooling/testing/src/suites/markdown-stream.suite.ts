import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { markdownStreamAnatomy, markdownStreamKeyboard } from '@xihan-ui/headless'

// 出处：正文不是控件，不接管按键；这里守的是「别把可滚动内容的按键吞掉」那条通则。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

const CONTENT = '[data-scope="markdown-stream"][data-part="content"]'

/** 一段写完的正文：两个定型块。 */
const SETTLED = [
  { key: '0:a', kind: 'markdown', html: '<p>先说结论。</p>', complete: true },
  { key: '1:b', kind: 'code', html: '<pre><code>x</code></pre>', complete: true, lang: 'ts', source: 'const x = 1' },
]

/** 还在长的正文：末块是生长块。 */
const GROWING = [
  { key: '0:a', kind: 'markdown', html: '<p>先说结论。</p>', complete: true },
  { key: 'live', kind: 'markdown', html: '<p>还在写</p>', complete: false },
]

/** 块由适配器按数据铺，两侧都不由作者写；fixture 只声明作者那几件。 */
export const markdownStreamSuite: ConformanceSuite = {
  component: 'markdown-stream',
  anatomy: markdownStreamAnatomy,
  keyboard: markdownStreamKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'content' },
      { part: 'live-region' },
    ],
  },
  cases: [
    {
      name: '默认：不流式、不播报，块按数据铺开',
      spec: { apg: WCAG },
      props: { blocks: SETTLED },
      initial: {
        counts: { root: 1, content: 1, block: 2 },
        parts: {
          'root': { 'data-state': 'complete' },
          // 播报区永远带 role 与档位，念不念由内容决定
          'live-region': { 'role': 'status', 'aria-live': 'polite', 'aria-atomic': 'true' },
          'block': [
            { 'data-kind': 'markdown', 'data-complete': '', 'data-live': null },
            { 'data-kind': 'code', 'data-complete': '', 'data-live': null, 'data-lang': 'ts' },
          ],
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '正文还在长：root 落流式相位，生长那一块带 data-live',
      spec: { apg: WCAG },
      props: { blocks: GROWING, streaming: true },
      initial: {
        parts: {
          root: { 'data-state': 'streaming' },
          // 流式光标就挂在这一格上
          block: [
            { 'data-live': null, 'data-complete': '' },
            { 'data-live': '', 'data-complete': null },
          ],
        },
      },
    },
    {
      name: 'markdown 块铺已消毒的 html，代码块只铺原文——照 html 渲会与交给代码组件的那份重复',
      spec: { apg: WCAG },
      props: { blocks: SETTLED },
      steps: [
        {
          kind: 'raw',
          why: '要核对的是块节点的内容本身，属性快照看不到它',
          run: ({ doc }: RawStepContext) => {
            const blocks = [...doc.querySelectorAll<HTMLElement>('[data-scope="markdown-stream"][data-part="block"]')]
            if (blocks.length !== 2)
              throw new Error(`应铺出 2 个块，实际 ${blocks.length}`)
            if (blocks[0]!.querySelector('p') === null)
              throw new Error('markdown 块应铺出已消毒的 html')
            if (blocks[1]!.querySelector('pre') !== null)
              throw new Error('代码块不该照 html 渲：会与交给代码组件的那份重复')
            if (blocks[1]!.textContent !== 'const x = 1')
              throw new Error(`代码块没人接管时应把原文当正文显示，实际 ${blocks[1]!.textContent}`)
          },
        },
      ],
    },
    {
      name: '开了播报：写完那一刻念一句，还在写的时候不念',
      spec: { apg: WCAG },
      props: { blocks: GROWING, streaming: true, announce: 'polite' },
      steps: [
        {
          kind: 'raw',
          why: '播报文本是节点内容不是属性，属性快照看不到',
          run: ({ doc }: RawStepContext) => {
            const live = doc.querySelector<HTMLElement>('[data-scope="markdown-stream"][data-part="live-region"]')
            if (!live)
              throw new Error('找不到 markdown-stream 的 live-region 部件')
            if (live.textContent?.trim() !== '')
              throw new Error(`还在写的时候不该播报，实际念了「${live.textContent}」`)
          },
        },
        {
          kind: 'setProps',
          props: { blocks: SETTLED, streaming: false, announce: 'polite' },
          expect: { parts: { root: { 'data-state': 'complete' } } },
        },
        {
          kind: 'raw',
          why: '同上，播报文本是节点内容',
          run: ({ doc }: RawStepContext) => {
            const live = doc.querySelector<HTMLElement>('[data-scope="markdown-stream"][data-part="live-region"]')
            if (live?.textContent !== 'Response complete')
              throw new Error(`写完应念一句，实际念了「${live?.textContent}」`)
          },
        },
      ],
    },
    {
      name: '块列表换了：key 没变的块原地留着，只有内容跟着走',
      spec: { apg: WCAG },
      props: { blocks: GROWING, streaming: true },
      steps: [
        {
          kind: 'raw',
          why: '要核对的是「同一个 DOM 节点」而不是「同样的属性」，快照比不出节点身份',
          run: async ({ doc, flush }: RawStepContext) => {
            const first = doc.querySelector<HTMLElement>(`${CONTENT} > *`)
            if (!first)
              throw new Error('找不到第一个块节点')
            first.dataset.probe = '1'
            await flush()
            const still = doc.querySelector<HTMLElement>(`${CONTENT} > *`)
            if (still?.dataset.probe !== '1')
              throw new Error('定型块被重建了：稳定 key 的意义就是别重建，重建会把选区与滚动位置弄没')
          },
        },
      ],
    },
    {
      name: '组件不接管任何按键',
      spec: { apg: WCAG },
      covers: ['markdown-stream.kbd.none'],
      props: { blocks: SETTLED },
      steps: [
        {
          kind: 'raw',
          why: '要断言的是「没有 preventDefault」，只有拿到事件对象本身才看得见',
          run: ({ doc }: RawStepContext) => {
            const el = doc.querySelector<HTMLElement>(CONTENT)
            if (!el)
              throw new Error('找不到 markdown-stream 的 content 部件')
            for (const key of ['ArrowDown', 'PageDown', 'Home', 'Enter']) {
              const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
              el.dispatchEvent(event)
              if (event.defaultPrevented)
                throw new Error(`markdown-stream 把 ${key} 吞掉了`)
            }
          },
        },
      ],
    },
  ],
}
