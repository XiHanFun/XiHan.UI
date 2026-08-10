import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { highlightAnatomy, highlightKeyboard } from '@xihan-ui/headless'

// 出处：命中的片段用 <mark> 标出，语义由这个标签本身给出。
const HTML = 'https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-mark-element'

const MARK = '[data-scope="highlight"][data-part="mark"]'
const ROOT = '[data-scope="highlight"][data-part="root"]'

// 归一化快照只收属性，不收文本；命中切在哪儿只能直接读 DOM。
const WHY = '归一化快照不收文本，命中片段的边界只能直接读 DOM'

/** 逐个读出命中片段的文字，顺序即文档序。 */
function expectMarks(...expected: readonly string[]) {
  return ({ doc }: RawStepContext): void => {
    const got = [...doc.querySelectorAll(MARK)].map(el => el.textContent)
    if (JSON.stringify(got) !== JSON.stringify(expected))
      throw new Error(`命中片段是 ${JSON.stringify(got)}，期望 ${JSON.stringify(expected)}`)
  }
}

/** 核对整段文本原样拼得回来：切段不该多一个字也不该少一个字。 */
function expectWhole(expected: string) {
  return ({ doc }: RawStepContext): void => {
    const got = doc.querySelector(ROOT)?.textContent
    if (got !== expected)
      throw new Error(`整段文本是 ${JSON.stringify(got)}，期望 ${JSON.stringify(expected)}`)
  }
}

const TEXT = '曦寒 UI 组件库'

/** highlight 的一致性套件：锁「命中几段、切在哪儿、拼不拼得回原文」。 */
export const highlightSuite: ConformanceSuite = {
  component: 'highlight',
  anatomy: highlightAnatomy,
  keyboard: highlightKeyboard,
  fixture: { part: 'root', tag: 'span' },
  cases: [
    {
      name: '没给关键词：整段不切，一个 mark 都不生成',
      spec: { apg: HTML },
      props: { text: TEXT },
      initial: {
        order: ['root'],
        counts: { root: 1, mark: 0 },
        parts: { root: { 'role': null, 'data-case-sensitive': null } },
        activeElement: null,
        events: [],
      },
      steps: [{ kind: 'raw', why: WHY, run: expectWhole(TEXT) }],
    },
    {
      name: '命中一处：切出一个 mark，整段文本仍拼得回来',
      spec: { apg: HTML },
      props: { text: TEXT, keyword: '组件' },
      initial: {
        order: ['root', 'mark'],
        counts: { root: 1, mark: 1 },
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectMarks('组件') },
        { kind: 'raw', why: WHY, run: expectWhole(TEXT) },
      ],
    },
    {
      name: '一组关键词各自命中，按出现的先后排',
      spec: { apg: HTML },
      props: { text: TEXT, keyword: ['组件', '曦寒'] },
      initial: {
        order: ['root', 'mark[0]', 'mark[1]'],
        counts: { root: 1, mark: 2 },
      },
      steps: [{ kind: 'raw', why: WHY, run: expectMarks('曦寒', '组件') }],
    },
    {
      name: '空关键词丢掉：不把整段切成一串零长片段',
      spec: { apg: HTML },
      props: { text: TEXT, keyword: '' },
      initial: {
        order: ['root'],
        counts: { root: 1, mark: 0 },
      },
      steps: [{ kind: 'raw', why: WHY, run: expectWhole(TEXT) }],
    },
    {
      name: '关键词比文本长：一处都不命中，不越过文本末尾去比',
      spec: { apg: HTML },
      props: { text: 'UI', keyword: 'UI 组件库' },
      initial: {
        order: ['root'],
        counts: { root: 1, mark: 0 },
      },
      steps: [{ kind: 'raw', why: WHY, run: expectWhole('UI') }],
    },
    {
      name: '同一处多个关键词都命中：取最长的那个，重叠只切出一段',
      spec: { apg: HTML },
      props: { text: 'abcd', keyword: ['ab', 'bcd', 'abc'] },
      initial: {
        order: ['root', 'mark'],
        counts: { root: 1, mark: 1 },
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectMarks('abc') },
        { kind: 'raw', why: WHY, run: expectWhole('abcd') },
      ],
    },
    {
      name: '缺省不区分大小写：小写关键词命中大写写法',
      spec: { apg: HTML },
      props: { text: TEXT, keyword: 'ui' },
      initial: {
        counts: { root: 1, mark: 1 },
        parts: { root: { 'data-case-sensitive': null } },
      },
      steps: [{ kind: 'raw', why: WHY, run: expectMarks('UI') }],
    },
    {
      name: '开了区分大小写：写法不同就不算命中，开关落成 data-case-sensitive',
      spec: { apg: HTML },
      props: { text: TEXT, keyword: 'ui', caseSensitive: true },
      initial: {
        order: ['root'],
        counts: { root: 1, mark: 0 },
        parts: { root: { 'data-case-sensitive': '' } },
      },
      steps: [{ kind: 'raw', why: WHY, run: expectWhole(TEXT) }],
    },
  ],
}
