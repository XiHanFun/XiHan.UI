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
        counts: { 'root': 1, 'text': 1, 'trigger': 1, 'preview': 2, 'list': 1, 'source': 2, 'source-link': 2 },
        parts: {
          'trigger': {
            'type': 'button',
            'aria-expanded': 'false',
            'aria-controls': '@part(preview[0])',
            'data-state': 'closed',
          },
          'preview[0]': { 'role': 'region', 'hidden': '', 'data-state': 'closed' },
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
          part: 'trigger',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true', 'data-state': 'open' },
              'preview[0]': { 'hidden': null, 'aria-labelledby': '@part(trigger)', 'data-state': 'open' },
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
  ],
}
