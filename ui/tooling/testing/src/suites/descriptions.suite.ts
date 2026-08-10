import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { descriptionsAnatomy, descriptionsKeyboard } from '@xihan-ui/headless'

// 描述列表是只读排版，APG 没有对应模式；判据只锁「三个轴与一个开关如实落到根上、
// 每组的标签与取值各自拿得到身份、组件不往任何部件塞 role」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

/** 三组「标签 + 取值」，标签写成 dt、取值写成 dd，成对关系由标签本身表达。 */
const descriptionsTree: FixtureNode = {
  part: 'root',
  tag: 'dl',
  children: [
    {
      part: 'item',
      children: [
        { part: 'label', tag: 'dt', text: '订单号' },
        { part: 'value', tag: 'dd', text: 'XH-20260810-0042' },
      ],
    },
    {
      part: 'item',
      children: [
        { part: 'label', tag: 'dt', text: '下单时间' },
        { part: 'value', tag: 'dd', text: '2026-08-10 09:31' },
      ],
    },
    {
      part: 'item',
      children: [
        { part: 'label', tag: 'dt', text: '收货地址' },
        { part: 'value', tag: 'dd', text: '浙江省杭州市余杭区文一西路 969 号' },
      ],
    },
  ],
}

export const descriptionsSuite: ConformanceSuite = {
  component: 'descriptions',
  anatomy: descriptionsAnatomy,
  keyboard: descriptionsKeyboard,
  fixture: descriptionsTree,
  cases: [
    {
      name: '缺省：各部件都不写 role，三个轴与一个开关一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': {
            'role': null,
            'data-columns': null,
            'data-placement': null,
            'data-size': null,
            'data-bordered': null,
          },
          'item[0]': { role: null },
          // 标签与取值的配对靠作者写的 dt / dd 表达，组件不补 role、不补 IDREF 关联
          'label[0]': { 'role': null, 'aria-labelledby': null },
          'value[0]': { 'role': null, 'aria-describedby': null },
        },
      },
    },
    {
      name: 'columns 如实落成根上的 data-columns 字符串',
      spec: { apg: APG },
      props: { columns: 3 },
      initial: {
        parts: {
          'root': { 'data-columns': '3', 'role': null },
          // 列数只写在根上，每一格不重复标注
          'item[0]': { 'data-columns': null },
        },
      },
    },
    {
      name: 'placement 与 size 落到根上，语义不变',
      spec: { apg: APG },
      props: { placement: 'left', size: 'sm' },
      initial: {
        parts: {
          'root': { 'data-placement': 'left', 'data-size': 'sm', 'role': null },
          'label[0]': { role: null },
        },
      },
    },
    {
      name: 'bordered 落成空串，关掉时不留空属性',
      spec: { apg: APG },
      props: { bordered: true },
      initial: {
        parts: { root: { 'data-bordered': '' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { bordered: false },
          expect: {
            parts: { root: { 'data-bordered': null } },
          },
        },
      ],
    },
    {
      name: '换列数：根上的 data-columns 当场跟着换',
      spec: { apg: APG },
      props: { columns: 2 },
      initial: {
        parts: { root: { 'data-columns': '2' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { columns: 4 },
          expect: {
            parts: { root: { 'data-columns': '4' } },
          },
        },
      ],
    },
    {
      name: '三组各一份，按每组「标签 → 取值」的文档序排列',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'item[0]',
          'label[0]',
          'value[0]',
          'item[1]',
          'label[1]',
          'value[1]',
          'item[2]',
          'label[2]',
          'value[2]',
        ],
        counts: { root: 1, item: 3, label: 3, value: 3 },
      },
    },
  ],
}
