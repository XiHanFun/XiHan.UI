import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { computeTextDiff, diffViewAnatomy, diffViewKeyboard } from '@xihan-ui/headless'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

/** 一行改一处：上下文、删、增、上下文，共四行。 */
const SMALL = computeTextDiff('a\nb\nc', 'a\nB\nc')

/** 中间隔着一长段没改的行，folding 才有东西可折。 */
const LONG_BEFORE = Array.from({ length: 24 }, (_, i) => `line ${i}`).join('\n')
const LONG = computeTextDiff(LONG_BEFORE, LONG_BEFORE.replace('line 1', 'X').replace('line 22', 'Y'), { contextLines: 12 })

/** 行由适配器按模型铺，两侧都不由作者写；fixture 只声明作者那几件。 */
export const diffViewSuite: ConformanceSuite = {
  component: 'diff-view',
  anatomy: diffViewAnatomy,
  keyboard: diffViewKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'header', text: 'src/a.ts' },
      { part: 'viewport', children: [{ part: 'body' }] },
      { part: 'empty', text: '没有变更' },
    ],
  },
  cases: [
    {
      name: '单栏：表格语义齐全，列数只数真正暴露的内容列——行号不算列',
      spec: { apg: WCAG },
      props: { model: SMALL },
      initial: {
        counts: { root: 1, viewport: 1, body: 1, row: 4 },
        parts: {
          'root': { 'data-view': 'unified' },
          // 唯一的 Tab 停靠点
          'viewport': { tabindex: '0' },
          'body': { 'role': 'table', 'aria-rowcount': '4', 'aria-colcount': '1', 'aria-label': 'Diff' },
          'row': [
            { 'role': 'row', 'aria-rowindex': '1', 'data-change': 'context' },
            { 'role': 'row', 'aria-rowindex': '2', 'data-change': 'removed' },
            { 'role': 'row', 'aria-rowindex': '3', 'data-change': 'added' },
            { 'role': 'row', 'aria-rowindex': '4', 'data-change': 'context' },
          ],
          // 行号不是内容列：不给 role、不给列号，对读屏隐藏
          'line-number': [{ 'role': null, 'aria-colindex': null, 'aria-hidden': 'true' }],
          'line-content': [{ 'role': 'cell', 'aria-colindex': '1' }],
          // 有变更时占位收起
          'empty': { hidden: '' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '并排：两列都发 cell，空的那一侧照发、否则列号会串位',
      spec: { apg: WCAG },
      props: { model: SMALL, view: 'split' },
      initial: {
        parts: {
          root: { 'data-view': 'split' },
          body: { 'aria-colcount': '2' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '要核对的是每一行都有两格、且删除行的新侧标了空，逐格断言在属性快照里排不下',
          run: ({ doc }: RawStepContext) => {
            const rows = [...doc.querySelectorAll<HTMLElement>('[data-scope="diff-view"][data-part="row"]')]
            for (const row of rows) {
              const cells = row.querySelectorAll('[data-part="line-content"]')
              if (cells.length !== 2)
                throw new Error(`并排视图每行应有两格，实际 ${cells.length}`)
            }
            const removed = rows.find(r => r.dataset.change === 'removed')
            const newSide = removed?.querySelector('[data-part="line-content"][data-side="new"]')
            if (!newSide?.hasAttribute('data-empty'))
              throw new Error('删除行的新侧应标成空格')
          },
        },
      ],
    },
    {
      name: '每一行都带一段视觉隐藏的变更类型文字：变更不能只靠颜色传达',
      spec: { apg: WCAG },
      props: { model: SMALL },
      steps: [
        {
          kind: 'raw',
          why: '要核对的是节点的文本内容，属性快照看不到',
          run: ({ doc }: RawStepContext) => {
            const labels = [...doc.querySelectorAll<HTMLElement>('[data-scope="diff-view"][data-part="change-label"]')]
            if (labels.length !== 4)
              throw new Error(`每行一段变更类型文字，应有 4 段，实际 ${labels.length}`)
            const texts = labels.map(el => el.textContent)
            if (!texts.includes('Removed') || !texts.includes('Added'))
              throw new Error(`变更类型文字不对：${texts.join('/')}`)
          },
        },
      ],
    },
    {
      name: '一条变更都没有：不铺任何行，占位露出来',
      spec: { apg: WCAG },
      props: { model: { hunks: [] } },
      initial: {
        counts: { row: 0 },
        parts: { body: { 'aria-rowcount': '0' }, empty: { hidden: null } },
      },
    },
    {
      name: '折叠：远离变更的连续上下文折成一格，行号与行序按折叠后的可见行算',
      spec: { apg: WCAG },
      props: { model: LONG, contextLines: 3 },
      initial: {
        counts: { gap: 1 },
        parts: {
          'gap': { 'role': 'row', 'data-expanded': null },
          'gap-cell': { 'role': 'cell', 'aria-colindex': '1' },
          'gap-trigger': { 'type': 'button', 'aria-expanded': 'false' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '要核对的是「行序连续、且与 aria-rowcount 同一口径」，逐行断言在属性快照里排不下',
          run: ({ doc }: RawStepContext) => {
            const body = doc.querySelector<HTMLElement>('[data-scope="diff-view"][data-part="body"]')
            const rows = [...doc.querySelectorAll<HTMLElement>('[data-scope="diff-view"][data-part="row"], [data-scope="diff-view"][data-part="gap"]')]
            if (body?.getAttribute('aria-rowcount') !== String(rows.length))
              throw new Error(`行数应与可见行序同口径：报 ${body?.getAttribute('aria-rowcount')}，实际 ${rows.length}`)
            const indexed = rows.filter(r => r.hasAttribute('aria-rowindex'))
            indexed.forEach((row, i) => {
              const want = String(rows.indexOf(row) + 1)
              if (row.getAttribute('aria-rowindex') !== want)
                throw new Error(`第 ${i} 行的行序应是 ${want}，实际 ${row.getAttribute('aria-rowindex')}`)
            })
          },
        },
      ],
    },
    {
      name: '展开那一格：折起来的行铺出来，按钮翻面',
      spec: { apg: WCAG },
      covers: ['diff-view.kbd.expand-gap'],
      props: { model: LONG, contextLines: 3 },
      steps: [
        {
          kind: 'click',
          part: 'gap-trigger',
          expect: {
            counts: { gap: 0 },
            events: [{ type: 'expanded-value-change' }],
          },
        },
      ],
    },
    {
      name: '滚动容器可聚焦且不吞任何按键：横纵滚动交给浏览器',
      spec: { apg: WCAG },
      covers: ['diff-view.kbd.viewport-focus'],
      props: { model: SMALL },
      steps: [
        { kind: 'focus', part: 'viewport', expect: { activeElement: { part: 'viewport', exact: true } } },
        {
          kind: 'raw',
          why: '要断言的是「没有 preventDefault」，只有拿到事件对象本身才看得见',
          run: ({ doc }: RawStepContext) => {
            const el = doc.querySelector<HTMLElement>('[data-scope="diff-view"][data-part="viewport"]')
            if (!el)
              throw new Error('找不到 diff-view 的 viewport 部件')
            for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageDown']) {
              const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
              el.dispatchEvent(event)
              if (event.defaultPrevented)
                throw new Error(`diff-view 把 ${key} 吞掉了：键盘用户再也滚不动差异了`)
            }
          },
        },
      ],
    },
  ],
}
