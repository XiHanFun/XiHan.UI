import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { listAnatomy, listKeyboard } from '@xihan-ui/headless'

// 列表是容器，APG 没有对应模式；判据只锁「一个轴与三个开关如实落到根上、
// 条目内的四个位各自拿得到身份、根与条目都不被组件塞进 role」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

/** 两条条目，每条都摆齐媒体、文字区（标题 + 说明）与操作位。 */
const listTree: FixtureNode = {
  part: 'root',
  tag: 'ul',
  children: [
    {
      part: 'item',
      tag: 'li',
      children: [
        { part: 'item-media', text: '甲' },
        {
          part: 'item-content',
          children: [
            { part: 'item-title', text: '张三' },
            { part: 'item-description', text: '技术部 · 前端' },
          ],
        },
        { part: 'item-action', children: [{ tag: 'button', text: '移除' }] },
      ],
    },
    {
      part: 'item',
      tag: 'li',
      children: [
        { part: 'item-media', text: '乙' },
        {
          part: 'item-content',
          children: [
            { part: 'item-title', text: '李四' },
            { part: 'item-description', text: '技术部 · 后端' },
          ],
        },
        { part: 'item-action', children: [{ tag: 'button', text: '移除' }] },
      ],
    },
  ],
}

export const listSuite: ConformanceSuite = {
  component: 'list',
  anatomy: listAnatomy,
  keyboard: listKeyboard,
  fixture: listTree,
  cases: [
    {
      name: '缺省：根与条目都不写 role，一个轴与三个开关一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': {
            'role': null,
            'data-size': null,
            'data-bordered': null,
            'data-hoverable': null,
            'data-split': null,
          },
          // 是不是列表项由作者写的 li 表达，组件不补 role
          'item[0]': { role: null },
          'item-media[0]': { role: null },
          'item-content[0]': { role: null },
          // 标题与说明只是普通文本，不占标题层级、不带 role
          'item-title[0]': { role: null },
          'item-description[0]': { role: null },
          'item-action[0]': { role: null },
        },
      },
    },
    {
      name: '三个开关落成 data-*，关掉时不留空属性',
      spec: { apg: APG },
      props: { bordered: true, split: true, hoverable: false },
      initial: {
        parts: {
          root: {
            'data-bordered': '',
            'data-split': '',
            'data-hoverable': null,
          },
        },
      },
    },
    {
      name: 'size 如实落到根上，条目不重复标注',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: {
          'root': { 'data-size': 'lg', 'role': null },
          'item[0]': { 'data-size': null },
        },
      },
    },
    {
      name: '关掉分隔线：根上的 data-split 当场撤掉',
      spec: { apg: APG },
      props: { split: true },
      initial: {
        parts: { root: { 'data-split': '' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { split: false },
          expect: {
            parts: { root: { 'data-split': null } },
          },
        },
      ],
    },
    {
      name: '两条条目各摆齐四个位，按媒体 / 文字区 / 标题 / 说明 / 操作的文档序排列',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'item[0]',
          'item-media[0]',
          'item-content[0]',
          'item-title[0]',
          'item-description[0]',
          'item-action[0]',
          'item[1]',
          'item-media[1]',
          'item-content[1]',
          'item-title[1]',
          'item-description[1]',
          'item-action[1]',
        ],
        counts: {
          'root': 1,
          'item': 2,
          'item-media': 2,
          'item-content': 2,
          'item-title': 2,
          'item-description': 2,
          'item-action': 2,
        },
      },
    },
    {
      name: '条目内四个位全部可缺省：只写一行标题也是一条合法条目',
      spec: { apg: APG },
      fixture: () => ({
        part: 'root',
        tag: 'ul',
        children: [
          {
            part: 'item',
            tag: 'li',
            children: [
              { part: 'item-content', children: [{ part: 'item-title', text: '只有标题' }] },
            ],
          },
        ],
      }),
      initial: {
        order: ['root', 'item', 'item-content', 'item-title'],
        counts: {
          'root': 1,
          'item': 1,
          'item-content': 1,
          'item-title': 1,
          'item-media': 0,
          'item-description': 0,
          'item-action': 0,
        },
      },
    },
  ],
}
