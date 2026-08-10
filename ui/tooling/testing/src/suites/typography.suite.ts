import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { typographyAnatomy, typographyKeyboard } from '@xihan-ui/headless'

// 版式只排字，APG 没有对应模式；判据只锁「档位、形态、语气如实落成 data-*，
// 各段拿得到自己的身份，组件不替作者补标题语义」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

/** 一块正文：一个标题、两段文字，其中一段里夹着弱化文字、行内代码与链接。 */
const typographyTree: FixtureNode = {
  part: 'root',
  children: [
    { part: 'heading', tag: 'h2', text: '版式约定', attrs: { level: '2' } },
    {
      part: 'paragraph',
      tag: 'p',
      children: [
        { part: 'text', tag: 'span', text: '字号、字重与行高都收进令牌。', attrs: { variant: 'muted' } },
        { part: 'text', tag: 'code', text: 'data-level', attrs: { variant: 'code' } },
        { part: 'link', tag: 'a', text: '查看令牌表', attrs: { href: '/docs/tokens' } },
      ],
    },
    { part: 'paragraph', tag: 'p', text: '标签由作者写在自己的节点上。' },
  ],
}

export const typographySuite: ConformanceSuite = {
  component: 'typography',
  anatomy: typographyAnatomy,
  keyboard: typographyKeyboard,
  fixture: typographyTree,
  cases: [
    {
      name: '缺省：根不写 role，尺寸不写就不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-size': null,
          },
        },
      },
    },
    {
      name: '尺寸如实落到根上',
      spec: { apg: APG },
      props: { size: 'sm' },
      initial: {
        parts: {
          root: { 'data-size': 'sm' },
        },
      },
    },
    {
      name: '标题的档位取自节点自报的 level，且不补 role 与 aria-level',
      spec: { apg: APG },
      initial: {
        parts: {
          heading: {
            'data-level': '2',
            'role': null,
            'aria-level': null,
          },
        },
      },
    },
    {
      name: '档位收进 1-6：超出范围收到边界，给不出数字就不写这个属性',
      spec: { apg: APG },
      fixture: base => ({
        ...base,
        children: [
          { part: 'heading', tag: 'h2', text: '超出上界', attrs: { level: '9' } },
          { part: 'heading', tag: 'h2', text: '超出下界', attrs: { level: '0' } },
          { part: 'heading', tag: 'h2', text: '不是数字', attrs: { level: '第二档' } },
        ],
      }),
      initial: {
        parts: {
          'heading[0]': { 'data-level': '6' },
          'heading[1]': { 'data-level': '1' },
          'heading[2]': { 'data-level': null },
        },
      },
    },
    {
      name: '行内文字的形态各落一个 data-variant，没写语气就不输出 data-tone',
      spec: { apg: APG },
      initial: {
        parts: {
          'text[0]': { 'data-variant': 'muted', 'data-tone': null },
          'text[1]': { 'data-variant': 'code', 'data-tone': null },
        },
      },
    },
    {
      name: '形态与语气是两个轴，可以同时写在一段行内文字上',
      spec: { apg: APG },
      fixture: base => ({
        ...base,
        children: [
          {
            part: 'paragraph',
            tag: 'p',
            children: [
              { part: 'text', tag: 'strong', text: '此操作不可撤销', attrs: { tone: 'danger', variant: 'strong' } },
            ],
          },
        ],
      }),
      initial: {
        parts: {
          text: { 'data-tone': 'danger', 'data-variant': 'strong' },
        },
      },
    },
    {
      name: '链接只拿身份：不补 role、不占 Tab 位，作者写的 href 原样留着',
      spec: { apg: APG },
      initial: {
        parts: {
          link: {
            'role': null,
            'tabindex': null,
            'aria-current': null,
          },
        },
      },
    },
    {
      name: '段落与行内文字可以有多份，按文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'heading', 'paragraph[0]', 'text[0]', 'text[1]', 'link', 'paragraph[1]'],
        counts: { root: 1, heading: 1, paragraph: 2, text: 2, link: 1 },
      },
    },
  ],
}
