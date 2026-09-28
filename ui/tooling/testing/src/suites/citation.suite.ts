import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { citationAnatomy, citationKeyboard } from '@xihan-ui/headless'
import { nativeActivation, singleTabStop } from './shared/native-activation'

const DISCLOSURE = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'
const LISTBOX = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'

const sources = [
  {
    type: 'source-url',
    sourceId: 'web',
    title: 'Web source',
    url: 'https://example.com/article',
    anchors: [{ sourceId: 'web', quote: 'Quoted sentence.' }],
  },
  { type: 'source-document', sourceId: 'doc', title: 'Document', mediaType: 'application/pdf' },
]

function preview(sourceId: string): FixtureNode {
  return {
    part: 'preview',
    tag: 'section',
    attrs: { value: sourceId, sourceId },
    children: [
      {
        part: 'preview-header',
        tag: 'header',
        only: ['wc'],
        children: [
          {
            tag: 'span',
            children: [
              { part: 'preview-title', tag: 'strong', text: sourceId === 'web' ? 'Web source' : 'Document' },
              { part: 'preview-meta', tag: 'span', text: sourceId === 'web' ? 'example.com' : 'application/pdf' },
            ],
          },
          { part: 'prev-trigger', tag: 'button' },
          { part: 'preview-index', tag: 'span' },
          { part: 'next-trigger', tag: 'button' },
          { part: 'dismiss-trigger', tag: 'button' },
        ],
      },
      { part: 'quote', tag: 'blockquote', text: 'Quoted sentence.', only: ['wc'] },
      { part: 'preview-link', tag: sourceId === 'web' ? 'a' : 'button', text: 'Open', only: ['wc'] },
    ],
  }
}

function source(sourceId: string, title: string, index: string): FixtureNode {
  return {
    part: 'source',
    tag: 'li',
    attrs: { value: sourceId },
    only: ['wc'],
    children: [
      {
        part: 'source-link',
        tag: 'button',
        children: [
          { part: 'source-index', tag: 'span', text: index },
          {
            tag: 'span',
            children: [
              { part: 'source-title', tag: 'span', text: title },
              { part: 'source-meta', tag: 'span', text: sourceId === 'web' ? 'example.com' : 'application/pdf' },
            ],
          },
        ],
      },
    ],
  }
}

export const citationSuite: ConformanceSuite = {
  component: 'citation',
  anatomy: citationAnatomy,
  keyboard: citationKeyboard,
  defaultProps: { sources },
  fixture: {
    part: 'root',
    children: [
      {
        part: 'text',
        tag: 'p',
        children: [
          { tag: 'span', text: 'Statement' },
          { part: 'trigger', tag: 'button', attrs: { 'sourceId': 'web', 'citationId': 'first', 'value': 'web', 'name': 'first', 'data-anchor-index': '0' }, text: '1' },
          // 一处引了两个来源：Vue / React 写 sourceIds，Web Components 在 value 里写成空白分隔的两个
          { part: 'trigger', tag: 'button', attrs: { sourceIds: ['web', 'doc'], citationId: 'both', value: 'web doc', name: 'both' }, text: '1, 2' },
        ],
      },
      preview('web'),
      preview('doc'),
      {
        part: 'list',
        tag: 'ol',
        children: [source('web', 'Web source', '1'), source('doc', 'Document', '2')],
      },
    ],
  },
  cases: [
    {
      name: '初始：行内引用与预览建立关系，来源列表是带 roving 按钮的语义列表',
      spec: { apg: `${DISCLOSURE} ${LISTBOX}` },
      initial: {
        counts: { 'root': 1, 'text': 1, 'trigger': 2, 'preview': 2, 'list': 1, 'source': 2, 'source-link': 2 },
        parts: {
          'trigger[0]': {
            'type': 'button',
            'aria-expanded': 'false',
            'aria-controls': '@part(preview[0])',
            'data-state': 'closed',
          },
          'trigger[1]': { 'aria-label': 'Sources 1, 2', 'aria-expanded': 'false' },
          'preview[0]': { 'role': 'region', 'hidden': '', 'data-state': 'closed', 'data-preview-mode': 'inline' },
          // 只有一个来源（或还没打开）时轮换钮收着
          'next-trigger[0]': { hidden: '' },
          'list': { 'role': 'list', 'aria-label': 'Sources', 'tabindex': '-1' },
          'source[0]': { 'role': 'listitem', 'data-state': 'active' },
          'source-link[0]': { 'type': 'button', 'aria-current': 'true', 'tabindex': '0' },
          'source-link[1]': { 'aria-current': null, 'tabindex': '-1' },
        },
      },
    },
    {
      name: '行内引用由原生按钮激活并展开对应预览',
      spec: { apg: DISCLOSURE },
      covers: ['citation.kbd.trigger'],
      steps: [
        nativeActivation('citation', 'trigger'),
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true', 'data-state': 'open' },
              'preview[0]': { 'hidden': null, 'aria-labelledby': '@part(trigger[0])', 'data-state': 'open' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '来源列表方向键循环导航，Home / End 到端点',
      spec: { apg: LISTBOX },
      covers: ['citation.kbd.next', 'citation.kbd.prev', 'citation.kbd.first', 'citation.kbd.last'],
      steps: [
        singleTabStop('citation', 'source-link', 'list'),
        { kind: 'focus', part: 'list', expect: { activeElement: { part: 'source-link[0]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'source-link[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'source-link[0]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'source-link[1]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'source-link[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'source-link[1]', exact: true } } },
      ],
    },
    {
      name: '来源条目 Enter 展开预览，Escape 从预览归还焦点',
      spec: { apg: `${DISCLOSURE} ${LISTBOX}` },
      covers: ['citation.kbd.open', 'citation.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'source-link[1]' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'source-link[1]': { 'aria-expanded': 'true', 'aria-current': 'true' },
              'preview[1]': { 'hidden': null, 'data-state': 'open' },
            },
            events: [
              { type: 'active-source-change', detail: { sourceId: 'doc' } },
              { type: 'open-change', detail: { open: true } },
            ],
          },
        },
        { kind: 'focus', part: 'preview-link[1]' },
        { kind: 'key', key: 'Escape', expect: { activeElement: { part: 'source-link[1]', exact: true }, parts: { 'preview[1]': { hidden: '' } } } },
      ],
    },
    {
      name: '一处多源：预览里的上一个 / 下一个在几个来源之间轮换，位置跟着走',
      spec: { apg: DISCLOSURE },
      covers: ['citation.kbd.step'],
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'true' },
              'preview[0]': { 'hidden': null, 'data-state': 'open' },
              'next-trigger[0]': { 'hidden': null, 'type': 'button', 'aria-label': 'Next source' },
              'preview-index[0]': { 'hidden': null, 'aria-hidden': 'true' },
            },
          },
        },
        {
          kind: 'click',
          part: 'next-trigger[0]',
          expect: {
            parts: {
              'preview[1]': { 'data-state': 'open' },
              'trigger[1]': { 'aria-expanded': 'true', 'aria-controls': '@part(preview[1])' },
            },
            events: [{ type: 'active-source-change', detail: { sourceId: 'doc' } }],
          },
        },
      ],
    },
    {
      name: 'hover 档：焦点落到行内引用上当场打开，离开引用与卡片即收起',
      spec: { apg: DISCLOSURE },
      covers: ['citation.kbd.hover-focus'],
      steps: [
        { kind: 'setProps', props: { previewMode: 'hover' } },
        {
          kind: 'focus',
          part: 'trigger[0]',
          expect: {
            parts: {
              'root': { 'data-preview-mode': 'hover' },
              'trigger[0]': { 'aria-expanded': 'true' },
              'preview[0]': { 'data-preview-mode': 'hover' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'blur',
          expect: {
            parts: { 'trigger[0]': { 'aria-expanded': 'false' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
  ],
}
